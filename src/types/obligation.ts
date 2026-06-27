export type ObligationStatus = 'pendente' | 'proximo' | 'atrasado' | 'concluido';
export type ObligationType = 'dae' | 'ferias' | '13o_1a' | '13o_2a' | 'esocial';

export interface Obligation {
  id: string;
  tipo: ObligationType;
  titulo: string;
  descricao: string;
  dataLimite: string;
  employeeId?: string;
  status: ObligationStatus;
  concluidoEm?: string;
}

export const OBLIGATION_LABELS: Record<ObligationType, string> = {
  dae: 'DAE Mensal',
  ferias: 'Férias',
  '13o_1a': '13º - 1ª Parcela',
  '13o_2a': '13º - 2ª Parcela',
  esocial: 'eSocial',
};
