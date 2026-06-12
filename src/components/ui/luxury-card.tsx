import React from "react";
import { cn } from "@/lib/utils";

interface LuxuryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: string;
  glowOnHover?: boolean;
}

export function LuxuryCard({ 
  children, 
  className, 
  gradient = "from-primary/10 via-background to-background dark:from-primary/20",
  glowOnHover = true,
  ...props 
}: LuxuryCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 dark:border-white/10 bg-card/40 backdrop-blur-xl transition-all duration-500",
        glowOnHover && "hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(var(--color-primary),0.3)] dark:hover:shadow-[0_0_40px_-15px_rgba(var(--color-primary),0.5)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Dynamic background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30 dark:opacity-50 transition-opacity duration-500 group-hover:opacity-80 dark:group-hover:opacity-100",
        gradient
      )} />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
      
      {/* Subtle top glare effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
