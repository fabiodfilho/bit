from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
from app.api.deps import obter_usuario_atual
from app.core.security import gerar_hash_senha
from app.db.database import get_db
from app.db.models import Usuario
from app.schemas.usuario import UsuarioAtualizar, UsuarioResposta

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/{user_id}/avatar")
async def upload_avatar(user_id: int, file: UploadFile = File(...)):
    # Caminho onde a imagem será salva
    file_path = f"uploads/avatars/{user_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    avatar_url = f"/uploads/avatars/{user_id}_{file.filename}"
    
    # Lembre-se de atualizar o campo `avatar_url` ou `foto` do usuário no banco de dados aqui!
    # ...
    
    return {"avatar_url": avatar_url, "mensagem": "Foto atualizada com sucesso!"}

@router.put("/{usuario_id}", response_model=UsuarioResposta)
def atualizar_usuario(
    usuario_id: int,
    dados: UsuarioAtualizar,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual),
):
    """Atualiza os dados do próprio perfil autenticado."""
    if usuario_id != usuario_atual.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode atualizar o próprio perfil.",
        )

    if dados.usuario and dados.usuario != usuario_atual.usuario:
        usuario_existente = (
            db.query(Usuario)
            .filter(Usuario.usuario == dados.usuario, Usuario.id != usuario_atual.id)
            .first()
        )
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este nome de usuário já está em uso.",
            )

    if dados.nome is not None:
        usuario_atual.nome = dados.nome
    if dados.usuario is not None:
        usuario_atual.usuario = dados.usuario
    if dados.senha:
        usuario_atual.senha_hash = gerar_hash_senha(dados.senha)

    db.commit()
    db.refresh(usuario_atual)
    return usuario_atual
