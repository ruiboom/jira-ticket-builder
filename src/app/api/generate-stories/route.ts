import { NextResponse } from "next/server";
import { callClaudeJson } from "@/lib/claude";
import { generateStoriesPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const {
      featureSummary,
      featureDescription,
      originalText,
      answeredQuestions,
      metadata,
      context,
      team,
    } = await request.json();

    const prompt = generateStoriesPrompt(
      featureSummary,
      featureDescription,
      originalText,
      answeredQuestions || [],
      metadata || {},
      context || "",
      team || ""
    );
    const data = await callClaudeJson<{
      stories: {
        summary: string;
        description: string;
        acceptanceCriteria: string;
        priority: string;
        labels: string[];
        components: string[];
        storyPoints: number;
      }[];
    }>(prompt);

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
