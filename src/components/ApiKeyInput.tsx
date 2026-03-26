"use client";

import { useState } from "react";

export function ApiKeyInput({
  apiKey,
  onSave,
}: {
  apiKey: string;
  onSave: (key: string) => void;
}) {
  const [value, setValue] = useState(apiKey);
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Anthropic API Key
      </label>
      <div className="relative flex-1 max-w-md">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSave(e.target.value);
          }}
          placeholder="sk-ant-..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {apiKey && (
        <span className="text-green-600 dark:text-green-400 text-sm font-medium">Connected</span>
      )}
    </div>
  );
}
