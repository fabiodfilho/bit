from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Solicitacao, SolicitacaoCompartilhamento, Usuario
from app.api.deps import obter_usuario_atual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/indicadores")
def obter_indicadores(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    solicitacoes_usuario = (
        db.query(Solicitacao)
        .outerjoin(SolicitacaoCompartilhamento)
        .filter(
            or_(
                Solicitacao.solicitante_id == usuario_atual.id,
                SolicitacaoCompartilhamento.usuario_id == usuario_atual.id
            )
        )
        .distinct()
    )
    total = solicitacoes_usuario.count()
    abertas = solicitacoes_usuario.filter(Solicitacao.status == "Aberto").count()
    em_atendimento = solicitacoes_usuario.filter(Solicitacao.status == "Em Atendimento").count()
    concluidas = solicitacoes_usuario.filter(Solicitacao.status == "Concluído").count()

    return {
        "total": total,
        "abertas": abertas,
        "em_atendimento": em_atendimento,
        "concluidas": concluidas
    }