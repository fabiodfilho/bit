from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.db.models import Categoria

# Criar tabelas no banco de dados automaticamente na inicialização
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

# Evento de inicialização para cadastrar categorias padrão, se não existirem
@app.on_event("startup")
def popular_categorias_iniciais():
    db = SessionLocal()
    try:
        categorias_padrao = ["TI", "RH", "Compras", "Financeiro", "Infraestrutura"]
        for nome_cat in categorias_padrao:
            existe = db.query(Categoria).filter(Categoria.nome == nome_cat).first()
            if not existe:
                db.add(Categoria(nome=nome_cat))
        db.commit()
    finally:
        db.close()

@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "sistema": "BitDesk API",
        "status": "Online",
        "mensagem": "Banco de dados conectado e tabelas criadas com sucesso!"
    }