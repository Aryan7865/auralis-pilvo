import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";

export type Skill = "conversation" | "image" | "document";

interface TopNavProps {
  skill: Skill;
  onSkillChange: (value: Skill) => void;
  className?: string;
}

const TopNav = ({ skill, onSkillChange, className }: TopNavProps) => {
  const { theme, setTheme } = useTheme();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthed(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className={cn("sticky top-0 z-50", className)}>
      <div className="glass-card mx-auto mt-4 w-[min(1100px,92vw)] px-4 py-3">
        <nav className="flex items-center justify-between">
          <a href="/" className="story-link text-sm font-semibold tracking-wide">
            AI Playground
          </a>
          <div className="flex items-center gap-3">
            <Select value={skill} onValueChange={(v) => onSkillChange(v as Skill)}>
              <SelectTrigger className="w-48 bg-background/50">
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent className="bg-background/90 backdrop-blur">
                <SelectItem value="conversation">Conversation Analysis</SelectItem>
                <SelectItem value="image">Image Analysis</SelectItem>
                <SelectItem value="document">Doc/URL Summarization</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="glass" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isAuthed ? (
              <a href="/auth">
                <Button variant="glass" size="sm">
                  <LogIn className="mr-1" /> Login
                </Button>
              </a>
            ) : (
              <Button variant="glass" size="sm" onClick={() => supabase.auth.signOut()}>
                <LogOut className="mr-1" /> Logout
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
