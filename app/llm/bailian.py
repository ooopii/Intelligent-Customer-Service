from openai import AsyncOpenAI
from app.core.config import Settings


class BailianChatClient:
    """调用百炼 Qwen 大模型。"""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = AsyncOpenAI(
            api_key=settings.dashscope_api_key,
            base_url=settings.bailian_base_url
        )

    async def complete(self, messages: Sequence[dict[str, str]]) -> str:
        if not self.settings.dashscope_api_key:
            raise ValueError("DASHSCOPE_API_KEY is not configured. Please set the Bailian API Key in .env.")

        try:
            response = await self.client.chat.completions.create(
                model=self.settings.bailian_model,
                messages=list(messages),
                temperature=self.settings.model_temperature
            )
        except Exception as exc:
            print(f"Bailian API call failed.: {type(exc).__name__}: {exc}")
            raise

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("The Bailian model returned no valid text.")

        return content