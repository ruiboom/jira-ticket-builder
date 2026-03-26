import { NextResponse } from "next/server";
import { callClaudeJson } from "@/lib/claude";
import { analyzeTicketPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const { ticketText, context, team } = await request.json();

    if (!ticketText) {
      return NextResponse.json({ error: "Ticket text is required" }, { status: 400 });
    }

    const prompt = analyzeTicketPrompt(ticketText, context || "", team || "");
    const data = await callClaudeJson<{
      metadata: Record<string, unknown>;
      summary: string;
      description: string;
      questions: { text: string; category: string }[];
    }>(prompt);

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
