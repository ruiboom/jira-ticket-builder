"use client";

import { BaseTicket, Story, Task, SubTask } from "@/lib/types";
import { ISSUE_TYPE_COLORS } from "@/lib/constants";
import { useTicketStore } from "@/hooks/useTicketStore";
import { InlineEditor } from "./InlineEditor";
import { MetadataEditor } from "./MetadataEditor";
import { v4 as uuid } from "uuid";

interface TicketTreeNodeProps {
  node: BaseTicket;
  depth: number;
  onGenerateTasks?: (storyId: string) => void;
  isLoading?: boolean;
}

function getChildren(
  node: BaseTicket
): (Story | Task | SubTask)[] {
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

export function TicketTreeNode({
  node,
  depth,
  onGenerateTasks,
  isLoading,
}: TicketTreeNodeProps) {
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
  const hasChildren = children.length > 0;
  const childType = getChildType(node);

  const handleAddChild = () => {
    const baseChild = {
      id: uuid(),
      summary: `New ${childType}`,
      description: "",
      metadata: { ...node.metadata },
      isExpanded: true,
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
    <div className={depth > 0 ? "ml-6 border-l border-gray-200 dark:border-gray-700 pl-4" : ""}>
      <div className="group py-2">
        <div className="flex items-start gap-2">
          {/* Expand/collapse */}
          <button
            onClick={() => toggleExpand(node.id)}
            className="mt-0.5 w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 flex-shrink-0"
          >
            {hasChildren || childType ? (
              <svg
                className={`w-3.5 h-3.5 transition-transform ${
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
            ) : (
              <span className="w-3.5" />
            )}
          </button>

          {/* Issue type badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${
              ISSUE_TYPE_COLORS[node.issueType]
            }`}
          >
            {node.issueType}
          </span>

          {/* Summary */}
          <div className="flex-1 min-w-0">
            <InlineEditor
              value={node.summary}
              onChange={(v) => updateNode(node.id, { summary: v })}
              className="font-medium text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {node.issueType === "Story" && onGenerateTasks && (
              <button
                onClick={() => onGenerateTasks(node.id)}
                disabled={isLoading}
                className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-50"
                title="Generate tasks with AI"
              >
                AI Tasks
              </button>
            )}
            {childType && (
              <button
                onClick={handleAddChild}
                className="text-xs px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={`Add ${childType}`}
              >
                + {childType}
              </button>
            )}
            {depth > 0 && (
              <button
                onClick={() => removeNode(node.id)}
                className="text-xs px-2 py-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title="Delete"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Description (shown when expanded) */}
        {node.isExpanded && (
          <div className="ml-7 mt-1 space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Description</div>
            <InlineEditor
              value={node.description}
              onChange={(v) => updateNode(node.id, { description: v })}
              className="text-sm text-gray-600 dark:text-gray-300"
              multiline
            />

            {/* Acceptance criteria for stories */}
            {node.issueType === "Story" && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Acceptance Criteria
                </div>
                <InlineEditor
                  value={(node as Story).acceptanceCriteria}
                  onChange={(v) =>
                    updateStoryFields(node.id, { acceptanceCriteria: v })
                  }
                  className="text-sm text-gray-600 dark:text-gray-300"
                  multiline
                />
              </div>
            )}

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
        )}
      </div>

      {/* Children */}
      {node.isExpanded &&
        children.map((child) => (
          <TicketTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            onGenerateTasks={onGenerateTasks}
            isLoading={isLoading}
          />
        ))}
    </div>
  );
}
