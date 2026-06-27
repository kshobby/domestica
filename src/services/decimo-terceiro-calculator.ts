import type { DecimoTerceiroResult, CalcStep } from '../types/calculations';
import { calcularINSS } from './inss-calculator';
import { formatCurrency, round2 } from './currency';

export interface DecimoTerceiroInput {
  salarioBruto: number;
  mesesTrabalhados: number;
}

export function calcularDecimoTerceiro(input: DecimoTerceiroInput): DecimoTerceiroResult {
  const { salarioBruto, mesesTrabalhados } = input;
  const steps: CalcStep[] = [];

  steps.push({
    descricao: 'O 13º salário é um direito de todo trabalhador. Ele equivale a 1/12 do salário para cada mês trabalhado no ano. Se trabalhou o ano inteiro, recebe um salário extra completo.',
    formula: `Salário: ${formatCurrency(salarioBruto)} | Meses trabalhados: ${mesesTrabalhados}`,
    resultado: salarioBruto,
  });

  const valorProporcional = round2((salarioBruto / 12) * mesesTrabalhados);
  steps.push({
    descricao: `Valor proporcional: salário dividido por 12, multiplicado por ${mesesTrabalhados} meses`,
    formula: `(${formatCurrency(salarioBruto)} ÷ 12) × ${mesesTrabalhados} = ${formatCurrency(valorProporcional)}`,
    resultado: valorProporcional,
  });

  const primeiraParcela = round2(valorProporcional / 2);
  steps.push({
    descricao: '1ª parcela (até 30 de novembro): metade do valor, sem descontos',
    formula: `${formatCurrency(valorProporcional)} ÷ 2 = ${formatCurrency(primeiraParcela)}`,
    resultado: primeiraParcela,
  });

  const inss = calcularINSS(valorProporcional);
  const descontoINSS = inss.totalDesconto;

  steps.push({
    descricao: 'Desconto INSS sobre o valor total do 13º',
    formula: `INSS sobre ${formatCurrency(valorProporcional)} = ${formatCurrency(descontoINSS)}`,
    resultado: descontoINSS,
  });

  const segundaParcela = round2(valorProporcional - primeiraParcela - descontoINSS);
  steps.push({
    descricao: '2ª parcela (até 20 de dezembro): restante menos INSS. Na 2ª parcela é que saem todos os descontos.',
    formula: `${formatCurrency(valorProporcional)} - ${formatCurrency(primeiraParcela)} - ${formatCurrency(descontoINSS)} = ${formatCurrency(segundaParcela)}`,
    resultado: segundaParcela,
  });

  const totalLiquido = round2(primeiraParcela + segundaParcela);
  steps.push({
    descricao: 'Total líquido que o empregado recebe (1ª + 2ª parcela)',
    formula: `${formatCurrency(primeiraParcela)} + ${formatCurrency(segundaParcela)} = ${formatCurrency(totalLiquido)}`,
    resultado: totalLiquido,
  });

  return {
    salarioBase: salarioBruto,
    mesesTrabalhados,
    valorProporcional,
    primeiraParcela,
    segundaParcela,
    descontoINSS,
    totalLiquido,
    steps,
  };
}
