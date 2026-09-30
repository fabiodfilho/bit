from pydantic import BaseModel, Field
from datetime import datetime

# Schema para criação de usuário
class UsuarioCriar(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, example="João Silva")
    usuario: str = Field(..., min_length=3, max_length=50, example="joao.silva")
    senha: str = Field(..., min_length=6, example="senha123")

# Schema de resposta (retorno seguro sem a senha)
class UsuarioResposta(BaseModel):
    id: int
    nome: str
    usuario: str
    criado_em: datetime

    class Config:
        from_attributes = True

# Schema para formulário de Login
class LoginRequest(BaseModel):
    usuario: str = Field(..., example="joao.silva")
    senha: str = Field(..., example="senha123")

# Schema para resposta do Token JWT
class TokenResposta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResposta