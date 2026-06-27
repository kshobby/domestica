import { useState } from 'react';
import { Home, LogIn, UserPlus } from 'lucide-react';
import { InfoBanner } from '../components/ui/InfoBanner';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, nome: string) => Promise<any>;
}

export function Login({ onLogin, onSignUp }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        await onSignUp(email, password, nome);
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Erro desconhecido';
      if (msg.includes('Invalid login')) setError('E-mail ou senha incorretos.');
      else if (msg.includes('already registered')) setError('Este e-mail já está cadastrado.');
      else if (msg.includes('Password should be')) setError('A senha deve ter pelo menos 6 caracteres.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Home className="text-primary" size={36} />
            <h1 className="text-3xl font-bold text-gray-900">DomestiCare</h1>
          </div>
          <p className="text-gray-500">Gestão Doméstica Simplificada</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isSignUp
              ? 'Crie sua conta para gerenciar seus empregados domésticos'
              : 'Acesse sua conta para continuar'}
          </p>

          {error && (
            <InfoBanner type="error" title="Erro">
              <p>{error}</p>
            </InfoBanner>
          )}

          {success && (
            <InfoBanner type="success" title="Sucesso!">
              <p>{success}</p>
            </InfoBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                'Aguarde...'
              ) : isSignUp ? (
                <><UserPlus size={18} /> Criar Conta</>
              ) : (
                <><LogIn size={18} /> Entrar</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar uma'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          DomestiCare — Ferramenta informativa. Não substitui assessoria contábil ou jurídica.
        </p>
      </div>
    </div>
  );
}
