import { Leaf } from "lucide-react";

interface StaticLogoProps {
  word: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const StaticLogo = ({ word, onClick, size = "md" }: StaticLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
  };

  return (
    <div
      className={`cursor-pointer select-none flex items-center gap-0 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <span className={`${sizeClasses[size]} font-black tracking-tight relative`}>
        <span className="relative">
          <Leaf className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-accent fill-accent" />
          <span className="text-primary">Go</span>
        </span>
        <span className="text-foreground">{word}</span>
      </span>
    </div>
  );
};

export default StaticLogo;
