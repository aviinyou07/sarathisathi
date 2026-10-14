# Sarathi Sakha (सारथी सखा)
### Divine Charioteer & Constant Friend — 100% Zero-External-Token-Cost AI Architecture

Sarathi Sakha is an AI companion designed to provide spiritual counsel for modern psychological, moral, and emotional dilemmas, drawing upon the authentic wisdom of the **700 verses of the Bhagavad Gita** and narrative episodes from the **Mahabharata** and **Bhagavata Purana**.

It operates completely **offline & self-hosted** with **zero recurring API token costs ($0.00)**.

---

## 🏛️ Architecture Overview

```
Mobile App (Expo SDK 52)
  ├── Zustand State Store (useChatStore)
  ├── Native Client-side TTS (expo-speech, 0 cost)
  └── Real-time SSE Stream Reader
           │
           │ POST /consult/stream
           ▼
NestJS Backend (port 3000)
  ├── CrisisGuardInterceptor (Deterministic Regex, <10ms emergency helplines)
  ├── LocalEmbedderService (@xenova/transformers, 384-dim ONNX, in-process)
  ├── RagService (PostgreSQL vector cosine similarity search)
  └── OllamaService (Streaming local LLM inference)
           │
           ├── PostgreSQL (sarathi_sakha)
           │     ├── gita_verses (700 rows with vector embeddings)
           │     └── krishna_episodes (Mahabharata narrative dilemmas)
           │
           └── Ollama (localhost:11434)
                 └── llama3.2:3b (quantized, runs in RTX 2050 4GB VRAM)
```

---

## ⚡ Quick Start Guide

### 1. Database & Seeding
The backend uses your local PostgreSQL service:
```bash
# Seed all 700 Gita verses + Krishna episodes with 384-dim vector embeddings
cd backend
npm run seed
```

### 2. Ollama Local LLM
Start Ollama and pull the 3B model (fits 100% in 4GB GPU VRAM):
```bash
ollama serve
ollama pull llama3.2:3b
```

### 3. Start Backend
```bash
cd backend
npm run start:dev
```
Backend runs at `http://localhost:3000`. Health check: `http://localhost:3000/health`.

### 4. Start Mobile App
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with **Expo Go** on Android or iOS.

---

## 📜 Divine Response Format
Every response adheres to the sacred **4-Pillar Format**:
1. **The Mirror**: Validates the seeker's turmoil without detachment.
2. **The Eternal Shloka**: Exact Chapter and Verse with original Sanskrit, transliteration, and translation.
3. **The Living Example**: Relates the dilemma to an event from Sri Krishna's life.
4. **Micro-Sadhana**: A concrete 15-minute physical, breath, or contemplative action.

---

## 🛡️ Crisis Intervention
If any query indicates self-harm or suicidal ideation, the engine immediately short-circuits in `< 10ms` without calling any LLM, providing verified helplines (Tele-MANAS, AASRA, 988, Vandrevala Foundation).
