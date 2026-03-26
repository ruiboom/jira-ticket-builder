import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { FeedbackEntry } from "@/lib/types";

interface FeedbackStore {
  entries: FeedbackEntry[];
  addEntry: (text: string) => void;
  clearAll: () => void;
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (text: string) =>
        set((state) => ({
          entries: [
            {
              id: uuidv4(),
              text,
              timestamp: new Date().toISOString(),
            },
            ...state.entries,
          ],
        })),
      clearAll: () => set({ entries: [] }),
    }),
    {
      name: "jira-ticket-builder-feedback",
    }
  )
);
