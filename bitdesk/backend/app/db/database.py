from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Ajuste automático de compatibilidade caso utilize SQLite durante o desenvolvimento local
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency do FastAPI para injetar a sessão de banco de dados nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_solicitacao_due_date_column(database_engine=engine):
    with database_engine.begin() as connection:
        columns = {
            column["name"]
            for column in inspect(connection).get_columns("solicitacoes")
        }
        if "data_termino_previsto" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE solicitacoes "
                    "ADD COLUMN data_termino_previsto TIMESTAMP"
                )
            )
