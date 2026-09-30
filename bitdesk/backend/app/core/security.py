from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Configuração do contexto de hash utilizando Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    """Verifica se a senha em texto puro corresponde ao hash armazenado."""
    return pwd_context.verify(senha_pura, senha_hash)

def gerar_hash_senha(senha: str) -> str:
    """Gera o hash da senha usando Bcrypt."""
    return pwd_context.hash(senha)

def criar_token_acesso(dados: dict, tempo_expiracao: Optional[timedelta] = None) -> str:
    """Cria o token JWT assinado."""
    dados_para_codificar = dados.copy()
    
    if tempo_expiracao:
        expira = datetime.utcnow() + tempo_expiracao
    else:
        expira = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    dados_para_codificar.update({"exp": expira})
    
    token_jwt = jwt.encode(
        dados_para_codificar, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return token_jwt