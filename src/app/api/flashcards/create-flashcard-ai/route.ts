import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { APIError } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.FLASHCARD_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const rawContent = completion.choices[0].message.content || "";
    const jsonString = rawContent.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(jsonString);
    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    if (error instanceof APIError) {
      if (error.status === 429) {
        return NextResponse.json({ error: "Rate limit hit" }, { status: 429 });
      }
    }
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 },
    );
  }
}
