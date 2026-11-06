import React, { useState } from 'react';
import { SavedItem, ActiveTab } from '../types';
import {
  Bookmark,
  Trash2,
  FileText,
  Lightbulb,
  HelpCircle,
  Award,
  Terminal,
  Calendar,
  Search,
  ExternalLink,
} from 'lucide-react';

interface SavedNotebookProps {
  savedItems: SavedItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOpenItem: (item: SavedItem) => void;
}

const TYPE_ICONS: Record<ActiveTab, React.ElementType> = {
  notes: FileText,
  concept: Lightbulb,
  quiz: HelpCircle,
  questions: Award,
  code: Terminal,
  planner: Calendar,
  saved: Bookmark,
};

const TYPE_LABELS: Record<ActiveTab, string> = {
  notes: 'Study Notes',
  concept: 'Concept Explainer',
  quiz: 'Practice Quiz',
  questions: 'Exam Questions',
  code: 'Code Breakdown',
  planner: 'Study Plan',
  saved: 'All Items',
};

export const SavedNotebook: React.FC<SavedNotebookProps> = ({
  savedItems,
  onRemoveItem,
  onClearAll,
  onOpenItem,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = savedItems.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Local Storage Repository</span>
            <span aria-hidden="true">·</span>
            <span>{savedItems.length} Saved Records</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            My Study Notebook
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revisit your generated study notes, quiz scorecards, exam questions, code tutorials, and study timetables anytime.
          </p>
        </div>

        {savedItems.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your saved items in this browser?')) {
                onClearAll();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Notebook</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved topics or subjects..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'notes', 'concept', 'quiz', 'questions', 'code', 'planner'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  filterType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All' : TYPE_LABELS[t as ActiveTab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item List */}
      {filteredItems.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <Bookmark className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h4 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-300">
            {savedItems.length === 0 ? 'Your Study Notebook is Empty' : 'No Matching Saved Items'}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {savedItems.length === 0
              ? 'Generate study notes, practice quizzes, or study plans and click "Save" to keep them in your browser.'
              : 'Try clearing your search query or switching categories.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredItems.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Bookmark;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">
                          {TYPE_LABELS[item.type]}
                        </span>
                        {item.subject && (
                          <>
                            <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              {item.subject}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenItem(item)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Open in Tool</span>
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
