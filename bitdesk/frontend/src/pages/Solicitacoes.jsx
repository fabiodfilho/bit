import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast'; // Importação do Toast
import { 
  ClipboardList, 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  Share2, 
  X, 
  Tag
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

  // Estados de Filtro e Ordenação
  const [aba, setAba] = useState('todas'); 
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Estado de ordenação

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
      toast.error('Erro ao carregar solicitações.');
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
    try {
      await api.post('/solicitacoes', {
        titulo: novoTitulo,
        descricao: novaDescricao,
        categoria_id: parseInt(novaCategoriaId)
      });
      toast.success('Solicitação criada com sucesso!');
      fecharModalNovo();
      setNovoTitulo('');
      setNovaDescricao('');
      setNovaCategoriaId('');
      carregarSolicitacoes();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar solicitação.');
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/solicitacoes/${id}/status`, { status: novoStatus });
      toast.success(`Status alterado para "${novoStatus}"`);
      carregarSolicitacoes();
    } catch (err) {
      toast.error('Erro ao alterar status.');
    }
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    try {
      await api.delete(`/solicitacoes/${id}`);
      toast.success('Solicitação excluída com sucesso.');
      carregarSolicitacoes();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Não foi possível excluir.');
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
      toast.success('Solicitação compartilhada com sucesso!');
      setModalCompartilharAberto(false);
      setUsuarioCompartilharId('');
      carregarSolicitacoes();
    } catch (err) {
      toast.error('Erro ao compartilhar solicitação.');
    }
  };

  const badgeStatus = (status) => {
    switch (status) {
      case 'Aberto': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Em Atendimento': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
      case 'Concluído': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  // --- LÓGICA DE ORDENAÇÃO ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const solicitacoesOrdenadas = [...solicitacoes].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Ajustes para campos aninhados
    if (sortConfig.key === 'categoria') {
      aValue = a.categoria?.nome || '';
      bValue = b.categoria?.nome || '';
    } else if (sortConfig.key === 'solicitante') {
      aValue = a.solicitante?.nome || '';
      bValue = b.solicitante?.nome || '';
    } else if (sortConfig.key === 'data') {
      aValue = new Date(a.criado_em).getTime();
      bValue = new Date(b.criado_em).getTime();
    }

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">Gerenciador de Solicitações</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Acompanhe, crie e compartilhe chamados internos</p>
        </div>
        <button
          onClick={() => setModalNovoAberto(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      {/* Abas e Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        
        {/* Abas (Todas / Minhas / Compartilhadas) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 pb-2">
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
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Barra de Pesquisa e Seletores */}
        <form onSubmit={handleBuscarSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Concluído">Concluído</option>
          </select>

          <button
            type="submit"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
            <div key={i} className="h-20 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : solicitacoesOrdenadas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-600 dark:text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhuma solicitação encontrada</p>
          <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros ou crie um novo chamado.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th onClick={() => handleSort('id')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Código <span className="text-[10px]">{getSortIcon('id')}</span>
                  </th>
                  <th onClick={() => handleSort('titulo')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Título & Descrição <span className="text-[10px]">{getSortIcon('titulo')}</span>
                  </th>
                  <th onClick={() => handleSort('categoria')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Categoria <span className="text-[10px]">{getSortIcon('categoria')}</span>
                  </th>
                  <th onClick={() => handleSort('solicitante')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Solicitante <span className="text-[10px]">{getSortIcon('solicitante')}</span>
                  </th>
                  <th onClick={() => handleSort('data')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Data <span className="text-[10px]">{getSortIcon('data')}</span>
                  </th>
                  <th onClick={() => handleSort('status')} className="px-6 py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Status <span className="text-[10px]">{getSortIcon('status')}</span>
                  </th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {solicitacoesOrdenadas.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{s.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{s.titulo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{s.descricao}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Tag className="w-3 h-3" />
                        {s.categoria.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 dark:text-slate-300">
                      {s.solicitante.nome}
                      {s.solicitante.id === usuario?.id && (
                        <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">(Você)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={s.status}
                        onChange={(e) => handleAlterarStatus(s.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none ${badgeStatus(s.status)}`}
                      >
                        <option value="Aberto" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400">Aberto</option>
                        <option value="Em Atendimento" className="bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400">Em Atendimento</option>
                        <option value="Concluído" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400">Concluído</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSolicitacaoSelecionada(s);
                            setModalCompartilharAberto(true);
                          }}
                          title="Compartilhar com colaborador"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {s.solicitante.id === usuario?.id && s.status === 'Aberto' && (
                          <button
                            onClick={() => handleExcluir(s.id)}
                            title="Excluir solicitação"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
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
        <div className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Criar Nova Solicitação</h2>
                <button onClick={fecharModalNovo}><X className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
            </div>

            <form onSubmit={handleCriarSolicitacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Troca de mouse no setor Financeiro"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Categoria</label>
                <select
                  required
                  value={novaCategoriaId}
                  onChange={(e) => setNovaCategoriaId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Descrição Detalhada</label>
                <textarea
                  required
                  rows={4}
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Descreva a necessidade ou o problema enfrentado..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                type="button"
                onClick={fecharModalNovo}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compartilhar Chamado #{solicitacaoSelecionada.id}</h2>
              <button onClick={() => setModalCompartilharAberto(false)}><X className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Selecione um colaborador para conceder acesso de visualização a este chamado.
            </p>

            <form onSubmit={handleCompartilhar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Colaborador</label>
                <select
                  required
                  value={usuarioCompartilharId}
                  onChange={(e) => setUsuarioCompartilharId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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