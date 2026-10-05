from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UsuarioCriar(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, example="João Silva")
    usuario: str = Field(..., min_length=3, max_length=50, example="joao.silva")
    senha: str = Field(..., min_length=6, example="senha123")
    avatar_url: Optional[str] = None

class UsuarioAtualizar(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    usuario: Optional[str] = Field(None, min_length=3, max_length=50)
    senha: Optional[str] = Field(None, min_length=6)
    avatar_url: Optional[str] = None

class UsuarioResposta(BaseModel):
    id: int
    nome: str
    usuario: str
    avatar_url: Optional[str] = None
    criado_em: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    usuario: str = Field(..., example="joao.silva")
    senha: str = Field(..., example="senha123")

class TokenResposta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResposta