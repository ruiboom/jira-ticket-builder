import { create } from "zustand";
import {
  AppStep,
  Feature,
  Story,
  Task,
  SubTask,
  BaseTicket,
} from "@/lib/types";

interface TicketStore {
  step: AppStep;
  feature: Feature | null;
  isLoading: boolean;
  error: string | null;

  setStep: (step: AppStep) => void;
  setFeature: (feature: Feature) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateNode: (id: string, updates: Partial<BaseTicket>) => void;
  updateStoryFields: (
    id: string,
    updates: { acceptanceCriteria?: string; storyPoints?: number }
  ) => void;
  addStory: (story: Story) => void;
  addTask: (storyId: string, task: Task) => void;
  addSubTask: (taskId: string, subtask: SubTask) => void;
  removeNode: (id: string) => void;
  setStoriesForFeature: (stories: Story[]) => void;
  setTasksForStory: (storyId: string, tasks: Task[]) => void;
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  updateQuestion: (questionId: string, answer: string) => void;
}

function updateNodeInTree(
  feature: Feature,
  id: string,
  updates: Partial<BaseTicket>
): Feature {
  if (feature.id === id) {
    return { ...feature, ...updates } as Feature;
  }
  return {
    ...feature,
    stories: feature.stories.map((story) => {
      if (story.id === id) return { ...story, ...updates } as Story;
      return {
        ...story,
        tasks: story.tasks.map((task) => {
          if (task.id === id) return { ...task, ...updates } as Task;
          return {
            ...task,
            subtasks: task.subtasks.map((st) =>
              st.id === id ? ({ ...st, ...updates } as SubTask) : st
            ),
          };
        }),
      };
    }),
  };
}

function setExpandAll(feature: Feature, expanded: boolean): Feature {
  return {
    ...feature,
    isExpanded: expanded,
    stories: feature.stories.map((story) => ({
      ...story,
      isExpanded: expanded,
      tasks: story.tasks.map((task) => ({
        ...task,
        isExpanded: expanded,
        subtasks: task.subtasks.map((st) => ({
          ...st,
          isExpanded: expanded,
        })),
      })),
    })),
  };
}

function removeNodeFromTree(feature: Feature, id: string): Feature {
  return {
    ...feature,
    stories: feature.stories
      .filter((s) => s.id !== id)
      .map((story) => ({
        ...story,
        tasks: story.tasks
          .filter((t) => t.id !== id)
          .map((task) => ({
            ...task,
            subtasks: task.subtasks.filter((st) => st.id !== id),
          })),
      })),
  };
}

export const useTicketStore = create<TicketStore>((set) => ({
  step: "paste",
  feature: null,
  isLoading: false,
  error: null,

  setStep: (step) => set({ step }),
  setFeature: (feature) => set({ feature }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateNode: (id, updates) =>
    set((state) => ({
      feature: state.feature
        ? updateNodeInTree(state.feature, id, updates)
        : null,
    })),

  updateStoryFields: (id, updates) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          stories: state.feature.stories.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        },
      };
    }),

  addStory: (story) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          stories: [...state.feature.stories, story],
        },
      };
    }),

  addTask: (storyId, task) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          stories: state.feature.stories.map((s) =>
            s.id === storyId ? { ...s, tasks: [...s.tasks, task] } : s
          ),
        },
      };
    }),

  addSubTask: (taskId, subtask) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          stories: state.feature.stories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? { ...t, subtasks: [...t.subtasks, subtask] }
                : t
            ),
          })),
        },
      };
    }),

  removeNode: (id) =>
    set((state) => ({
      feature: state.feature
        ? removeNodeFromTree(state.feature, id)
        : null,
    })),

  setStoriesForFeature: (stories) =>
    set((state) => {
      if (!state.feature) return {};
      return { feature: { ...state.feature, stories } };
    }),

  setTasksForStory: (storyId, tasks) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          stories: state.feature.stories.map((s) =>
            s.id === storyId ? { ...s, tasks } : s
          ),
        },
      };
    }),

  toggleExpand: (id) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: updateNodeInTree(state.feature, id, {
          isExpanded: !(function findExpanded(f: Feature): boolean {
            if (f.id === id) return f.isExpanded;
            for (const s of f.stories) {
              if (s.id === id) return s.isExpanded;
              for (const t of s.tasks) {
                if (t.id === id) return t.isExpanded;
                for (const st of t.subtasks) {
                  if (st.id === id) return st.isExpanded;
                }
              }
            }
            return false;
          })(state.feature),
        }),
      };
    }),

  expandAll: () =>
    set((state) => ({
      feature: state.feature ? setExpandAll(state.feature, true) : null,
    })),

  collapseAll: () =>
    set((state) => ({
      feature: state.feature ? setExpandAll(state.feature, false) : null,
    })),

  updateQuestion: (questionId, answer) =>
    set((state) => {
      if (!state.feature) return {};
      return {
        feature: {
          ...state.feature,
          questions: state.feature.questions.map((q) =>
            q.id === questionId ? { ...q, answer } : q
          ),
        },
      };
    }),
}));
