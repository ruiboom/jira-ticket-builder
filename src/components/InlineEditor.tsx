"use client";

import { useState, useRef, useEffect } from "react";

export function InlineEditor({
  value,
  onChange,
  className = "",
  multiline = false,
}: {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = () => {
    setEditing(false);
    if (draft.trim() !== value) {
      onChange(draft.trim());
    }
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-1 -mx-1 ${className}`}
        title="Click to edit"
      >
        {value || <span className="text-gray-400 dark:text-gray-500 italic">Click to edit</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
        rows={3}
        className={`w-full px-2 py-1 border border-blue-400 dark:border-blue-500 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className}`}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
      }}
      className={`px-2 py-0.5 border border-blue-400 dark:border-blue-500 rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}
