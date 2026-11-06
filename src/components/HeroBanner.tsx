import React from 'react';
import { ActiveTab } from '../types';
import { FileText, Lightbulb, HelpCircle, Award, Terminal, Calendar, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onSelectTab: (tab: ActiveTab) => void;
  onSelectPresetTopic?: (topic: string, subject: string) => void;
}

const TOOLS_CONFIG = [
  {
    id: 'notes' as ActiveTab,
    icon: FileText,
    title: 'AI Notes Generator',
    description: 'Structured notes with definitions, key formulas, and exam recap flashcards.',
    badge: 'Study Notes',
  },
  {
    id: 'concept' as ActiveTab,
    icon: Lightbulb,
    title: 'Concept Explainer',
    description: 'Break down complex collegiate topics with ELI5 analogies and mental models.',
    badge: 'Intuitive Clarity',
  },
  {
    id: 'quiz' as ActiveTab,
    icon: HelpCircle,
    title: 'AI Quiz Generator',
    description: 'Interactive multiple-choice quizzes with hints and instant step explanations.',
    badge: 'Self-Testing',
  },
  {
    id: 'questions' as ActiveTab,
    icon: Award,
    title: 'Practice Questions',
    description: '2-mark, 5-mark, and 10-mark exam questions with marking scheme rubrics.',
    badge: 'Exam Prep',
  },
  {
    id: 'code' as ActiveTab,
    icon: Terminal,
    title: 'Code Explainer',
    description: 'Line-by-line code walk-throughs, Big-O complexity, and bug pitfalls for beginners.',
    badge: 'CS & Coding',
  },
  {
    id: 'planner' as ActiveTab,
    icon: Calendar,
    title: 'Study Planner',
    description: 'Custom timetables with spaced repetition, Pomodoro blocks, and review milestones.',
    badge: 'Time Management',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectTab }) => {
  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-white pt-8 pb-12 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Targeted for 1st & 2nd Year College Students</span>
              <span aria-hidden="true">·</span>
              <span>Powered by Gemini 3.8 Flash</span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white" style={{ textWrap: 'balance' }}>
              Your Intelligent Academic Co-Pilot for College Success
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Master challenging coursework with clarity. Generate structured exam notes, break down tricky concepts with everyday analogies, test yourself with interactive quizzes, decode complex code, and build realistic study timetables.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectTab('notes')}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
              >
                <span>Generate Study Notes</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSelectTab('quiz')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Practice an AI Quiz</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero High-Res Image */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-md dark:border-slate-800">
              <img
                src="/src/assets/images/hero_student_study_workspace_1793953204599.jpg"
                alt="Student studying in university library with laptop and notes"
                className="h-64 w-full object-cover sm:h-72"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-5 flex flex-col justify-end">
                <span className="text-xs font-medium text-slate-200">Active Recall & Focused Learning</span>
                <p className="text-sm font-semibold text-white">Built for engineering, science, business, and pre-med undergrads</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Quick Jump Feature Cards */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTab(tool.id)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-600"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{tool.badge}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Open Tool</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
