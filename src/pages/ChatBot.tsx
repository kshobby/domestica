import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { ROLE_LABELS } from '../types/employee';
import { formatCurrency } from '../services/currency';
import { format, differenceInMonths } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Quando devo pagar o DAE este mês?',
  'Como calcular as férias do meu empregado?',
  'O que acontece se eu atrasar o pagamento do eSocial?',
  'Quais são meus direitos e deveres como empregador doméstico?',
  'Como funciona o FGTS para empregado doméstico?',
  'Quando devo pagar o 13º salário?',
];

export function ChatBot() {
  const { employees } = useEmployees();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function buildEmployeeContext(): string {
    if (employees.length === 0) return '';

    return employees.map(emp => {
      const meses = differenceInMonths(new Date(), new Date(emp.dataAdmissao));
      return `
- Nome: ${emp.nome}
  CPF: ${emp.cpf}
  Cargo: ${ROLE_LABELS[emp.cargo]}
  Admissão: ${format(new Date(emp.dataAdmissao), 'dd/MM/yyyy')} (${meses} meses)
  Salário: ${formatCurrency(emp.salarioBruto)}
  Jornada: ${emp.jornadaSemanal}h/semana
  Vale-transporte: ${emp.valeTransporte ? 'Sim' : 'Não'}
  Status: ${emp.ativo ? 'Ativo' : 'Inativo'}`;
    }).join('\n');
  }

  async function sendMessage(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          employeeContext: buildEmployeeContext(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao se comunicar com a IA');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              assistantContent += parsed.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            } catch {}
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ **Erro:** ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistente IA</h1>
          <p className="text-gray-500 mt-1">Tire dúvidas sobre gestão doméstica e legislação trabalhista</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        )}
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Bot className="text-primary" size={32} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Olá! Como posso ajudar?</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Sou o assistente do DomestiCare. Posso tirar dúvidas sobre legislação trabalhista,
                eSocial, cálculos e gestão dos seus empregados domésticos.
                {employees.length > 0 && (
                  <span className="block mt-2 text-emerald-600 font-medium">
                    Tenho acesso aos dados de {employees.length} funcionário(s) cadastrado(s).
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-left p-3 bg-gray-50 hover:bg-primary-light hover:text-primary border border-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Bot className="text-primary" size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <User className="text-gray-600" size={16} />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                <Bot className="text-primary" size={16} />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3 rounded-bl-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              rows={1}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-sm"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by Gemini — Respostas informativas, não substituem assessoria profissional.
          </p>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-gray-900 mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-gray-900 mt-3 mb-1 text-base">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
