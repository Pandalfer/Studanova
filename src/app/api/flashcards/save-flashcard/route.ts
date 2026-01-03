import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { id, question, answer, setId } = await req.json();

		if (!setId) {
			return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
		}

		let flashcard;

		if (id) {
			flashcard = await prisma.flashcard.upsert({
				where: { id },
				update: { question, answer },
				create: {
					question,
					answer,
					setId,
				},
			});
		} else {
			// 3. Plain creation for new cards
			flashcard = await prisma.flashcard.create({
				data: {
					question,
					answer,
					setId,
				}
			});
		}
		return NextResponse.json({ flashcard });
	} catch (error) {
		console.error("Error saving flashcard:", error);
		return NextResponse.json(
			{ error: "Failed to save flashcard" },
			{ status: 500 },
		);
	}
}