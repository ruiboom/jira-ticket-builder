"use client";

import { useState } from "react";
import { JiraMetadata, IssuePriority } from "@/lib/types";
import { PRIORITIES } from "@/lib/constants";

export function MetadataEditor({
  metadata,
  onUpdate,
  storyPoints,
  onUpdateStoryPoints,
  showStoryPoints = false,
}: {
  metadata: JiraMetadata;
  onUpdate: (updates: Partial<JiraMetadata>) => void;
  storyPoints?: number;
  onUpdateStoryPoints?: (sp: number) => void;
  showStoryPoints?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [labelsInput, setLabelsInput] = useState(metadata.labels.join(", "));
  const [componentsInput, setComponentsInput] = useState(
    metadata.components.join(", ")
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Metadata
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">Metadata</span>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Priority</label>
          <select
            value={metadata.priority}
            onChange={(e) =>
              onUpdate({ priority: e.target.value as IssuePriority })
            }
            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Assignee</label>
          <input
            value={metadata.assignee}
            onChange={(e) => onUpdate({ assignee: e.target.value })}
            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Unassigned"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Labels (comma-separated)</label>
          <input
            value={labelsInput}
            onChange={(e) => {
              setLabelsInput(e.target.value);
              onUpdate({
                labels: e.target.value
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
              });
            }}
            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Components (comma-separated)</label>
          <input
            value={componentsInput}
            onChange={(e) => {
              setComponentsInput(e.target.value);
              onUpdate({
                components: e.target.value
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean),
              });
            }}
            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          />
        </div>

        {showStoryPoints && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Story Points</label>
            <input
              type="number"
              value={storyPoints ?? ""}
              onChange={(e) =>
                onUpdateStoryPoints?.(parseInt(e.target.value) || 0)
              }
              className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              min={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
