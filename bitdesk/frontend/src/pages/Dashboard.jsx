import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight 
} from 'lucide-react';

export const Dashboard = () => {
  const [indicadores, setIndicadores] = useState({
    total: 0,
    abertas: 0,
    em_atendimento: 0,
    concluidas: 0
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarIndicadores();
  }, []);

  const carregarIndicadores = async () => {
    try {
      const response = await api.get('/dashboard/indicadores');
      setIndicadores(response.data);
    } catch (error) {
      console.error('Erro ao carregar indicadores do dashboard:', error);
    } finally {
      setCarregando(false);
    }
  };

  const cards = [
    {
      titulo: 'Total de Solicitações',
      valor: indicadores.total,
      icone: ClipboardList,
      corTexto: 'text-blue-400',
      corBg: 'bg-blue-500/10',
      corBorda: 'border-blue-500/30'
    },
    {
      titulo: 'Solicitações Abertas',
      valor: indicadores.abertas,
      icone: AlertCircle,
      corTexto: 'text-amber-400',
      corBg: 'bg-amber-500/10',
      corBorda: 'border-amber-500/30'
    },
    {
      titulo: 'Em Atendimento',
      valor: indicadores.em_atendimento,
      icone: Clock,
      corTexto: 'text-cyan-400',
      corBg: 'bg-cyan-500/10',
      corBorda: 'border-cyan-500/30'
    },
    {
      titulo: 'Concluídas',
      valor: indicadores.concluidas,
      icone: CheckCircle2,
      corTexto: 'text-emerald-400',
      corBg: 'bg-emerald-500/10',
      corBorda: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Painel de Indicadores</h1>
          <p className="text-slate-400 text-sm">Resumo do fluxo de chamados do BitDesk</p>
        </div>
        <Link
          to="/solicitacoes/nova"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Nova Solicitação
        </Link>
      </div>

      {/* Cards de Métricas */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse p-5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icone;
            return (
              <div
                key={index}
                className={`bg-slate-900/80 border ${card.corBorda} rounded-xl p-5 flex items-center justify-between transition-all hover:translate-y-[-2px]`}
              >
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{card.titulo}</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{card.valor}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.corBg} ${card.corTexto}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barra de Progresso / Proporção de Status */}
      {!carregando && indicadores.total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Distribuição dos Status
          </h3>
          
          {/* Barra Visual Proporcional */}
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${(indicadores.abertas / indicadores.total) * 100}%` }} 
              className="bg-amber-500 transition-all duration-500"
              title="Abertas"
            ></div>
            <div 
              style={{ width: `${(indicadores.em_atendimento / indicadores.total) * 100}%` }} 
              className="bg-cyan-500 transition-all duration-500"
              title="Em Atendimento"
            ></div>
            <div 
              style={{ width: `${(indicadores.concluidas / indicadores.total) * 100}%` }} 
              className="bg-emerald-500 transition-all duration-500"
              title="Concluídas"
            ></div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-6 mt-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Abertas ({Math.round((indicadores.abertas / indicadores.total) * 100) || 0}%)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              Em Atendimento ({Math.round((indicadores.em_atendimento / indicadores.total) * 100) || 0}%)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Concluídas ({Math.round((indicadores.concluidas / indicadores.total) * 100) || 0}%)
            </div>
          </div>
        </div>
      )}

      {/* Banner de Ação Rápida */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Gerenciar Solicitações</h3>
          <p className="text-slate-400 text-sm mt-0.5">Visualize a lista completa, aplique filtros por categoria e atualize os chamados.</p>
        </div>
        <Link
          to="/solicitacoes"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors group"
        >
          Acessar Gerenciador
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
