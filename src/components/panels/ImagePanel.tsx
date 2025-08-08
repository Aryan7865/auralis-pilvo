import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const res = (reader.result as string) || "";
    const base64 = res.split(",").pop() || "";
    resolve(base64);
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImagePanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const onAnalyze = async () => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file (PNG, JPG, etc.)", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const imageB64 = await toBase64(file);
      const { data, error } = await supabase.functions.invoke("describe-image", {
        body: { image: imageB64 },
      });
      if (error) throw error;
      setResult(data?.description || "");
      toast({ title: "Analysis complete", description: "Image analyzed successfully." });
    } catch (err: any) {
      console.error("describe-image error", err);
      toast({ title: "Image analysis failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Upload image">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
            className="md:w-auto"
          />
          <Button variant="hero" size="lg" onClick={onAnalyze} disabled={!file || loading}>
            {loading ? "Analyzing..." : "Analyze Image"}
          </Button>
        </div>
        {preview ? (
          <div className="mt-4 overflow-hidden rounded-2xl">
            <img src={preview} alt="uploaded image for analysis" className="mx-auto max-h-72 w-auto animate-scale-in" />
          </div>
        ) : null}
      </GlassCard>

      <GlassCard title="Description">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {result || "Detailed image description will appear here."}
        </p>
      </GlassCard>
    </div>
  );
};

export default ImagePanel;
