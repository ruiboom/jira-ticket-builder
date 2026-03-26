export type IssuePriority = "Highest" | "High" | "Medium" | "Low" | "Lowest";

export type IssueType = "Epic" | "Story" | "Task" | "Sub-task";

export interface JiraMetadata {
  projectKey: string;
  priority: IssuePriority;
  labels: string[];
  components: string[];
  assignee: string;
  reporter: string;
  fixVersion: string;
  epicName?: string;
  epicLink?: string;
}

export interface BaseTicket {
  id: string;
  summary: string;
  description: string;
  issueType: IssueType;
  metadata: JiraMetadata;
  isExpanded: boolean;
}

export interface SubTask extends BaseTicket {
  issueType: "Sub-task";
}

export interface Task extends BaseTicket {
  issueType: "Task";
  subtasks: SubTask[];
}

export interface Story extends BaseTicket {
  issueType: "Story";
  tasks: Task[];
  acceptanceCriteria: string;
  storyPoints?: number;
}

export interface Feature extends BaseTicket {
  issueType: "Epic";
  stories: Story[];
  originalText: string;
  questions: Question[];
  context: string;
  team: string;
}

export interface Question {
  id: string;
  text: string;
  answer: string;
  category: string;
}

export type AppStep = "paste" | "questions" | "canvas" | "export";

export interface AppState {
  step: AppStep;
  apiKey: string;
  feature: Feature | null;
  isLoading: boolean;
  error: string | null;
}
