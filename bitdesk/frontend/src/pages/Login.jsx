import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Lock, User, AlertCircle } from 'lucide-react';

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
      await login(usuarioInput, senhaInput);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setCarregandoForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-8">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/20 text-blue-500 rounded-xl mb-4 border border-blue-500/30">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">BitDesk</h1>
          <p className="text-slate-400 text-sm mt-1">Portal de Solicitações Internas</p>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Usuário
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={usuarioInput}
                onChange={(e) => setUsuarioInput(e.target.value)}
                placeholder="Ex: admin ou dev.junior"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
          bit Soluções &copy; 2026 - Desenvolvedor Júnior
        </div>
      </div>
    </div>
  );
};