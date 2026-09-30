from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.db.models import Solicitacao, Categoria, Usuario, SolicitacaoCompartilhamento
from app.schemas.solicitacao import (
    SolicitacaoCriar, 
    SolicitacaoAtualizar, 
    SolicitacaoStatusAtualizar, 
    SolicitacaoResposta,
    CompartilhamentoCriar
)
from app.api.deps import obter_usuario_atual

router = APIRouter(prefix="/solicitacoes", tags=["Solicitações"])

@router.post("/", response_model=SolicitacaoResposta, status_code=status.HTTP_201_CREATED)
def criar_solicitacao(
    dados: SolicitacaoCriar,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Cria uma nova solicitação no sistema associando ao usuário logado."""
    categoria = db.query(Categoria).filter(Categoria.id == dados.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    nova_solicitacao = Solicitacao(
        titulo=dados.titulo,
        descricao=dados.descricao,
        categoria_id=dados.categoria_id,
        solicitante_id=usuario_atual.id,
        status="Aberto"
    )
    
    db.add(nova_solicitacao)
    db.commit()
    db.refresh(nova_solicitacao)
    return nova_solicitacao


@router.get("/", response_model=List[SolicitacaoResposta])
def listar_solicitacoes(
    status: Optional[str] = Query(None, description="Filtrar por status (Aberto, Em Atendimento, Concluído)"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por ID da Categoria"),
    busca: Optional[str] = Query(None, description="Pesquisa por texto livre no título"),
    data_inicio: Optional[str] = Query(None, description="Data inicial YYYY-MM-DD"),
    data_fim: Optional[str] = Query(None, description="Data final YYYY-MM-DD"),
    aba: str = Query("todas", description="Opções: todas, minhas, compartilhadas"),
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Lista solicitações com suporte a filtros avançados e abas."""
    query = db.query(Solicitacao).outerjoin(SolicitacaoCompartilhamento)

    # Filtragem por permissão/visibilidade
    if aba == "minhas":
        query = query.filter(Solicitacao.solicitante_id == usuario_atual.id)
    elif aba == "compartilhadas":
        query = query.filter(SolicitacaoCompartilhamento.usuario_id == usuario_atual.id)
    else:
        # Visível se for solicitante OU se foi compartilhada com ele
        query = query.filter(
            (Solicitacao.solicitante_id == usuario_atual.id) | 
            (SolicitacaoCompartilhamento.usuario_id == usuario_atual.id)
        )

    # Filtros condicionais
    if status:
        query = query.filter(Solicitacao.status == status)
    if categoria_id:
        query = query.filter(Solicitacao.categoria_id == categoria_id)
    if busca:
        query = query.filter(Solicitacao.titulo.ilike(f"%{busca}%"))
    if data_inicio:
        inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
        query = query.filter(Solicitacao.criado_em >= inicio)
    if data_fim:
        fim = datetime.strptime(f"{data_fim} 23:59:59", "%Y-%m-%d %H:%M:%S")
        query = query.filter(Solicitacao.criado_em <= fim)

    return query.distinct().order_by(Solicitacao.criado_em.desc()).all()


@router.get("/{id}", response_model=SolicitacaoResposta)
def obter_solicitacao(
    id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Consulta detalhes de uma solicitação específica."""
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    return solicitacao


@router.put("/{id}", response_model=SolicitacaoResposta)
def editar_solicitacao(
    id: int,
    dados: SolicitacaoAtualizar,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Edita uma solicitação. Regra: Apenas se o status for 'Aberto'."""
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    # Regra de negócio do edital
    if solicitacao.status != "Aberto":
        raise HTTPException(
            status_code=400, 
            detail="Apenas solicitações com status 'Aberto' podem ser editadas."
        )

    if solicitacao.solicitante_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar esta solicitação.")

    if dados.titulo:
        solicitacao.titulo = dados.titulo
    if dados.descricao:
        solicitacao.descricao = dados.descricao
    if dados.categoria_id:
        solicitacao.categoria_id = dados.categoria_id

    db.commit()
    db.refresh(solicitacao)
    return solicitacao


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_solicitacao(
    id: int,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Exclui uma solicitação. Regra: Apenas se o status for 'Aberto' e for o solicitante."""
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    if solicitacao.solicitante_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Apenas o criador pode excluir a solicitação.")

    # Regra de negócio do edital
    if solicitacao.status != "Aberto":
        raise HTTPException(
            status_code=400, 
            detail="Apenas solicitações com status 'Aberto' podem ser excluídas."
        )

    db.delete(solicitacao)
    db.commit()


@router.patch("/{id}/status", response_model=SolicitacaoResposta)
def alterar_status(
    id: int,
    dados: SolicitacaoStatusAtualizar,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Altera o status da solicitação (Aberto, Em Atendimento, Concluído)."""
    if dados.status not in ["Aberto", "Em Atendimento", "Concluído"]:
        raise HTTPException(status_code=400, detail="Status inválido.")

    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    solicitacao.status = dados.status
    db.commit()
    db.refresh(solicitacao)
    return solicitacao


@router.post("/{id}/compartilhar", response_model=SolicitacaoResposta)
def compartilhar_solicitacao(
    id: int,
    dados: CompartilhamentoCriar,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(obter_usuario_atual)
):
    """Compartilha uma solicitação com outro colaborador."""
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")

    # Verificar se o usuário existe
    usuario_destino = db.query(Usuario).filter(Usuario.id == dados.usuario_id).first()
    if not usuario_destino:
        raise HTTPException(status_code=404, detail="Usuário destino não encontrado.")

    # Verificar se já está compartilhado
    comp_existente = db.query(SolicitacaoCompartilhamento).filter(
        SolicitacaoCompartilhamento.solicitacao_id == id,
        SolicitacaoCompartilhamento.usuario_id == dados.usuario_id
    ).first()

    if not comp_existente:
        novo_comp = SolicitacaoCompartilhamento(
            solicitacao_id=id,
            usuario_id=dados.usuario_id,
            permissao=dados.permissao
        )
        db.add(novo_comp)
        db.commit()
        db.refresh(solicitacao)

    return solicitacao