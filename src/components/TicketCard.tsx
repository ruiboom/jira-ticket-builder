"use client";

import { BaseTicket, Story, Task, SubTask } from "@/lib/types";
import { ISSUE_TYPE_COLORS } from "@/lib/constants";
import { useTicketStore } from "@/hooks/useTicketStore";
import { InlineEditor } from "./InlineEditor";
import { MetadataEditor } from "./MetadataEditor";
import { v4 as uuid } from "uuid";

interface TicketCardProps {
  node: BaseTicket;
  depth: number;
  onGenerateTasks?: (storyId: string) => void;
  isLoading?: boolean;
}

function getChildren(node: BaseTicket): (Story | Task | SubTask)[] {
  if ("stories" in node) return (node as { stories: Story[] }).stories;
  if ("tasks" in node) return (node as { tasks: Task[] }).tasks;
  if ("subtasks" in node) return (node as { subtasks: SubTask[] }).subtasks;
  return [];
}

function getChildType(node: BaseTicket): string | null {
  if (node.issueType === "Epic") return "Story";
  if (node.issueType === "Story") return "Task";
  if (node.issueType === "Task") return "Sub-task";
  return null;
}

const DEPTH_STYLES: Record<number, string> = {
  0: "border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-sm",
  1: "border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 shadow-sm",
  2: "border-blue-200 dark:border-blue-800 bg-gray-50/50 dark:bg-gray-800/50",
  3: "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50",
};

export function TicketCard({
  node,
  depth,
  onGenerateTasks,
  isLoading,
}: TicketCardProps) {
  const {
    toggleExpand,
    updateNode,
    updateStoryFields,
    removeNode,
    addStory,
    addTask,
    addSubTask,
  } = useTicketStore();

  const children = getChildren(node);
  const childCount = children.length;
  const childType = getChildType(node);
  const cardStyle = DEPTH_STYLES[depth] ?? DEPTH_STYLES[3];

  const handleAddChild = () => {
    const baseChild = {
      id: uuid(),
      summary: `New ${childType}`,
      description: "",
      metadata: { ...node.metadata },
      isExpanded: false,
    };

    if (node.issueType === "Epic") {
      addStory({
        ...baseChild,
        issueType: "Story",
        tasks: [],
        acceptanceCriteria: "",
      });
    } else if (node.issueType === "Story") {
      addTask(node.id, {
        ...baseChild,
        issueType: "Task",
        subtasks: [],
      });
    } else if (node.issueType === "Task") {
      addSubTask(node.id, {
        ...baseChild,
        issueType: "Sub-task",
      });
    }
  };

  return (
    <div className={`rounded-lg border ${cardStyle}`}>
      {/* Card header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => toggleExpand(node.id)}
      >
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${
            node.isExpanded ? "rotate-90" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>

        {/* Issue type badge */}
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${
            ISSUE_TYPE_COLORS[node.issueType]
          }`}
        >
          {node.issueType}
        </span>

        {/* Summary */}
        <div
          className="flex-1 min-w-0 font-medium text-sm text-gray-900 dark:text-gray-100 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <InlineEditor
            value={node.summary}
            onChange={(v) => updateNode(node.id, { summary: v })}
          />
        </div>

        {/* Child count badge */}
        {childCount > 0 && !node.isExpanded && (
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
            {childCount} {childType ? childType.toLowerCase() : "item"}
            {childCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Story points badge */}
        {node.issueType === "Story" && (node as Story).storyPoints && (
          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full flex-shrink-0">
            {(node as Story).storyPoints} pts
          </span>
        )}
      </div>

      {/* Card body — shown when expanded */}
      {node.isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Description */}
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Description
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <InlineEditor
                value={node.description}
                onChange={(v) => updateNode(node.id, { description: v })}
                className="text-sm text-gray-600 dark:text-gray-300"
                multiline
              />
            </div>
          </div>

          {/* Acceptance criteria for stories */}
          {node.issueType === "Story" && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Acceptance Criteria
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <InlineEditor
                  value={(node as Story).acceptanceCriteria}
                  onChange={(v) =>
                    updateStoryFields(node.id, { acceptanceCriteria: v })
                  }
                  className="text-sm text-gray-600 dark:text-gray-300"
                  multiline
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div onClick={(e) => e.stopPropagation()}>
            <MetadataEditor
              metadata={node.metadata}
              onUpdate={(updates) =>
                updateNode(node.id, {
                  metadata: { ...node.metadata, ...updates },
                })
              }
              showStoryPoints={node.issueType === "Story"}
              storyPoints={
                node.issueType === "Story"
                  ? (node as Story).storyPoints
                  : undefined
              }
              onUpdateStoryPoints={
                node.issueType === "Story"
                  ? (sp) => updateStoryFields(node.id, { storyPoints: sp })
                  : undefined
              }
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {node.issueType === "Story" && onGenerateTasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateTasks(node.id);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                Generate Tasks with AI
              </button>
            )}
            {childType && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild();
                }}
                className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md font-medium transition-colors"
              >
                + Add {childType}
              </button>
            )}
            {depth > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                className="text-xs px-3 py-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md font-medium transition-colors ml-auto"
              >
                Delete
              </button>
            )}
          </div>

          {/* Nested child cards */}
          {children.length > 0 && (
            <div className="space-y-3 pt-2">
              {children.map((child) => (
                <TicketCard
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onGenerateTasks={onGenerateTasks}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
