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
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert tutor. Create flashcards that test deep understanding, not just definitions. 
          Return ONLY a JSON object with a key "cards" containing an array of objects.
          Each object must have "question" and "answer" strings. 
          Format: {"cards": [{"question": "...", "answer": "..."}]}`
        },
        { role: "user", content: content }
      ],
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);
    const cards = parsed.cards || parsed;

    return NextResponse.json(cards);
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
