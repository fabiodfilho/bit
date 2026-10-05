import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import api from '../services/api';
import { SolicitacaoDetalhesModal } from '../components/SolicitacaoDetalhesModal';

export const Calendario = () => {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

  useEffect(() => {
    const carregarPrazos = async () => {
      try {
        const response = await api.get('/solicitacoes');

        const solicitacoesComPrazo = response.data
          .filter(sol => sol.data_termino_previsto)
          .map(sol => ({
            id: String(sol.id),
            title: sol.titulo || `Solicitação #${sol.id}`,
            start: sol.data_termino_previsto.split('T')[0],
            allDay: true,
            extendedProps: { solicitacao: sol },
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
          }));

        setEventos(solicitacoesComPrazo);
      } catch (error) {
        console.error('Erro ao carregar solicitações para o calendário:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPrazos();
  }, []);

  const handleEventClick = (info) => {
    setSolicitacaoSelecionada(info.event.extendedProps.solicitacao);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Calendário de Prazos</h2>
        
        {carregando ? (
          <div className="h-[600px] w-full bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl"></div>
        ) : (
          <div className="h-[600px] calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              locale={ptBrLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
              events={eventos}
              eventClick={handleEventClick}
              height="100%"
            />
          </div>
        )}
      </div>
      {solicitacaoSelecionada && (
        <SolicitacaoDetalhesModal
          solicitacao={solicitacaoSelecionada}
          onFechar={() => setSolicitacaoSelecionada(null)}
        />
      )}
    </div>
  );
};