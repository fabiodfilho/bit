from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from app.api.deps import obter_usuario_atual
from app.core.security import gerar_hash_senha
from app.db.database import get_db
from app.db.models import Usuario
from app.schemas.usuario import UsuarioAtualizar, UsuarioResposta

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/{user_id}/avatar")
async def upload_avatar(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs("uploads/avatars", exist_ok=True)
    
    file_path = f"uploads/avatars/{user_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    avatar_url = f"/uploads/avatars/{user_id}_{file.filename}"
    
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    
    usuario.avatar_url = avatar_url
    
    db.commit()
    db.refresh(usuario)
    
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

def get_current_admin_user(
    current_user: Usuario = Depends(obter_usuario_atual)
) -> Usuario:
    if current_user.usuario.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operação não permitida. Privilégios de administrador necessários."
        )
    return current_user

# 2. Rota para listar todos os utilizadores (Apenas Admin)
@router.get("/", response_model=List[UsuarioResposta])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin_user)
):
    usuarios = db.query(Usuario).all()
    return usuarios


# 3. Rota para excluir um utilizador (Apenas Admin)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_admin_user) # Injeta a verificação de admin
):
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Usuário não encontrado."
        )
        
    # Prevenção: Evitar que o admin se exclua a si próprio (opcional, mas recomendado)
    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O administrador não pode excluir a sua própria conta."
        )

    db.delete(usuario)
    db.commit()
    return None
