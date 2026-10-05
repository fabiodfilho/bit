from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    usuario = Column(String(50), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False)
    avatar_url = Column(String, nullable=True)

    solicitacoes_criadas = relationship("Solicitacao", back_populates="solicitante")
    compartilhamentos = relationship("SolicitacaoCompartilhamento", back_populates="usuario")


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), unique=True, nullable=False)

    solicitacoes = relationship("Solicitacao", back_populates="categoria")


class Solicitacao(Base):
    __tablename__ = "solicitacoes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False, index=True)
    solicitante_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="Aberto", nullable=False, index=True)
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    data_termino_previsto = Column(DateTime, nullable=True)

    solicitante = relationship("Usuario", back_populates="solicitacoes_criadas")
    categoria = relationship("Categoria", back_populates="solicitacoes")
    compartilhamentos = relationship("SolicitacaoCompartilhamento", back_populates="solicitacao", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('Aberto', 'Em Atendimento', 'Concluído')", name="chk_status"),
    )


class SolicitacaoCompartilhamento(Base):
    __tablename__ = "solicitacao_compartilhamentos"

    solicitacao_id = Column(Integer, ForeignKey("solicitacoes.id", ondelete="CASCADE"), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    permissao = Column(String(20), default="LEITURA", nullable=False)
    compartilhado_em = Column(DateTime, default=datetime.utcnow, nullable=False)

    solicitacao = relationship("Solicitacao", back_populates="compartilhamentos")
    usuario = relationship("Usuario", back_populates="compartilhamentos")

    __table_args__ = (
        CheckConstraint("permissao IN ('LEITURA', 'EDICAO')", name="chk_permissao"),
    )