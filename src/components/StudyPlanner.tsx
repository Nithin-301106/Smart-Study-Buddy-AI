import React, { useState } from 'react';
import { StudyPlanData } from '../types';
import {
  Calendar,
  Sparkles,
  Bookmark,
  RotateCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  HeartHandshake,
} from 'lucide-react';

interface StudyPlannerProps {
  onSaveToNotebook: (type: 'planner', title: string, subject: string, data: StudyPlanData) => void;
  onOpenTimer: () => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onSaveToNotebook, onOpenTimer }) => {
  const [subjects, setSubjects] = useState('Data Structures, Engineering Mathematics, Digital Electronics');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [goal, setGoal] = useState('Midterm Exam Preparation');
  const [targetWeaknesses, setTargetWeaknesses] = useState('Trees and dynamic programming in CS, Integration by parts in Math');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<StudyPlanData | null>(null);
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!subjects.trim()) {
      setError('Please list at least one subject to plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedSessions({});
    setSaved(false);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          daysAvailable,
          hoursPerDay,
          goal,
          targetWeaknesses,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: StudyPlanData = await res.json();
      setPlanData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSessionComplete = (key: string) => {
    setCompletedSessions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!planData) return;
    onSaveToNotebook('planner', planData.planTitle, subjects, planData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 6</span>
            <span aria-hidden="true">·</span>
            <span>Spaced Repetition & Pomodoro Timetable</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Personalized Study Planner
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create structured daily study blocks based on active recall, spaced repetition, and realistic student commitments.
          </p>
        </div>
      </div>

      {/* Input Configuration Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Subjects */}
          <div className="md:col-span-12">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subjects to Include (comma separated) *
            </label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Data Structures, Calculus II, Physics, Operating Systems"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Days */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Available
            </label>
            <select
              value={daysAvailable}
              onChange={(e) => setDaysAvailable(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={3}>3 Days (Crash Revision)</option>
              <option value={7}>7 Days (1 Week Sprint)</option>
              <option value={14}>14 Days (2 Weeks Thorough)</option>
              <option value={21}>21 Days (3 Weeks Deep Mastery)</option>
            </select>
          </div>

          {/* Hours per day */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Study Hours
            </label>
            <select
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={2}>2 Hours / Day (Steady)</option>
              <option value={3}>3 Hours / Day (Recommended)</option>
              <option value={4}>4 Hours / Day (Intensive)</option>
              <option value={6}>6 Hours / Day (Exam Mode)</option>
            </select>
          </div>

          {/* Target Goal */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Objective
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Midterm Exam Preparation">Midterm Prep</option>
              <option value="Final Semester Exams">Final Semester Exams</option>
              <option value="Mastery of Foundational Concepts">Concept Mastery</option>
            </select>
          </div>

          {/* Weak Areas */}
          <div className="md:col-span-12">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority or Weak Topics (Optional)
            </label>
            <input
              type="text"
              value={targetWeaknesses}
              onChange={(e) => setTargetWeaknesses(e.target.value)}
              placeholder="e.g. Trees and graphs in CS, Integration by parts, Vector calculus"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Designing Study Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Schedule */}
      {planData && (
        <div className="mt-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Total Budget: {planData.totalHours} Hours
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{planData.planTitle}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTimer}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-slate-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-slate-800"
              >
                <Timer className="h-3.5 w-3.5" />
                <span>Launch Focus Timer</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{saved ? 'Saved in Notebook' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          {/* Strategy Summary */}
          {planData.strategySummary && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                Pacing & Retention Strategy
              </span>
              <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {planData.strategySummary}
              </p>
            </div>
          )}

          {/* Daily Schedule Cards */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Day-by-Day Schedule</h4>
            {planData.dailySchedule.map((day) => (
              <div
                key={day.dayNumber}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{day.dayLabel}</h5>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      Primary Focus: {day.focusSubject}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Day {day.dayNumber} of {planData.dailySchedule.length}
                  </span>
                </div>

                {/* Sessions */}
                <div className="mt-4 space-y-3">
                  {day.sessions.map((sess, sIdx) => {
                    const sessionKey = `${day.dayNumber}-${sIdx}`;
                    const isDone = completedSessions[sessionKey];

                    return (
                      <div
                        key={sIdx}
                        className={`rounded-xl border p-4 transition-all ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50/40 opacity-75 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                            : 'border-slate-100 bg-slate-50/70 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => toggleSessionComplete(sessionKey)}
                            className="flex items-start gap-2.5 text-left"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                  {sess.subject}: {sess.topic}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                <strong>Goal: </strong> {sess.actionableGoal}
                              </p>
                            </div>
                          </button>

                          <div className="shrink-0 text-right">
                            <span className="rounded bg-white px-2 py-1 text-[11px] font-mono font-medium border border-slate-200 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {sess.timeSlot}
                            </span>
                            <div className="mt-1 text-[11px] text-slate-400">
                              {sess.pomodoros}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {day.dailyReviewTip && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Daily Habit: </strong>
                    {day.dailyReviewTip}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Milestones & Burnout Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planData.weeklyMilestones && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Checkpoints & Milestones</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {planData.weeklyMilestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">Day {m.day}:</span>
                      <span>{m.checkpoint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {planData.burnoutPreventionTips && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <HeartHandshake className="h-4 w-4 text-rose-500" />
                  <span>Student Well-Being Tips</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {planData.burnoutPreventionTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500">✦</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
