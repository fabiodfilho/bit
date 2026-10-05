from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Usuario
from app.schemas.usuario import UsuarioCriar, UsuarioResposta, LoginRequest, TokenResposta
from app.core.security import verificar_senha, gerar_hash_senha, criar_token_acesso
from app.api.deps import obter_usuario_atual

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/cadastrar", response_model=UsuarioResposta, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(dados: UsuarioCriar, db: Session = Depends(get_db)):
    """Cadastra um novo colaborador no sistema BitDesk."""
    usuario_existente = db.query(Usuario).filter(Usuario.usuario == dados.usuario).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Este nome de usuário já está em uso."
        )

    novo_usuario = Usuario(
        nome=dados.nome,
        usuario=dados.usuario,
        senha_hash=gerar_hash_senha(dados.senha)
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


@router.post("/login", response_model=TokenResposta)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    """Autentica o usuário e retorna o token JWT."""
    usuario = db.query(Usuario).filter(Usuario.usuario == dados.usuario).first()
    
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )

    token = criar_token_acesso(dados={"sub": str(usuario.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario
    }


@router.get("/me", response_model=UsuarioResposta)
def obter_perfil_logado(usuario_atual: Usuario = Depends(obter_usuario_atual)):
    """Retorna os dados do usuário atualmente autenticado."""
    return usuario_atual