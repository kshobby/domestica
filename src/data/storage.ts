import { supabase } from '../lib/supabase';
import type { Employee } from '../types/employee';
import type { Obligation } from '../types/obligation';

export const storage = {
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('nome');
    if (error) throw error;
    return (data || []).map(mapDbToEmployee);
  },

  async addEmployee(employee: Employee): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase.from('employees').insert({
      id: employee.id,
      user_id: user.id,
      nome: employee.nome,
      cpf: employee.cpf,
      data_nascimento: employee.dataNascimento || null,
      endereco: employee.endereco,
      cargo: employee.cargo,
      data_admissao: employee.dataAdmissao,
      salario_bruto: employee.salarioBruto,
      jornada_semanal: employee.jornadaSemanal,
      vale_transporte: employee.valeTransporte,
      ativo: employee.ativo,
    });
    if (error) throw error;
  },

  async updateEmployee(employee: Employee): Promise<void> {
    const { error } = await supabase.from('employees').update({
      nome: employee.nome,
      cpf: employee.cpf,
      data_nascimento: employee.dataNascimento || null,
      endereco: employee.endereco,
      cargo: employee.cargo,
      data_admissao: employee.dataAdmissao,
      salario_bruto: employee.salarioBruto,
      jornada_semanal: employee.jornadaSemanal,
      vale_transporte: employee.valeTransporte,
      ativo: employee.ativo,
    }).eq('id', employee.id);
    if (error) throw error;
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  },

  async getObligations(): Promise<Obligation[]> {
    const { data, error } = await supabase
      .from('obligations')
      .select('*')
      .order('data_limite');
    if (error) throw error;
    return (data || []).map(mapDbToObligation);
  },

  async saveObligations(obligations: Obligation[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const o of obligations) {
      await supabase.from('obligations').upsert({
        id: o.id,
        user_id: user.id,
        tipo: o.tipo,
        titulo: o.titulo,
        descricao: o.descricao,
        data_limite: o.dataLimite,
        employee_id: o.employeeId || null,
        status: o.status,
        concluido_em: o.concluidoEm || null,
      });
    }
  },

  async markObligationDone(id: string): Promise<void> {
    await supabase.from('obligations').update({
      status: 'concluido',
      concluido_em: new Date().toISOString(),
    }).eq('id', id);
  },
};

function mapDbToEmployee(row: any): Employee {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    dataNascimento: row.data_nascimento || '',
    endereco: row.endereco || '',
    cargo: row.cargo,
    dataAdmissao: row.data_admissao,
    salarioBruto: row.salario_bruto,
    jornadaSemanal: row.jornada_semanal,
    valeTransporte: row.vale_transporte,
    ativo: row.ativo,
    eventos: [],
  };
}

function mapDbToObligation(row: any): Obligation {
  return {
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    descricao: row.descricao,
    dataLimite: row.data_limite,
    employeeId: row.employee_id,
    status: row.status,
    concluidoEm: row.concluido_em,
  };
}
