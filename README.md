# Enterprise Knowledge Assistant

An AI-powered internal assistant that uses a Retrieval-Augmented Generation (RAG) pipeline to answer complex, policy-aware employee questions. This application is built with a React frontend, a Node.js backend, and leverages the Google Gemini API for its AI capabilities.

## Features

* **Secure Authentication:** Users can register and log in via email/password or securely through Google OAuth.
* **Conversational AI:** A simple chat interface to ask questions in natural language.
* **RAG Implementation:** Utilizes a Retrieval-Augmented Generation (RAG) pipeline to provide accurate, context-aware answers based on internal documents.
* **Admin Panel:** A dedicated section for administrators to manage the knowledge base.
    * **File Upload:** Upload new knowledge documents (`.txt`, `.md`, `.pdf`).
    * **Knowledge Explorer:** View all documents currently in the AI's knowledge base.
* **Role-Based Access Control:** The first registered user automatically becomes an 'admin', with subsequent users assigned the 'employee' role.

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL for user management and query history.
* **Vector Store:** Vectra for local, file-based vector storage and similarity search.
* **AI & Embeddings:** Google Gemini API (gemini-1.5-flash, text-embedding-004)
* **Authentication:** JWT (JSON Web Tokens), Passport.js for Google OAuth 2.0.

## Architecture

The application follows a standard client-server architecture. The frontend communicates with the backend via a REST API. The core RAG pipeline is executed on the backend, which involves retrieving relevant context from the vector store and then prompting the Gemini API to generate a policy-aware response.


## Setup and Installation

Follow these steps to run the project locally.

### Prerequisites

* Node.js (v18 or higher)
* npm
* PostgreSQL
* Git


### 1.Clone the repo

* git clone https://github.com/himanshuchhabran/Enterprise-knowledge-assistant.git
* cd Enterprise-knowledge-assistant

### 2.Backend Setup

cd backend
npm install

# Create a .env file and enter with your credentials:
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/nebula9_db"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-google-ai-api-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Start the backend server
npm start

### 3. Frontend Setup

cd frontend
npm install

# Create .env file in frotend folder and enter your backend url
VITE_API_URL=http://localhost:3001

# Start the frontend development server
npm run dev


### Key Assumptions Made

Knowledge Base: For simplicity and rapid development, the knowledge base is managed via file uploads to a local /data directory instead of a live integration with SharePoint/Confluence.

Admin Assignment: The first user to register is automatically designated as the 'admin'. A full user management UI was considered out of scope for the MVP.

Vector Store: Vectra was chosen as a simple, file-based vector database to avoid the overhead of setting up and managing a separate database server like Pinecone or ChromaDB. 