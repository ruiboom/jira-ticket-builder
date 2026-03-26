import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { summariseFeedbackPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const { entries } = await request.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "No feedback entries provided" },
        { status: 400 }
      );
    }

    const prompt = summariseFeedbackPrompt(entries);
    const summary = await callClaude(prompt);

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
