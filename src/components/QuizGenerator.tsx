import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizData, QuizQuestion } from '../types';
import { TOPIC_PRESETS } from '../data/presets';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCw,
  AlertTriangle,
  Lightbulb,
  Award,
  Bookmark,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface QuizGeneratorProps {
  onSaveToNotebook: (type: 'quiz', title: string, subject: string, data: any) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onSaveToNotebook }) => {
  const [topic, setTopic] = useState('Data Structures: Stacks, Queues, and Linked Lists');
  const [subject, setSubject] = useState('Computer Science');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Quiz running state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (overrideTopic?: string, overrideSubject?: string) => {
    const finalTopic = overrideTopic || topic;
    const finalSubject = overrideSubject || subject;

    if (!finalTopic.trim()) {
      setError('Please provide a topic for the quiz.');
      return;
    }

    setLoading(true);
    setError(null);
    setUserAnswers({});
    setRevealedHints({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          subject: finalSubject,
          numberOfQuestions,
          difficulty,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: QuizData = await res.json();
      setQuizData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof TOPIC_PRESETS[0]) => {
    setTopic(preset.title);
    setSubject(preset.subject);
    handleGenerate(preset.title, preset.subject);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (userAnswers[questionId] !== undefined) return; // already answered
    const nextAnswers = { ...userAnswers, [questionId]: optionIdx };
    setUserAnswers(nextAnswers);

    // Check if this was the last question answered
    if (quizData && Object.keys(nextAnswers).length === quizData.questions.length) {
      triggerConfetti();
      setIsCompleted(true);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const toggleHint = (questionId: number) => {
    setRevealedHints((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    const total = quizData.questions.length;
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
    };
  };

  const handleSaveResult = () => {
    if (!quizData) return;
    const score = calculateScore();
    onSaveToNotebook('quiz', `${quizData.quizTitle} (${score.correct}/${score.total})`, subject, {
      quizData,
      userAnswers,
      score,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const scoreInfo = calculateScore();
  const currentQuestion: QuizQuestion | undefined = quizData?.questions[currentQuestionIndex];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 3</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Multiple-Choice Testing</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            AI Quiz Generator
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practice conceptual multiple-choice questions with step-by-step explanations, helpful clues, and instant evaluation.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Topics:</span>
          {TOPIC_PRESETS.slice(0, 4).map((p) => (
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

      {/* Input Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quiz Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Object-Oriented Polymorphism, Calculus Integration, Thermodynamics"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Questions
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={5}>5 Questions (Fast Check)</option>
              <option value={8}>8 Questions (Standard Drill)</option>
              <option value={10}>10 Questions (Full Test)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Foundational">Foundational (1st Year Intro)</option>
              <option value="Intermediate">Intermediate (Semester Standard)</option>
              <option value="Challenging">Challenging (Honors & Edge Cases)</option>
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
                <span>Crafting Quiz Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Quiz</span>
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

      {/* Quiz Runner */}
      {quizData && currentQuestion && (
        <div className="mt-8 space-y-6">
          {/* Header Progress & Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{quizData.quizTitle}</h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-slate-500">
                  Score:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {scoreInfo.correct} / {Object.keys(userAnswers).length}
                  </strong>
                </span>

                <button
                  onClick={handleSaveResult}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{currentQuestion.topicTag}</span>
              <button
                onClick={() => toggleHint(currentQuestion.id)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{revealedHints[currentQuestion.id] ? 'Hide Clue' : 'Need Clue?'}</span>
              </button>
            </div>

            {revealedHints[currentQuestion.id] && (
              <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <strong>Clue: </strong> {currentQuestion.hint}
              </div>
            )}

            <h4 className="mt-4 text-base font-semibold leading-relaxed text-slate-900 dark:text-white">
              {currentQuestion.question}
            </h4>

            {/* 4 Options */}
            <div className="mt-5 space-y-2.5">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx;
                const isAnswered = userAnswers[currentQuestion.id] !== undefined;
                const isCorrect = optIdx === currentQuestion.correctAnswerIndex;

                let stateClass =
                  'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600';

                if (isAnswered) {
                  if (isCorrect) {
                    stateClass =
                      'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 font-medium';
                  } else if (isSelected) {
                    stateClass =
                      'border-rose-500 bg-rose-50 text-rose-950 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-100';
                  } else {
                    stateClass = 'border-slate-100 opacity-50 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left rounded-xl border p-4 text-xs sm:text-sm transition-all flex items-center justify-between ${stateClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 ml-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : isSelected ? (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Display after answer */}
            {userAnswers[currentQuestion.id] !== undefined && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">Explanation: </span>
                {currentQuestion.explanation}
              </div>
            )}

            {/* Question Navigation Controls */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex gap-1.5">
                {quizData.questions.map((_, idx) => {
                  const answered = userAnswers[idx + 1] !== undefined;
                  const isCur = idx === currentQuestionIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-2.5 w-6 rounded-full transition-all ${
                        isCur
                          ? 'bg-indigo-600'
                          : answered
                          ? 'bg-indigo-300 dark:bg-indigo-800'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(quizData.questions.length - 1, prev + 1))
                }
                disabled={currentQuestionIndex === quizData.questions.length - 1}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Completion Scoreboard */}
          {isCompleted && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 text-center dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <Award className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              <h4 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Quiz Completed!</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                You scored <strong className="text-indigo-600 dark:text-indigo-400 tabular-nums">{scoreInfo.correct} out of {scoreInfo.total}</strong> ({scoreInfo.percentage}%)
              </p>

              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsCompleted(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Retry This Quiz
                </button>
                <button
                  onClick={() => handleGenerate()}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
