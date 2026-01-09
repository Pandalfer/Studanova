import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { setId } = await req.json();

    if (!setId) {
      return NextResponse.json({ error: "Missing setId" }, { status: 400 });
    }

    // This updates EVERY flashcard in the set to progress 0 in one go
    const result = await prisma.flashcard.updateMany({
      where: {
        setId: setId,
      },
      data: {
        progress: 0,
      },
    });

    return NextResponse.json({
      message: "Deck reset successful",
      count: result.count,
    });
  } catch (error) {
    console.error("Error resetting deck:", error);
    return NextResponse.json(
      { error: "Failed to reset deck" },
      { status: 500 },
    );
  }
}
