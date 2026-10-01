import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

export const Perfil = () => {
  const { usuario } = useContext(AuthContext);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Preenche os dados quando o componente montar
  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setUsername(usuario.usuario || '');
    }
  }, [usuario]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Monta o payload. Só envia a senha se o usuário digitou uma nova
      const payload = { nome, usuario: username };
      if (senha) payload.senha = senha;

      // Supondo que a rota do seu backend seja PUT /usuarios/{id} ou /usuarios/me
      await api.put(`/usuarios/${usuario.id}`, payload);
      
      toast.success('Perfil atualizado com sucesso! Faça login novamente para ver as alterações (se necessário).', { duration: 4000 });
      setSenha(''); // Limpa o campo de senha por segurança
      
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao atualizar perfil.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide transition-colors">Meu Perfil</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Atualize suas informações pessoais e credenciais de acesso</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{usuario?.nome}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{usuario?.usuario}</p>
          </div>
        </div>

        <form onSubmit={handleSalvar} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase mb-2">Nome Completo</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase mb-2">Nome de Usuário (Login)</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase mb-2">Nova Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={carregando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};