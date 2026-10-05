from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

# 1. Configura um banco SQLite em memória, totalmente isolado
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Cria as tabelas no banco de teste
Base.metadata.create_all(bind=engine)

# 2. Substitui a dependência do banco na API para usar o banco de teste
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# 3. Escreve o teste do Health Check
def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "sistema": "BitDesk API",
        "status": "Online",
        "mensagem": "Backend 100% concluído!",
    }