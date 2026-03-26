import { Feature, Story, Task, SubTask } from "./types";

interface CsvRow {
  id: number;
  parentId: number | null;
  issueType: string;
  summary: string;
  description: string;
  priority: string;
  labels: string;
  components: string;
  assignee: string;
  reporter: string;
  fixVersion: string;
  epicName: string;
  epicLink: string;
  storyPoints: string;
  acceptanceCriteria: string;
}

const CSV_HEADERS = [
  "ID",
  "Parent ID",
  "Issue Type",
  "Summary",
  "Description",
  "Priority",
  "Labels",
  "Components",
  "Assignee",
  "Reporter",
  "Fix Version",
  "Epic Name",
  "Epic Link",
  "Story Points",
  "Acceptance Criteria",
];

function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowToLine(row: CsvRow): string {
  return [
    row.id,
    row.parentId ?? "",
    row.issueType,
    escapeField(row.summary),
    escapeField(row.description),
    row.priority,
    escapeField(row.labels),
    escapeField(row.components),
    row.assignee,
    row.reporter,
    row.fixVersion,
    row.epicName,
    row.epicLink,
    row.storyPoints,
    escapeField(row.acceptanceCriteria),
  ].join(",");
}

export function featureToCSV(feature: Feature): string {
  const rows: CsvRow[] = [];
  let nextId = 1;

  const featureId = nextId++;
  rows.push({
    id: featureId,
    parentId: null,
    issueType: "Epic",
    summary: feature.summary,
    description: feature.description,
    priority: feature.metadata.priority,
    labels: feature.metadata.labels.join(" "),
    components: feature.metadata.components.join(" "),
    assignee: feature.metadata.assignee,
    reporter: feature.metadata.reporter,
    fixVersion: feature.metadata.fixVersion,
    epicName: feature.summary,
    epicLink: "",
    storyPoints: "",
    acceptanceCriteria: "",
  });

  for (const story of feature.stories) {
    const storyId = nextId++;
    rows.push({
      id: storyId,
      parentId: featureId,
      issueType: "Story",
      summary: story.summary,
      description: story.description,
      priority: story.metadata.priority,
      labels: story.metadata.labels.join(" "),
      components: story.metadata.components.join(" "),
      assignee: story.metadata.assignee,
      reporter: story.metadata.reporter,
      fixVersion: story.metadata.fixVersion,
      epicName: "",
      epicLink: feature.summary,
      storyPoints: story.storyPoints?.toString() ?? "",
      acceptanceCriteria: story.acceptanceCriteria,
    });

    for (const task of story.tasks) {
      const taskId = nextId++;
      rows.push({
        id: taskId,
        parentId: storyId,
        issueType: "Task",
        summary: task.summary,
        description: task.description,
        priority: task.metadata.priority,
        labels: task.metadata.labels.join(" "),
        components: task.metadata.components.join(" "),
        assignee: task.metadata.assignee,
        reporter: task.metadata.reporter,
        fixVersion: task.metadata.fixVersion,
        epicName: "",
        epicLink: "",
        storyPoints: "",
        acceptanceCriteria: "",
      });

      for (const subtask of task.subtasks) {
        const subtaskId = nextId++;
        rows.push({
          id: subtaskId,
          parentId: taskId,
          issueType: "Sub-task",
          summary: subtask.summary,
          description: subtask.description,
          priority: subtask.metadata.priority,
          labels: subtask.metadata.labels.join(" "),
          components: subtask.metadata.components.join(" "),
          assignee: subtask.metadata.assignee,
          reporter: subtask.metadata.reporter,
          fixVersion: subtask.metadata.fixVersion,
          epicName: "",
          epicLink: "",
          storyPoints: "",
          acceptanceCriteria: "",
        });
      }
    }
  }

  return [CSV_HEADERS.join(","), ...rows.map(rowToLine)].join("\n");
}

export function storyToCSV(story: Story, epicName: string): string {
  const rows: CsvRow[] = [];
  let nextId = 1;

  const storyId = nextId++;
  rows.push({
    id: storyId,
    parentId: null,
    issueType: "Story",
    summary: story.summary,
    description: story.description,
    priority: story.metadata.priority,
    labels: story.metadata.labels.join(" "),
    components: story.metadata.components.join(" "),
    assignee: story.metadata.assignee,
    reporter: story.metadata.reporter,
    fixVersion: story.metadata.fixVersion,
    epicName: "",
    epicLink: epicName,
    storyPoints: story.storyPoints?.toString() ?? "",
    acceptanceCriteria: story.acceptanceCriteria,
  });

  for (const task of story.tasks) {
    const taskId = nextId++;
    rows.push({
      id: taskId,
      parentId: storyId,
      issueType: "Task",
      summary: task.summary,
      description: task.description,
      priority: task.metadata.priority,
      labels: task.metadata.labels.join(" "),
      components: task.metadata.components.join(" "),
      assignee: task.metadata.assignee,
      reporter: task.metadata.reporter,
      fixVersion: task.metadata.fixVersion,
      epicName: "",
      epicLink: "",
      storyPoints: "",
      acceptanceCriteria: "",
    });

    for (const subtask of task.subtasks) {
      const subtaskId = nextId++;
      rows.push({
        id: subtaskId,
        parentId: taskId,
        issueType: "Sub-task",
        summary: subtask.summary,
        description: subtask.description,
        priority: subtask.metadata.priority,
        labels: subtask.metadata.labels.join(" "),
        components: subtask.metadata.components.join(" "),
        assignee: subtask.metadata.assignee,
        reporter: subtask.metadata.reporter,
        fixVersion: subtask.metadata.fixVersion,
        epicName: "",
        epicLink: "",
        storyPoints: "",
        acceptanceCriteria: "",
      });
    }
  }

  return [CSV_HEADERS.join(","), ...rows.map(rowToLine)].join("\n");
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
