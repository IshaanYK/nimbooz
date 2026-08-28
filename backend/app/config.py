from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://aasra_user:aasra_pass@localhost:5432/aasra_db"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Google AI Studio API Keys
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_API_KEY_1: Optional[str] = None
    GOOGLE_API_KEY_2: Optional[str] = None
    GOOGLE_API_KEY_3: Optional[str] = None
    GOOGLE_API_KEY_4: Optional[str] = None

    # Groq API Keys
    GROQ_API_KEY: Optional[str] = None
    GROQ_API_KEY_1: Optional[str] = None
    GROQ_API_KEY_2: Optional[str] = None
    GROQ_API_KEY_3: Optional[str] = None
    GROQ_API_KEY_4: Optional[str] = None

    # OpenRouter API Keys
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY_1: Optional[str] = None
    OPENROUTER_API_KEY_2: Optional[str] = None
    OPENROUTER_API_KEY_3: Optional[str] = None
    OPENROUTER_API_KEY_4: Optional[str] = None

    # Cloudflare Credentials (1-4)
    CLOUDFLARE_ACCOUNT_ID_1: Optional[str] = None
    CLOUDFLARE_API_TOKEN_1: Optional[str] = None
    CLOUDFLARE_R2_ACCESS_KEY_1: Optional[str] = None
    CLOUDFLARE_R2_SECRET_KEY_1: Optional[str] = None
    CLOUDFLARE_R2_ENDPOINT_1: Optional[str] = None

    CLOUDFLARE_ACCOUNT_ID_2: Optional[str] = None
    CLOUDFLARE_API_TOKEN_2: Optional[str] = None
    CLOUDFLARE_R2_ACCESS_KEY_2: Optional[str] = None
    CLOUDFLARE_R2_SECRET_KEY_2: Optional[str] = None
    CLOUDFLARE_R2_ENDPOINT_2: Optional[str] = None

    CLOUDFLARE_ACCOUNT_ID_3: Optional[str] = None
    CLOUDFLARE_API_TOKEN_3: Optional[str] = None
    CLOUDFLARE_R2_ACCESS_KEY_3: Optional[str] = None
    CLOUDFLARE_R2_SECRET_KEY_3: Optional[str] = None
    CLOUDFLARE_R2_ENDPOINT_3: Optional[str] = None

    CLOUDFLARE_ACCOUNT_ID_4: Optional[str] = None
    CLOUDFLARE_API_TOKEN_4: Optional[str] = None
    CLOUDFLARE_R2_ACCESS_KEY_4: Optional[str] = None
    CLOUDFLARE_R2_SECRET_KEY_4: Optional[str] = None
    CLOUDFLARE_R2_ENDPOINT_4: Optional[str] = None

    # CE Hub — base URL confirmed from live tests
    CE_HUB_BASE_URL: str = "https://services.cehub.syngenta-ais.com"
    CEHUB_API_KEY: Optional[str] = None

    # Meteoblue
    METEOBLUE_BASE_URL: str = "https://my.meteoblue.com"
    METEOBLUE_API_KEY: Optional[str] = None

    # App
    DEMO_MODE: bool = False
    ALLOWED_ORIGINS: str = "*"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_google_keys(self) -> List[str]:
        keys = [self.GOOGLE_API_KEY, self.GOOGLE_API_KEY_1, self.GOOGLE_API_KEY_2, self.GOOGLE_API_KEY_3, self.GOOGLE_API_KEY_4]
        return [k for k in keys if k]

    def get_groq_keys(self) -> List[str]:
        keys = [self.GROQ_API_KEY, self.GROQ_API_KEY_1, self.GROQ_API_KEY_2, self.GROQ_API_KEY_3, self.GROQ_API_KEY_4]
        return [k for k in keys if k]

    def get_openrouter_keys(self) -> List[str]:
        keys = [self.OPENROUTER_API_KEY, self.OPENROUTER_API_KEY_1, self.OPENROUTER_API_KEY_2, self.OPENROUTER_API_KEY_3, self.OPENROUTER_API_KEY_4]
        return [k for k in keys if k]


settings = Settings()
