"""Core configuration with hardened defaults and audience/issuer."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "B2P Connect"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_ME_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost/b2p_db"

    # JWT claims
    JWT_AUDIENCE: str = "api.b2p.com"
    JWT_ISSUER: str = "auth.b2p.com"

    # Rate limiting
    RATE_LIMIT_AUTH: str = "5/minute"

    # Account lockout
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5
    LOCK_MINUTES: int = 15

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
