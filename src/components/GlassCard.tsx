import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ title, children, className }: GlassCardProps) => {
  return (
    <section className={cn("glass-card p-6 hover-scale", className)}>
      {title ? (
        <header className="mb-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/90">
            {title}
          </h2>
        </header>
      ) : null}
      <div>{children}</div>
    </section>
  );
};

export default GlassCard;
