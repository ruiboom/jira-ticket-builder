"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useFeedbackStore } from "@/hooks/useFeedbackStore";
import { FeedbackEntry } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import FeedbackButton from "@/components/FeedbackButton";

export default function FeedbackPage() {
  const [mounted, setMounted] = useState(false);
  const entries = useFeedbackStore((s) => s.entries);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarising, setIsSummarising] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const d = e.timestamp.slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [entries, fromDate, toDate]);

  async function handleSummarise() {
    setIsSummarising(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarise-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: filtered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarise");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSummarising(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              &larr; Back to Builder
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Feedback
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <FeedbackButton />
            <ThemeToggle />
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-2 py-1"
            />
          </label>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Summarise Button */}
        {filtered.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleSummarise}
              disabled={isSummarising}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSummarising ? "Summarising..." : "Summarise Feedback"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              AI Summary
            </h2>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}

        {/* Feedback List */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">
            {entries.length === 0
              ? "No feedback yet. Use the feedback button to submit some!"
              : "No feedback matches the selected date range."}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {entry.text}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
