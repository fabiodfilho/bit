import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "BitDesk API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bitdesk.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chave_secreta_padrao")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

settings = Settings()