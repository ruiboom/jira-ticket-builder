"use client";

import { AppStep } from "@/lib/types";

const STEPS: { key: AppStep; label: string }[] = [
  { key: "paste", label: "Paste Ticket" },
  { key: "questions", label: "Review Questions" },
  { key: "canvas", label: "Edit Stories" },
  { key: "export", label: "Export" },
];

export function StepIndicator({ currentStep }: { currentStep: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === currentIndex
                ? "bg-blue-600 text-white"
                : i < currentIndex
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-white/20">
              {i + 1}
            </span>
            {step.label}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                i < currentIndex ? "bg-blue-300 dark:bg-blue-700" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
