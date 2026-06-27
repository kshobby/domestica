export type EmployeeRole = 'empregada' | 'baba' | 'cuidador' | 'motorista' | 'jardineiro' | 'cozinheira';

export interface Employee {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  cargo: EmployeeRole;
  dataAdmissao: string;
  salarioBruto: number;
  jornadaSemanal: number;
  valeTransporte: boolean;
  ativo: boolean;
  eventos: EmployeeEvent[];
}

export interface EmployeeEvent {
  id: string;
  tipo: 'ferias' | '13o_1a' | '13o_2a' | 'rescisao' | 'aumento';
  data: string;
  descricao: string;
  valor?: number;
}

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  empregada: 'Empregada Doméstica',
  baba: 'Babá',
  cuidador: 'Cuidador(a)',
  motorista: 'Motorista Particular',
  jardineiro: 'Jardineiro(a)',
  cozinheira: 'Cozinheira(o)',
};
