from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Categoria, Usuario
from app.schemas.solicitacao import CategoriaResumo, UsuarioResumo
from app.api.deps import obter_usuario_atual

router = APIRouter(tags=["Auxiliares"])

@router.get("/categorias", response_model=List[CategoriaResumo])
def listar_categorias(db: Session = Depends(get_db)):
    """Retorna a lista de categorias cadastradas para os formulários e filtros."""
    return db.query(Categoria).all()

@router.get("/usuarios", response_model=List[UsuarioResumo])
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Lista os colaboradores cadastrados (exceto o usuário logado) para compartilhamento."""
    return db.query(Usuario).filter(Usuario.id != usuario_atual.id).all()