"""Application configuration and environment variables.

The Settings class uses pydantic‑settings to read from a .env file (or
environment) and provides defaults suitable for local development.
Replace SECRET_KEY and DATABASE_URL in production.
"""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "B2P Connect"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_ME_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost/b2p_db"

    class Config:
        env_file = ".env"

settings = Settings()
