"use client";

import { useCallback } from "react";
import { useTicketStore } from "./useTicketStore";
import { Feature, Story, Task, SubTask } from "@/lib/types";
import { DEFAULT_METADATA } from "@/lib/constants";
import { v4 as uuid } from "uuid";

export function useAiGeneration() {
  const { setLoading, setError, setFeature, setStep, setTasksForStory, feature } =
    useTicketStore();

  const analyzeTicket = useCallback(
    async ({ ticketText, context, team }: { ticketText: string; context: string; team: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketText, context, team }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to analyze ticket");
        }
        const data = await res.json();

        const newFeature: Feature = {
          id: uuid(),
          summary: data.summary,
          description: data.description,
          issueType: "Epic",
          metadata: {
            ...DEFAULT_METADATA,
            ...data.metadata,
            labels: data.metadata?.labels ?? [],
            components: data.metadata?.components ?? [],
          },
          isExpanded: true,
          stories: [],
          originalText: ticketText,
          context,
          team,
          questions: data.questions.map(
            (q: { text: string; category: string }) => ({
              id: uuid(),
              text: q.text,
              answer: "",
              category: q.category,
            })
          ),
        };

        setFeature(newFeature);
        setStep("questions");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setFeature, setStep]
  );

  const generateStories = useCallback(async () => {
    if (!feature) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureSummary: feature.summary,
          featureDescription: feature.description,
          originalText: feature.originalText,
          answeredQuestions: feature.questions
            .filter((q) => q.answer.trim())
            .map((q) => ({ text: q.text, answer: q.answer })),
          metadata: feature.metadata,
          context: feature.context,
          team: feature.team,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate stories");
      }
      const data = await res.json();

      const stories: Story[] = data.stories.map(
        (s: {
          summary: string;
          description: string;
          acceptanceCriteria: string;
          priority: string;
          labels: string[];
          components: string[];
          storyPoints: number;
        }) => ({
          id: uuid(),
          summary: s.summary,
          description: s.description,
          issueType: "Story" as const,
          metadata: {
            ...feature.metadata,
            priority: s.priority || feature.metadata.priority,
            labels: s.labels || feature.metadata.labels,
            components: s.components || feature.metadata.components,
          },
          isExpanded: false,
          tasks: [],
          acceptanceCriteria: s.acceptanceCriteria || "",
          storyPoints: s.storyPoints,
        })
      );

      setFeature({ ...feature, stories });
      setStep("canvas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [feature, setLoading, setError, setFeature, setStep]);

  const generateTasks = useCallback(
    async (storyId: string) => {
      if (!feature) return;
      const story = feature.stories.find((s) => s.id === storyId);
      if (!story) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/generate-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storySummary: story.summary,
            storyDescription: story.description,
            acceptanceCriteria: story.acceptanceCriteria,
            featureContext: feature.summary,
            context: feature.context,
            team: feature.team,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate tasks");
        }
        const data = await res.json();

        const tasks: Task[] = data.tasks.map(
          (t: {
            summary: string;
            description: string;
            subtasks?: { summary: string; description: string }[];
          }) => ({
            id: uuid(),
            summary: t.summary,
            description: t.description,
            issueType: "Task" as const,
            metadata: { ...story.metadata },
            isExpanded: false,
            subtasks: (t.subtasks || []).map(
              (st: { summary: string; description: string }) => ({
                id: uuid(),
                summary: st.summary,
                description: st.description,
                issueType: "Sub-task" as const,
                metadata: { ...story.metadata },
                isExpanded: false,
              })
            ),
          })
        );

        setTasksForStory(storyId, tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [feature, setLoading, setError, setTasksForStory]
  );

  return { analyzeTicket, generateStories, generateTasks };
}
