import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Calendar,
  BookOpen,
  FileText,
  Menu,
  X,
  Home,
  MessageCircle,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Painel Inicial' },
  { to: '/funcionarios', icon: Users, label: 'Funcionários' },
  { to: '/calculadoras', icon: Calculator, label: 'Calculadoras' },
  { to: '/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/guia-esocial', icon: BookOpen, label: 'Guia eSocial' },
  { to: '/holerite', icon: FileText, label: 'Holerite' },
  { to: '/assistente', icon: MessageCircle, label: 'Assistente IA' },
];

interface LayoutProps {
  onSignOut?: () => void;
  userName?: string;
}

export function Layout({ onSignOut, userName }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <Home className="text-primary" size={28} />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">DomestiCare</h1>
            <p className="text-xs text-gray-500">Gestão Doméstica Simplificada</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          {userName && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 truncate">{userName}</p>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Ferramenta informativa. Não substitui assessoria contábil ou jurídica profissional.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:hidden no-print">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-bold text-gray-900">DomestiCare</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
