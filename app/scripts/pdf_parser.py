from pathlib import Path
import pymupdf4llm


PDF_DIR = Path("data")
OUTPUT_DIR = Path("data/markdown")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    pdf_files = list(PDF_DIR.glob("*.pdf"))

    for pdf_path in pdf_files:
        markdown = pymupdf4llm.to_markdown(str(pdf_path))

        output_path = OUTPUT_DIR / f"{pdf_path.stem}.md"
        output_path.write_text(markdown, encoding="utf-8")

        print(f"Parsing completed.：{pdf_path.name} -> {output_path}")


if __name__ == "__main__":
    main()