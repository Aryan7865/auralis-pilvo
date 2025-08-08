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
APIs
OpenAI API (OPENAI_API_KEY)

Whisper STT
POST /v1/audio/transcriptions (model: whisper-1)
Converts uploaded audio into text with word-level timestamps.

Chat Completions
POST /v1/chat/completions (model: gpt-4o-mini)
Summarizes transcripts and documents into concise bullet points.

Vision (Image Analysis)
POST /v1/responses (model: gpt-4o-mini with vision)
Generates detailed textual descriptions of uploaded images.

Custom Diarization API (Python on Vercel)

Endpoint: /api/diarize

Uses librosa, scikit-learn, soundfile, numpy

Steps:

Voice Activity Detection (energy-based)

MFCC feature extraction per segment

KMeans clustering (max 2 speakers)

Outputs { start, end, speaker } segments

Document & URL Parsing

pdf-parse – PDF text extraction

mammoth – DOCX text extraction

@mozilla/readability + jsdom – Clean article extraction from URLs

Supabase API (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

Handles authentication via Magic Link (email) or Google OAuth.

(Optional) Stores last 10 user requests and generated outputs in history table.

