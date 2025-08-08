import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { audio, mimeType } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: "No audio data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const binaryAudio = processBase64Chunks(audio);

    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: mimeType || "audio/webm" });
    formData.append("file", blob, `audio.${(mimeType || "webm").split("/")[1] || "webm"}`);
    formData.append("model", "gpt-4o-mini-transcribe");
    // Ask for verbose json to potentially use timestamps later
    formData.append("response_format", "json");

    const sttResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!sttResponse.ok) {
      const errText = await sttResponse.text();
      try {
        const info = JSON.parse(errText);
        if (info?.error?.type === "insufficient_quota") {
          return new Response(JSON.stringify({ error: "OpenAI quota exceeded for STT. Please add billing or use another provider." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {}
      throw new Error(`OpenAI STT error: ${errText}`);
    }

    const sttData = await sttResponse.json();
    const transcript: string = sttData.text || "";

    // Naive two-speaker diarization heuristic: alternate by sentence
    const sentences = transcript
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const diarized = sentences
      .map((s: string, idx: number) => `Speaker ${idx % 2 === 0 ? 1 : 2}: ${s}`)
      .join("\n");

    // Summarize transcript
    const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Summarize the transcript into 4-6 concise bullet points." },
          { role: "user", content: transcript.slice(0, 12000) },
        ],
      }),
    });

    if (!summaryRes.ok) {
      const errText = await summaryRes.text();
      throw new Error(`OpenAI summary error: ${errText}`);
    }

    const summaryData = await summaryRes.json();
    const summary = summaryData.choices?.[0]?.message?.content ?? "";

    return new Response(
      JSON.stringify({ transcript, diarized, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("transcribe-audio error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
