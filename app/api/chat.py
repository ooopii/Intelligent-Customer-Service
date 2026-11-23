from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.security import get_current_user

router = APIRouter(prefix="/chat", tags=["AI chatbot"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:

    service: ChatService = request.app.state.chat_service

    try:
        return await service.reply(
            payload,
            db,
            current_user["user_id"],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=403, detail=str(e))