import React, { useState } from 'react';
import { PracticeQuestionsData } from '../types';
import { TOPIC_PRESETS } from '../data/presets';
import {
  Award,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';

interface PracticeQuestionsProps {
  onSaveToNotebook: (type: 'questions', title: string, subject: string, data: PracticeQuestionsData) => void;
}

export const PracticeQuestions: React.FC<PracticeQuestionsProps> = ({ onSaveToNotebook }) => {
  const [topic, setTopic] = useState('First Law of Thermodynamics & Heat Engines');
  const [subject, setSubject] = useState('Engineering Physics');
  const [examType, setExamType] = useState('Semester Midterm & Final Exams');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsData, setQuestionsData] = useState<PracticeQuestionsData | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (overrideTopic?: string, overrideSubject?: string) => {
    const finalTopic = overrideTopic || topic;
    const finalSubject = overrideSubject || subject;

    if (!finalTopic.trim()) {
      setError('Please enter an exam topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setCheckedItems({});
    setSaved(false);

    try {
      const res = await fetch('/api/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          subject: finalSubject,
          examType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: PracticeQuestionsData = await res.json();
      setQuestionsData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate practice questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof TOPIC_PRESETS[0]) => {
    setTopic(preset.title);
    setSubject(preset.subject);
    handleGenerate(preset.title, preset.subject);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSave = () => {
    if (!questionsData) return;
    onSaveToNotebook('questions', `Exam Prep: ${questionsData.topic}`, questionsData.subject, questionsData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyAll = () => {
    if (!questionsData) return;
    let text = `# Exam Practice Questions: ${questionsData.topic}\nSubject: ${questionsData.subject}\n\n`;
    text += `### 2-Mark Short Questions\n`;
    questionsData.shortQuestions?.forEach((q, i) => {
      text += `Q${i + 1} (2 Marks): ${q.question}\nAnswer: ${q.modelAnswer}\n\n`;
    });
    text += `### 5-Mark Medium Questions\n`;
    questionsData.mediumQuestions?.forEach((q, i) => {
      text += `Q${i + 1} (5 Marks): ${q.question}\nAnswer: ${q.modelAnswer}\nDiagram Advice: ${q.diagramOrStepAdvice}\n\n`;
    });
    text += `### 10-Mark Long Questions\n`;
    questionsData.longQuestions?.forEach((q, i) => {
      text += `Q${i + 1} (10 Marks): ${q.question}\nOutline: ${q.modelAnswerOutline}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 4</span>
            <span aria-hidden="true">·</span>
            <span>Structured Exam Revision</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Important Practice Questions
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Exam-style practice questions categorized by 2, 5, and 10 marks with model answers, examiner rubrics, and high-yield checklists.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Curriculum:</span>
          {TOPIC_PRESETS.slice(3, 7).map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Topic for Exam Revision *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Database Normalization, Eigenvalues, Kirchhoff's Laws"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course / Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, DBMS, Calculus"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Examination Target
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Semester Midterm Exams">Semester Midterms</option>
              <option value="University Final Exams">University Final Exams</option>
              <option value="Viva Voce & Lab Oral Exams">Viva Voce / Lab Exam</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Generating Exam Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Questions</span>
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

      {/* Questions Output */}
      {questionsData && (
        <div className="mt-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{questionsData.subject}</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{questionsData.topic}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Questions'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{saved ? 'Saved in Notebook' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Examiner's Advice Box */}
          {questionsData.examTips && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                Examiner's Scoring Strategy
              </span>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{questionsData.examTips}</p>
            </div>
          )}

          {/* 1. Two-Mark Short Questions */}
          {questionsData.shortQuestions && questionsData.shortQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    2 Marks Each
                  </span>
                  <span>Short Conceptual Questions & Definitions</span>
                </h4>
              </div>

              <div className="space-y-4">
                {questionsData.shortQuestions.map((q, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</span>
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">Model Answer: </strong>
                      {q.modelAnswer}
                    </div>
                    {q.keyKeywords && q.keyKeywords.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-medium">Mandatory Keywords:</span>
                        {q.keyKeywords.map((k, kIdx) => (
                          <span key={kIdx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Five-Mark Medium Questions */}
          {questionsData.mediumQuestions && questionsData.mediumQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    5 Marks Each
                  </span>
                  <span>Explanatory & Derivation Questions</span>
                </h4>
              </div>

              <div className="space-y-4">
                {questionsData.mediumQuestions.map((q, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</span>
                    <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                      <strong className="text-slate-900 dark:text-slate-100">Model Answer: </strong>
                      {q.modelAnswer}
                    </p>
                    {q.diagramOrStepAdvice && (
                      <div className="mt-3 rounded-lg bg-emerald-50/80 p-2.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <strong>Diagram & Presentation Tip: </strong>
                        {q.diagramOrStepAdvice}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Ten-Mark Comprehensive Questions */}
          {questionsData.longQuestions && questionsData.longQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    10 Marks Each
                  </span>
                  <span>Comprehensive Essay / Design / Derivation</span>
                </h4>
              </div>

              <div className="space-y-4">
                {questionsData.longQuestions.map((q, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</span>

                    {q.rubricBreakdown && (
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-slate-500">Grading Rubric Breakdown:</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {q.rubricBreakdown.map((r, rIdx) => (
                            <span key={rIdx} className="rounded bg-white px-2 py-1 text-xs border border-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">Structural Answer Outline: </strong>
                      <p className="mt-1 whitespace-pre-line">{q.modelAnswerOutline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Interactive Revision Checklist */}
          {questionsData.highYieldRevisionChecklist && questionsData.highYieldRevisionChecklist.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                <span>High-Yield Revision Checklist</span>
              </h4>
              <p className="text-xs text-slate-500 mb-3">Check these off as you review before entering the exam hall.</p>

              <div className="space-y-2">
                {questionsData.highYieldRevisionChecklist.map((item, idx) => {
                  const isChecked = checkedItems[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 mt-0.5 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
