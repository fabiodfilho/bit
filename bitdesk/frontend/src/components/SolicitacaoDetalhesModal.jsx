import { useEffect } from 'react';
import { CalendarDays, Tag, User, X } from 'lucide-react';

const statusClasses = {
  Aberto: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  'Em Atendimento': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  'Concluído': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

export const SolicitacaoDetalhesModal = ({ solicitacao, onFechar }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onFechar();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFechar]);

  if (!solicitacao) return null;

  const dataCriacao = solicitacao.criado_em
    ? new Date(solicitacao.criado_em).toLocaleString('pt-BR')
    : 'Não informada';
  const dataTermino = solicitacao.data_termino_previsto
    ? solicitacao.data_termino_previsto.split('T')[0].split('-').reverse().join('/')
    : 'Não definida';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm dark:bg-black/70"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="solicitacao-detalhes-titulo"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-xs text-slate-500 dark:text-slate-400">#{solicitacao.id}</p>
            <h2 id="solicitacao-detalhes-titulo" className="text-xl font-bold text-slate-900 dark:text-white">
              {solicitacao.titulo || `Solicitação #${solicitacao.id}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar detalhes da solicitação"
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Descrição
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800 dark:text-slate-200">
            {solicitacao.descricao || 'Nenhuma descrição informada.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <Tag className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <strong className="block text-xs uppercase text-slate-500 dark:text-slate-500">Categoria</strong>
              {solicitacao.categoria?.nome || 'Sem categoria'}
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <User className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <strong className="block text-xs uppercase text-slate-500 dark:text-slate-500">Solicitante</strong>
              {solicitacao.solicitante?.nome || 'Usuário indisponível'}
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <strong className="block text-xs uppercase text-slate-500 dark:text-slate-500">Criada em</strong>
              {dataCriacao}
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
            <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              <strong className="block text-xs uppercase text-slate-500 dark:text-slate-500">Prazo previsto</strong>
              {dataTermino}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</span>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[solicitacao.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            {solicitacao.status || 'Não informado'}
          </span>
        </div>
      </section>
    </div>
  );
};
