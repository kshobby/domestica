import type { HoleriteResult, CalcStep } from '../types/calculations';
import { FGTS_ALIQUOTA, FGTS_COMPENSATORIO, VALE_TRANSPORTE_DESCONTO } from '../constants/labor';
import { calcularINSS } from './inss-calculator';
import { formatCurrency, round2 } from './currency';

export interface HoleriteInput {
  salarioBruto: number;
  valeTransporte: boolean;
}

export function calcularHolerite(input: HoleriteInput): HoleriteResult {
  const { salarioBruto, valeTransporte } = input;
  const steps: CalcStep[] = [];

  steps.push({
    descricao: 'O holerite (ou recibo de pagamento) mostra todos os valores do salário: o que o empregado recebe e o que é descontado.',
    formula: `Salário bruto: ${formatCurrency(salarioBruto)}`,
    resultado: salarioBruto,
  });

  const inss = calcularINSS(salarioBruto);
  const descontoINSS = inss.totalDesconto;

  steps.push({
    descricao: 'Desconto INSS do empregado (calculado progressivamente)',
    formula: `INSS = ${formatCurrency(descontoINSS)}`,
    resultado: descontoINSS,
  });

  let descontoVT = 0;
  if (valeTransporte) {
    descontoVT = round2(salarioBruto * VALE_TRANSPORTE_DESCONTO);
    steps.push({
      descricao: 'Desconto vale-transporte: até 6% do salário base (o empregador paga o restante do custo real)',
      formula: `${formatCurrency(salarioBruto)} × 6% = ${formatCurrency(descontoVT)}`,
      resultado: descontoVT,
    });
  }

  const totalDescontos = round2(descontoINSS + descontoVT);
  const salarioLiquido = round2(salarioBruto - totalDescontos);

  steps.push({
    descricao: 'Salário líquido (o que o empregado recebe na mão)',
    formula: `${formatCurrency(salarioBruto)} - ${formatCurrency(totalDescontos)} = ${formatCurrency(salarioLiquido)}`,
    resultado: salarioLiquido,
  });

  const fgtsInfo = round2(salarioBruto * FGTS_ALIQUOTA);
  const fgtsCompensatorio = round2(salarioBruto * FGTS_COMPENSATORIO);

  steps.push({
    descricao: 'FGTS (informativo - pago pelo empregador, não descontado do empregado)',
    formula: `${formatCurrency(salarioBruto)} × 8% = ${formatCurrency(fgtsInfo)}`,
    resultado: fgtsInfo,
  });

  steps.push({
    descricao: 'FGTS Compensatório (3,2% - exclusivo empregado doméstico)',
    formula: `${formatCurrency(salarioBruto)} × 3,2% = ${formatCurrency(fgtsCompensatorio)}`,
    resultado: fgtsCompensatorio,
  });

  return {
    salarioBruto,
    descontoINSS,
    descontoVT,
    totalDescontos,
    salarioLiquido,
    fgtsInfo,
    fgtsCompensatorio,
    steps,
  };
}
