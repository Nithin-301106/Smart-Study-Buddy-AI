import React, { useState, useEffect } from 'react';
import { ActiveTab, SavedItem } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { NotesGenerator } from './components/NotesGenerator';
import { ConceptExplainer } from './components/ConceptExplainer';
import { QuizGenerator } from './components/QuizGenerator';
import { PracticeQuestions } from './components/PracticeQuestions';
import { CodeExplainer } from './components/CodeExplainer';
import { StudyPlanner } from './components/StudyPlanner';
import { SavedNotebook } from './components/SavedNotebook';
import { PomodoroWidget } from './components/PomodoroWidget';
import {
  FileText,
  Lightbulb,
  HelpCircle,
  Award,
  Terminal,
  Calendar,
  Bookmark,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('study_buddy_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('study_buddy_notebook');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Sync theme changes with DOM
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('study_buddy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('study_buddy_theme', 'light');
    }
  }, [isDark]);

  // Persist saved items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('study_buddy_notebook', JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedItems]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleSaveToNotebook = (type: ActiveTab, title: string, subject: string, data: any) => {
    const newItem: SavedItem = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      subject,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data,
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllSaved = () => {
    setSavedItems([]);
  };

  const handleOpenSavedItem = (item: SavedItem) => {
    setActiveTab(item.type);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        savedCount={savedItems.length}
        openTimer={() => setIsTimerOpen(true)}
      />

      {/* Hero Section */}
      <HeroBanner onSelectTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }} />

      {/* Secondary Mobile & Tablet Quick Tab Switcher */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>1. AI Notes Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('concept')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'concept'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>2. Concept Explainer</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>3. AI Quiz Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>4. Practice Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>5. Code Explainer</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>6. Study Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved Notebook {savedItems.length > 0 && `(${savedItems.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'notes' && <NotesGenerator onSaveToNotebook={handleSaveToNotebook} />}
        {activeTab === 'concept' && <ConceptExplainer onSaveToNotebook={handleSaveToNotebook} />}
        {activeTab === 'quiz' && <QuizGenerator onSaveToNotebook={handleSaveToNotebook} />}
        {activeTab === 'questions' && <PracticeQuestions onSaveToNotebook={handleSaveToNotebook} />}
        {activeTab === 'code' && <CodeExplainer onSaveToNotebook={handleSaveToNotebook} />}
        {activeTab === 'planner' && (
          <StudyPlanner
            onSaveToNotebook={handleSaveToNotebook}
            onOpenTimer={() => setIsTimerOpen(true)}
          />
        )}
        {activeTab === 'saved' && (
          <SavedNotebook
            savedItems={savedItems}
            onRemoveItem={handleRemoveSavedItem}
            onClearAll={handleClearAllSaved}
            onOpenItem={handleOpenSavedItem}
          />
        )}
      </main>

      {/* Floating Pomodoro Focus Timer */}
      <PomodoroWidget isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                Smart Study Buddy AI
              </span>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                An AI-powered academic learning companion tailored for 1st and 2nd-year college students.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span>Google Gemini AI</span>
              <span aria-hidden="true">·</span>
              <span>Active Recall & Spaced Repetition</span>
              <span aria-hidden="true">·</span>
              <span>Confidential & Safe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
