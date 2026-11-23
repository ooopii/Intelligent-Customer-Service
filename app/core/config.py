from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    """从.env 加载运行配置。"""
    model_config = SettingsConfigDict(env_file=PROJECT_ROOT / ".env",
                                      env_file_encoding="utf-8",
                                      extra="ignore"
                                      )
    #bailian
    dashscope_api_key: str | None = None
    # beijing
    bailian_base_url: str = "https://ws-y3v69qkuwouuz0ur.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
    bailian_model: str = "qwen3.8-max"
    #database
    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120

    #chroma
    chroma_persist_directory: Path = PROJECT_ROOT / "chroma_db"
    chroma_collection_name: str = "customer_service_knowledge"
    #embedding
    embedding_model: str = "shibing624/text2vec-base-chinese"
    #RAG
    retrieval_top_k: int = 3
    #conversation
    max_history_messages: int = 8
    #model
    model_temperature: float = 0.2

@lru_cache
def get_settings() -> Settings:
    return Settings()
