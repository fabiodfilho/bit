import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Save, Camera } from 'lucide-react';

export const Perfil = () => {
  const { usuario, atualizarUsuarioLocal } = useContext(AuthContext);
  
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setUsername(usuario.usuario || '');
    }
  }, [usuario]);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('Enviando foto...', { id: 'uploadToast' });
      
      const res = await api.post(`/usuarios/${usuario.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Foto de perfil atualizada!', { id: 'uploadToast' });
      
      atualizarUsuarioLocal({ avatar_url: res.data.avatar_url });
      
    } catch (err) {
      toast.error('Erro ao enviar a foto.', { id: 'uploadToast' });
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const payload = { nome, usuario: username };
      if (senha) payload.senha = senha;

      const res = await api.put(`/usuarios/${usuario.id}`, payload);
      
      atualizarUsuarioLocal({ nome, usuario: username });
      toast.success('Perfil atualizado com sucesso!');
      setSenha('');
      
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
        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Atualize suas informações pessoais e foto de perfil</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors">
        
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-lg flex items-center justify-center flex-shrink-0">
              {usuario?.avatar_url ? (
                <img 
                  src={`http://localhost:8000${usuario.avatar_url}`} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>

            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFotoChange} 
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{usuario?.nome}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{usuario?.usuario}</p>
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline"
            >
              Alterar foto
            </button>
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