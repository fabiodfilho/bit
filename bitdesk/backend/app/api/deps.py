from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Usuario
from app.core.config import settings

security = HTTPBearer()

def obter_usuario_atual(
    db: Session = Depends(get_db), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Usuario:
    token = credentials.credentials
    excecao_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais de acesso.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise excecao_credenciais
    except JWTError:
        raise excecao_credenciais

    usuario = db.query(Usuario).filter(Usuario.id == int(usuario_id)).first()
    if usuario is None:
        raise excecao_credenciais

    return usuario