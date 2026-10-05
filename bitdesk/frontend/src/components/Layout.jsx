import { useContext } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 
import { getAssetUrl } from '../services/api';
import { LayoutDashboard, ClipboardList, PlusCircle, LogOut, User, Sun, Moon, Calendar } from 'lucide-react';
export const Layout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const { tema, toggleTema } = useContext(ThemeContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Solicitações', path: '/solicitacoes', icon: ClipboardList },
    { label: 'Calendário', path: '/calendario', icon: Calendar },
    { label: 'Nova Solicitação', path: '/solicitacoes/nova', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between p-4 flex-shrink-0 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <img
              src="/Logo-BitDesk.png"
              alt="BitDesk"
              className=" w-auto max-w-full object-contain"
            />
          </div>

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
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
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

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 transition-colors duration-300">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 rounded-lg transition-colors duration-300">
            
            <Link to="/perfil" className="flex items-center gap-2 overflow-hidden hover:opacity-70 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 overflow-hidden transition-colors duration-300">
              {usuario?.avatar_url ? (
                <img 
                  src={getAssetUrl(usuario.avatar_url)}
                  alt="Perfil" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate transition-colors duration-300">{usuario?.nome}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate transition-colors duration-300">@{usuario?.usuario}</p>
            </div>
          </Link>

            <button
              onClick={handleLogout}
              title="Sair do sistema"
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="flex justify-end items-center px-6 py-3 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
          <button
            onClick={toggleTema}
            title={tema === 'light' ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors duration-300"
          >
            {tema === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};