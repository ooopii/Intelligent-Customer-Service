from pydantic import BaseModel, Field

#用户内容
class ChatRequest(BaseModel):
    session_id: str = Field(
        min_length=1,
        max_length=128,
        description="Session ID for maintaining conversation context."
    )
    message: str = Field(
        min_length=1,
        max_length=4000,
        description="user question"
    )

#RAG找到的
class SourceDocument(BaseModel):
    content: str
    source: str | None = None #默认none
    score: float | None = None

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: list[SourceDocument] = Field(default_factory=list)
