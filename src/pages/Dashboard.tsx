import { Link } from 'react-router-dom';
import { Users, Calculator, Calendar, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { generateObligations } from '../services/obligations';
import { InfoBanner } from '../components/ui/InfoBanner';
import { formatCurrency } from '../services/currency';
import { differenceInMonths } from 'date-fns';

export function Dashboard() {
  const { employees } = useEmployees();
  const obligations = generateObligations(employees);
  const pendentes = obligations.filter(o => o.status !== 'concluido');
  const atrasadas = obligations.filter(o => o.status === 'atrasado');
  const proximas = obligations.filter(o => o.status === 'proximo' || o.status === 'pendente');

  const totalSalarios = employees.filter(e => e.ativo).reduce((sum, e) => sum + e.salarioBruto, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel Inicial</h1>
        <p className="text-gray-500 mt-1">Visão geral dos seus empregados domésticos</p>
      </div>

      {employees.length === 0 && (
        <InfoBanner type="info" title="Bem-vindo ao DomestiCare! 👋">
          <p>Comece cadastrando seu primeiro funcionário. Vamos te guiar em cada etapa!</p>
          <Link
            to="/funcionarios"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            <Users size={16} />
            Cadastrar Funcionário
          </Link>
        </InfoBanner>
      )}

      {atrasadas.length > 0 && (
        <InfoBanner type="error" title={`⚠️ ${atrasadas.length} obrigação(ões) atrasada(s)!`}>
          <ul className="list-disc ml-4 space-y-1">
            {atrasadas.map(o => (
              <li key={o.id}>{o.titulo}: {o.descricao}</li>
            ))}
          </ul>
        </InfoBanner>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Funcionários</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{employees.filter(e => e.ativo).length}</p>
          <p className="text-xs text-gray-400 mt-1">ativos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Folha Mensal</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSalarios)}</p>
          <p className="text-xs text-gray-400 mt-1">total de salários</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="text-amber-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Pendências</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendentes.length}</p>
          <p className="text-xs text-gray-400 mt-1">obrigações pendentes</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Atrasadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{atrasadas.length}</p>
          <p className="text-xs text-gray-400 mt-1">precisam de atenção</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Obrigações</h2>
          {proximas.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma obrigação pendente. Tudo em dia! ✅</p>
          ) : (
            <div className="space-y-3">
              {proximas.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    o.status === 'atrasado' ? 'bg-red-500' : o.status === 'proximo' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Prazo: {new Date(o.dataLimite).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funcionários</h2>
          {employees.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum funcionário cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {employees.filter(e => e.ativo).map(emp => (
                <Link
                  key={emp.id}
                  to={`/funcionarios/${emp.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{emp.nome}</p>
                    <p className="text-xs text-gray-500">
                      {emp.cargo.charAt(0).toUpperCase() + emp.cargo.slice(1)} · Desde {new Date(emp.dataAdmissao).toLocaleDateString('pt-BR')}
                      {' · '}
                      {differenceInMonths(new Date(), new Date(emp.dataAdmissao))} meses
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(emp.salarioBruto)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/funcionarios" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all">
          <Users className="text-primary" size={24} />
          <span className="text-sm font-medium text-gray-700">Funcionários</span>
        </Link>
        <Link to="/calculadoras" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all">
          <Calculator className="text-primary" size={24} />
          <span className="text-sm font-medium text-gray-700">Calculadoras</span>
        </Link>
        <Link to="/calendario" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all">
          <Calendar className="text-primary" size={24} />
          <span className="text-sm font-medium text-gray-700">Calendário</span>
        </Link>
        <Link to="/guia-esocial" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all">
          <BookOpen className="text-primary" size={24} />
          <span className="text-sm font-medium text-gray-700">Guia eSocial</span>
        </Link>
      </div>
    </div>
  );
}
