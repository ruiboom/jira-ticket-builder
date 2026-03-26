"use client";

import { Feature } from "@/lib/types";
import { useTicketStore } from "@/hooks/useTicketStore";
import { TicketCard } from "./TicketCard";

export function TicketTree({
  feature,
  onGenerateTasks,
  isLoading,
}: {
  feature: Feature;
  onGenerateTasks: (storyId: string) => void;
  isLoading: boolean;
}) {
  const { expandAll, collapseAll } = useTicketStore();

  const totalStories = feature.stories.length;
  const totalTasks = feature.stories.reduce(
    (sum, s) => sum + s.tasks.length,
    0
  );
  const totalSubtasks = feature.stories.reduce(
    (sum, s) => s.tasks.reduce((ts, t) => ts + t.subtasks.length, sum),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalStories} stories, {totalTasks} tasks, {totalSubtasks} subtasks
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
          >
            Collapse All
          </button>
        </div>
      </div>

      <TicketCard
        node={feature}
        depth={0}
        onGenerateTasks={onGenerateTasks}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Generating with Claude...
        </div>
      )}
    </div>
  );
}
