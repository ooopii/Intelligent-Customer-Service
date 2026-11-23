from pathlib import Path

from app.core.config import get_settings
from app.rag.vector_store import ChromaKnowledgeBase, split_text


DATA_DIR = Path("data/markdown")


def main():
    settings = get_settings()
    knowledge_base = ChromaKnowledgeBase(settings)

    md_files = list(DATA_DIR.glob("*.md"))

    if not md_files:
        print("can not find Markdown files")
        return

    total = 0

    for md_path in md_files:
        text = md_path.read_text(encoding="utf-8")
        chunks = split_text(text)

        count = knowledge_base.add_texts(
            chunks,
            source=md_path.name
        )

        total += count

        print(f"Import completed:{md_path.name} -> {count} text chunks")

    print(f"\nAll done.A total of {total} text chunks imported.")


if __name__ == "__main__":
    main()