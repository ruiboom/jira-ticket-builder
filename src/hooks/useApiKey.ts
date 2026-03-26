"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "jira-ticket-builder-api-key";

export function useApiKey() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  return { apiKey, saveApiKey };
}
