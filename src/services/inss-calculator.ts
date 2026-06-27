import type { INSSResult, CalcStep } from '../types/calculations';
import { INSS_FAIXAS_2025, INSS_PATRONAL_DOMESTICO, GILRAT_DOMESTICO } from '../constants/labor';
import { formatCurrency, formatPercent, round2 } from './currency';

export function calcularINSS(salarioBruto: number): INSSResult {
  const steps: CalcStep[] = [];
  const faixas: INSSResult['faixas'] = [];
  let totalDesconto = 0;
  let salarioRestante = salarioBruto;

  steps.push({
    descricao: 'O INSS do empregado é calculado de forma progressiva (igual ao imposto de renda). Cada faixa salarial tem sua própria alíquota.',
    formula: `Salário bruto: ${formatCurrency(salarioBruto)}`,
    resultado: salarioBruto,
  });

  for (const faixa of INSS_FAIXAS_2025) {
    if (salarioBruto <= faixa.min) break;

    const baseCalculo = Math.min(salarioRestante, faixa.max - faixa.min);
    const valorFaixa = round2(baseCalculo * faixa.aliquota);
    totalDesconto += valorFaixa;

    faixas.push({
      faixa: `${formatCurrency(faixa.min)} até ${formatCurrency(faixa.max)}`,
      aliquota: faixa.aliquota,
      valor: valorFaixa,
    });

    steps.push({
      descricao: `Faixa ${formatCurrency(faixa.min)} a ${formatCurrency(faixa.max)} (${formatPercent(faixa.aliquota)})`,
      formula: `${formatCurrency(baseCalculo)} × ${formatPercent(faixa.aliquota)} = ${formatCurrency(valorFaixa)}`,
      resultado: valorFaixa,
    });

    salarioRestante -= baseCalculo;
    if (salarioRestante <= 0) break;
  }

  totalDesconto = round2(totalDesconto);
  const patronal = round2(salarioBruto * INSS_PATRONAL_DOMESTICO);
  const gilrat = round2(salarioBruto * GILRAT_DOMESTICO);

  steps.push({
    descricao: 'Total descontado do empregado (soma de todas as faixas)',
    formula: faixas.map(f => formatCurrency(f.valor)).join(' + ') + ` = ${formatCurrency(totalDesconto)}`,
    resultado: totalDesconto,
  });

  steps.push({
    descricao: 'INSS patronal (pago pelo empregador): 8% sobre o salário bruto',
    formula: `${formatCurrency(salarioBruto)} × 8% = ${formatCurrency(patronal)}`,
    resultado: patronal,
  });

  steps.push({
    descricao: 'GILRAT (seguro contra acidentes de trabalho): 0,8%',
    formula: `${formatCurrency(salarioBruto)} × 0,8% = ${formatCurrency(gilrat)}`,
    resultado: gilrat,
  });

  return { faixas, totalDesconto, patronal, gilrat, steps };
}
