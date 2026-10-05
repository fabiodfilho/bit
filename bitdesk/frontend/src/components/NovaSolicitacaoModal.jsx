import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const NovaSolicitacaoModal = ({ categorias, onFechar, onCriada }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [dataTerminoPrevisto, setDataTerminoPrevisto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      await api.post('/solicitacoes/', {
        titulo,
        descricao,
        categoria_id: parseInt(categoriaId, 10),
        data_termino_previsto: dataTerminoPrevisto
          ? `${dataTerminoPrevisto}T00:00:00`
          : null,
      });
      toast.success('Solicitação criada com sucesso!');
      onFechar();
      onCriada();
    } catch (err) {
      const detalhe = err.response?.data?.detail;
      const mensagem = Array.isArray(detalhe)
        ? detalhe.map((item) => item.msg).filter(Boolean).join(' ')
        : detalhe;
      toast.error(typeof mensagem === 'string' ? mensagem : 'Erro ao criar solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Criar Nova Solicitação</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Título</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Troca de mouse no setor Financeiro"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Categoria</label>
            <select
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione uma categoria...</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">Descrição Detalhada</label>
            <textarea
              required
              minLength={5}
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva a necessidade ou o problema enfrentado..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="data-termino-previsto" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Data prevista de término (opcional)
            </label>
            <input
              id="data-termino-previsto"
              type="date"
              value={dataTerminoPrevisto}
              onChange={(e) => setDataTerminoPrevisto(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {enviando ? 'Cadastrando...' : 'Cadastrar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};