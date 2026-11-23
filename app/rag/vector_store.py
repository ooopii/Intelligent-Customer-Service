from uuid import uuid4

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from app.core.config import Settings


class ChromaKnowledgeBase:

    def __init__(self, settings: Settings):
        embedding = SentenceTransformerEmbeddingFunction(
            model_name=settings.embedding_model
        )

        client = chromadb.PersistentClient(
            path=str(settings.chroma_persist_directory)
        )

        self.collection = client.get_or_create_collection(
            name=settings.chroma_collection_name,
            embedding_function=embedding
        )

    def add_texts(self, texts: list[str], source: str):
        cleaned = [text.strip() for text in texts if text.strip()]

        if not cleaned:
            return 0

        self.collection.add(
            documents=cleaned,
            metadatas=[{"source": source} for _ in cleaned],
            ids=[str(uuid4()) for _ in cleaned]
        )

        return len(cleaned)

    def search(self, query: str, limit: int = 3):
        result = self.collection.query(
            query_texts=[query],
            n_results=limit
        )

        return [
            {
                "content": doc,
                "source": meta["source"],
                "score": distance
            }
            for doc, meta, distance in zip(
                result["documents"][0],
                result["metadatas"][0],
                result["distances"][0]
            )
        ]


def split_text(text: str, chunk_size: int = 500, overlap: int = 80):
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []
    current = ""

    for paragraph in paragraphs:
        # 忽略 PDF 中重复出现的页眉/页脚
        if paragraph in {"行业定期报告", "证券研究报告"}:
            continue

        if len(current) + len(paragraph) + 2 <= chunk_size:
            if current:
                current += "\n\n" + paragraph
            else:
                current = paragraph
        else:
            if current:
                chunks.append(current)

            if len(paragraph) <= chunk_size:
                current = paragraph
            else:
                for start in range(0, len(paragraph), chunk_size - overlap):
                    chunks.append(paragraph[start:start + chunk_size])

                current = ""

    if current:
        chunks.append(current)

    # 去掉重复文本块
    unique_chunks = []
    seen = set()

    for chunk in chunks:
        if chunk not in seen:
            unique_chunks.append(chunk)
            seen.add(chunk)

    return unique_chunks