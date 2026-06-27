import { useState } from 'react';
import { CheckCircle, Circle, ExternalLink, ChevronDown, ChevronUp, User } from 'lucide-react';
import { InfoBanner } from '../components/ui/InfoBanner';
import { ESocialFieldPreview } from '../components/esocial/ESocialFieldPreview';
import { useEmployees } from '../hooks/useEmployees';
import { calcularINSS } from '../services/inss-calculator';
import { calcularFGTS } from '../services/fgts-calculator';
import { calcularFerias } from '../services/ferias-calculator';
import { calcularDecimoTerceiro } from '../services/decimo-terceiro-calculator';
import { calcularHolerite } from '../services/holerite-calculator';
import { formatCurrency } from '../services/currency';
import { ROLE_LABELS } from '../types/employee';
import type { Employee } from '../types/employee';
import { format, differenceInMonths } from 'date-fns';

interface GuideStep {
  id: string;
  titulo: string;
  descricao: string;
  detalhes: string;
  dica?: string;
  getFields?: (emp: Employee) => { label: string; value: string }[];
  fieldsTitle?: string;
}

function buildStepsInicial(_employee: Employee | undefined): GuideStep[] {
  return [
    {
      id: 'entender',
      titulo: '1. Entenda o que é o eSocial',
      descricao: 'O eSocial é um sistema do governo que unifica as informações trabalhistas, previdenciárias e fiscais.',
      detalhes: 'Antes do eSocial, o empregador doméstico precisava fazer várias guias separadas (GPS para INSS, GRF para FGTS, etc.). Agora, tudo é feito em um só lugar. O eSocial gera o DAE (Documento de Arrecadação do eSocial), que inclui tudo que você precisa pagar em uma única guia.',
      dica: 'O eSocial não é opcional! Todo empregador doméstico é obrigado a usar desde 2015.',
    },
    {
      id: 'acesso',
      titulo: '2. Acesse o portal do eSocial',
      descricao: 'O primeiro passo é acessar o site oficial do eSocial para empregador doméstico.',
      detalhes: 'Acesse o portal do eSocial Doméstico em login.esocial.gov.br. Você vai precisar do seu CPF e senha gov.br (nível prata ou ouro). Se ainda não tem conta gov.br, crie uma em gov.br/conta. Recomendamos usar o nível ouro (com reconhecimento facial ou certificado digital) para maior segurança.',
      dica: 'Use o navegador Chrome ou Firefox atualizado para melhor compatibilidade.',
    },
    {
      id: 'empregador',
      titulo: '3. Cadastre-se como Empregador',
      descricao: 'Na primeira vez, você precisa se identificar como empregador doméstico no sistema.',
      detalhes: 'Ao acessar pela primeira vez, o sistema pedirá seus dados pessoais: nome completo, CPF, data de nascimento, telefone e endereço. Preencha com os mesmos dados que constam na Receita Federal. Esse cadastro é feito apenas uma vez.',
    },
    {
      id: 'trabalhador',
      titulo: '4. Cadastre o Trabalhador',
      descricao: 'Registre cada empregado doméstico com seus dados pessoais e contratuais.',
      detalhes: 'Para cadastrar o trabalhador, você vai precisar de: Nome completo, CPF, data de nascimento, NIS/PIS (número de identificação social), número da CTPS (Carteira de Trabalho), data de admissão, cargo/função, salário, jornada de trabalho semanal, e se recebe vale-transporte. IMPORTANTE: A data de admissão no eSocial deve ser a mesma da CTPS assinada!',
      dica: 'Se o empregado não sabe o NIS/PIS, ele pode consultar pelo app Meu INSS ou pelo telefone 135.',
      fieldsTitle: 'Dados para digitar no eSocial',
      getFields: (emp) => [
        { label: 'Nome Completo', value: emp.nome },
        { label: 'CPF', value: emp.cpf },
        { label: 'Data de Nascimento', value: emp.dataNascimento ? format(new Date(emp.dataNascimento), 'dd/MM/yyyy') : 'Não informada' },
        { label: 'Data de Admissão', value: format(new Date(emp.dataAdmissao), 'dd/MM/yyyy') },
        { label: 'Cargo / Função', value: ROLE_LABELS[emp.cargo] },
        { label: 'Salário Contratual', value: formatCurrency(emp.salarioBruto) },
        { label: 'Jornada Semanal', value: `${emp.jornadaSemanal} horas` },
        { label: 'Vale-Transporte', value: emp.valeTransporte ? 'Sim' : 'Não' },
      ],
    },
  ];
}

function buildStepsRotina(_employee: Employee | undefined): GuideStep[] {
  return [
    {
      id: 'folha',
      titulo: '5. Feche a Folha de Pagamento (mensal)',
      descricao: 'Todo mês você precisa "fechar" a folha no eSocial para gerar a guia de pagamento.',
      detalhes: 'No eSocial, acesse "Folha/Recebimentos e Pagamentos". Verifique se o salário está correto, se há horas extras, faltas, ou outros eventos. Confirme os dados e feche a folha. Isso deve ser feito até o dia 7 do mês seguinte (ex: folha de janeiro deve ser fechada até 7 de fevereiro). Após fechar, o sistema calcula automaticamente INSS, FGTS e demais encargos.',
      dica: 'Crie um lembrete no celular para todo dia 1º do mês: "Fechar folha no eSocial".',
      fieldsTitle: 'Valores da folha mensal',
      getFields: (emp) => {
        const holerite = calcularHolerite({ salarioBruto: emp.salarioBruto, valeTransporte: emp.valeTransporte });
        const inss = calcularINSS(emp.salarioBruto);
        const fgts = calcularFGTS(emp.salarioBruto);
        return [
          { label: 'Salário Bruto', value: formatCurrency(emp.salarioBruto) },
          { label: 'INSS Empregado (desconto)', value: formatCurrency(inss.totalDesconto) },
          { label: 'INSS Patronal (8%)', value: formatCurrency(inss.patronal) },
          { label: 'GILRAT (0,8%)', value: formatCurrency(inss.gilrat) },
          { label: 'FGTS (8%)', value: formatCurrency(fgts.deposito) },
          { label: 'FGTS Compensatório (3,2%)', value: formatCurrency(fgts.compensatorio) },
          ...(emp.valeTransporte ? [{ label: 'Desconto Vale-Transporte (6%)', value: formatCurrency(holerite.descontoVT) }] : []),
          { label: 'Salário Líquido', value: formatCurrency(holerite.salarioLiquido) },
          { label: 'Total DAE (encargos do empregador)', value: formatCurrency(inss.patronal + inss.gilrat + fgts.deposito + fgts.compensatorio) },
        ];
      },
    },
    {
      id: 'dae',
      titulo: '6. Gere e Pague o DAE',
      descricao: 'Após fechar a folha, gere o DAE (guia de pagamento) e pague até o dia 7.',
      detalhes: 'O DAE (Documento de Arrecadação do eSocial) inclui: INSS do empregado, INSS patronal (8%), FGTS (8%), FGTS Compensatório (3,2%), GILRAT (0,8%), e Seguro contra acidentes. Tudo em uma guia só! O DAE pode ser pago em qualquer banco, lotérica ou pelo internet banking. ATENÇÃO: Se o dia 7 cair em sábado, domingo ou feriado, o pagamento deve ser antecipado para o último dia útil anterior.',
      dica: 'O DAE vence no dia 7. Pagamento em atraso gera multa e juros!',
    },
    {
      id: 'ferias',
      titulo: '7. Informe Férias no eSocial',
      descricao: 'Quando o empregado for tirar férias, você precisa avisar o eSocial com antecedência.',
      detalhes: 'No eSocial, acesse "Trabalhador" > "Férias". Informe: data de início e fim das férias, se há abono pecuniário (venda de dias), e o valor a ser pago. O aviso de férias deve ser feito com pelo menos 30 dias de antecedência. O pagamento das férias deve ser feito até 2 dias úteis antes do início. Não esqueça do adicional de 1/3!',
      fieldsTitle: 'Valores de férias (30 dias, sem abono)',
      getFields: (emp) => {
        const ferias = calcularFerias({ salarioBruto: emp.salarioBruto, diasFerias: 30, diasAbono: 0 });
        const meses = differenceInMonths(new Date(), new Date(emp.dataAdmissao));
        return [
          { label: 'Situação', value: meses >= 12 ? `✅ Tem direito (${meses} meses trabalhados)` : `⏳ Faltam ${12 - meses} meses para ter direito` },
          { label: 'Valor das Férias (30 dias)', value: formatCurrency(ferias.valorFerias) },
          { label: '1/3 Constitucional', value: formatCurrency(ferias.tercoConstitucional) },
          { label: 'Total Bruto', value: formatCurrency(ferias.totalBruto) },
          { label: 'Desconto INSS', value: formatCurrency(ferias.descontoINSS) },
          { label: 'Total Líquido a Pagar', value: formatCurrency(ferias.totalLiquido) },
        ];
      },
    },
    {
      id: '13o',
      titulo: '8. Informe o 13º Salário',
      descricao: 'O 13º tem duas parcelas que precisam ser informadas no eSocial.',
      detalhes: '1ª parcela: paga até 30 de novembro. No eSocial, acesse "Folha/Recebimentos" e registre o adiantamento do 13º. 2ª parcela: paga até 20 de dezembro. Nesta parcela são aplicados os descontos de INSS. O eSocial gera um DAE específico para o 13º, separado do DAE mensal.',
      fieldsTitle: 'Valores do 13º salário (ano completo)',
      getFields: (emp) => {
        const mesesNoAno = Math.min(differenceInMonths(new Date(), new Date(new Date().getFullYear(), 0, 1)), 12);
        const decimo = calcularDecimoTerceiro({ salarioBruto: emp.salarioBruto, mesesTrabalhados: Math.max(mesesNoAno, 1) });
        return [
          { label: 'Meses Trabalhados no Ano', value: `${Math.max(mesesNoAno, 1)} meses` },
          { label: 'Valor Proporcional', value: formatCurrency(decimo.valorProporcional) },
          { label: '1ª Parcela (até 30/nov) — sem descontos', value: formatCurrency(decimo.primeiraParcela) },
          { label: '2ª Parcela (até 20/dez) — com INSS', value: formatCurrency(decimo.segundaParcela) },
          { label: 'Desconto INSS na 2ª parcela', value: formatCurrency(decimo.descontoINSS) },
          { label: 'Total Líquido (1ª + 2ª)', value: formatCurrency(decimo.totalLiquido) },
        ];
      },
    },
    {
      id: 'rescisao',
      titulo: '9. Informe a Rescisão (se aplicável)',
      descricao: 'Em caso de desligamento, registre a rescisão no eSocial.',
      detalhes: 'No eSocial, acesse "Trabalhador" > "Desligamento". Informe: data do desligamento, motivo (sem justa causa, justa causa, pedido de demissão ou acordo), se o aviso prévio foi trabalhado ou indenizado. O sistema calcula as verbas rescisórias automaticamente. O pagamento da rescisão deve ser feito em até 10 dias corridos após o desligamento. Não esqueça de dar baixa na CTPS!',
      dica: 'Recomendamos sempre consultar um contador ou advogado trabalhista para rescisões. Use nossa Calculadora de Rescisão para simular os valores.',
    },
  ];
}

export function ESocialGuide() {
  const { employees } = useEmployees();
  const [selectedId, setSelectedId] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>('entender');

  const selectedEmployee = employees.find(e => e.id === selectedId);
  const stepsInicial = buildStepsInicial(selectedEmployee);
  const stepsRotina = buildStepsRotina(selectedEmployee);
  const totalSteps = stepsInicial.length + stepsRotina.length;

  function toggleStep(id: string) {
    setExpandedStep(expandedStep === id ? null : id);
  }

  function toggleComplete(id: string) {
    const newSet = new Set(completedSteps);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCompletedSteps(newSet);
  }

  function renderSteps(steps: GuideStep[]) {
    return steps.map(step => {
      const isComplete = completedSteps.has(step.id);
      const isExpanded = expandedStep === step.id;
      const fields = selectedEmployee && step.getFields ? step.getFields(selectedEmployee) : null;

      return (
        <div key={step.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleStep(step.id)}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <button
              type="button"
              onClick={e => { e.stopPropagation(); toggleComplete(step.id); }}
              className="shrink-0"
            >
              {isComplete ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : (
                <Circle className="text-gray-300" size={24} />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isComplete ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                  {step.titulo}
                </h3>
                {step.getFields && selectedEmployee && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Dados prontos
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{step.descricao}</p>
            </div>
            {isExpanded ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
          </button>

          {isExpanded && (
            <div className="px-5 pb-5 pt-0 ml-14">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {step.detalhes}
              </div>
              {step.dica && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  💡 <strong>Dica:</strong> {step.dica}
                </div>
              )}
              {fields && (
                <ESocialFieldPreview
                  title={step.fieldsTitle || 'Dados do funcionário'}
                  fields={fields}
                />
              )}
              {step.getFields && !selectedEmployee && (
                <div className="mt-3 bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-500 text-center">
                  <User className="inline-block mb-1" size={18} />
                  <p>Selecione um funcionário acima para ver os dados personalizados aqui.</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Guia do eSocial</h1>
        <p className="text-gray-500 mt-1">Passo a passo para gerenciar o eSocial doméstico</p>
      </div>

      <InfoBanner type="info" title="O que é o eSocial Doméstico?">
        <p>O eSocial é o sistema do governo federal que unifica todas as obrigações trabalhistas do empregador doméstico. Com ele, você gera uma única guia de pagamento (DAE) que inclui INSS, FGTS, seguro contra acidentes e imposto de renda. É obrigatório para todo empregador que tem empregado doméstico registrado.</p>
      </InfoBanner>

      {employees.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione um funcionário para ver os dados personalizados em cada etapa:
          </label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          >
            <option value="">Sem personalização (guia genérico)</option>
            {employees.filter(e => e.ativo).map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome} — {ROLE_LABELS[emp.cargo]}</option>
            ))}
          </select>
          {selectedEmployee && (
            <p className="text-xs text-emerald-600 mt-2">
              ✅ Os passos com dados preenchidos terão o badge "Dados prontos". Expanda para ver exatamente o que digitar no portal.
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {completedSteps.size} de {totalSteps} etapas concluídas
        </p>
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(completedSteps.size / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Configuração Inicial</h2>
      <div className="space-y-3 mb-8">
        {renderSteps(stepsInicial)}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Rotina Mensal e Eventos</h2>
      <div className="space-y-3 mb-8">
        {renderSteps(stepsRotina)}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Links Úteis</h2>
        <div className="space-y-2">
          {[
            { label: 'Portal eSocial Doméstico', desc: 'Acesso ao sistema do eSocial' },
            { label: 'Gov.br - Criar Conta', desc: 'Crie sua conta gov.br para acessar o eSocial' },
            { label: 'Meu INSS', desc: 'Consulte contribuições e situação previdenciária' },
          ].map(link => (
            <div key={link.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{link.label}</p>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
              <ExternalLink className="text-gray-400" size={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
