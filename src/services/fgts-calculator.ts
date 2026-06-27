import type { FGTSResult, CalcStep } from '../types/calculations';
import { FGTS_ALIQUOTA, FGTS_COMPENSATORIO } from '../constants/labor';
import { formatCurrency, round2 } from './currency';

export function calcularFGTS(salarioBruto: number): FGTSResult {
  const steps: CalcStep[] = [];

  const deposito = round2(salarioBruto * FGTS_ALIQUOTA);
  const compensatorio = round2(salarioBruto * FGTS_COMPENSATORIO);
  const total = round2(deposito + compensatorio);

  steps.push({
    descricao: 'O FGTS é um depósito mensal que o empregador faz para o empregado. Ele serve como uma reserva financeira que pode ser sacada em casos específicos (demissão, aposentadoria, etc.).',
    formula: `Base de cálculo: ${formatCurrency(salarioBruto)}`,
    resultado: salarioBruto,
  });

  steps.push({
    descricao: 'Depósito FGTS: 8% do salário bruto (pago pelo empregador, não é descontado do empregado)',
    formula: `${formatCurrency(salarioBruto)} × 8% = ${formatCurrency(deposito)}`,
    resultado: deposito,
  });

  steps.push({
    descricao: 'FGTS Compensatório: 3,2% adicional exclusivo para empregados domésticos. É a antecipação da multa rescisória, depositado mensalmente.',
    formula: `${formatCurrency(salarioBruto)} × 3,2% = ${formatCurrency(compensatorio)}`,
    resultado: compensatorio,
  });

  steps.push({
    descricao: 'Total mensal de FGTS (depósito + compensatório)',
    formula: `${formatCurrency(deposito)} + ${formatCurrency(compensatorio)} = ${formatCurrency(total)}`,
    resultado: total,
  });

  return { baseCalculo: salarioBruto, deposito, compensatorio, total, steps };
}
