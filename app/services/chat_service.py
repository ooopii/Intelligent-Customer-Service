from collections import defaultdict, deque

from sqlalchemy.orm import Session

from app.prompts.customer_service import SYSTEM_PROMPT, render_context
from app.schemas.chat import ChatRequest, ChatResponse, SourceDocument
from app.db.models import Message, ChatSession


class ConversationMemory:
    """保存用户的多轮对话历史。"""

    def __init__(self, max_messages: int = 8):
        self.conversations = defaultdict(
            lambda: deque(maxlen=max_messages)
        )

    def get(self, session_id: str):
        return list(self.conversations[session_id])

    def add(self, session_id: str, role: str, content: str):
        self.conversations[session_id].append({
            "role": role,
            "content": content
        })


class ChatService:
    """处理智能客服的核心业务逻辑。"""

    def __init__(self, llm, retriever, memory):
        self.llm = llm
        self.retriever = retriever
        self.memory = memory

    async def reply(
            self,
            request: ChatRequest,
            db: Session,
            user_id: int,
    ) -> ChatResponse:

        # 1. 获取数据库会话 ID
        session_id = request.session_id
        memory_session_id = str(session_id)

        # 统一内存中的 session key
        memory_session_id = str(session_id)

        # 2. 检查会话是否存在
        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
            )
            .first()
        )

        if not session:
            raise RuntimeError("会话不存在")

        # 3. RAG 检索相关知识
        documents = self.retriever.retrieve(request.message)

        # 4. 获取历史对话
        history = self.memory.get(memory_session_id)

        # 5. 如果内存中没有历史记录，从数据库读取
        if not history:
            db_messages = (
                db.query(Message)
                .filter(Message.session_id == session_id)
                .order_by(Message.created_at.asc())
                .all()
            )

            history = [
                {
                    "role": message.role,
                    "content": message.content
                }
                for message in db_messages[-8:]
            ]

        # 6. 组织发送给大模型的消息
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT.format(
                    context=render_context(documents)
                )
            },
            *history,
            {
                "role": "user",
                "content": request.message
            }
        ]

        # 7. 调用百炼 Qwen
        answer = await self.llm.complete(messages)

        # 8. 保存用户消息到内存
        self.memory.add(
            memory_session_id,
            "user",
            request.message
        )

        # 9. 保存 AI 回复到内存
        self.memory.add(
            memory_session_id,
            "assistant",
            answer
        )

        # 10. 保存用户消息到 MySQL
        user_message = Message(
            session_id=session_id,
            role="user",
            content=request.message,
        )

        db.add(user_message)

        # 11. 保存 AI 回复到 MySQL
        assistant_message = Message(
            session_id=session_id,
            role="assistant",
            content=answer,
        )

        db.add(assistant_message)

        # 12. 更新会话标题
        if session.title == "新会话":
            session.title = request.message[:20]

        db.commit()

        # 13. 返回结果
        return ChatResponse(
            session_id=request.session_id,
            answer=answer,
            sources=[
                SourceDocument(**doc)
                for doc in documents
            ]
        )