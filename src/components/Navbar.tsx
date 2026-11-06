import React from 'react';
import { ActiveTab } from '../types';
import { Timer, Moon, Sun, Bookmark } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  toggleTheme: () => void;
  savedCount: number;
  openTimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  savedCount,
  openTimer,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('notes')}
          className="text-left text-lg font-extrabold tracking-tight text-slate-900 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 dark:text-white"
        >
          Smart Study Buddy AI
        </button>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('notes')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'notes' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Study Notes
          </button>
          <button
            onClick={() => setActiveTab('concept')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'concept' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Concept Explainer
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'quiz' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Practice Quiz
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'questions' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Exam Questions
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'code' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Code Tutor
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              activeTab === 'planner' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Study Planner
          </button>
        </nav>

        {/* Zone 3: 1 primary action & utility toggles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title="Saved Notebook"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Notebook</span>
            {savedCount > 0 && (
              <span className="ml-0.5 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                ({savedCount})
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={openTimer}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 shadow-sm"
          >
            <Timer className="h-4 w-4" />
            <span>Focus Timer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
