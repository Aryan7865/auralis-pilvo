import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// @ts-ignore - Vite will inline worker as URL (pdfjs v4)
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = pdfjsWorker as any;

const DocumentPanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const onSummarize = async () => {
    if (!file && !url) return;
    setLoading(true);
    try {
      let payload: { url?: string; text?: string } = {};

      if (url) {
        payload.url = url.trim();
      } else if (file) {
        if (file.type === "text/plain") {
          const text = await file.text();
          payload.text = text.slice(0, 12000);
        } else if (file.type === "application/pdf") {
          const buf = await file.arrayBuffer();
          const pdf = await getDocument({ data: buf }).promise;
          let combined = "";
          for (let p = 1; p <= Math.min(pdf.numPages, 30); p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const textItems = (content.items || []).map((it: any) => ("str" in it ? it.str : ""));
            combined += textItems.join(" ") + "\n";
            if (combined.length > 12000) break;
          }
          payload.text = combined.slice(0, 12000);
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const buf = await file.arrayBuffer();
          const { value } = await mammoth.convertToHtml({ arrayBuffer: buf });
          const plain = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          payload.text = plain.slice(0, 12000);
        } else {
          toast({ title: "Unsupported file", description: "Upload .txt, .pdf or .docx, or paste a URL.", variant: "destructive" });
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("summarize", { body: payload });
      if (error) throw error;

      setSummary(data?.summary || "");
      toast({ title: "Summary ready", description: "Content summarized successfully." });
    } catch (err: any) {
      console.error("summarize error", err);
      toast({ title: "Summarization failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Upload document or enter URL">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="md:w-auto"
          />
          <span className="text-xs text-muted-foreground">or</span>
          <Input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="md:w-[360px]"
          />
          <Button variant="hero" size="lg" onClick={onSummarize} disabled={(!file && !url) || loading}>
            {loading ? "Summarizing..." : "Summarize"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: paste a URL to summarize a page, or upload a .txt, .pdf or .docx file.
        </p>
      </GlassCard>

      <GlassCard title="Summary">
        <pre className={"text-sm text-foreground/90 whitespace-pre-wrap " + (summary ? "typewriter" : "") }>
{summary || "A concise bullet-point summary will appear here."}
        </pre>
      </GlassCard>
    </div>
  );
};

export default DocumentPanel;
