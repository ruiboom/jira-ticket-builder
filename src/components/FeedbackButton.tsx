"use client";

import { useState, useEffect, useRef } from "react";
import { useFeedbackStore } from "@/hooks/useFeedbackStore";

export default function FeedbackButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const addEntry = useFeedbackStore((s) => s.addEntry);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!mounted) return <div className="w-9 h-9" />;

  function handleSubmit() {
    if (!text.trim()) return;
    addEntry(text.trim());
    setText("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 1200);
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Send feedback"
      >
        Feedback
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          {submitted ? (
            <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">
              Thanks for your feedback!
            </p>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Send Feedback
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="mt-2 w-full px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Submit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
