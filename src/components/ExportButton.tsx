"use client";

import { useState } from "react";
import { Feature } from "@/lib/types";
import { featureToCSV, storyToCSV, downloadCSV } from "@/lib/csv-export";

export function ExportButton({ feature }: { feature: Feature }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleExportAll = () => {
    const csv = featureToCSV(feature);
    const safeName = feature.summary
      .replace(/[^a-zA-Z0-9]/g, "-")
      .slice(0, 50);
    downloadCSV(`${safeName}-all.csv`, csv);
    setShowOptions(false);
  };

  const handleExportPerStory = () => {
    feature.stories.forEach((story, i) => {
      const csv = storyToCSV(story, feature.summary);
      const safeName = story.summary
        .replace(/[^a-zA-Z0-9]/g, "-")
        .slice(0, 40);
      downloadCSV(`story-${i + 1}-${safeName}.csv`, csv);
    });
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Export CSV
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 w-56">
          <button
            onClick={handleExportAll}
            className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Export All (Single CSV)
          </button>
          <button
            onClick={handleExportPerStory}
            className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Export Per Story (Multiple CSVs)
          </button>
        </div>
      )}
    </div>
  );
}
