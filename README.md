# Auralis Pilvo

Auralis Pilvo is a [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) project with Tailwind CSS and Supabase integration.  
It includes a modular UI component system, authentication pages, and backend functions for media processing.

---

## 🚀 Features

- **Vite + React + TypeScript** for fast, type-safe frontend development
- **Tailwind CSS** with custom UI components
- **Supabase Integration** for:
  - Authentication
  - Database queries
  - Edge Functions
- **UI Component Library** (Accordion, Dialogs, Buttons, Forms, etc.)
- **Pages & Navigation**
  - Auth page
  - Landing page (Index)
  - Not Found page
- **Edge Functions**
  - Image description
  - Text summarization
  - Audio transcription
- **Responsive Layout** with sidebar navigation
- **Utility Hooks** (`use-toast`, `use-mobile`) for enhanced UX

---
APIs: This project integrates multiple APIs to deliver its multi-modal AI capabilities. It uses the OpenAI API (OPENAI_API_KEY) for three core tasks: Whisper STT (POST /v1/audio/transcriptions, model whisper-1) to convert uploaded audio into text with word-level timestamps, Chat Completions (POST /v1/chat/completions, model gpt-4o-mini) to summarize transcripts and documents into concise bullet points, and Vision (POST /v1/responses, model gpt-4o-mini with vision) to generate detailed textual descriptions of uploaded images. For diarization, a Custom Diarization API is deployed as a Python serverless function on Vercel (/api/diarize) using librosa, scikit-learn, soundfile, and numpy, which performs voice activity detection (energy-based), MFCC feature extraction per segment, KMeans clustering (max two speakers), and outputs { start, end, speaker } segments. Document and URL parsing is handled locally via pdf-parse for PDF text extraction, mammoth for DOCX text extraction, and @mozilla/readability with jsdom for clean article extraction from HTML. Supabase API (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) manages authentication via Magic Link (email) or Google OAuth and optionally stores the last 10 user requests with generated outputs in a history table.

(Optional) Stores last 10 user requests and generated outputs in history table.

