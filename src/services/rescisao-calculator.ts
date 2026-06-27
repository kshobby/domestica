import type { RescisaoResult, TerminationType, CalcStep } from '../types/calculations';
import { AVISO_PREVIO_DIAS_BASE, AVISO_PREVIO_DIAS_POR_ANO, AVISO_PREVIO_MAXIMO, MULTA_FGTS_SEM_JUSTA_CAUSA, MULTA_FGTS_ACORDO, TERCO_CONSTITUCIONAL } from '../constants/labor';
import { calcularINSS } from './inss-calculator';
import { formatCurrency, round2 } from './currency';
import { differenceInMonths, differenceInDays, differenceInYears } from 'date-fns';

export const TERMINATION_LABELS: Record<TerminationType, string> = {
  sem_justa_causa: 'Demissão sem justa causa',
  com_justa_causa: 'Demissão por justa causa',
  pedido_demissao: 'Pedido de demissão',
  acordo_mutuo: 'Acordo mútuo (reforma trabalhista)',
};

export const TERMINATION_DESCRIPTIONS: Record<TerminationType, string> = {
  sem_justa_causa: 'O empregador decide encerrar o contrato sem que o empregado tenha cometido falta grave. O empregado tem direito a todos os benefícios rescisórios.',
  com_justa_causa: 'O empregado cometeu falta grave (ex: roubo, abandono de emprego). Perde a maioria dos direitos rescisórios.',
  pedido_demissao: 'O próprio empregado pede para sair. Perde direito ao aviso prévio indenizado e à multa do FGTS.',
  acordo_mutuo: 'Empregador e empregado concordam em encerrar o contrato. Criado pela Reforma Trabalhista de 2017. Os valores são intermediários.',
};

export interface RescisaoInput {
  salarioBruto: number;
  dataAdmissao: string;
  dataDemissao: string;
  tipo: TerminationType;
  diasTrabalhadosMes: number;
  saldoFGTS: number;
}

export function calcularRescisao(input: RescisaoInput): RescisaoResult {
  const { salarioBruto, dataAdmissao, dataDemissao, tipo, diasTrabalhadosMes, saldoFGTS } = input;
  const steps: CalcStep[] = [];
  const admissao = new Date(dataAdmissao);
  const demissao = new Date(dataDemissao);

  const anosCompletos = differenceInYears(demissao, admissao);
  const mesesTotais = differenceInMonths(demissao, admissao);
  const mesesNoAno = mesesTotais % 12;
  const diasRestantes = differenceInDays(demissao, admissao) % 30;

  steps.push({
    descricao: `${TERMINATION_DESCRIPTIONS[tipo]}`,
    formula: `Tempo de serviço: ${anosCompletos} ano(s) e ${mesesNoAno} mês(es)`,
    resultado: mesesTotais,
  });

  const valorDiario = round2(salarioBruto / 30);
  const saldoSalario = round2(valorDiario * diasTrabalhadosMes);
  steps.push({
    descricao: 'Saldo de salário: dias trabalhados no mês da demissão',
    formula: `${formatCurrency(valorDiario)} × ${diasTrabalhadosMes} dias = ${formatCurrency(saldoSalario)}`,
    resultado: saldoSalario,
  });

  const mesesFeriasProporcionais = mesesNoAno + (diasRestantes >= 15 ? 1 : 0);
  let feriasProporcionais = 0;
  let tercoFerias = 0;

  if (tipo !== 'com_justa_causa') {
    feriasProporcionais = round2((salarioBruto / 12) * Math.min(mesesFeriasProporcionais, 12));
    tercoFerias = round2(feriasProporcionais * TERCO_CONSTITUCIONAL);

    steps.push({
      descricao: 'Férias proporcionais: meses trabalhados desde o último período aquisitivo',
      formula: `(${formatCurrency(salarioBruto)} ÷ 12) × ${mesesFeriasProporcionais} meses = ${formatCurrency(feriasProporcionais)}`,
      resultado: feriasProporcionais,
    });

    steps.push({
      descricao: '1/3 constitucional sobre férias proporcionais',
      formula: `${formatCurrency(feriasProporcionais)} ÷ 3 = ${formatCurrency(tercoFerias)}`,
      resultado: tercoFerias,
    });
  } else {
    steps.push({
      descricao: 'Na justa causa, o empregado perde o direito a férias proporcionais.',
      formula: 'R$ 0,00',
      resultado: 0,
    });
  }

  const feriasVencidas = 0;
  const tercoFeriasVencidas = 0;

  let decimoTerceiroProporcional = 0;
  if (tipo !== 'com_justa_causa') {
    const meses13 = mesesNoAno + (diasRestantes >= 15 ? 1 : 0);
    decimoTerceiroProporcional = round2((salarioBruto / 12) * Math.min(meses13, 12));

    steps.push({
      descricao: '13º salário proporcional',
      formula: `(${formatCurrency(salarioBruto)} ÷ 12) × ${meses13} meses = ${formatCurrency(decimoTerceiroProporcional)}`,
      resultado: decimoTerceiroProporcional,
    });
  } else {
    steps.push({
      descricao: 'Na justa causa, o empregado perde o direito ao 13º proporcional.',
      formula: 'R$ 0,00',
      resultado: 0,
    });
  }

  let avisoPrevio = 0;
  if (tipo === 'sem_justa_causa') {
    const diasAviso = Math.min(AVISO_PREVIO_DIAS_BASE + (anosCompletos * AVISO_PREVIO_DIAS_POR_ANO), AVISO_PREVIO_MAXIMO);
    avisoPrevio = round2(valorDiario * diasAviso);

    steps.push({
      descricao: `Aviso prévio indenizado: 30 dias + 3 dias por ano de serviço (máx. 90 dias)`,
      formula: `${formatCurrency(valorDiario)} × ${diasAviso} dias = ${formatCurrency(avisoPrevio)}`,
      resultado: avisoPrevio,
    });
  } else if (tipo === 'acordo_mutuo') {
    const diasAviso = Math.min(AVISO_PREVIO_DIAS_BASE + (anosCompletos * AVISO_PREVIO_DIAS_POR_ANO), AVISO_PREVIO_MAXIMO);
    avisoPrevio = round2((valorDiario * diasAviso) / 2);

    steps.push({
      descricao: 'No acordo mútuo, o aviso prévio é pela metade (50%)',
      formula: `(${formatCurrency(valorDiario)} × ${diasAviso} dias) ÷ 2 = ${formatCurrency(avisoPrevio)}`,
      resultado: avisoPrevio,
    });
  } else {
    steps.push({
      descricao: tipo === 'com_justa_causa' ? 'Na justa causa não há aviso prévio.' : 'No pedido de demissão, o empregado deve cumprir o aviso prévio ou ter descontado.',
      formula: 'R$ 0,00',
      resultado: 0,
    });
  }

  let multaFGTS = 0;
  if (tipo === 'sem_justa_causa') {
    multaFGTS = round2(saldoFGTS * MULTA_FGTS_SEM_JUSTA_CAUSA);
    steps.push({
      descricao: 'Multa FGTS: 40% sobre o saldo total do FGTS (para domésticos, já foi depositado mensalmente como compensatório, mas a multa incide sobre o saldo)',
      formula: `${formatCurrency(saldoFGTS)} × 40% = ${formatCurrency(multaFGTS)}`,
      resultado: multaFGTS,
    });
  } else if (tipo === 'acordo_mutuo') {
    multaFGTS = round2(saldoFGTS * MULTA_FGTS_ACORDO);
    steps.push({
      descricao: 'No acordo mútuo, a multa FGTS é de 20% (metade do normal)',
      formula: `${formatCurrency(saldoFGTS)} × 20% = ${formatCurrency(multaFGTS)}`,
      resultado: multaFGTS,
    });
  }

  const totalBruto = round2(saldoSalario + feriasProporcionais + tercoFerias + feriasVencidas + tercoFeriasVencidas + decimoTerceiroProporcional + avisoPrevio + multaFGTS);

  const inss = calcularINSS(saldoSalario);
  const descontoINSS = inss.totalDesconto;

  steps.push({
    descricao: 'Total bruto da rescisão',
    formula: `Soma de todas as verbas = ${formatCurrency(totalBruto)}`,
    resultado: totalBruto,
  });

  const totalLiquido = round2(totalBruto - descontoINSS);
  steps.push({
    descricao: 'Total líquido (após desconto INSS sobre saldo de salário)',
    formula: `${formatCurrency(totalBruto)} - ${formatCurrency(descontoINSS)} = ${formatCurrency(totalLiquido)}`,
    resultado: totalLiquido,
  });

  return {
    tipo,
    saldoSalario,
    feriasProporcionais,
    tercoFerias,
    feriasVencidas,
    tercoFeriasVencidas,
    decimoTerceiroProporcional,
    avisoPrevio,
    multaFGTS,
    totalBruto,
    descontoINSS,
    totalLiquido,
    steps,
  };
}
