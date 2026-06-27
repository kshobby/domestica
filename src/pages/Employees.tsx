import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, User } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { InfoBanner } from '../components/ui/InfoBanner';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { ROLE_LABELS } from '../types/employee';
import type { Employee, EmployeeRole } from '../types/employee';
import { formatCurrency } from '../services/currency';
import { validarCPF, formatarCPF } from '../services/validators';
import { SALARIO_MINIMO } from '../constants/labor';

const emptyEmployee: Omit<Employee, 'id' | 'eventos'> = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  endereco: '',
  cargo: 'empregada',
  dataAdmissao: '',
  salarioBruto: SALARIO_MINIMO,
  jornadaSemanal: 44,
  valeTransporte: false,
  ativo: true,
};

export function Employees() {
  const { employees, addEmployee, deleteEmployee } = useEmployees();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyEmployee);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = 'Informe o nome completo';
    if (!form.cpf.trim()) errs.cpf = 'Informe o CPF';
    else if (!validarCPF(form.cpf)) errs.cpf = 'CPF inválido';
    if (!form.dataAdmissao) errs.dataAdmissao = 'Informe a data de admissão';
    if (form.salarioBruto < SALARIO_MINIMO) errs.salarioBruto = `Salário mínimo atual: ${formatCurrency(SALARIO_MINIMO)}`;
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await addEmployee({
      ...form,
      id: crypto.randomUUID(),
      cpf: formatarCPF(form.cpf),
      eventos: [],
    });

    setForm(emptyEmployee);
    setShowForm(false);
    setStep(1);
    setErrors({});
  }

  const totalSteps = 3;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500 mt-1">Gerencie seus empregados domésticos</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cadastrar Funcionário</h2>
            <span className="text-sm text-gray-500">Etapa {step} de {totalSteps}</span>
          </div>

          <div className="flex gap-1 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <InfoBanner type="info" title="Dados Pessoais">
                  <p>Essas informações são necessárias para o cadastro no eSocial e para emissão do contrato de trabalho.</p>
                </InfoBanner>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                    <InfoTooltip text="Nome completo do empregado, exatamente como consta no CPF/RG." />
                  </label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Ex: Maria da Silva Santos"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                      <InfoTooltip text="O CPF é obrigatório para o cadastro no eSocial. Sem ele, não é possível registrar o trabalhador." />
                    </label>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={e => setForm({ ...form, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={form.dataNascimento}
                      onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={e => setForm({ ...form, endereco: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <InfoBanner type="info" title="Cargo e Salário">
                  <p>O salário mínimo atual é {formatCurrency(SALARIO_MINIMO)}. Empregados domésticos não podem receber menos que isso. Alguns estados têm pisos regionais maiores.</p>
                </InfoBanner>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo / Função
                    <InfoTooltip text="A função determina as atividades que o empregado vai exercer. Escolha a que melhor descreve o trabalho." />
                  </label>
                  <select
                    value={form.cargo}
                    onChange={e => setForm({ ...form, cargo: e.target.value as EmployeeRole })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Admissão
                      <InfoTooltip text="Data em que o empregado começou a trabalhar. Essa data é usada para calcular férias, 13º e tempo de serviço." />
                    </label>
                    <input
                      type="date"
                      value={form.dataAdmissao}
                      onChange={e => setForm({ ...form, dataAdmissao: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    {errors.dataAdmissao && <p className="text-red-500 text-xs mt-1">{errors.dataAdmissao}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salário Bruto (R$)
                      <InfoTooltip text="O salário bruto é o valor total antes dos descontos (INSS, vale-transporte). O valor líquido (na mão) será menor." />
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={SALARIO_MINIMO}
                      value={form.salarioBruto}
                      onChange={e => setForm({ ...form, salarioBruto: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    {errors.salarioBruto && <p className="text-red-500 text-xs mt-1">{errors.salarioBruto}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <InfoBanner type="info" title="Jornada e Benefícios">
                  <p>A jornada máxima para empregados domésticos é de 44 horas semanais (8h por dia, com 4h aos sábados). O vale-transporte é obrigatório se o empregado usar transporte público.</p>
                </InfoBanner>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jornada Semanal (horas)
                    <InfoTooltip text="Quantidade de horas trabalhadas por semana. O máximo legal é 44 horas. Jornadas parciais (até 25h) também são permitidas." />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={44}
                    value={form.jornadaSemanal}
                    onChange={e => setForm({ ...form, jornadaSemanal: parseInt(e.target.value) || 44 })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="valeTransporte"
                    checked={form.valeTransporte}
                    onChange={e => setForm({ ...form, valeTransporte: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                  />
                  <label htmlFor="valeTransporte" className="text-sm text-gray-700">
                    <span className="font-medium">Vale-Transporte</span>
                    <InfoTooltip text="Se o empregado usa transporte público para ir ao trabalho, o empregador é obrigado a fornecer o vale-transporte. O desconto no salário é de até 6%." />
                    <p className="text-xs text-gray-500 mt-0.5">Desconto de até 6% do salário. Obrigatório se o empregado usar transporte público.</p>
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {step === 1 ? 'Cancelar' : 'Voltar'}
              </button>
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Cadastrar Funcionário
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {employees.length === 0 && !showForm ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhum funcionário cadastrado</h2>
          <p className="text-gray-500 text-sm mb-4">Clique em "Novo Funcionário" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp => (
            <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <Link to={`/funcionarios/${emp.id}`} className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                      <User className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {ROLE_LABELS[emp.cargo]} · {formatCurrency(emp.salarioBruto)}/mês
                        {!emp.ativo && <span className="ml-2 text-red-500 font-medium">Inativo</span>}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link
                    to={`/funcionarios/${emp.id}`}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Tem certeza que deseja excluir ${emp.nome}?`)) {
                        await deleteEmployee(emp.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
