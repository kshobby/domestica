import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { generateObligations } from '../services/obligations';
import { storage } from '../data/storage';
import { InfoBanner } from '../components/ui/InfoBanner';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Obligation, ObligationStatus } from '../types/obligation';

const statusConfig: Record<ObligationStatus, { color: string; bg: string; icon: typeof Clock; label: string }> = {
  atrasado: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: AlertTriangle, label: 'Atrasado' },
  proximo: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Próximo' },
  pendente: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: Calendar, label: 'Pendente' },
  concluido: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle, label: 'Concluído' },
};

export function CalendarPage() {
  const { employees } = useEmployees();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    storage.getObligations().then(saved => {
      setCompletedIds(new Set(saved.filter(o => o.status === 'concluido').map(o => o.id)));
    });
  }, []);

  const obligations = generateObligations(employees, currentDate).map(o => ({
    ...o,
    status: completedIds.has(o.id) ? 'concluido' as const : o.status,
  }));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  function toggleComplete(id: string) {
    const newSet = new Set(completedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCompletedIds(newSet);
    const allObligations = obligations.map(o => ({
      ...o,
      status: newSet.has(o.id) ? 'concluido' as const : o.status,
      concluidoEm: newSet.has(o.id) ? new Date().toISOString() : undefined,
    }));
    storage.saveObligations(allObligations);
  }

  function getDayObligations(date: Date): Obligation[] {
    return obligations.filter(o => isSameDay(new Date(o.dataLimite), date));
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendário de Obrigações</h1>
        <p className="text-gray-500 mt-1">Acompanhe prazos e marque como concluído</p>
      </div>

      <InfoBanner type="info" title="Como funciona?">
        <p>O calendário mostra todas as obrigações trabalhistas e prazos do eSocial. Dias com obrigações são marcados com bolinha colorida. Clique em "Marcar como feito" quando cumprir cada obrigação.</p>
      </InfoBanner>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              type="button"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map(day => {
              const dayObs = getDayObligations(day);
              const hasAtrasado = dayObs.some(o => o.status === 'atrasado');
              const hasProximo = dayObs.some(o => o.status === 'proximo');
              const hasPendente = dayObs.some(o => o.status === 'pendente');
              const allDone = dayObs.length > 0 && dayObs.every(o => o.status === 'concluido');

              return (
                <div
                  key={day.toISOString()}
                  className={`text-center p-2 rounded-lg text-sm relative ${
                    isToday(day)
                      ? 'bg-primary text-white font-bold'
                      : isSameMonth(day, currentDate)
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-300'
                  }`}
                >
                  {day.getDate()}
                  {dayObs.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {hasAtrasado && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {hasProximo && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      {hasPendente && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {allDone && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Atrasado</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Próximo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Pendente</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Concluído</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Obrigações do Mês</h3>

          {obligations.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-5">
              {employees.length === 0
                ? 'Cadastre um funcionário para ver as obrigações.'
                : 'Nenhuma obrigação para este mês.'}
            </p>
          ) : (
            obligations.map(o => {
              const { color, bg, icon: Icon, label } = statusConfig[o.status];
              return (
                <div key={o.id} className={`${bg} border rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`${color} shrink-0 mt-0.5`} size={18} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">{o.titulo}</p>
                        <span className={`text-xs font-medium ${color}`}>{label}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{o.descricao}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Prazo: {new Date(o.dataLimite).toLocaleDateString('pt-BR')}
                      </p>
                      {o.status !== 'concluido' ? (
                        <button
                          type="button"
                          onClick={() => toggleComplete(o.id)}
                          className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Marcar como feito
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleComplete(o.id)}
                          className="mt-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                        >
                          Desfazer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
