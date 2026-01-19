"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FlashcardItem,
  FlashcardItemSkeleton,
} from "@/components/Flashcards/flashcard";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFlashcards } from "@/hooks/use-flashcards";
import {use} from "react";

interface FlashcardDeckProps {
  uuid: string;
  flashcardsetId: string;
  isDemo?: boolean; // New Prop
}

interface PageProps {
  params: Promise<{ uuid: string; flashcardsetId: string }>;
}

export default function Page({ params }: PageProps) {
  const { uuid, flashcardsetId } = use(params);
  return <FlashcardDeck uuid={uuid} flashcardsetId={flashcardsetId} isDemo={false} />;
}

export function FlashcardDeck({
                                uuid,
                                flashcardsetId,
                                isDemo = false,
                              }: FlashcardDeckProps) {
  const router = useRouter();

  const {
    flashcards,
    trackedFlashcards,
    loading,
    flashcardSet,
    activeFlashcard,
    isFirst,
    isLast,
    changeFlashcard,
    handleResetDeck,
    shuffleFlashcards,
    trackProgress,
    setTrackProgress,
    trackedFlashcardRight,
    trackedFlashcardWrong,
  } = useFlashcards(uuid, router, flashcardsetId, isDemo);

  return (
    <div className="px-6 flex flex-col justify-center min-h-[90vh] max-w-2xl mx-auto w-full mt-5 sm:mt-0">
      <div className="absolute right-4 top-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(`/${uuid}/flashcards/${flashcardsetId}/edit`)
              }
              className="rounded-full h-10 w-10"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Set</TooltipContent>
        </Tooltip>
      </div>

      <div className="mb-6 text-center space-y-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-balance line-clamp-1 break-words">
              {flashcardSet?.title ?? "Flashcards"}
            </h1>
            {!trackProgress ? (
              <p className="text-muted-foreground text-sm font-medium">
                Card {activeFlashcard + 1} of {flashcards.length}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm font-medium">
                {flashcards.length - trackedFlashcards.length} of{" "}
                {flashcards.length} cards mastered
              </p>
            )}
          </>
        )}
      </div>

      <div className={"flex flex-row items-center justify-between mb-6"}>
        {loading ? (
          <>
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </>
        ) : (
          (!trackProgress ||
            (trackProgress && trackedFlashcards.length > 0)) && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"ghost"} onClick={shuffleFlashcards}>
                    <Shuffle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shuffle Flashcards</TooltipContent>
              </Tooltip>

              <div className={"flex flex-row items-center gap-2"}>
                <Label>Track Progress</Label>
                <Switch
                  className={"data-[state=checked]:bg-foreground"}
                  checked={trackProgress}
                  onCheckedChange={(checked) => {
                    setTrackProgress(checked);
                  }}
                />
              </div>
            </>
          )
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative group">
          {loading ? (
            <FlashcardItemSkeleton />
          ) : flashcards.length > 0 && !trackProgress ? (
            <FlashcardItem
              fc={flashcards[activeFlashcard]}
              key={flashcards[activeFlashcard].id}
            />
          ) : trackedFlashcards.length > 0 && trackProgress ? (
            <FlashcardItem
              fc={trackedFlashcards[0]}
              key={trackedFlashcards[0].id}
            />
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">
                {trackProgress ? "No flashcards left" : "No flashcards found"}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6 w-full max-w-sm mx-auto">
          <div className={`grid grid-cols-2 gap-4`}>
            {loading && !trackProgress ? (
              <>
                <Skeleton className="rounded-xl h-14 w-full" />
                <Skeleton className="rounded-xl h-14 w-full" />
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
                  <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-14 font-semibold shadow-sm"
                  disabled={isLast}
                  onClick={() => changeFlashcard("next")}
                >
                  Next <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              trackProgress &&
              trackedFlashcards.length > 0 && (
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
              )
            )}
          </div>

          <div className="w-full bg-popover h-2 rounded-full overflow-hidden">
            {loading ? (
              <div className="h-full w-0" />
            ) : (
              <div
                className="bg-foreground h-full transition-all duration-300 ease-in-out"
                style={{
                  width: !trackProgress
                    ? `${((activeFlashcard + 1) / flashcards.length) * 100}%`
                    : `${((flashcards.length - trackedFlashcards.length) / flashcards.length) * 100}%`,
                }}
              />
            )}
          </div>
          {trackProgress && trackedFlashcards.length <= 0 && !loading && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Set Complete! 🎉
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleResetDeck}
                className="w-full max-w-[200px] rounded-xl font-semibold"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Deck
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}