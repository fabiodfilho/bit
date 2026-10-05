import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [usuarioInput, setUsuarioInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [erro, setErro] = useState('');
  const [carregandoForm, setCarregandoForm] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregandoForm(true);

    try {
      const res = await api.post('/auth/login', {
        usuario: usuarioInput,
        senha: senhaInput
      });

      const token = res.data.access_token;
      localStorage.setItem('token', token);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      login(res.data.usuario);

      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      console.error("Erro capturado no frontend:", err);
      setErro(err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setCarregandoForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
        
        <div className="text-center mb-8">
          <div> 
            <img
              src="/Logo-BitDesk.png"
              alt="BitDesk"
              className=" w-auto max-w-full object-contain"
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Portal de Solicitações Internas</p>
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Usuário
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={usuarioInput}
                onChange={(e) => setUsuarioInput(e.target.value)}
                placeholder="Ex: admin ou dev.junior"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregandoForm}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregandoForm ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Bit Soluções &copy; 2026 - By Fábio Dantas - Desenvolvedor Júnior
        </div>
      </div>
    </div>
  );
};