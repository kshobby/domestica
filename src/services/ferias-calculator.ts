import type { FeriasResult, CalcStep } from '../types/calculations';
import { TERCO_CONSTITUCIONAL } from '../constants/labor';
import { calcularINSS } from './inss-calculator';
import { formatCurrency, round2 } from './currency';

export interface FeriasInput {
  salarioBruto: number;
  diasFerias: number;
  diasAbono: number;
}

export function calcularFerias(input: FeriasInput): FeriasResult {
  const { salarioBruto, diasFerias, diasAbono } = input;
  const steps: CalcStep[] = [];

  steps.push({
    descricao: 'As férias são um direito do trabalhador após 12 meses de trabalho (período aquisitivo). O empregado tem direito a 30 dias de descanso remunerado, com um acréscimo de 1/3 sobre o salário.',
    formula: `Salário base: ${formatCurrency(salarioBruto)}`,
    resultado: salarioBruto,
  });

  const valorDiario = round2(salarioBruto / 30);
  steps.push({
    descricao: 'Valor do dia de trabalho',
    formula: `${formatCurrency(salarioBruto)} ÷ 30 dias = ${formatCurrency(valorDiario)}`,
    resultado: valorDiario,
  });

  const valorFerias = round2(valorDiario * diasFerias);
  steps.push({
    descricao: `Valor das férias (${diasFerias} dias)`,
    formula: `${formatCurrency(valorDiario)} × ${diasFerias} dias = ${formatCurrency(valorFerias)}`,
    resultado: valorFerias,
  });

  const tercoConstitucional = round2(valorFerias * TERCO_CONSTITUCIONAL);
  steps.push({
    descricao: 'Terço constitucional: adicional de 1/3 sobre o valor das férias. É um direito garantido pela Constituição Federal.',
    formula: `${formatCurrency(valorFerias)} ÷ 3 = ${formatCurrency(tercoConstitucional)}`,
    resultado: tercoConstitucional,
  });

  let abonoPecuniario = 0;
  let tercoAbono = 0;

  if (diasAbono > 0) {
    abonoPecuniario = round2(valorDiario * diasAbono);
    tercoAbono = round2(abonoPecuniario * TERCO_CONSTITUCIONAL);

    steps.push({
      descricao: `Abono pecuniário: o empregado pode "vender" até 10 dias das férias. Você escolheu vender ${diasAbono} dias.`,
      formula: `${formatCurrency(valorDiario)} × ${diasAbono} dias = ${formatCurrency(abonoPecuniario)}`,
      resultado: abonoPecuniario,
    });

    steps.push({
      descricao: 'Terço constitucional sobre o abono pecuniário',
      formula: `${formatCurrency(abonoPecuniario)} ÷ 3 = ${formatCurrency(tercoAbono)}`,
      resultado: tercoAbono,
    });
  }

  const totalBruto = round2(valorFerias + tercoConstitucional + abonoPecuniario + tercoAbono);
  steps.push({
    descricao: 'Total bruto das férias',
    formula: `${formatCurrency(valorFerias)} + ${formatCurrency(tercoConstitucional)}${diasAbono > 0 ? ` + ${formatCurrency(abonoPecuniario)} + ${formatCurrency(tercoAbono)}` : ''} = ${formatCurrency(totalBruto)}`,
    resultado: totalBruto,
  });

  const baseINSS = round2(valorFerias + tercoConstitucional);
  const inss = calcularINSS(baseINSS);
  const descontoINSS = inss.totalDesconto;

  steps.push({
    descricao: 'Desconto do INSS sobre férias + terço (o abono pecuniário é isento de INSS)',
    formula: `INSS sobre ${formatCurrency(baseINSS)} = ${formatCurrency(descontoINSS)}`,
    resultado: descontoINSS,
  });

  const totalLiquido = round2(totalBruto - descontoINSS);
  steps.push({
    descricao: 'Valor líquido que o empregado recebe',
    formula: `${formatCurrency(totalBruto)} - ${formatCurrency(descontoINSS)} = ${formatCurrency(totalLiquido)}`,
    resultado: totalLiquido,
  });

  return {
    salarioBase: salarioBruto,
    diasFerias,
    valorFerias,
    tercoConstitucional,
    abonoPecuniario,
    tercoAbono,
    totalBruto,
    descontoINSS,
    totalLiquido,
    steps,
  };
}
