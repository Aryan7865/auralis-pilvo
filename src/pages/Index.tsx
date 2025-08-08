import { useState } from "react";
import TopNav, { type Skill } from "@/components/TopNav";
import ConversationPanel from "@/components/panels/ConversationPanel";
import ImagePanel from "@/components/panels/ImagePanel";
import DocumentPanel from "@/components/panels/DocumentPanel";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const [skill, setSkill] = useState<Skill>("conversation");

  return (
    <div className="min-h-screen bg-background">
      <TopNav skill={skill} onSkillChange={setSkill} />

      <main className="container mx-auto w-[min(1100px,92vw)] pt-24 pb-16">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">AI Playground – Multimodal Skills</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a skill and experiment with conversation analysis, image understanding, or document/URL summarization.
          </p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={skill}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {skill === "conversation" && <ConversationPanel />}
            {skill === "image" && <ImagePanel />}
            {skill === "document" && <DocumentPanel />}
          </motion.div>
        </AnimatePresence>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Authentication and real AI processing will be enabled after connecting Supabase.
        </p>
      </main>
    </div>
  );
};

export default Index;
