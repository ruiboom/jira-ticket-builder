"use client";

import { useState } from "react";

export function TicketPasteForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (input: { ticketText: string; context: string; team: string }) => void;
  isLoading: boolean;
}) {
  const [ticketText, setTicketText] = useState("");
  const [context, setContext] = useState("");
  const [team, setTeam] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste your Jira feature ticket
        </label>
        <textarea
          value={ticketText}
          onChange={(e) => setTicketText(e.target.value)}
          placeholder="Paste the full text of your Jira feature ticket here..."
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Context
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Technical or business context — architecture, tech stack, constraints, dependencies, business goals.
        </p>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. We use a React/Next.js frontend with a Go microservices backend. Auth is handled by Auth0. The payments service is a separate bounded context..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Team
          <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Team members, roles, and specialisms — helps assign the right work to the right people.
        </p>
        <textarea
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. Frontend: Alice (React specialist), Bob (CSS/accessibility). Backend: Carol (Go, payments domain), Dave (infrastructure/DevOps). QA: Eve..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>

      <button
        onClick={() => onSubmit({ ticketText, context, team })}
        disabled={!ticketText.trim() || isLoading}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Analyzing..." : "Analyze Ticket"}
      </button>
    </div>
  );
}
