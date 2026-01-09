"use server"

import { Flashcard, FlashcardSet } from "@/lib/types";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const groq = new Groq({ apiKey: process.env.FLASHCARD_API_KEY! });

// --- AI GENERATION ---
export async function generateAndSaveFlashcardsAction(
  noteContent: string,
  noteTitle: string,
  count: number,
  studentId: string
) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert tutor. Create exactly ${count} flashcards. 
          Return ONLY a JSON object: {"title": "...", "cards": [{"question": "...", "answer": "..."}]}`
        },
        { role: "user", content: noteContent }
      ],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");
    const cards = data.cards || [];

    const newSet = await prisma.$transaction(async (tx) => {
      return await tx.flashcardSet.create({
        data: {
          title: data.title || `${noteTitle} Review`,
          description: `Generated from: ${noteTitle}`,
          studentId: studentId,
          flashcards: {
            create: cards.map((fc: Flashcard) => ({
              question: fc.question,
              answer: fc.answer,
              progress: 0,
            })),
          },
        },
      });
    });

    revalidatePath(`/${studentId}/flashcards`);
    return { success: true, setId: newSet.id };
  } catch (error) {
    console.error("AI Action Error:", error);
    return { success: false, error: "AI Generation failed" };
  }
}

// --- DATA LOADING ---
export async function loadFlashcardSets(uuid: string) {
  try {
    const sets = await prisma.flashcardSet.findMany({
      where: { studentId: uuid },
      orderBy: { title: "asc" },
      include: { flashcards: true },
    });

    // Map to ensure types match your frontend FlashcardSet interface
    const formattedSets: FlashcardSet[] = sets.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
      studentId: s.studentId,
      flashcards: s.flashcards.map(f => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        setId: f.setId,
        progress: f.progress
      }))
    }));

    return { success: true, flashcardSets: formattedSets };
  } catch (error) {
    return { success: false, error: "Failed to load sets" };
  }
}

export async function loadFlashcards(setId: string, uuid: string) {
  // Direct Prisma call instead of fetch
  const set = await prisma.flashcardSet.findUnique({
    where: { id: setId, studentId: uuid },
    include: { flashcards: true }
  });
  return set as FlashcardSet | null;
}

// --- UPDATES & DELETES ---
export async function saveFlashcard(flashcard: Flashcard) {
  return await prisma.flashcard.update({
    where: { id: flashcard.id },
    data: {
      question: flashcard.question,
      answer: flashcard.answer,
      progress: flashcard.progress
    }
  });
}

export async function resetDeckProgress(setId: string) {
  return await prisma.flashcard.updateMany({
    where: { setId: setId },
    data: { progress: 0 }
  });
}