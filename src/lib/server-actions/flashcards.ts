"use server";

import { prisma } from "@/lib/prisma";
import { Flashcard, FlashcardSet } from "@/lib/types";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.FLASHCARD_API_KEY!,
});

//region Flashcards

export async function saveFlashcardsBulk(
  flashcards: Flashcard[],
  idsToDelete: string[] = [] // New parameter
) {
  try {
    await prisma.$transaction(async (tx) => {
      if (idsToDelete.length > 0) {
        await tx.flashcard.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      for (const fc of flashcards) {
        if (!fc.id || fc.id.startsWith("temp-")) {
          await tx.flashcard.create({
            data: {
              question: fc.question,
              answer: fc.answer,
              progress: fc.progress ?? 0,
              setId: fc.setId,
            },
          });
        } else {
          await tx.flashcard.update({
            where: { id: fc.id },
            data: {
              question: fc.question,
              answer: fc.answer,
              progress: fc.progress,
            },
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to sync flashcards" };
  }
}

export async function resetDeckProgress(
  setId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!setId) {
    return { success: false, error: "Missing setId" };
  }
  try {
    await prisma.flashcard.updateMany({
      where: {
        setId: setId,
      },
      data: {
        progress: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting deck:", error);
    return { success: false, error: "Failed to reset deck" };
  }
}

export async function generateFlashcardsFromNote(params: {
  uuid: string;
  noteTitle: string;
  noteContent: string;
  count: number;
}): Promise<
  { success: true; data: { setId: string } } | { success: false; error: string }
> {
  if (!params.uuid) return { success: false, error: "Invalid user ID" };

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert tutor. Create flashcards for: ${params.noteTitle}.
          Return ONLY a JSON object with a key "cards".
          Format: {"cards": [{"question": "string", "answer": "string"}]}`,
        },
        { role: "user", content: params.noteContent },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    if (!raw) return { success: false, error: "AI returned empty response" };

    const parsed = JSON.parse(raw);

    // FIX 1: Use the correct key "cards" consistently
    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return { success: false, error: "AI returned malformed data" };
    }

    // FIX 2: Ensure we are slicing the correct array
    const flashcards = parsed.cards.slice(0, params.count);

    if (flashcards.length === 0) {
      return { success: false, error: "No flashcards generated" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const set = await tx.flashcardSet.create({
        data: {

          title: params.noteTitle || "Untitled Set",
          description: `Generated from: ${params.noteTitle}`,
          studentId: params.uuid,
        },
      });

      await tx.flashcard.createMany({
        data: flashcards.map((f: Flashcard) => ({
          question: f.question,
          answer: f.answer,
          setId: set.id,
          progress: 0,
        })),
      });

      return set.id;
    });

    return { success: true, data: { setId: result } };
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    return { success: false, error: "Failed to generate flashcards" };
  }
}


//endregion

//region Flashcard Sets
export async function loadFlashcardSets(uuid: string): Promise<
  | {
      success: true;
      data: FlashcardSet[];
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const flashcardSetsFromDb = await prisma.flashcardSet.findMany({
      where: { studentId: uuid },
      orderBy: { title: "asc" },
      include: { flashcards: true },
    });

    if (!flashcardSetsFromDb || flashcardSetsFromDb.length === 0) {
      return { success: true, data: [] };
    }

    const mappedSets: FlashcardSet[] = flashcardSetsFromDb.map((set) => ({
      id: set.id,
      title: set.title,
      description: set.description ?? "",
      studentId: set.studentId,
      flashcards: Array.isArray(set.flashcards)
        ? set.flashcards.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            setId: f.setId,
            progress: f.progress ?? 0,
          }))
        : [],
    }));

    return { success: true, data: mappedSets };
  } catch (error) {
    console.error("[loadFlashcardSets] DB failure:", error);
    return { success: false, error: "Failed to load flashcard sets" };
  }
}

export async function loadFlashcardSet(
  setId: string,
  uuid: string,
): Promise<
  { success: true; data: FlashcardSet } | { success: false; error: string }
> {
  if (!uuid) {
    return { success: false, error: "Missing studentId" };
  }

  try {
    const flashcardSet = await prisma.flashcardSet.findFirst({
      where: {
        id: setId,
        studentId: uuid,
      },
      include: {
        flashcards: true,
      },
    });
    if (!flashcardSet) {
      return { success: false, error: "Flashcard set not found" };
    }
    const mappedSet: FlashcardSet = {
      id: flashcardSet.id,
      title: flashcardSet.title,
      description: flashcardSet.description ?? "",
      studentId: flashcardSet.studentId,
      flashcards: flashcardSet.flashcards.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        setId: f.setId,
        progress: f.progress ?? 0,
      })),
    };
    return { success: true, data: mappedSet };
  } catch (error) {
    console.error("[loadFlashcardSet] DB failure:", error);
    return {
      success: false,
      error: "Failed to load flashcard set",
    };
  }
}

export async function saveFlashcardSet(
  setId: string,
  data: { title: string; description?: string }
) {
  try {
    const updatedSet = await prisma.flashcardSet.update({
      where: { id: setId },
      data: {
        title: data.title,
        description: data.description,
      },
    });

    return { success: true, data: updatedSet };
  } catch (error) {
    console.error("Set Update Error:", error);
    return { success: false, error: "Failed to update set details" };
  }
}

export async function createFlashcardSet(
  uuid: string,
  data: { title: string; description?: string }
): Promise<
  { success: true; data: FlashcardSet } | { success: false; error: string }
> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const set = await tx.flashcardSet.create({
        data: {
          title: data.title,
          description: data.description || "",
          studentId: uuid,
        },
        include: {
          flashcards: true,
        }
      });

      return set;
    });

    return {
      success: true,
      data: {
        ...result,
        description: result.description ?? "",
        flashcards: []
      }
    };
  } catch (error) {
    console.error("Create Set Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create flashcard set"
    };
  }
}

//endregion
