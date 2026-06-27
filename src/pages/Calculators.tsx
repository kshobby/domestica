import { useState } from 'react';
import { Calculator, Palmtree, Gift, DoorOpen } from 'lucide-react';
import { InfoBanner } from '../components/ui/InfoBanner';
import { CalcStepExplanation } from '../components/ui/CalcStepExplanation';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { calcularFerias } from '../services/ferias-calculator';
import { calcularDecimoTerceiro } from '../services/decimo-terceiro-calculator';
import { calcularRescisao, TERMINATION_LABELS, TERMINATION_DESCRIPTIONS } from '../services/rescisao-calculator';
import { formatCurrency } from '../services/currency';
import { SALARIO_MINIMO } from '../constants/labor';
import type { FeriasResult, DecimoTerceiroResult, RescisaoResult, TerminationType } from '../types/calculations';

type CalcTab = 'ferias' | '13o' | 'rescisao';

export function Calculators() {
  const [activeTab, setActiveTab] = useState<CalcTab>('ferias');

  const tabs: { id: CalcTab; label: string; icon: typeof Calculator }[] = [
    { id: 'ferias', label: 'Férias', icon: Palmtree },
    { id: '13o', label: '13º Salário', icon: Gift },
    { id: 'rescisao', label: 'Rescisão', icon: DoorOpen },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calculadoras Trabalhistas</h1>
        <p className="text-gray-500 mt-1">Faça simulações com explicações passo a passo</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'ferias' && <FeriasCalculator />}
      {activeTab === '13o' && <DecimoTerceiroCalculator />}
      {activeTab === 'rescisao' && <RescisaoCalculator />}
    </div>
  );
}

function FeriasCalculator() {
  const [salario, setSalario] = useState(SALARIO_MINIMO);
  const [dias, setDias] = useState(30);
  const [abono, setAbono] = useState(0);
  const [result, setResult] = useState<FeriasResult | null>(null);

  function calcular() {
    setResult(calcularFerias({ salarioBruto: salario, diasFerias: dias, diasAbono: abono }));
  }

  return (
    <div>
      <InfoBanner type="info" title="O que são férias?">
        <p>Todo empregado doméstico tem direito a 30 dias de férias remuneradas após trabalhar 12 meses (período aquisitivo). Além do salário normal, você deve pagar um adicional de 1/3 (terço constitucional). O pagamento deve ser feito até 2 dias úteis antes do início das férias.</p>
      </InfoBanner>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulador de Férias</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salário Bruto (R$)
              <InfoTooltip text="Valor do salário antes dos descontos." />
            </label>
            <input
              type="number"
              step="0.01"
              value={salario}
              onChange={e => setSalario(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias de Férias
              <InfoTooltip text="O mínimo é 20 dias (se vender 10). O máximo é 30 dias corridos." />
            </label>
            <input
              type="number"
              min={20}
              max={30}
              value={dias}
              onChange={e => setDias(parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias Vendidos (Abono)
              <InfoTooltip text="O empregado pode 'vender' até 10 dias de férias, recebendo o valor sem precisar descansar esses dias. Isso se chama abono pecuniário." />
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={abono}
              onChange={e => setAbono(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={calcular}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Calcular Férias
        </button>

        {result && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <ResultCard label="Férias" value={result.valorFerias} />
              <ResultCard label="1/3 Constitucional" value={result.tercoConstitucional} />
              <ResultCard label="Desconto INSS" value={result.descontoINSS} negative />
              <ResultCard label="Total Líquido" value={result.totalLiquido} highlight />
            </div>
            <CalcStepExplanation steps={result.steps} title="Cálculo das Férias" />
          </div>
        )}
      </div>
    </div>
  );
}

function DecimoTerceiroCalculator() {
  const [salario, setSalario] = useState(SALARIO_MINIMO);
  const [meses, setMeses] = useState(12);
  const [result, setResult] = useState<DecimoTerceiroResult | null>(null);

  function calcular() {
    setResult(calcularDecimoTerceiro({ salarioBruto: salario, mesesTrabalhados: meses }));
  }

  return (
    <div>
      <InfoBanner type="info" title="O que é o 13º Salário?">
        <p>O 13º salário é um salário extra pago todo ano. Ele é proporcional aos meses trabalhados: se trabalhou o ano inteiro, recebe um salário completo. Se trabalhou 6 meses, recebe metade. É pago em duas parcelas: a 1ª até 30/nov (sem descontos) e a 2ª até 20/dez (com desconto do INSS).</p>
      </InfoBanner>

      <InfoBanner type="warning" title="Quando um mês conta?">
        <p>Um mês só conta para o 13º se o empregado trabalhou 15 dias ou mais naquele mês. Exemplo: se começou dia 20 de março, março NÃO conta (só 11 dias). Mas se começou dia 15, março conta.</p>
      </InfoBanner>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulador de 13º Salário</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salário Bruto (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={salario}
              onChange={e => setSalario(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meses Trabalhados no Ano
              <InfoTooltip text="Quantos meses o empregado trabalhou este ano. Se trabalhou o ano inteiro, coloque 12." />
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={meses}
              onChange={e => setMeses(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={calcular}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Calcular 13º Salário
        </button>

        {result && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <ResultCard label="Valor Proporcional" value={result.valorProporcional} />
              <ResultCard label="1ª Parcela (nov)" value={result.primeiraParcela} />
              <ResultCard label="2ª Parcela (dez)" value={result.segundaParcela} />
              <ResultCard label="Total Líquido" value={result.totalLiquido} highlight />
            </div>
            <CalcStepExplanation steps={result.steps} title="Cálculo do 13º Salário" />
          </div>
        )}
      </div>
    </div>
  );
}

function RescisaoCalculator() {
  const [salario, setSalario] = useState(SALARIO_MINIMO);
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataDemissao, setDataDemissao] = useState('');
  const [tipo, setTipo] = useState<TerminationType>('sem_justa_causa');
  const [diasTrabalhados, setDiasTrabalhados] = useState(15);
  const [saldoFGTS, setSaldoFGTS] = useState(0);
  const [result, setResult] = useState<RescisaoResult | null>(null);

  function calcular() {
    if (!dataAdmissao || !dataDemissao) return;
    setResult(calcularRescisao({
      salarioBruto: salario,
      dataAdmissao,
      dataDemissao,
      tipo,
      diasTrabalhadosMes: diasTrabalhados,
      saldoFGTS,
    }));
  }

  return (
    <div>
      <InfoBanner type="warning" title="Tipos de Rescisão">
        <p>Existem 4 formas de encerrar o contrato. Cada uma dá direito a verbas diferentes. Selecione abaixo o tipo para entender o que se aplica.</p>
      </InfoBanner>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulador de Rescisão</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Rescisão</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(Object.entries(TERMINATION_LABELS) as [TerminationType, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipo(value)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  tipo === value
                    ? 'border-primary bg-primary-light text-primary font-medium'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium">{label}</p>
                <p className="text-xs mt-0.5 opacity-75">{TERMINATION_DESCRIPTIONS[value].slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salário Bruto (R$)</label>
            <input type="number" step="0.01" value={salario} onChange={e => setSalario(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
            <input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Demissão</label>
            <input type="date" value={dataDemissao} onChange={e => setDataDemissao(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias Trabalhados no Mês
              <InfoTooltip text="Quantos dias o empregado trabalhou no mês da demissão. Serve para calcular o saldo de salário." />
            </label>
            <input type="number" min={1} max={31} value={diasTrabalhados} onChange={e => setDiasTrabalhados(parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo FGTS (R$)
              <InfoTooltip text="Valor total acumulado no FGTS do empregado. Usado para calcular a multa rescisória. Se não sabe, some 8% do salário × meses trabalhados." />
            </label>
            <input type="number" step="0.01" value={saldoFGTS} onChange={e => setSaldoFGTS(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={calcular}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Calcular Rescisão
        </button>

        {result && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <ResultCard label="Saldo Salário" value={result.saldoSalario} />
              <ResultCard label="Férias Proporcionais" value={result.feriasProporcionais} />
              <ResultCard label="1/3 Férias" value={result.tercoFerias} />
              <ResultCard label="13º Proporcional" value={result.decimoTerceiroProporcional} />
              <ResultCard label="Aviso Prévio" value={result.avisoPrevio} />
              <ResultCard label="Multa FGTS" value={result.multaFGTS} />
              <ResultCard label="Desc. INSS" value={result.descontoINSS} negative />
              <ResultCard label="Total Bruto" value={result.totalBruto} />
              <ResultCard label="Total Líquido" value={result.totalLiquido} highlight />
            </div>
            <CalcStepExplanation steps={result.steps} title="Cálculo da Rescisão" />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value, highlight, negative }: { label: string; value: number; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-green-700' : negative ? 'text-red-600' : 'text-gray-900'}`}>
        {negative && value > 0 ? '-' : ''}{formatCurrency(value)}
      </p>
    </div>
  );
}
