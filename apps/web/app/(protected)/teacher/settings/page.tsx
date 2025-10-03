"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export default function TeacherSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Teacher Settings
      </h1>

      {/* Appearance Section */}
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Appearance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Switch between light and dark themes.
        </p>

        {/* Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition 
                     bg-gray-300 dark:bg-gray-600"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              theme === "dark" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      </section>
    </div>
  );
}
