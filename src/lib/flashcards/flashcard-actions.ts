"use client";

import { Flashcard, FlashcardSet } from "@/lib/types";
import { v4 } from "uuid";

const STORAGE_KEY = "demo_flashcard_sets";

export async function loadFlashcardSetsDemo(): Promise<
  { success: true; data: FlashcardSet[] } | { success: false; error: string }
> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    if (typeof window === "undefined") return { success: true, data: [] };

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: true, data: [] };

    const sets: FlashcardSet[] = JSON.parse(raw);

    sets.sort((a, b) => a.title.localeCompare(b.title));

    return { success: true, data: sets };
  } catch (error) {
    console.error("Demo Load Error:", error);
    return { success: false, error: "Failed to load demo data" };
  }
}

export async function createFlashcardSetDemo(
  uuid: string,
  data: { title: string; description?: string },
): Promise<
  { success: true; data: FlashcardSet } | { success: false; error: string }
> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sets: FlashcardSet[] = raw ? JSON.parse(raw) : [];

    const newSet: FlashcardSet = {
      id: v4(),
      studentId: uuid,
      title: data.title,
      description: data.description || "",
      flashcards: [],
    };

    sets.push(newSet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));

    return { success: true, data: newSet };
  } catch (error) {
    console.error("Demo Create Error:", error);
    return { success: false, error: "Failed to create demo set" };
  }
}

export async function loadFlashcardSetDemo(
  setId: string,
): Promise<
  { success: true; data: FlashcardSet } | { success: false; error: string }
> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: false, error: "No data found" };

    const sets: FlashcardSet[] = JSON.parse(raw);
    const set = sets.find((s) => s.id === setId);

    if (!set) return { success: false, error: "Set not found" };

    return { success: true, data: set };
  } catch (error) {
    console.error("Demo Load Single Error:", error);
    return { success: false, error: "Failed to load set" };
  }
}

/**
 * Saves progress (bulk update) to LocalStorage
 */
/**
 * Saves progress (bulk update) to LocalStorage
 */
export async function saveFlashcardsBulkDemo(
  flashcards: Flashcard[],
  idsToDelete: string[] = [],
) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: false, error: "No data to update" };

    const sets: FlashcardSet[] = JSON.parse(raw);
    const setsMap = new Map(sets.map((s) => [s.id, s]));

    if (idsToDelete.length > 0) {
      for (const set of setsMap.values()) {
        if (set.flashcards) {
          set.flashcards = set.flashcards.filter(
            (fc) => !idsToDelete.includes(fc.id!),
          );
        }
      }
    }

    for (const fc of flashcards) {
      const set = setsMap.get(fc.setId);

      if (set) {
        if (!set.flashcards) set.flashcards = [];

        const cardIndex = set.flashcards.findIndex((c) => c.id === fc.id);

        if (cardIndex >= 0) {
          set.flashcards[cardIndex] = { ...set.flashcards[cardIndex], ...fc };
        } else {
          const newCard = { ...fc };
          if (newCard.id?.startsWith("temp-")) {
            newCard.id = v4();
          }
          set.flashcards.push(newCard);
        }
      }
    }

    const updatedSets = Array.from(setsMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

    return { success: true };
  } catch (error) {
    console.error("Demo Save Bulk Error:", error);
    return { success: false, error: "Failed to save progress" };
  }
}

export async function saveFlashcardSetDemo(
  setId: string,
  data: { title: string; description?: string },
) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: false, error: "No data found" };

    const sets: FlashcardSet[] = JSON.parse(raw);
    const setIndex = sets.findIndex((s) => s.id === setId);

    if (setIndex === -1) return { success: false, error: "Set not found" };

    sets[setIndex] = {
      ...sets[setIndex],
      title: data.title,
      description: data.description || "",
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));

    return { success: true, data: sets[setIndex] };
  } catch (error) {
    console.error("Demo Set Update Error:", error);
    return { success: false, error: "Failed to update set details" };
  }
}

/**
 * Resets progress for a specific deck in LocalStorage
 */
export async function resetDeckProgressDemo(
  setId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { success: false, error: "No data found" };

    const sets: FlashcardSet[] = JSON.parse(raw);
    const setIndex = sets.findIndex((s) => s.id === setId);

    if (setIndex === -1) {
      return { success: false, error: "Set not found" };
    }

    if (!sets[setIndex].flashcards) {
      return { success: false, error: "No flashcards in set" };
    }
    sets[setIndex].flashcards = sets[setIndex].flashcards.map((fc) => ({
      ...fc,
      progress: 0,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reset deck" };
  }
}
