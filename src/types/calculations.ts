export interface CalcStep {
  descricao: string;
  formula: string;
  resultado: number;
}

export interface INSSResult {
  faixas: { faixa: string; aliquota: number; valor: number }[];
  totalDesconto: number;
  patronal: number;
  gilrat: number;
  steps: CalcStep[];
}

export interface FGTSResult {
  baseCalculo: number;
  deposito: number;
  compensatorio: number;
  total: number;
  steps: CalcStep[];
}

export interface FeriasResult {
  salarioBase: number;
  diasFerias: number;
  valorFerias: number;
  tercoConstitucional: number;
  abonoPecuniario: number;
  tercoAbono: number;
  totalBruto: number;
  descontoINSS: number;
  totalLiquido: number;
  steps: CalcStep[];
}

export interface DecimoTerceiroResult {
  salarioBase: number;
  mesesTrabalhados: number;
  valorProporcional: number;
  primeiraParcela: number;
  segundaParcela: number;
  descontoINSS: number;
  totalLiquido: number;
  steps: CalcStep[];
}

export type TerminationType = 'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'acordo_mutuo';

export interface RescisaoResult {
  tipo: TerminationType;
  saldoSalario: number;
  feriasProporcionais: number;
  tercoFerias: number;
  feriasVencidas: number;
  tercoFeriasVencidas: number;
  decimoTerceiroProporcional: number;
  avisoPrevio: number;
  multaFGTS: number;
  totalBruto: number;
  descontoINSS: number;
  totalLiquido: number;
  steps: CalcStep[];
}

export interface HoleriteResult {
  salarioBruto: number;
  descontoINSS: number;
  descontoVT: number;
  totalDescontos: number;
  salarioLiquido: number;
  fgtsInfo: number;
  fgtsCompensatorio: number;
  steps: CalcStep[];
}
