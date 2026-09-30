from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Solicitacao, Usuario
from app.api.deps import obter_usuario_atual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/indicadores")
def obter_indicadores(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Retorna os contadores gerais e por status para o Dashboard."""
    total = db.query(Solicitacao).count()
    abertas = db.query(Solicitacao).filter(Solicitacao.status == "Aberto").count()
    em_atendimento = db.query(Solicitacao).filter(Solicitacao.status == "Em Atendimento").count()
    concluidas = db.query(Solicitacao).filter(Solicitacao.status == "Concluído").count()

    return {
        "total": total,
        "abertas": abertas,
        "em_atendimento": em_atendimento,
        "concluidas": concluidas
    }