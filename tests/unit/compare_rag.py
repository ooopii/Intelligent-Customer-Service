
import json
import os
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

import uuid

session_id = str(uuid.uuid4())

print("Session ID:", session_id)


# =========================================================
# 1. Load environment variables from project root
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("DASHSCOPE_API_KEY", "").strip()

BASE_URL = os.getenv(
    "BAILIAN_BASE_URL",
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
).rstrip("/")

MODEL = os.getenv("BAILIAN_MODEL", "qwen3.8-max")

BACKEND_BASE_URL = os.getenv(
    "BACKEND_BASE_URL",
    "http://127.0.0.1:8000",
).rstrip("/")

ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "").strip()

# Output directory located at project root
OUTPUT_DIR = PROJECT_ROOT / "rag_comparison_results"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# 2. Call Qwen WITHOUT RAG
# =========================================================

def call_qwen_without_rag(question: str) -> str:
    """Call Qwen directly without retrieved report context."""

    if not API_KEY:
        raise RuntimeError(
            "Missing DASHSCOPE_API_KEY in project .env"
        )

    url = f"{BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "temperature": 0.2,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Answer the user's question clearly and accurately. "
                    "If you are uncertain, say so. Do not claim to have "
                    "read a specific report or source unless it is provided."
                ),
            },
            {
                "role": "user",
                "content": question,
            },
        ],
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=120,
    )

    if not response.ok:
        print("Non-RAG HTTP Status:", response.status_code)
        print("Non-RAG Response Body:", response.text)
        print("\n--- Chat API Debug ---")
        print("HTTP Status:", response.status_code)
        print("Request Payload:", payload)
        print("Response Body:", response.text)
        print("----------------------\n")

    response.raise_for_status()

    response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"].strip()


# =========================================================
# 3. Call project WITH RAG
# =========================================================

def call_project_rag(question: str) -> str:
    """Send the question to the existing project chat endpoint."""

    if not ACCESS_TOKEN:
        raise RuntimeError(
            "Missing ACCESS_TOKEN in project .env"
        )

    url = f"{BACKEND_BASE_URL}/api/v1/chat"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    # A fresh session ID for each experiment question
    # 创建数据库会话
    session_response = requests.post(
        "http://127.0.0.1:8000/api/v1/sessions",
        headers=headers,
        params={"title": "RAG Evaluation"}
    )

    session_response.raise_for_status()

    session_data = session_response.json()

    # 使用数据库生成的整数 ID
    session_id = session_data["id"]

    print("Database Session ID:", session_id)

    payload = {
        "session_id": session_id,
        "message": question,
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=180,

    )

    # Print detailed backend errors before raising the exception
    if not response.ok:
        print("\n--- RAG Backend Error Details ---")
        print("HTTP Status:", response.status_code)
        print("Response Body:", response.text)
        print("------------------------------\n")

    response.raise_for_status()

    data = response.json()

    return extract_answer(data)


# =========================================================
# 4. Extract answer from API response
# =========================================================

def extract_answer(response_data) -> str:
    """Extract answer from common API response formats."""

    if isinstance(response_data, str):
        return response_data

    if isinstance(response_data, dict):

        # Format: {"answer": "..."}
        if isinstance(response_data.get("answer"), str):
            return response_data["answer"]

        # Format: {"data": {"answer": "..."}}
        nested = response_data.get("data")

        if isinstance(nested, dict):
            if isinstance(nested.get("answer"), str):
                return nested["answer"]

        # Format: {"message": "..."}
        if isinstance(response_data.get("message"), str):
            return response_data["message"]

    # Return raw JSON if the response format is unexpected
    return json.dumps(
        response_data,
        ensure_ascii=False,
        indent=2,
    )


# =========================================================
# 5. Main experiment
# =========================================================

def main():

    print("=" * 72)
    print("RAG vs. Non-RAG Answer Comparison")
    print("=" * 72)

    print(
        "Enter one question. The same question will be sent "
        "to both systems.\n"
    )

    question = input("Question: ").strip()

    if not question:
        print("No question entered. Exiting.")
        return

    # -----------------------------------------------------
    # WITHOUT RAG
    # -----------------------------------------------------

    print("\n[1/2] Calling Qwen WITHOUT RAG...")

    try:
        answer_without_rag = call_qwen_without_rag(question)

    except Exception as exc:
        answer_without_rag = f"ERROR: {exc}"
        print("Non-RAG call failed:", repr(exc))

    # -----------------------------------------------------
    # WITH RAG
    # -----------------------------------------------------

    print("\n[2/2] Calling project chat WITH RAG...")

    try:
        answer_with_rag = call_project_rag(question)

    except Exception as exc:
        answer_with_rag = f"ERROR: {exc}"
        print("RAG call failed:", repr(exc))

    # -----------------------------------------------------
    # Display results
    # -----------------------------------------------------

    print("\n" + "=" * 72)
    print("WITHOUT RAG")
    print("=" * 72)
    print(answer_without_rag)

    print("\n" + "=" * 72)
    print("WITH RAG")
    print("=" * 72)
    print(answer_with_rag)

    # -----------------------------------------------------
    # Save experiment results
    # -----------------------------------------------------

    result = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "model": MODEL,
        "question": question,
        "without_rag": answer_without_rag,
        "with_rag": answer_with_rag,
    }

    filename = OUTPUT_DIR / (
        f"comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )

    filename.write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"\nResults saved to: {filename.resolve()}")


# =========================================================
# 6. Entry point
# =========================================================

if __name__ == "__main__":
    main()
