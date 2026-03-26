export function summariseFeedbackPrompt(
  entries: { text: string; timestamp: string }[]
): string {
  const feedbackBlock = entries
    .map((e, i) => `[${i + 1}] (${e.timestamp}): ${e.text}`)
    .join("\n");

  return `You are an analyst reviewing user feedback for a Jira ticket builder tool. Summarise the following ${entries.length} feedback entries into a concise report. Group by theme, highlight the most common requests or complaints, and note any trends over time.

Feedback entries:
---
${feedbackBlock}
---

Provide a clear, structured summary with sections for key themes, frequency of mentions, and actionable recommendations.`;
}

function contextBlock(context: string, team: string): string {
  const parts: string[] = [];
  if (context.trim()) {
    parts.push(`Technical/Business Context:\n${context}`);
  }
  if (team.trim()) {
    parts.push(`Team Structure:\n${team}`);
  }
  return parts.length > 0 ? parts.join("\n\n") + "\n\n" : "";
}

export function analyzeTicketPrompt(
  ticketText: string,
  context: string = "",
  team: string = ""
): string {
  return `You are a senior product manager and Jira expert. Analyze the following feature ticket and identify what information is missing or ambiguous that would be needed to break this into implementable stories.

Extract the following metadata from the ticket if present:
- Project key
- Priority
- Labels
- Components
- Reporter
- Fix version

${contextBlock(context, team)}Then generate 5-15 questions about missing information. Categorize each question as one of: "scope", "technical", "ux", "dependencies", "acceptance-criteria", "non-functional".

Take into account any provided context and team information when generating questions — avoid asking about things already covered.

Feature Ticket:
---
${ticketText}
---

Respond in this exact JSON format (no other text):
{
  "metadata": {
    "projectKey": "",
    "priority": "Medium",
    "labels": [],
    "components": [],
    "reporter": "",
    "fixVersion": ""
  },
  "summary": "extracted or inferred feature summary",
  "description": "cleaned up description",
  "questions": [
    {
      "text": "What is the expected...",
      "category": "scope"
    }
  ]
}`;
}

export function generateStoriesPrompt(
  featureSummary: string,
  featureDescription: string,
  originalText: string,
  answeredQuestions: { text: string; answer: string }[],
  metadata: { projectKey: string; priority: string; labels: string[]; components: string[] },
  context: string = "",
  team: string = ""
): string {
  const qaBlock = answeredQuestions
    .filter((q) => q.answer.trim())
    .map((q) => `Q: ${q.text}\nA: ${q.answer}`)
    .join("\n\n");

  return `You are a senior product manager breaking a feature into user stories for a Jira board.

Feature: ${featureSummary}
Description: ${featureDescription}
Original ticket text: ${originalText}

${contextBlock(context, team)}${qaBlock ? `Additional context from answered questions:\n${qaBlock}\n\n` : ""}Create 3-8 user stories that fully implement this feature. Each story should be independently deliverable and follow the format "As a [user], I want [goal], so that [benefit]".

${team.trim() ? "When relevant, consider the team structure and specialisms when scoping stories — group work that aligns with team members' expertise.\n\n" : ""}For each story, inherit these defaults from the parent feature (but adjust if appropriate):
- Project key: ${metadata.projectKey}
- Priority: ${metadata.priority}
- Labels: ${JSON.stringify(metadata.labels)}
- Components: ${JSON.stringify(metadata.components)}

Respond in this exact JSON format (no other text):
{
  "stories": [
    {
      "summary": "As a user, I want...",
      "description": "Detailed description...",
      "acceptanceCriteria": "- [ ] Criterion 1\\n- [ ] Criterion 2",
      "priority": "Medium",
      "labels": ["backend"],
      "components": ["api"],
      "storyPoints": 5
    }
  ]
}`;
}

export function generateTasksPrompt(
  storySummary: string,
  storyDescription: string,
  acceptanceCriteria: string,
  featureContext: string,
  context: string = "",
  team: string = ""
): string {
  return `You are a senior software engineer breaking a user story into implementation tasks.

Story: ${storySummary}
Description: ${storyDescription}
Acceptance Criteria: ${acceptanceCriteria}
Parent Feature Context: ${featureContext}

${contextBlock(context, team)}Break this story into 2-6 concrete implementation tasks. For each task, optionally include 1-3 subtasks if the task is complex enough to warrant decomposition.

Each task should be a specific, actionable unit of work (e.g., "Create REST endpoint for user preferences", not "Do backend work").
${team.trim() ? "\nWhere possible, align tasks with specific team members' roles and expertise based on the team structure provided.\n" : ""}
Respond in this exact JSON format (no other text):
{
  "tasks": [
    {
      "summary": "Create database migration for...",
      "description": "...",
      "subtasks": [
        {
          "summary": "Add column X to table Y",
          "description": "..."
        }
      ]
    }
  ]
}`;
}
