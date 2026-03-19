import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateCursorType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.onclick !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(isClickable);
    };

    window.addEventListener("mousemove", updateCursorPosition);
    window.addEventListener("mouseover", updateCursorType);

    return () => {
      window.removeEventListener("mousemove", updateCursorPosition);
      window.removeEventListener("mouseover", updateCursorType);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      <div
        className={`rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-sm transition-all duration-200 ${
          isPointer ? "w-10 h-10" : "w-6 h-6"
        }`}
      />
    </div>
  );
};

export default CustomCursor;
