# Intelligent Customer Service
An intelligent customer service system built with FastAPI, React, Alibaba Cloud Bailian (Qwen), and ChromaDB. 
The system uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from a knowledge base and generate context-aware customer service responses.

# 1. Project Introduction

This project implements an AI-powered customer service application with user authentication, multi-turn conversations, conversation history, and role-based user management.

The system combines a Large Language Model (LLM) with a vector database to improve response relevance by retrieving information from the provided knowledge base before generating answers.

Key Features

1.AI Customer Service: Generates responses using Alibaba Cloud Bailian Qwen.

2.RAG Knowledge Retrieval: Retrieves relevant information from a ChromaDB vector database.

3.Multi-turn Conversations: Maintains conversation context during interactions.

4.User Authentication: Supports user registration and login with JWT authentication.

5.Conversation Management: Stores and manages conversation sessions and messages.

6.User Management: Supports user and role management.

7.Document Processing: Converts PDF documents into Markdown files for knowledge base ingestion.

 # 2. Technology Stack

Component  :         Technology

Backend     :         Python, FastAPI

Frontend    :      React, Vite

LLM:               Alibaba Cloud Bailian (Qwen)

RAG:              Retrieval-Augmented Generation

Vector Database :  ChromaDB

Embedding Model :    shibing624/text2vec-base-chinese

Relational Database : MySQL

ORM : SQLAlchemy

Authentication : JWT

PDF Processing : PyMuPDF4LLM

# 3. Project Structure

Intelligent Customer Service/
├── app/
│   ├── scripts/
│   │   ├── ingest.py
│   │   └── pdf_parser.py  # PDF parsing and ingestion scripts
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── llm/
│   ├── rag/
│   └── main.py
├── data/
├── frontend/
├── tests/
├── requirements.txt
└── README.md

# 4. Prerequisites

Install the following software before running the project:

Python 3.10 or later

Node.js and npm

MySQL 8.0 or a compatible version

Alibaba Cloud Bailian API access

A valid Bailian API Key is required to use the LLM functionality.

# 5. Environment Configuration

Clone the repository:

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Intelligent Customer Service"

Create a Python virtual environment:

python -m venv .venv

Activate it on Windows:

.venv\Scripts\activate

On macOS/Linux:

source .venv/bin/activate

Install Python dependencies:

pip install -r requirements.txt

Create a local environment configuration file by copying the example:

Windows:

copy .env.example .env

macOS/Linux:

cp .env.example .env

Edit .env and provide your own configuration:

DASHSCOPE_API_KEY=your_own_api_key
BAILIAN_BASE_URL=your_bailian_base_url
BAILIAN_MODEL=qwen3.8-max

DATABASE_URL=mysql+pymysql://username:password@localhost:3306/customer_service

JWT_SECRET_KEY=your_own_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=120

Replace all placeholder values with your own credentials and configuration.

Important: Never upload your .env file or expose your API Key, database password, or JWT secret.

# 6. Database Setup

Start MySQL and create the project database:

CREATE DATABASE customer_service
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

Make sure the DATABASE_URL in .env contains the correct MySQL username, password, host, port, and database name.

Create the database tables from the project root directory:

python -m app.db.init_db

The initialization script creates the following tables:

users

sessions

messages

This step is required when setting up the project for the first time.

# 7. Knowledge Base Initialization

The project uses PDF documents as its knowledge base.

Step 1: Convert PDF Documents into Markdown

From the project root directory, run:

python -m app.scripts.pdf_parser

The converted Markdown files will be saved in:

data/markdown/

Step 2: Import Documents into ChromaDB

Run:

python -m app.scripts.ingest

The script splits the Markdown documents into text chunks and stores their embeddings in ChromaDB.

The vector database will be persisted locally in:

chroma_db/

Note: These two steps are intended for the initial knowledge base setup.
Do not repeatedly run the ingestion script on an already populated database, as duplicate records may be created.

# 8. Start the Backend

From the project root directory, activate the virtual environment and run:

uvicorn app.main:app --reload

The backend will be available at:

http://127.0.0.1:8000

Check the health endpoint:

http://127.0.0.1:8000/health

API documentation is available at:

http://127.0.0.1:8000/docs

# 9. Start the Frontend

Open a new terminal window and navigate to the frontend directory:

cd frontend

Install frontend dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open the URL in your browser to access the application.

# 11. System Workflow

Users register or log in to the system.

The frontend sends requests to the FastAPI backend.

The backend retrieves relevant knowledge from ChromaDB.

The retrieved context is passed to the Bailian Qwen model.

The model generates a customer service response.

Conversation information is managed and stored through the application.

# 12. Notes

MySQL must be running before starting the application.

The project requires a valid Alibaba Cloud Bailian API Key.

The knowledge base must be initialized before using RAG-based chat functionality.

The first embedding operation may take additional time because the embedding model may need to be downloaded.

Local environment files, virtual environments, and generated ChromaDB data are not included in the repository.