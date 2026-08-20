import { useState } from 'react';
import { Home, KeyRound, Eye, EyeOff } from 'lucide-react';
import { InfoBanner } from '../components/ui/InfoBanner';

interface ResetPasswordProps {
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export function ResetPassword({ onUpdatePassword }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await onUpdatePassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <KeyRound className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nova Senha</h2>
              <p className="text-sm text-gray-500">Escolha uma senha segura</p>
            </div>
          </div>

          {success ? (
            <div>
              <InfoBanner type="success" title="Senha atualizada!">
                <p>Sua senha foi redefinida com sucesso. Você já está conectado.</p>
              </InfoBanner>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Aguarde, você será redirecionado para o app automaticamente...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <InfoBanner type="error" title="Erro">
                  <p>{error}</p>
                </InfoBanner>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Repita a nova senha"
                  />
                </div>

                {password && confirm && password !== confirm && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : <><KeyRound size={18} /> Salvar nova senha</>}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          DomestiCare — Ferramenta informativa. Não substitui assessoria contábil ou jurídica.
        </p>
      </div>
    </div>
  );
}
