import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent AI Research Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENV: str = os.getenv("ENV", "development")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-multi-agent-assistant")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # OpenAI API
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Real Search API
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "auto")

    # Academic APIs
    ARXIV_API_KEY: str = os.getenv("ARXIV_API_KEY", "")

    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./multi_agent_research.db")

    DIRECT_URL: str = ""
    CORS_ORIGINS: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
