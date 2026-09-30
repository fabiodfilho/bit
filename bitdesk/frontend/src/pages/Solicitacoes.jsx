import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Share2, 
  X, 
  AlertCircle,
  UserCheck,
  Tag,
  Calendar
} from 'lucide-react';

export const Solicitacoes = () => {
  const { usuario } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Estados de Dados
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuariosColaboradores, setUsuariosColaboradores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados de Filtro
  const [aba, setAba] = useState('todas'); // todas | minhas | compartilhadas
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalCompartilharAberto, setModalCompartilharAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

  // Formulário Nova Solicitação
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoriaId, setNovaCategoriaId] = useState('');

  // Formulário Compartilhamento
  const [usuarioCompartilharId, setUsuarioCompartilharId] = useState('');

  // Feedback de Mensagem
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    if (location.pathname === '/solicitacoes/nova') {
      setModalNovoAberto(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    carregarCategorias();
    carregarUsuarios();
  }, []);

  useEffect(() => {
    carregarSolicitacoes();
  }, [aba, categoriaFiltro, statusFiltro]);


  const fecharModalNovo = () => {
    setModalNovoAberto(false);
    if (location.pathname === '/solicitacoes/nova') {
      navigate('/solicitacoes', { replace: true });
    }
    };

  const carregarCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuariosColaboradores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const carregarSolicitacoes = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.append('aba', aba);
      if (busca) params.append('busca', busca);
      if (categoriaFiltro) params.append('categoria_id', categoriaFiltro);
      if (statusFiltro) params.append('status', statusFiltro);

      const res = await api.get(`/solicitacoes?${params.toString()}`);
      setSolicitacoes(res.data);
    } catch (err) {
      setMensagemErro('Erro ao carregar solicitações.');
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    carregarSolicitacoes();
  };

  const handleCriarSolicitacao = async (e) => {
    e.preventDefault();
    setMensagemErro('');
    try {
      await api.post('/solicitacoes', {
        titulo: novoTitulo,
        descricao: novaDescricao,
        categoria_id: parseInt(novaCategoriaId)
      });
      setMensagemSucesso('Solicitação criada com sucesso!');
      fecharModalNovo();
      setNovoTitulo('');
      setNovaDescricao('');
      setNovaCategoriaId('');
      carregarSolicitacoes();
    } catch (err) {
      setMensagemErro(err.response?.data?.detail || 'Erro ao criar solicitação.');
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/solicitacoes/${id}/status`, { status: novoStatus });
      setMensagemSucesso(`Status alterado para "${novoStatus}"`);
      carregarSolicitacoes();
    } catch (err) {
      setMensagemErro('Erro ao alterar status.');
    }
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    try {
      await api.delete(`/solicitacoes/${id}`);
      setMensagemSucesso('Solicitação excluída com sucesso.');
      carregarSolicitacoes();
    } catch (err) {
      setMensagemErro(err.response?.data?.detail || 'Não foi possível excluir.');
    }
  };

  const handleCompartilhar = async (e) => {
    e.preventDefault();
    if (!solicitacaoSelecionada || !usuarioCompartilharId) return;

    try {
      await api.post(`/solicitacoes/${solicitacaoSelecionada.id}/compartilhar`, {
        usuario_id: parseInt(usuarioCompartilharId),
        permissao: 'LEITURA'
      });
      setMensagemSucesso('Solicitação compartilhada com sucesso!');
      setModalCompartilharAberto(false);
      setUsuarioCompartilharId('');
      carregarSolicitacoes();
    } catch (err) {
      setMensagemErro('Erro ao compartilhar solicitação.');
    }
  };

  const badgeStatus = (status) => {
    switch (status) {
      case 'Aberto':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Em Atendimento':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Concluído':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Gerenciador de Solicitações</h1>
          <p className="text-slate-400 text-sm">Acompanhe, crie e compartilhe chamados internos</p>
        </div>
        <button
          onClick={() => setModalNovoAberto(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      {/* Alertas de Notificação */}
      {mensagemSucesso && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex justify-between items-center">
          <span>{mensagemSucesso}</span>
          <button onClick={() => setMensagemSucesso('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {mensagemErro && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{mensagemErro}</span>
          <button onClick={() => setMensagemErro('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Abas e Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        
        {/* Abas (Todas / Minhas / Compartilhadas) */}
        <div className="flex border-b border-slate-800 gap-2 pb-2">
          {[
            { id: 'todas', label: 'Todas as Visíveis' },
            { id: 'minhas', label: 'Criadas por Mim' },
            { id: 'compartilhadas', label: 'Compartilhadas Comigo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aba === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Barra de Pesquisa e Seletores */}
        <form onSubmit={handleBuscarSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Busca por texto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtro por Categoria */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>

          {/* Filtro por Status */}
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Concluído">Concluído</option>
          </select>

          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </form>
      </div>

      {/* Tabela de Listagem */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : solicitacoes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-slate-300">Nenhuma solicitação encontrada</p>
          <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros ou crie um novo chamado.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Título & Descrição</th>
                  <th className="px-6 py-3.5">Categoria</th>
                  <th className="px-6 py-3.5">Solicitante</th>
                  <th className="px-6 py-3.5">Data</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {solicitacoes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{s.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-100">{s.titulo}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{s.descricao}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <Tag className="w-3 h-3" />
                        {s.categoria.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {s.solicitante.nome}
                      {s.solicitante.id === usuario?.id && (
                        <span className="ml-1 text-[10px] text-blue-400 font-bold">(Você)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={s.status}
                        onChange={(e) => handleAlterarStatus(s.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none ${badgeStatus(s.status)}`}
                      >
                        <option value="Aberto" className="bg-slate-900 text-amber-400">Aberto</option>
                        <option value="Em Atendimento" className="bg-slate-900 text-cyan-400">Em Atendimento</option>
                        <option value="Concluído" className="bg-slate-900 text-emerald-400">Concluído</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Compartilhar */}
                        <button
                          onClick={() => {
                            setSolicitacaoSelecionada(s);
                            setModalCompartilharAberto(true);
                          }}
                          title="Compartilhar com colaborador"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Botão Excluir (apenas se for criador e estiver Aberto) */}
                        {s.solicitante.id === usuario?.id && s.status === 'Aberto' && (
                          <button
                            onClick={() => handleExcluir(s.id)}
                            title="Excluir solicitação"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Nova Solicitação */}
      {modalNovoAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Criar Nova Solicitação</h2>
                <button onClick={fecharModalNovo}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCriarSolicitacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Troca de mouse no setor Financeiro"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Categoria</label>
                <select
                  required
                  value={novaCategoriaId}
                  onChange={(e) => setNovaCategoriaId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Descrição Detalhada</label>
                <textarea
                  required
                  rows={4}
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Descreva a necessidade ou o problema enfrentado..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                type="button"
                onClick={fecharModalNovo}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
                >
                Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/30"
                >
                  Cadastrar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Compartilhar Solicitação */}
      {modalCompartilharAberto && solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Compartilhar Chamado #{solicitacaoSelecionada.id}</h2>
              <button onClick={() => setModalCompartilharAberto(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Selecione um colaborador para conceder acesso de visualização a este chamado.
            </p>

            <form onSubmit={handleCompartilhar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Colaborador</label>
                <select
                  required
                  value={usuarioCompartilharId}
                  onChange={(e) => setUsuarioCompartilharId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione o usuário...</option>
                  {usuariosColaboradores.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome} (@{u.usuario})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCompartilharAberto(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/30"
                >
                  Confirmar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};