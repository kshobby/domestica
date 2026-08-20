import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { Calculators } from './pages/Calculators';
import { CalendarPage } from './pages/CalendarPage';
import { ESocialGuide } from './pages/ESocialGuide';
import { Payslip } from './pages/Payslip';
import { ChatBot } from './pages/ChatBot';

export default function App() {
  const { user, loading, isRecovery, signIn, signUp, signOut, resetPassword, updatePassword } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Usuário clicou no link de redefinição de senha
  if (isRecovery && user) {
    return <ResetPassword onUpdatePassword={updatePassword} />;
  }

  if (!user) {
    return <Login onLogin={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onSignOut={signOut} userName={user.user_metadata?.nome} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/funcionarios" element={<Employees />} />
          <Route path="/funcionarios/:id" element={<EmployeeDetail />} />
          <Route path="/calculadoras" element={<Calculators />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/guia-esocial" element={<ESocialGuide />} />
          <Route path="/holerite" element={<Payslip />} />
          <Route path="/assistente" element={<ChatBot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
