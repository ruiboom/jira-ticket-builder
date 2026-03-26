import { IssuePriority, IssueType } from "./types";

export const PRIORITIES: IssuePriority[] = [
  "Highest",
  "High",
  "Medium",
  "Low",
  "Lowest",
];

export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  Epic: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Story: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Task: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "Sub-task": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export const QUESTION_CATEGORIES = [
  "scope",
  "technical",
  "ux",
  "dependencies",
  "acceptance-criteria",
  "non-functional",
] as const;

export const DEFAULT_METADATA = {
  projectKey: "",
  priority: "Medium" as IssuePriority,
  labels: [] as string[],
  components: [] as string[],
  assignee: "",
  reporter: "",
  fixVersion: "",
};
