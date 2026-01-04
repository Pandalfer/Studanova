import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { flashcards, setId } = await req.json();

		if (!setId || !Array.isArray(flashcards)) {
			return NextResponse.json({ error: "Missing setId or flashcards array" }, { status: 400 });
		}

		// Using createMany is the most efficient way to insert multiple records at once
		const createdCards = await prisma.flashcard.createMany({
			data: flashcards.map((fc: { question: string; answer: string }) => ({
				question: fc.question,
				answer: fc.answer,
				setId: setId,
			})),
		});

		return NextResponse.json({ count: createdCards.count });
	} catch (error) {
		console.error("Error bulk saving flashcards:", error);
		return NextResponse.json(
			{ error: "Failed to save flashcards in bulk" },
			{ status: 500 },
		);
	}
}