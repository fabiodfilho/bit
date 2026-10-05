from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class CategoriaResumo(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True

class UsuarioResumo(BaseModel):
    id: int
    nome: str
    usuario: str

    class Config:
        from_attributes = True

class SolicitacaoCriar(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=150, example="Impressora do setor Financeiro com defeito")
    descricao: str = Field(..., min_length=5, example="A impressora não está puxando papel nem ligando o painel.")
    categoria_id: int = Field(..., example=1)
    data_termino_previsto: Optional[datetime] = None

class SolicitacaoAtualizar(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=150)
    descricao: Optional[str] = Field(None, min_length=1)
    data_termino_previsto: Optional[datetime] = None
    categoria_id: Optional[int] = None

class SolicitacaoStatusAtualizar(BaseModel):
    status: str = Field(..., example="Em Atendimento")

class CompartilhamentoCriar(BaseModel):
    usuario_id: int = Field(..., example=2)
    permissao: str = Field("LEITURA", example="LEITURA")

class CompartilhamentoResposta(BaseModel):
    usuario: UsuarioResumo
    permissao: str
    compartilhado_em: datetime

    class Config:
        from_attributes = True

class SolicitacaoResposta(BaseModel):
    id: int
    titulo: str
    descricao: str
    status: str
    criado_em: datetime
    atualizado_em: datetime
    categoria: CategoriaResumo
    solicitante: UsuarioResumo
    compartilhamentos: List[CompartilhamentoResposta] = []
    data_termino_previsto: Optional[datetime] = None

    class Config:
        from_attributes = True