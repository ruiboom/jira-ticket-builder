"use client";

import { useTicketStore } from "@/hooks/useTicketStore";
import { useAiGeneration } from "@/hooks/useAiGeneration";
import { StepIndicator } from "@/components/StepIndicator";
import { TicketPasteForm } from "@/components/TicketPasteForm";
import { QuestionsPanel } from "@/components/QuestionsPanel";
import { TicketTree } from "@/components/TicketTree";
import { ExportButton } from "@/components/ExportButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { step, feature, isLoading, error, setStep, updateQuestion } =
    useTicketStore();
  const { analyzeTicket, generateStories, generateTasks } =
    useAiGeneration();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jira Ticket Builder
          </h1>
          <ThemeToggle />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Paste a feature ticket, let AI break it down into stories and tasks,
          then export to CSV for Jira import.
        </p>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {step === "paste" && (
          <TicketPasteForm
            onSubmit={analyzeTicket}
            isLoading={isLoading}
          />
        )}

        {step === "questions" && feature && (
          <QuestionsPanel
            questions={feature.questions}
            onUpdateAnswer={updateQuestion}
            onGenerateStories={generateStories}
            onSkip={generateStories}
            isLoading={isLoading}
          />
        )}

        {(step === "canvas" || step === "export") && feature && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("questions")}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                &larr; Back to Questions
              </button>
              <ExportButton feature={feature} />
            </div>
            <TicketTree
              feature={feature}
              onGenerateTasks={generateTasks}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
