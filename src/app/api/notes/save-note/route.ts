import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { id, title, content, createdAt, studentId } = await req.json();

		if (!studentId) {
			return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
		}

		let note;
		if (id && !isNaN(Number(id))) {
			note = await prisma.note.update({
				where: { id: Number(id) },
				data: { title, content },
			});
		} else {
			note = await prisma.note.create({
				data: { title, content, createdAt: createdAt ? new Date(createdAt) : new Date(), studentId },
			});
		}

		return NextResponse.json({
			note: {
				...note,
				createdAt: note.createdAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error saving note:", error);
		return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
	}
}
