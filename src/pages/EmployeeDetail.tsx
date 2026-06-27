import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Clock, MapPin } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { ROLE_LABELS } from '../types/employee';
import { formatCurrency } from '../services/currency';
import { calcularINSS } from '../services/inss-calculator';
import { calcularFGTS } from '../services/fgts-calculator';
import { calcularHolerite } from '../services/holerite-calculator';
import { CalcStepExplanation } from '../components/ui/CalcStepExplanation';
import { differenceInMonths, format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { getEmployee } = useEmployees();
  const employee = getEmployee(id || '');

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">Funcionário não encontrado.</p>
        <Link to="/funcionarios" className="text-primary hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const admissao = new Date(employee.dataAdmissao);
  const hoje = new Date();
  const mesesTrabalhados = differenceInMonths(hoje, admissao);
  const anosCompletos = Math.floor(mesesTrabalhados / 12);
  const mesesRestantes = mesesTrabalhados % 12;

  const inss = calcularINSS(employee.salarioBruto);
  const fgts = calcularFGTS(employee.salarioBruto);
  const holerite = calcularHolerite({ salarioBruto: employee.salarioBruto, valeTransporte: employee.valeTransporte });

  const proximasFerias = addMonths(admissao, 12 * (Math.floor(mesesTrabalhados / 12) + 1));
  const podeTirarFerias = mesesTrabalhados >= 12;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/funcionarios" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} />
        Voltar para lista
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.nome}</h1>
            <p className="text-gray-500">{ROLE_LABELS[employee.cargo]}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {employee.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <DollarSign className="text-green-600" size={18} />
            <div>
              <p className="text-xs text-gray-500">Salário Bruto</p>
              <p className="font-semibold text-gray-900">{formatCurrency(employee.salarioBruto)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="text-blue-600" size={18} />
            <div>
              <p className="text-xs text-gray-500">Admissão</p>
              <p className="font-semibold text-gray-900">{format(admissao, 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="text-purple-600" size={18} />
            <div>
              <p className="text-xs text-gray-500">Tempo de Serviço</p>
              <p className="font-semibold text-gray-900">{anosCompletos}a {mesesRestantes}m</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="text-amber-600" size={18} />
            <div>
              <p className="text-xs text-gray-500">Jornada</p>
              <p className="font-semibold text-gray-900">{employee.jornadaSemanal}h/sem</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Salário Líquido</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(holerite.salarioLiquido)}</p>
          <p className="text-xs text-gray-400 mt-1">Após descontos INSS{employee.valeTransporte ? ' e VT' : ''}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">INSS (empregado)</h3>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(inss.totalDesconto)}</p>
          <p className="text-xs text-gray-400 mt-1">Descontado do salário</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">FGTS Total</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(fgts.total)}</p>
          <p className="text-xs text-gray-400 mt-1">Pago pelo empregador</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Situação de Férias</h2>
        {podeTirarFerias ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-medium text-amber-800">
              ✅ {employee.nome.split(' ')[0]} já tem direito a férias!
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Próximo período aquisitivo completa em {format(proximasFerias, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
              Use a <Link to="/calculadoras" className="underline font-medium">calculadora de férias</Link> para ver os valores.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-800">
              ⏳ Férias disponíveis em {12 - mesesTrabalhados} meses
            </p>
            <p className="text-sm text-blue-700 mt-1">
              O direito a férias surge após 12 meses completos de trabalho (período aquisitivo).
              Previsão: {format(addMonths(admissao, 12), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
            </p>
          </div>
        )}
      </div>

      <CalcStepExplanation steps={holerite.steps} title="Detalhamento do Holerite Mensal" />
    </div>
  );
}
