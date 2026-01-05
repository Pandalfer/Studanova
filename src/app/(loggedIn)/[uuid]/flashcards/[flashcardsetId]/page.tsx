"use client";

import { usePathname } from "next/navigation";
import { Flashcard, FlashcardSet } from "@/lib/types";
import { use, useEffect, useState } from "react";
import {loadFlashcards, resetDeckProgress, saveFlashcard} from "@/lib/flashcards/flashcard-actions";
import { Skeleton } from "@/components/ui/skeleton";
import {FlashcardItem, FlashcardItemSkeleton} from "@/components/Flashcards/flashcard";
import { Button } from "@/components/ui/button";
import {ChevronLeft, ChevronRight, RotateCcw, Shuffle} from "lucide-react";
import {toast} from "sonner";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {useIsDesktop} from "@/lib/utils";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function FlashcardsPage({ params }: PageProps) {
  const { uuid } = use(params);
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const flashcardsetIdFromPath = pathSegments[3];

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [trackedFlashcards, setTrackedFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [activeFlashcard, setActiveFlashcard] = useState<number>(0);
  const [trackProgress, setTrackProgress] = useState(true);

  const isFirst = activeFlashcard === 0;
  const isLast = activeFlashcard === flashcards.length - 1;

  const changeFlashcard = (direction: "next" | "prev") => {
    if (direction === "next" && !isLast) setActiveFlashcard((prev) => prev + 1);
    if (direction === "prev" && !isFirst) setActiveFlashcard((prev) => prev - 1);
  };

  const handleResetDeck = async () => {
    if (!flashcardSet?.id) return;

    toast.promise(
      (async () => {
        // 1. Reset in Database
        await resetDeckProgress(flashcardSet.id!);

        // 2. Reset Local State
        setFlashcards((prev) => prev.map(fc => ({ ...fc, progress: 0 })));
        setTrackedFlashcards(flashcards.map(fc => ({ ...fc, progress: 0 })));
        setActiveFlashcard(0);

        return "Deck reset!";
      })(),
      {
        loading: "Resetting progress...",
        success: (msg) => msg,
        error: "Could not reset deck.",
      }
    );
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

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await loadFlashcards(flashcardsetIdFromPath, uuid);
      setFlashcardSet(data ?? null);
      setFlashcards(data.flashcards ?? []);
      setTrackedFlashcards((data.flashcards ?? []).filter((fc) => fc.progress !== 1));
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [flashcardsetIdFromPath, uuid]);

  const trackedFlashcardRight = async (flashcard: Flashcard) => {
    // 1. Optimistically update UI: Remove from the queue immediately
    setTrackedFlashcards((prev) => prev.filter((f) => f.id !== flashcard.id));

    try {
      // 2. Persist to DB
      await saveFlashcard({ ...flashcard, progress: 1 });
    } catch (err) {
      toast.error("Failed to save progress");
      // Optional: Re-add to queue if save fails
      setTrackedFlashcards((prev) => [...prev, flashcard]);
    }
  };

  const trackedFlashcardWrong = async (flashcard: Flashcard) => {
    setTrackedFlashcards((prev) => {
      const withoutCurrent = prev.filter((f) => f.id !== flashcard.id);
      return [...withoutCurrent, flashcard]; // Push to end
    });

    try {
      await saveFlashcard({ ...flashcard, progress: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const isDesktop = useIsDesktop();



  return (
    <div className="px-6 flex flex-col justify-center min-h-[90vh] max-w-2xl mx-auto w-full mt-5 sm:mt-0">

      <div className="mb-6 text-center space-y-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-48"/>
            <Skeleton className="h-4 w-24"/>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              {flashcardSet?.title
                ? ((flashcardSet.title.length > 20 && !isDesktop)
                  ? `${flashcardSet.title.slice(0, 20)}...`
                  : flashcardSet.title)
                : "Flashcards"}
            </h1>
            {!trackProgress ? (
              <p className="text-muted-foreground text-sm font-medium">
                Card {activeFlashcard + 1} of {flashcards.length}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm font-medium">
                {flashcards.length - trackedFlashcards.length} of {flashcards.length} cards mastered
              </p>
            )}

          </>
        )}
      </div>

      <div className={"flex flex-row items-center justify-between mb-6"}>
        {loading ? (
          <>
          {/* Shuffle Button Skeleton */}
            <Skeleton className="h-10 w-10 rounded-md"/>

            {/* Switch & Label Skeleton */}
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-4 w-24"/> {/* Label */}
              <Skeleton className="h-6 w-11 rounded-full"/> {/* Switch */}
            </div>
          </>
        ) : ((!trackProgress) || (trackProgress && trackedFlashcards.length > 0)) && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"ghost"} onClick={shuffleFlashcards}>
                  <Shuffle/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Shuffle Flashcards
              </TooltipContent>
            </Tooltip>

            <div className={"flex flex-row items-center gap-2"}>
              <Label>Track Progress</Label>
              <Switch
                className={"data-[state=checked]:bg-foreground"}
                checked={trackProgress}
                onCheckedChange={(checked) => {
                  setActiveFlashcard(0);
                  setTrackProgress(checked);
                  if (checked) {
                    setTrackedFlashcards(flashcards.filter((fc) => fc.progress !== 1));
                  }
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative group">
          {loading ? (
            <FlashcardItemSkeleton/>
          ) : (flashcards.length > 0 && !trackProgress) ? (
            <FlashcardItem fc={flashcards[activeFlashcard]} key={flashcards[activeFlashcard].id}/>
          ) : (trackedFlashcards.length > 0 && trackProgress) ? (
            <FlashcardItem fc={trackedFlashcards[0]} key={trackedFlashcards[0].id}/>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">{trackProgress ? "No flashcards left" : "No flashcards found"}</p>
            </div>
          )}
        </div>

        <div className="space-y-6 w-full max-w-sm mx-auto">
          <div className={`grid grid-cols-2 gap-4`}>
            {(loading && !trackProgress) ? (
              <>
                <Skeleton className="rounded-xl h-14 w-full"/>
                <Skeleton className="rounded-xl h-14 w-full"/>
              </>
            ) : !trackProgress ? (
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
            ) : (trackProgress && trackedFlashcards.length > 0) &&  (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-14 font-semibold shadow-sm !bg-destructive-bg/70 border-none"
                  onClick={() => trackedFlashcardWrong(trackedFlashcards[0])}
                >
                  Wrong
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-xl h-14 font-semibold shadow-sm"
                  onClick={() => trackedFlashcardRight(trackedFlashcards[0])}
                >
                  Right
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
                style={{
                  width: !trackProgress
                    ? `${((activeFlashcard + 1) / flashcards.length) * 100}%`
                    : `${((flashcards.length - trackedFlashcards.length) / flashcards.length) * 100}%`
                }}
              />
            )}
          </div>
          {trackProgress && trackedFlashcards.length <= 0 && !loading && (
            <div
              className="flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Set Complete! 🎉</p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleResetDeck}
                className="w-full max-w-[200px] rounded-xl font-semibold"
              >
                <RotateCcw className="mr-2 h-4 w-4"/> Reset Deck
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}