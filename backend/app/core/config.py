"""
Application configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
<<<<<<< HEAD
from typing import List, Union
=======
from typing import List
>>>>>>> 8d897440e7dd0ce9461b7b203eb2cc91b00dd6a1


class Settings(BaseSettings):
    # Database (SQLite for development, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./intune.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
<<<<<<< HEAD
    # CORS - Can be comma-separated string or list
    # For production, use comma-separated string: "https://app1.com,https://app2.com"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS_ORIGINS from string or return as list"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS if isinstance(self.CORS_ORIGINS, list) else []
=======
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
>>>>>>> 8d897440e7dd0ce9461b7b203eb2cc91b00dd6a1
    
    # Spotify API (for future integration)
    SPOTIFY_CLIENT_ID: str = ""
    SPOTIFY_CLIENT_SECRET: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()
