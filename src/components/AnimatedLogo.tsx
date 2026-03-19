import { useEffect, useState, useRef } from "react";
import { Leaf } from "lucide-react";

const words = ["Eat", "Shop", "Vibe"];

interface AnimatedLogoProps {
  onClick?: () => void;
}

const AnimatedLogo = ({ onClick }: AnimatedLogoProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setTimeout(() => setIsAnimating(false), 50);
      }, 250);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="cursor-pointer select-none flex items-center gap-0"
      onClick={onClick}
    >
      <span className="text-xl md:text-2xl font-bold tracking-tight relative">
        <span className="relative">
          <Leaf className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 text-accent fill-accent" />
          <span className="text-primary">Go</span>
        </span>
        <span
          className={`inline-block transition-all duration-500 ease-out ${
            isAnimating
              ? "opacity-0 translate-y-2 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <span className="text-foreground">{words[currentIndex]}</span>
        </span>
      </span>
    </div>
  );
};

export default AnimatedLogo;
