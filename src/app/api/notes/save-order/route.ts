import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { studentId, notes } = await req.json();

		if (!studentId) {
			return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
		}

		// Update all notes in a transaction for safety
		await prisma.$transaction(
			notes.map((n: { id: string; order: number }) =>
				prisma.note.update({
					where: { id: n.id },
					data: { order: n.order },
				})
			)
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving note order:", error);
		return NextResponse.json({ error: "Failed to save note order" }, { status: 500 });
	}
}