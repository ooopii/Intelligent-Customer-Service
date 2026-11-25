# from app.core.config import get_settings
# from app.rag.vector_store import ChromaKnowledgeBase
# from app.rag.retriever import Retriever
#
#
# def test_retriever():
#     settings = get_settings()
#
#     kb = ChromaKnowledgeBase(settings)
#     retriever = Retriever(kb, top_k=3)
#
#     results = retriever.retrieve("商品签收后多久可以退货？")
#
#     print(results)
#
#     assert len(results) > 0
#     assert "7 天" in results[0]["content"]
from app.core.config import get_settings
from app.rag.vector_store import ChromaKnowledgeBase
from app.rag.retriever import Retriever


def test_retriever():
    settings = get_settings()
    kb = ChromaKnowledgeBase(settings)
    retriever = Retriever(kb, top_k=3)

    questions = [
        "What are the development opportunities in the renewable energy industry?",
        "What are the main opportunities in the energy storage sector?",
        "What factors influence the profitability of solar photovoltaic companies?",
    ]

    for question in questions:
        print(f"\n问题：{question}")

        results = retriever.retrieve(question)

        for result in results:
            print(result)

        assert len(results) > 0