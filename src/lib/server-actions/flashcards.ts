"use server"

import { prisma } from "@/lib/prisma";
import {FlashcardSet} from "@/lib/types";

export async function loadFlashcardSets(uuid: string): Promise<FlashcardSet[]> {
	const flashcardSetsFromDb = await prisma.flashcardSet.findMany({
		where: { studentId: uuid },
		orderBy: { title: "asc" },
		include: { flashcards: true },
	});

	return flashcardSetsFromDb.map((set) => ({
		id: set.id.toString(),
		title: set.title,
		description: set.description ?? "",
		flashcards: set.flashcards.map(f => ({
			id: f.id.toString(),
			question: f.question,
			answer: f.answer,
			setId: f.setId.toString(),
			progress: f.progress ?? 0,
		})),
		studentId: set.studentId.toString(),
	}));
}