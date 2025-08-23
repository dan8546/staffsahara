import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark" | "blue" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo = ({ 
  variant = "light", 
  size = "md", 
  className 
}: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl", 
    lg: "text-4xl"
  };

  const variantClasses = {
    light: "text-ink-900",
    dark: "text-paper-0", 
    blue: "text-brand-blue",
    gold: "text-brand-gold"
  };

  return (
    <div 
      className={cn(
        "font-bold tracking-tight logo-spacing select-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={{ "--logo-height": "2rem" } as React.CSSProperties}
    >
      <span className="font-sans">Staff Sahara</span>
    </div>
  );
};