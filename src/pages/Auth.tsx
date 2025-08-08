import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Establish listener FIRST, then fetch session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evt, session) => {
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const onLogin = async () => {
    if (!email || !password) {
      toast({ title: "Login failed", description: "Email and password are required." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Logged in", description: "Welcome back!" });
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Check your credentials" });
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    if (!email || !password) {
      toast({ title: "Signup failed", description: "Email and password are required." });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Signup failed", description: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "Confirm your signup to continue." });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err?.message || "Try a different email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto w-[min(500px,92vw)] pt-24 pb-16">
        <GlassCard title="Welcome">
          <div className="space-y-3">
            <Input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input required minLength={6} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="hero" className="flex-1" onClick={onLogin} disabled={loading}>Log in</Button>
              <Button variant="glass" className="flex-1" onClick={onSignUp} disabled={loading}>Sign up</Button>
            </div>
            <p className="text-xs text-muted-foreground">Tip: You can disable email confirmation in Supabase Auth settings while testing.</p>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default Auth;
