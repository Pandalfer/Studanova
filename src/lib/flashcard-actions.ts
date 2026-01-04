import { Flashcard, FlashcardSet } from "@/lib/types";

export async function saveFlashcard(flashcard: Flashcard): Promise<void> {
  const res = await fetch("/api/flashcards/save-flashcard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...flashcard }),
  });
  if (!res.ok) {
    throw new Error("Failed to save flashcard");
  }
}

export async function saveFlashcardSet(
  flashcardSet: FlashcardSet,
): Promise<FlashcardSet> {
  const res = await fetch("/api/flashcards/save-flashcard-set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...flashcardSet }),
  });
  if (!res.ok) {
    throw new Error("Failed to save flashcard set");
  }
  const data = await res.json();
  return data.flashcardSet;
}

export async function loadFlashcardSet(
  setId: string,
  uuid: string,
): Promise<FlashcardSet> {
  const res = await fetch("/api/flashcards/load-flashcards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ setId, uuid }),
  });
  if (!res.ok) {
    throw new Error("Failed to save flashcard set");
  }
  const data = await res.json();
  return data.flashcardSet;
}
