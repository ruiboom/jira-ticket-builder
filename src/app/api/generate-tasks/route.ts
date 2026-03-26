import { NextResponse } from "next/server";
import { callClaudeJson } from "@/lib/claude";
import { generateTasksPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const {
      storySummary,
      storyDescription,
      acceptanceCriteria,
      featureContext,
      context,
      team,
    } = await request.json();

    const prompt = generateTasksPrompt(
      storySummary,
      storyDescription,
      acceptanceCriteria || "",
      featureContext || "",
      context || "",
      team || ""
    );
    const data = await callClaudeJson<{
      tasks: {
        summary: string;
        description: string;
        subtasks?: { summary: string; description: string }[];
      }[];
    }>(prompt);

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
