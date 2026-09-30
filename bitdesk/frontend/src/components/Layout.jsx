import { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ClipboardList, PlusCircle, LogOut, User } from 'lucide-react';

export const Layout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Solicitações', path: '/solicitacoes', icon: ClipboardList },
    { label: 'Nova Solicitação', path: '/solicitacoes/nova', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
              BIT
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-wide text-white leading-none">BitDesk</h2>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Portal Interno</span>
            </div>
          </div>

          {/* Navegação */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Perfil & Logout */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{usuario?.nome}</p>
                <p className="text-[10px] text-slate-500 truncate">@{usuario?.usuario}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair do sistema"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};