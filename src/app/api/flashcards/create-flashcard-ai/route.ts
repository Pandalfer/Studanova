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

    // 1. Clean the response (remove potential markdown backticks)
    const jsonString = rawContent.replace(/```json|```/g, "").trim();

    // 2. Parse the string into a JavaScript object
    const parsedData = JSON.parse(jsonString);

    // 3. Return the parsed object directly
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
