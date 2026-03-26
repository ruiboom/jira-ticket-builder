"use client";

import { useTicketStore } from "@/hooks/useTicketStore";
import { useAiGeneration } from "@/hooks/useAiGeneration";
import { StepIndicator } from "@/components/StepIndicator";
import { TicketPasteForm } from "@/components/TicketPasteForm";
import { QuestionsPanel } from "@/components/QuestionsPanel";
import { TicketTree } from "@/components/TicketTree";
import { ExportButton } from "@/components/ExportButton";
import ThemeToggle from "@/components/ThemeToggle";
import FeedbackButton from "@/components/FeedbackButton";
import Link from "next/link";

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
          <div className="flex items-center gap-2">
            <FeedbackButton />
            <Link
              href="/feedback"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Settings"
              title="View submitted feedback"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
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
