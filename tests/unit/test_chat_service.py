import pytest
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService, ConversationMemory

class FakeRetriever:
    def retrieve(self, query):
        return [{"content": "退货申请需在签收后七天内提交。",
                 "source": "policy.md",
                 "score": 0.1
                 }]
class FakeLLM:
    def __init__(self): self.messages = []
    async def complete(self, messages): self.messages = messages; return "您可以在签收后七天内申请退货。"

@pytest.mark.asyncio
async def test_reply_includes_rag_sources_and_keeps_history():
    llm = FakeLLM(); service = ChatService(llm, FakeRetriever(), ConversationMemory(4))
    response = await service.reply(ChatRequest(
        session_id="user-1",
        message="退货期限是多久？"
    ))
    assert response.sources[0].source == "policy.md"
    assert "七天" in llm.messages[0]["content"]
    await service.reply(ChatRequest(
        session_id="user-1",
        message="怎么申请？"
    ))
    assert any(item["content"] == "退货期限是多久？" for item in llm.messages)

def test_memory_limit():
    memory = ConversationMemory(8)

    for i in range(5):
        memory.add("test-session", "user", f"问题{i}")
        memory.add("test-session", "assistant", f"回答{i}")

    history = memory.get("test-session")

    assert len(history) == 8
    assert history[0]["content"] == "问题1"
    assert history[-1]["content"] == "回答4"