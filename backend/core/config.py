import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "BioSynth-Xtreme"
    VERSION: str = "1.0.0"
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
    
    # NCBI Configuration
    NCBI_EMAIL: str = os.getenv("NCBI_EMAIL", "your_email@example.com")
    NCBI_API_KEY: str = os.getenv("NCBI_API_KEY", "")
    
    # Redis Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Other settings
    MAX_SEQUENCE_LENGTH: int = 10000
    CACHE_TTL: int = 3600  # 1 hour

settings = Settings()