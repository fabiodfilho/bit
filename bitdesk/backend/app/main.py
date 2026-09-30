from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.db.models import Categoria, Usuario
from app.core.security import gerar_hash_senha

from app.api.v1.auth import router as auth_router
from app.api.v1.solicitacoes import router as solicitacoes_router
from app.api.v1.dashboard import router as dashboard_router  # <--- Nova Importação
from app.api.v1.auxiliares import router as auxiliares_router  # <--- Nova Importação

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BitDesk API",
    description="API REST para o Portal de Solicitações Internas - bit Soluções",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Rotas
app.include_router(auth_router, prefix="/api/v1")
app.include_router(solicitacoes_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")     # <---
app.include_router(auxiliares_router, prefix="/api/v1")    # <---

@app.on_event("startup")
def popular_dados_iniciais():
    db = SessionLocal()
    try:
        categorias = ["TI", "RH", "Compras", "Financeiro", "Infraestrutura"]
        for nome_cat in categorias:
            if not db.query(Categoria).filter(Categoria.nome == nome_cat).first():
                db.add(Categoria(nome=nome_cat))

        if not db.query(Usuario).filter(Usuario.usuario == "admin").first():
            db.add(Usuario(
                nome="Administrador Bit",
                usuario="admin",
                senha_hash=gerar_hash_senha("123456")
            ))

        if not db.query(Usuario).filter(Usuario.usuario == "dev.junior").first():
            db.add(Usuario(
                nome="Desenvolvedor Júnior",
                usuario="dev.junior",
                senha_hash=gerar_hash_senha("123456")
            ))

        db.commit()
    finally:
        db.close()

@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "sistema": "BitDesk API",
        "status": "Online",
        "mensagem": "Backend 100% concluído!"
    }