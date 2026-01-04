import { Flashcard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function FlashcardItem({ fc }: { fc: Flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Helper to determine text size based on length
  const getTextSize = (text: string, isQuestion: boolean) => {
    const length = text.length;
    if (isQuestion) {
      if (length > 150) return "text-sm md:text-base";
      if (length > 80) return "text-lg md:text-md";
      return "text-xl md:text-xl"; // Default large
    } else {
      // Answers usually need to be smaller since they are often longer
      if (length > 200) return "text-xs md:text-sm";
      if (length > 100) return "text-sm md:text-lg";
      return "text-lg md:text-xl"; // Default large
    }
  };

  return (
    <div
      className="group h-64 md:h-80 w-full [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl transition-all duration-500 [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : "",
        )}
      >
        {/* FRONT SIDE (Question) */}
        <div className="absolute inset-0 h-full w-full rounded-xl border bg-card p-6 md:p-8 shadow-sm [backface-visibility:hidden]">
          <div className="flex flex-col h-full">
            <div className="text-xs md:text-sm font-bold uppercase text-muted-foreground tracking-wider">
              Question
            </div>
            <div className="flex-1 flex items-center justify-center text-center overflow-hidden">
              <p className={cn(
                "font-medium leading-tight transition-all",
                getTextSize(fc.question, true)
              )}>
                {fc.question}
              </p>
            </div>
            <div className="text-[10px] md:text-xs text-center text-muted-foreground opacity-70">
              Click to flip
            </div>
          </div>
        </div>

        {/* BACK SIDE (Answer) */}
        <div className="absolute inset-0 h-full w-full rounded-xl border bg-accent p-6 md:p-8 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex flex-col h-full">
            <div className="text-xs md:text-sm font-bold uppercase text-muted-foreground tracking-wider">
              Answer
            </div>
            <div className="flex-1 flex items-center justify-center text-center overflow-hidden">
              <p className={cn(
                "text-foreground/90 transition-all",
                getTextSize(fc.answer, false)
              )}>
                {fc.answer}
              </p>
            </div>
            <div className="text-[10px] md:text-xs text-center text-muted-foreground opacity-70">
              Click to hide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}