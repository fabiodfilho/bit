from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.db.models import Categoria, Usuario
from app.core.security import gerar_hash_senha
from app.api.v1.auth import router as auth_router

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

# Registrar Rotas de Autenticação
app.include_router(auth_router, prefix="/api/v1")

@app.on_event("startup")
def popular_dados_iniciais():
    db = SessionLocal()
    try:
        # Populate Categorias
        categorias = ["TI", "RH", "Compras", "Financeiro", "Infraestrutura"]
        for nome_cat in categorias:
            if not db.query(Categoria).filter(Categoria.nome == nome_cat).first():
                db.add(Categoria(nome=nome_cat))

        # Create demo users for testing
        if not db.query(Usuario).filter(Usuario.usuario == "admin").first():
            admin = Usuario(
                nome="Administrador Bit",
                usuario="admin",
                senha_hash=gerar_hash_senha("123456")
            )
            db.add(admin)

        if not db.query(Usuario).filter(Usuario.usuario == "dev.junior").first():
            dev = Usuario(
                nome="Desenvolvedor Júnior",
                usuario="dev.junior",
                senha_hash=gerar_hash_senha("123456")
            )
            db.add(dev)

        db.commit()
    finally:
        db.close()

@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "sistema": "BitDesk API",
        "status": "Online",
        "mensagem": "Autenticação JWT ativa!"
    }