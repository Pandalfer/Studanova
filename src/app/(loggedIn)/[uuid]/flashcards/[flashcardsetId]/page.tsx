"use client";

import { usePathname } from "next/navigation";
import { Flashcard, FlashcardSet } from "@/lib/types";
import { use, useEffect, useState } from "react";
import { loadFlashcardSet } from "@/lib/flashcard-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { FlashcardItem } from "./flashcard";
import { Button } from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Shuffle} from "lucide-react";
import {toast} from "sonner";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function FlashcardsPage({ params }: PageProps) {
  const { uuid } = use(params);
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const flashcardsetIdFromPath = pathSegments[3];

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [activeFlashcard, setActiveFlashcard] = useState<number>(0);

  const isFirst = activeFlashcard === 0;
  const isLast = activeFlashcard === flashcards.length - 1;

  const changeFlashcard = (direction: "next" | "prev") => {
    if (direction === "next" && !isLast) setActiveFlashcard((prev) => prev + 1);
    if (direction === "prev" && !isFirst) setActiveFlashcard((prev) => prev - 1);
  };

  const shuffleFlashcards = () => {
    setFlashcards((prevCards) => {
      const newCards = [...prevCards];
      let currentIndex = newCards.length;

      while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newCards[currentIndex], newCards[randomIndex]] = [
          newCards[randomIndex], newCards[currentIndex],
        ];
      }

      return newCards;
    });
    toast.success("Flashcards shuffled!");
    setActiveFlashcard(0);
  };

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const data = await loadFlashcardSet(flashcardsetIdFromPath, uuid);
        setFlashcardSet(data ?? null);
        setFlashcards(data.flashcards ?? []);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [flashcardsetIdFromPath, uuid]);

  return (
    <div className="px-6 flex flex-col justify-center min-h-[90vh] max-w-2xl mx-auto w-full">

      <div className="mb-6 text-center space-y-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">
              {flashcardSet?.title || "Flashcards"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Card {activeFlashcard + 1} of {flashcards.length}
            </p>
          </>
        )}
      </div>

      <div className={"flex flex-row items-center justify-center mb-6"}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"ghost"}  onClick={shuffleFlashcards} >
              <Shuffle/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Shuffle Flashcards
          </TooltipContent>
        </Tooltip>

      </div>

      <div className="flex flex-col gap-6">
        <div className="relative group">
          {loading ? (
            <div
              className="w-full h-64 md:h-80 rounded-xl border bg-card shadow-sm flex flex-col p-6 md:p-8 relative overflow-hidden">
              {/* Question Label Skeleton */}
              <Skeleton className="h-4 w-20 mb-6 opacity-50"/>

              {/* Main Content Skeleton */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Skeleton className="h-6 w-[80%]"/>
                <Skeleton className="h-6 w-[50%]"/>
              </div>

              {/* Footer/Hint Skeleton */}
              <div className="mt-auto flex justify-center">
                <Skeleton className="h-3 w-24 opacity-30"/>
              </div>
            </div>
          ) : flashcards.length > 0 ? (
            <FlashcardItem fc={flashcards[activeFlashcard]} key={flashcards[activeFlashcard].id}/>
          ) : (
            <div className="py-20 text-center border rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No flashcards found.</p>
            </div>
          )}
        </div>

        <div className="space-y-6 w-full max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton className="rounded-xl h-14 w-full"/>
                <Skeleton className="rounded-xl h-14 w-full"/>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-14 font-semibold shadow-sm"
                  disabled={isFirst}
                  onClick={() => changeFlashcard("prev")}
                >
                  <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-14 font-semibold shadow-sm"
                  disabled={isLast}
                  onClick={() => changeFlashcard("next")}
                >
                  Next <ChevronRight className="ml-2 h-5 w-5"/>
                </Button>
              </>
            )}
          </div>

          {/* Progress Bar Skeleton or Actual */}
          <div className="w-full bg-popover h-2 rounded-full overflow-hidden">
            {loading ? (
              <div className="h-full w-0"/> // Hidden during load
            ) : (
              <div
                className="bg-foreground h-full transition-all duration-300 ease-in-out"
                style={{width: `${((activeFlashcard + 1) / flashcards.length) * 100}%`}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}