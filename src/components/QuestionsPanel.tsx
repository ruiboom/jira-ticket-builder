"use client";

import { Question } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  scope: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  technical: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  ux: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  dependencies: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "acceptance-criteria": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "non-functional": "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export function QuestionsPanel({
  questions,
  onUpdateAnswer,
  onGenerateStories,
  onSkip,
  isLoading,
}: {
  questions: Question[];
  onUpdateAnswer: (id: string, answer: string) => void;
  onGenerateStories: () => void;
  onSkip: () => void;
  isLoading: boolean;
}) {
  const answered = questions.filter((q) => q.answer.trim()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Questions About This Feature
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {answered}/{questions.length} answered — answer what you can, skip
            the rest
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                {i + 1}.
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {q.text}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      CATEGORY_COLORS[q.category] || CATEGORY_COLORS["non-functional"]
                    }`}
                  >
                    {q.category}
                  </span>
                </div>
                <textarea
                  value={q.answer}
                  onChange={(e) => onUpdateAnswer(q.id, e.target.value)}
                  placeholder="Type your answer..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onGenerateStories}
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Stories..." : "Generate Stories"}
        </button>
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Skip & Generate
        </button>
      </div>
    </div>
  );
}
