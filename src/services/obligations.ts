import type { Employee } from '../types/employee';
import type { Obligation } from '../types/obligation';
import { addMonths, format, differenceInMonths, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function generateObligations(employees: Employee[], currentDate: Date = new Date()): Obligation[] {
  const obligations: Obligation[] = [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (employees.length > 0) {
    const daeDate = new Date(year, month + 1, 7);
    obligations.push({
      id: `dae-${year}-${month + 1}`,
      tipo: 'dae',
      titulo: `Pagar DAE de ${format(currentDate, 'MMMM/yyyy', { locale: ptBR })}`,
      descricao: 'O DAE (Documento de Arrecadação do eSocial) inclui INSS, FGTS e seguro. Deve ser pago até o dia 7 do mês seguinte.',
      dataLimite: format(daeDate, 'yyyy-MM-dd'),
      status: isBefore(daeDate, currentDate) ? 'atrasado' : 'pendente',
    });
  }

  obligations.push({
    id: `13o-1a-${year}`,
    tipo: '13o_1a',
    titulo: '13º Salário - 1ª Parcela',
    descricao: 'A primeira parcela do 13º deve ser paga até 30 de novembro. Corresponde a metade do valor, sem descontos.',
    dataLimite: `${year}-11-30`,
    status: 'pendente',
  });

  obligations.push({
    id: `13o-2a-${year}`,
    tipo: '13o_2a',
    titulo: '13º Salário - 2ª Parcela',
    descricao: 'A segunda parcela deve ser paga até 20 de dezembro. Nesta parcela são feitos os descontos de INSS.',
    dataLimite: `${year}-12-20`,
    status: 'pendente',
  });

  for (const emp of employees.filter(e => e.ativo)) {
    const admissao = new Date(emp.dataAdmissao);
    const mesesTrabalhados = differenceInMonths(currentDate, admissao);

    if (mesesTrabalhados >= 12) {
      const periodoAquisitivo = addMonths(admissao, 12 * Math.ceil(mesesTrabalhados / 12));
      const limiteConcessivo = addMonths(periodoAquisitivo, 12);
      const prazoAlerta = addDays(limiteConcessivo, -30);

      obligations.push({
        id: `ferias-${emp.id}-${year}`,
        tipo: 'ferias',
        titulo: `Férias de ${emp.nome.split(' ')[0]}`,
        descricao: `${emp.nome} tem direito a férias. O período concessivo vence em ${format(limiteConcessivo, 'dd/MM/yyyy')}. Após essa data, as férias devem ser pagas em dobro!`,
        dataLimite: format(prazoAlerta, 'yyyy-MM-dd'),
        employeeId: emp.id,
        status: isBefore(limiteConcessivo, currentDate) ? 'atrasado' : isBefore(prazoAlerta, currentDate) ? 'proximo' : 'pendente',
      });
    }
  }

  return obligations;
}
