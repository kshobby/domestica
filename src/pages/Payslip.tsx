import { useState, useRef } from 'react';
import { Printer, FileText } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { calcularHolerite } from '../services/holerite-calculator';
import { calcularFGTS } from '../services/fgts-calculator';
import { calcularINSS } from '../services/inss-calculator';
import { formatCurrency } from '../services/currency';
import { ROLE_LABELS } from '../types/employee';
import { InfoBanner } from '../components/ui/InfoBanner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Payslip() {
  const { employees } = useEmployees();
  const [selectedId, setSelectedId] = useState('');
  const [mesRef, setMesRef] = useState(format(new Date(), 'yyyy-MM'));
  const printRef = useRef<HTMLDivElement>(null);

  const employee = employees.find(e => e.id === selectedId);

  const holerite = employee
    ? calcularHolerite({ salarioBruto: employee.salarioBruto, valeTransporte: employee.valeTransporte })
    : null;

  const fgts = employee ? calcularFGTS(employee.salarioBruto) : null;
  const inss = employee ? calcularINSS(employee.salarioBruto) : null;

  function handlePrint() {
    window.print();
  }

  const [ano, mes] = mesRef.split('-').map(Number);
  const mesNome = format(new Date(ano, mes - 1), 'MMMM/yyyy', { locale: ptBR });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Holerite / Recibo de Pagamento</h1>
        <p className="text-gray-500 mt-1">Gere o recibo de pagamento mensal do seu empregado</p>
      </div>

      <div className="no-print">
        <InfoBanner type="info" title="O que é o holerite?">
          <p>O holerite (ou contracheque) é o recibo que detalha o salário do empregado: quanto ele ganha, quanto é descontado e quanto recebe líquido. É obrigatório entregar uma cópia ao empregado todo mês.</p>
        </InfoBanner>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              <option value="">Selecione um funcionário</option>
              {employees.filter(e => e.ativo).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
            <input
              type="month"
              value={mesRef}
              onChange={e => setMesRef(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {employee && holerite && fgts && inss && (
        <>
          <div className="no-print mb-4 flex justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>

          <div ref={printRef} className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center border-b border-gray-300 pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">RECIBO DE PAGAMENTO DE SALÁRIO</h2>
              <p className="text-sm text-gray-500 mt-1 capitalize">Referência: {mesNome}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Empregado</p>
                <p className="font-semibold text-gray-900">{employee.nome}</p>
              </div>
              <div>
                <p className="text-gray-500">CPF</p>
                <p className="font-semibold text-gray-900">{employee.cpf}</p>
              </div>
              <div>
                <p className="text-gray-500">Função</p>
                <p className="font-semibold text-gray-900">{ROLE_LABELS[employee.cargo]}</p>
              </div>
              <div>
                <p className="text-gray-500">Admissão</p>
                <p className="font-semibold text-gray-900">{new Date(employee.dataAdmissao).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 font-semibold text-gray-700">Descrição</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Referência</th>
                  <th className="text-right py-2 font-semibold text-green-700">Proventos</th>
                  <th className="text-right py-2 font-semibold text-red-700">Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Salário Base</td>
                  <td className="text-right py-2">30 dias</td>
                  <td className="text-right py-2 text-green-700 font-medium">{formatCurrency(employee.salarioBruto)}</td>
                  <td className="text-right py-2">-</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">INSS - Contribuição Empregado</td>
                  <td className="text-right py-2">{((inss.totalDesconto / employee.salarioBruto) * 100).toFixed(1)}%</td>
                  <td className="text-right py-2">-</td>
                  <td className="text-right py-2 text-red-700 font-medium">{formatCurrency(inss.totalDesconto)}</td>
                </tr>
                {employee.valeTransporte && (
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Vale-Transporte</td>
                    <td className="text-right py-2">6%</td>
                    <td className="text-right py-2">-</td>
                    <td className="text-right py-2 text-red-700 font-medium">{formatCurrency(holerite.descontoVT)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="py-3 font-bold text-gray-900" colSpan={2}>TOTAIS</td>
                  <td className="text-right py-3 font-bold text-green-700">{formatCurrency(employee.salarioBruto)}</td>
                  <td className="text-right py-3 font-bold text-red-700">{formatCurrency(holerite.totalDescontos)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 font-bold text-gray-900 text-lg" colSpan={2}>LÍQUIDO A RECEBER</td>
                  <td className="text-right py-3 font-bold text-green-700 text-lg" colSpan={2}>{formatCurrency(holerite.salarioLiquido)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Informações Adicionais (pago pelo empregador)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">FGTS (8%)</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(fgts.deposito)}</p>
                </div>
                <div>
                  <p className="text-blue-700">FGTS Compensatório (3,2%)</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(fgts.compensatorio)}</p>
                </div>
                <div>
                  <p className="text-blue-700">INSS Patronal (8%)</p>
                  <p className="font-semibold text-blue-900">{formatCurrency(inss.patronal)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12 pt-8">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Empregador</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Empregado</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-8">
              Documento gerado pelo DomestiCare — Ferramenta informativa. Não substitui assessoria contábil.
            </p>
          </div>
        </>
      )}

      {!employee && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Selecione um funcionário</h2>
          <p className="text-gray-500 text-sm">Escolha o funcionário e o mês para gerar o holerite</p>
        </div>
      )}
    </div>
  );
}
