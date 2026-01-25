import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect, useRef, useState } from "react";
import { Flashcard, FlashcardSet } from "@/lib/types";
import { toast } from "sonner";
import {
  loadFlashcardSet,
  resetDeckProgress,
  saveFlashcardsBulk,
} from "@/lib/server-actions/flashcards";
import {
  loadFlashcardSetDemo,
  resetDeckProgressDemo,
  saveFlashcardsBulkDemo,
} from "@/lib/flashcards/flashcard-actions";

export function useFlashcards(
  uuid: string,
  router: AppRouterInstance,
  flashcardsetIdFromPath?: string,
  isDemo: boolean = false,
) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [trackedFlashcards, setTrackedFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [activeFlashcard, setActiveFlashcard] = useState<number>(0);
  const [trackProgress, setTrackProgress] = useState(true);

  const saveQueue = useRef<Flashcard[]>([]);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const SAVE_INTERVAL = 20000;

  const processSaveQueue = async () => {
    if (saveQueue.current.length === 0) {
      scheduleFlush();
      return;
    }

    const flashcardsToSave = [...saveQueue.current];
    saveQueue.current = [];

    const dataToSave = flashcardsToSave.map((fc) => ({ ...fc, progress: 1 }));

    let res;
    if (isDemo) {
      res = await saveFlashcardsBulkDemo(dataToSave);
    } else {
      res = await saveFlashcardsBulk(dataToSave);
    }

    if (!res.success) {
      toast.error("Failed to save flashcards progress.");
      saveQueue.current.push(...flashcardsToSave);
    }
    scheduleFlush();
  };

  const scheduleFlush = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(processSaveQueue, SAVE_INTERVAL);
  };

  const isFirst = activeFlashcard === 0;
  const isLast = activeFlashcard === flashcards.length - 1;

  const changeFlashcard = (direction: "next" | "prev") => {
    if (direction === "next" && !isLast) setActiveFlashcard((prev) => prev + 1);
    if (direction === "prev" && !isFirst)
      setActiveFlashcard((prev) => prev - 1);
  };

  const handleResetDeck = async () => {
    if (!flashcardSet?.id) return;

    toast.promise(
      (async () => {
        if (isDemo) {
          await resetDeckProgressDemo(flashcardSet.id!);
        } else {
          await resetDeckProgress(flashcardSet.id!);
        }

        setFlashcards((prev) => prev.map((fc) => ({ ...fc, progress: 0 })));
        setTrackedFlashcards(flashcards.map((fc) => ({ ...fc, progress: 0 })));
        setActiveFlashcard(0);

        return "Deck reset!";
      })(),
      {
        loading: "Resetting progress...",
        success: (msg) => msg,
        error: "Could not reset deck.",
      },
    );
  };

  const shuffleFlashcards = () => {
    const shuffle = (cards: Flashcard[]) => {
      const newCards = [...cards];
      let currentIndex = newCards.length;
      while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newCards[currentIndex], newCards[randomIndex]] = [
          newCards[randomIndex],
          newCards[currentIndex],
        ];
      }
      return newCards;
    };
    trackProgress
      ? setTrackedFlashcards((prevCards) => shuffle(prevCards))
      : setFlashcards((prevCards) => shuffle(prevCards));

    toast.success("Flashcards shuffled!");
  };

  const fetchCards = async () => {
    if (!flashcardsetIdFromPath || !uuid) return;

    setLoading(true);
    try {
      let data;
      if (isDemo) {
        data = await loadFlashcardSetDemo(flashcardsetIdFromPath);
      } else {
        data = await loadFlashcardSet(flashcardsetIdFromPath, uuid);
      }

      if (data.success) {
        setFlashcardSet(data.data);
        const cards = data.data.flashcards ?? [];
        setFlashcards(cards);
        setTrackedFlashcards(cards.filter((fc) => fc.progress !== 1));
      } else {
        router.push(`/${uuid}/flashcards`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Error loading flashcards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [flashcardsetIdFromPath, uuid, isDemo]);

  const trackedFlashcardRight = async (flashcard: Flashcard) => {
    setTrackedFlashcards((prev) => prev.filter((f) => f.id !== flashcard.id));
    saveQueue.current.push(flashcard);
    scheduleFlush();
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveQueue.current.length === 0) return;
      e.preventDefault();
      e.returnValue = "";
      const dataToSave = saveQueue.current.map((fc) => ({
        ...fc,
        progress: 1,
      }));
      if (isDemo) {
        saveFlashcardsBulkDemo(dataToSave);
      } else {
        saveFlashcardsBulk(dataToSave);
      }
      saveQueue.current = [];
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDemo]);

  const trackedFlashcardWrong = async (flashcard: Flashcard) => {
    setTrackedFlashcards((prev) => {
      const withoutCurrent = prev.filter((f) => f.id !== flashcard.id);
      const offset = Math.floor(Math.random() * 3) + 2;
      const insertIndex = Math.min(offset, withoutCurrent.length);
      return [
        ...withoutCurrent.slice(0, insertIndex),
        flashcard,
        ...withoutCurrent.slice(insertIndex),
      ];
    });
  };

  return {
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
  };
}
