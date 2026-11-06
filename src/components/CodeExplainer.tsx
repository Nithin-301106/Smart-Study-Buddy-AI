import React, { useState } from 'react';
import { CodeExplainerData } from '../types';
import { TOPIC_PRESETS } from '../data/presets';
import {
  Terminal,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RotateCw,
  AlertTriangle,
  Zap,
  Code2,
} from 'lucide-react';

interface CodeExplainerProps {
  onSaveToNotebook: (type: 'code', title: string, subject: string, data: CodeExplainerData) => void;
}

const DEFAULT_CODE = `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1`;

export const CodeExplainer: React.FC<CodeExplainerProps> = ({ onSaveToNotebook }) => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('python');
  const [focus, setFocus] = useState('Comprehensive Line-by-Line & Complexity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explainerData, setExplainerData] = useState<CodeExplainerData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please paste or write a code snippet.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          focus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: CodeExplainerData = await res.json();
      setExplainerData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSnippet = (snippet: { code: string; language: string }) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
  };

  const handleSave = () => {
    if (!explainerData) return;
    onSaveToNotebook('code', `${explainerData.detectedLanguage} Code Explanation`, 'Programming', explainerData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyCode = (text: string, isOpt = false) => {
    navigator.clipboard.writeText(text);
    if (isOpt) {
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 5</span>
            <span aria-hidden="true">·</span>
            <span>Beginner-Friendly Code Tutor</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Code Explainer
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Understand how code executes step-by-step, dissect time & space complexity, and discover common beginner bugs.
          </p>
        </div>

        {/* Quick Sample Snippets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Sample Code:</span>
          {TOPIC_PRESETS.filter((p) => p.suggestedCodeSnippet).map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadSnippet(p.suggestedCodeSnippet!)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tutor Focus:</span>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="Comprehensive Line-by-Line & Complexity">Line-by-Line & Complexity</option>
              <option value="Find Beginner Bugs & Edge Cases">Find Bugs & Edge Cases</option>
              <option value="Optimize & Refactor">Optimize & Refactor</option>
            </select>
          </div>
        </div>

        {/* Code Input Area */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs dark:border-slate-800">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            placeholder="Paste your C, C++, Python, Java, or SQL code snippet here..."
            className="w-full resize-y bg-transparent text-emerald-400 placeholder-slate-600 outline-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            {code.split('\n').length} lines · {code.length} characters
          </span>

          <button
            onClick={handleExplain}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Analyzing Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Explain Code</span>
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

      {/* Output Display */}
      {explainerData && (
        <div className="mt-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {explainerData.detectedLanguage} Analysis
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Code Breakdown</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(code)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Original'}</span>
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

          {/* 1. Summary */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Plain English Summary
            </span>
            <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {explainerData.summary}
            </p>
          </div>

          {/* 2. Big-O Complexity Card */}
          {explainerData.complexity && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Big-O Complexity Analysis</span>
              </h4>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="text-xs font-semibold text-slate-500">Time Complexity</span>
                  <div className="mt-1 font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {explainerData.complexity.timeComplexity}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="text-xs font-semibold text-slate-500">Space Complexity</span>
                  <div className="mt-1 font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {explainerData.complexity.spaceComplexity}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Justification: </strong> {explainerData.complexity.complexityExplanation}
              </p>
            </div>
          )}

          {/* 3. Line-by-Line Breakdown */}
          {explainerData.lineByLine && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-600" />
                <span>Step-by-Step Code Walkthrough</span>
              </h4>

              <div className="mt-4 space-y-3">
                {explainerData.lineByLine.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.lineRange}
                      </span>
                    </div>

                    {item.codeSnippet && (
                      <pre className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-emerald-300">
                        {item.codeSnippet}
                      </pre>
                    )}

                    <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Common Beginner Pitfalls */}
          {explainerData.beginnerPitfalls && explainerData.beginnerPitfalls.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Common Beginner Traps & Edge Cases</span>
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-amber-950 dark:text-amber-200">
                {explainerData.beginnerPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Optimized or Cleaner Alternative */}
          {explainerData.optimizedAlternative && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Optimized / Cleaner Alternative</span>
                </h4>

                <button
                  onClick={() => handleCopyCode(explainerData.optimizedAlternative!.code, true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {copiedOptimized ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedOptimized ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed">
                {explainerData.optimizedAlternative.code}
              </pre>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 p-3 rounded-xl dark:bg-slate-800/80">
                <strong className="text-slate-800 dark:text-slate-200">What Was Improved: </strong>
                {explainerData.optimizedAlternative.whatWasImproved}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
