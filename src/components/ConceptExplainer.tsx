import React, { useState } from 'react';
import { ConceptExplanationData } from '../types';
import { TOPIC_PRESETS } from '../data/presets';
import { speech } from '../lib/speech';
import {
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  RotateCw,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface ConceptExplainerProps {
  onSaveToNotebook: (type: 'concept', title: string, subject: string, data: ConceptExplanationData) => void;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ onSaveToNotebook }) => {
  const [concept, setConcept] = useState('Recursion and Call Stack Memory');
  const [difficulty, setDifficulty] = useState('Standard (College Level)');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationData, setExplanationData] = useState<ConceptExplanationData | null>(null);
  const [showCheckAnswer, setShowCheckAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleExplain = async (overrideConcept?: string) => {
    const finalConcept = overrideConcept || concept;
    if (!finalConcept.trim()) {
      setError('Please provide a concept to explain.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowCheckAnswer(false);
    setShowHint(false);
    setSaved(false);
    speech.stop();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: finalConcept,
          difficulty,
          context,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setExplanationData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain concept.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof TOPIC_PRESETS[0]) => {
    setConcept(preset.suggestedConcept);
    handleExplain(preset.suggestedConcept);
  };

  const handleSave = () => {
    if (!explanationData) return;
    onSaveToNotebook('concept', explanationData.title, 'Academic Concept', explanationData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSpeech = () => {
    if (!explanationData) return;
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      const speechText = `${explanationData.title}. ${explanationData.oneSentenceDefinition}. Everyday Analogy: ${explanationData.everydayAnalogy}. ${explanationData.coreExplanation.map(s => `${s.stage}. ${s.details}`).join('. ')}`;
      speech.speak(speechText, 1.0, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 2</span>
            <span aria-hidden="true">·</span>
            <span>Intuitive Concept Simplifier</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Concept Explainer
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Demystify difficult college topics with crystal-clear everyday analogies, mental models, and myth busters.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Try:</span>
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

      {/* Input Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What concept do you want to understand? *
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Call Stack in Recursion, Eigenvalues in Linear Algebra, Kirchhoff's Laws"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What specific part confuses you? (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. 'I don't understand how the return value bubbles back up' or 'Why do we need a base case?'"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Explanation Style:</span>
              <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setDifficulty('ELI5 (Intuitive & Friendly)')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    difficulty.includes('ELI5')
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  ELI5 (Simple)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('Standard (College Level)')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    difficulty.includes('Standard')
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  College Level
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('Deep Dive (Rigorous & Math)')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    difficulty.includes('Deep Dive')
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Deep Dive
                </button>
              </div>
            </div>

            <button
              onClick={() => handleExplain()}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Explaining Concept...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Explain Clearly</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Display */}
      {explanationData && (
        <div className="mt-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Concept Explanation</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{explanationData.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5 text-red-500" /> : <Volume2 className="h-3.5 w-3.5 text-indigo-600" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{saved ? 'Saved in Notebook' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* 1. One-Sentence Definition */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The One-Sentence Definition
            </span>
            <p className="mt-2 text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
              "{explanationData.oneSentenceDefinition}"
            </p>
          </div>

          {/* 2. Everyday Analogy */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Everyday Relatable Analogy</span>
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-amber-950 dark:text-amber-100">
              {explanationData.everydayAnalogy}
            </p>
          </div>

          {/* 3. Mental Model ASCII Diagram */}
          {explanationData.mentalModelDiagram && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Mental Model Diagram
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Schematic Flow</span>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed">
                {explanationData.mentalModelDiagram}
              </pre>
            </div>
          )}

          {/* 4. Core Mechanism in Stages */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">How It Works: Step-by-Step Mechanism</h4>
            <div className="mt-4 space-y-4">
              {explanationData.coreExplanation.map((stage, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300">{stage.stage}</span>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{stage.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Common Misconceptions (Myth vs Reality) */}
          {explanationData.commonMisconceptions && explanationData.commonMisconceptions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-rose-500" />
                <span>Common Misconceptions (Myth vs. Reality)</span>
              </h4>
              <div className="mt-4 space-y-3">
                {explanationData.commonMisconceptions.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-slate-100 p-4 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="text-xs">
                      <span className="font-bold text-rose-600 dark:text-rose-400">❌ Common Myth:</span>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{item.myth}</p>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">✅ Academic Reality:</span>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{item.reality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Real World Application */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Where Is This Used in Real Industry?
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {explanationData.realWorldApplication}
            </p>
          </div>

          {/* 7. Quick Check Comprehension Question */}
          {explanationData.quickCheckQuestion && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <CheckCircle className="h-4 w-4" />
                <span>Comprehension Check</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {explanationData.quickCheckQuestion.question}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </button>
                <button
                  onClick={() => setShowCheckAnswer(!showCheckAnswer)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showCheckAnswer ? 'Hide Answer' : 'Reveal Answer'}</span>
                </button>
              </div>

              {showHint && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  <strong>Hint: </strong> {explanationData.quickCheckQuestion.hint}
                </div>
              )}

              {showCheckAnswer && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <strong>Answer & Reasoning: </strong> {explanationData.quickCheckQuestion.answer}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
