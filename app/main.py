from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router

from app.core.config import get_settings
from app.llm.bailian import BailianChatClient
from app.rag.retriever import Retriever
from app.rag.vector_store import ChromaKnowledgeBase
from app.services.chat_service import ChatService, ConversationMemory

from app.api.sessions import router as sessions_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    knowledge_base = ChromaKnowledgeBase(settings)
    application.state.chat_service = ChatService(
        llm=BailianChatClient(settings),
        retriever=Retriever(knowledge_base, settings.retrieval_top_k),
        memory=ConversationMemory(settings.max_history_messages),
    )
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="RAG Intelligent Customer Service",
        version="0.1.0",
        description="Multi-turn customer service built on Bailian Qwen, Chroma vector store and prompt engineering.",
        lifespan=lifespan
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(chat_router, prefix="/api/v1")
    app.include_router(sessions_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(users_router, prefix="/api/v1")

    @app.get("/health", tags=["operation and maintenance"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app

app = create_app()
