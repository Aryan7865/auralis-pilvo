import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const res = (reader.result as string) || "";
    const base64 = res.split(",").pop() || "";
    resolve(base64);
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ConversationPanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [diarized, setDiarized] = useState("");
  const [summary, setSummary] = useState("");

  const onProcess = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const audio = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio, mimeType: file.type },
      });

      if (error) throw error;

      setTranscript(data?.transcript ?? "");
      setDiarized(data?.diarized ?? "");
      setSummary(data?.summary ?? "");
      toast({ title: "Transcription complete", description: "Audio processed successfully." });
    } catch (err: any) {
      console.error("transcribe-audio error", err);
      const msg = (typeof err?.message === "string" && err.message.includes("insufficient_quota"))
        ? "OpenAI quota exceeded for speech-to-text. Please add billing or switch provider; image/doc still work."
        : err?.message || "Please try again.";
      toast({
        title: "Transcription failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Upload audio">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="md:w-auto"
          />
          <Button variant="hero" size="lg" onClick={onProcess} disabled={!file || loading}>
            {loading ? "Processing..." : "Process Audio"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Uses Whisper for STT + custom diarization (to be enabled after Supabase setup).
        </p>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard title="Transcript">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {transcript || "Upload an audio file to see the transcript here."}
          </p>
        </GlassCard>
        <GlassCard title="Diarization">
          <pre className="text-sm text-foreground/90 whitespace-pre-wrap">
            {diarized || "Speaker-separated transcript will appear here."}
          </pre>
        </GlassCard>
        <GlassCard title="Summary">
          <p className={"text-sm text-foreground/90 whitespace-pre-wrap " + (summary ? "typewriter" : "") }>
            {summary || "A concise summary will be generated here."}
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default ConversationPanel;
