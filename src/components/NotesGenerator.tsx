import React, { useState } from 'react';
import { StudyNotesData } from '../types';
import { TOPIC_PRESETS } from '../data/presets';
import { speech } from '../lib/speech';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Bookmark,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCw,
  BookOpen,
} from 'lucide-react';

interface NotesGeneratorProps {
  onSaveToNotebook: (type: 'notes', title: string, subject: string, data: StudyNotesData) => void;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ onSaveToNotebook }) => {
  const [topic, setTopic] = useState('Binary Search Algorithm');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [targetAudience, setTargetAudience] = useState('1st Year College');
  const [detailLevel, setDetailLevel] = useState('Comprehensive Exam Notes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<StudyNotesData | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleGenerate = async (topicToUse?: string, subjectToUse?: string) => {
    const finalTopic = topicToUse || topic;
    const finalSubject = subjectToUse || subject;

    if (!finalTopic.trim()) {
      setError('Please provide a topic or select one of the presets.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);
    speech.stop();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          subject: finalSubject,
          targetAudience,
          detailLevel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setNotesData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study notes. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof TOPIC_PRESETS[0]) => {
    setTopic(preset.title);
    setSubject(preset.subject);
    setTargetAudience(preset.year);
    handleGenerate(preset.title, preset.subject);
  };

  const toggleFlashcard = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getMarkdownRepresentation = (data: StudyNotesData): string => {
    let md = `# ${data.title}\n\n`;
    md += `**Subject:** ${data.subject}\n\n`;
    md += `## Summary\n${data.summary}\n\n`;

    if (data.keyDefinitions?.length) {
      md += `## Key Definitions\n`;
      data.keyDefinitions.forEach((d) => {
        md += `- **${d.term}:** ${d.definition}\n`;
      });
      md += `\n`;
    }

    if (data.coreConcepts?.length) {
      md += `## Core Concepts\n`;
      data.coreConcepts.forEach((c) => {
        md += `### ${c.heading}\n`;
        c.points?.forEach((p) => {
          md += `- ${p}\n`;
        });
        if (c.formula) md += `*Formula/Notation:* \`${c.formula}\`\n`;
        if (c.example) md += `*Example:* ${c.example}\n`;
        md += `\n`;
      });
    }

    if (data.practicalExamples?.length) {
      md += `## Practical Examples & Scenarios\n`;
      data.practicalExamples.forEach((ex) => {
        md += `### ${ex.title}\n${ex.scenario}\n`;
        ex.stepByStepExplanation?.forEach((step, idx) => {
          md += `${idx + 1}. ${step}\n`;
        });
        md += `\n`;
      });
    }

    if (data.examTipsAndPitfalls?.length) {
      md += `## Common Pitfalls & High-Yield Exam Tips\n`;
      data.examTipsAndPitfalls.forEach((tip) => {
        md += `- ⚠️ ${tip}\n`;
      });
      md += `\n`;
    }

    if (data.quickFlashcards?.length) {
      md += `## Quick Review Flashcards\n`;
      data.quickFlashcards.forEach((f) => {
        md += `**Q:** ${f.question}\n**A:** ${f.answer}\n\n`;
      });
    }

    return md;
  };

  const handleCopy = () => {
    if (!notesData) return;
    const md = getMarkdownRepresentation(notesData);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notesData) return;
    const md = getMarkdownRepresentation(notesData);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notesData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!notesData) return;
    onSaveToNotebook('notes', notesData.title, notesData.subject, notesData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSpeech = () => {
    if (!notesData) return;
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      const speechText = `${notesData.title}. Subject: ${notesData.subject}. Summary: ${notesData.summary}. ` +
        notesData.coreConcepts.map((c) => `${c.heading}. ${c.points.join('. ')}`).join('. ');
      speech.speak(speechText, 1.0, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title & Description */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Learning Tool 1</span>
            <span aria-hidden="true">·</span>
            <span>Structured College Exam Notes</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            AI Notes Generator
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate clean, organized study notes formatted for exams, with definitions, worked examples, and recall flashcards.
          </p>
        </div>

        {/* Quick Presets Dropdown/Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Presets:</span>
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

      {/* Input Configuration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Topic */}
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Lecture Title *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Search Trees, Kirchhoff's Laws, Photosynthesis"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>

          {/* Subject */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science, Physics"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>

          {/* Target Audience */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              College Year
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="1st Year College">1st Year Undergrad (Foundations)</option>
              <option value="2nd Year College">2nd Year Undergrad (Intermediate)</option>
              <option value="High School / Pre-College">Pre-College Revision</option>
            </select>
          </div>
        </div>

        {/* Note Style & Action */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Note Format:</span>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setDetailLevel('Comprehensive Exam Notes')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  detailLevel === 'Comprehensive Exam Notes'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Comprehensive
              </button>
              <button
                type="button"
                onClick={() => setDetailLevel('Quick Revision Cheat Sheet')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  detailLevel === 'Quick Revision Cheat Sheet'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Cheat Sheet
              </button>
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Crafting Study Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Notes Display */}
      {notesData && (
        <div className="mt-8 space-y-6">
          {/* Header toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{notesData.subject}</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{notesData.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Read Notes Aloud"
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5 text-red-500" /> : <Volume2 className="h-3.5 w-3.5 text-indigo-600" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Copy as Markdown"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Download .md file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
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

          {/* 1. Summary Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Exam Summary & Core Intuition
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {notesData.summary}
            </p>
          </div>

          {/* 2. Key Definitions */}
          {notesData.keyDefinitions && notesData.keyDefinitions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Must-Know Academic Definitions</span>
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notesData.keyDefinitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition-colors dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{def.term}</span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Core Concepts */}
          {notesData.coreConcepts && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Detailed Concept Breakdown</h4>
              {notesData.coreConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <h5 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{concept.heading}</h5>

                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {concept.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {concept.formula && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-xs font-mono text-emerald-400 dark:border-slate-700">
                      <span className="text-slate-400 select-none mr-2">Formula / Notation:</span>
                      {concept.formula}
                    </div>
                  )}

                  {concept.example && (
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 p-3 rounded-lg dark:bg-slate-800/80">
                      <strong className="text-slate-800 dark:text-slate-200">Concrete Example: </strong>
                      {concept.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 4. Practical Worked Scenarios */}
          {notesData.practicalExamples && notesData.practicalExamples.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Worked Problem & Scenario</h4>
              <div className="mt-4 space-y-4">
                {notesData.practicalExamples.map((ex, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{ex.title}</h5>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{ex.scenario}</p>
                    <div className="mt-3 space-y-1.5">
                      {ex.stepByStepExplanation.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{sIdx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Common Pitfalls & High-Yield Exam Tips */}
          {notesData.examTipsAndPitfalls && notesData.examTipsAndPitfalls.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Common Student Mistakes & Exam Traps</span>
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-amber-950 dark:text-amber-200">
                {notesData.examTipsAndPitfalls.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">⚠️</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Quick Flashcards for Active Recall */}
          {notesData.quickFlashcards && notesData.quickFlashcards.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Active Recall Flashcards</h4>
                  <p className="text-xs text-slate-500">Click any card to flip and reveal the answer.</p>
                </div>
                <span className="text-xs text-slate-400">{notesData.quickFlashcards.length} cards</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {notesData.quickFlashcards.map((card, idx) => {
                  const isFlipped = flippedCards[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleFlashcard(idx)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 min-h-[140px] flex flex-col justify-between ${
                        isFlipped
                          ? 'border-indigo-400 bg-indigo-50/80 dark:border-indigo-700 dark:bg-indigo-950/40'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/80'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{isFlipped ? 'Answer' : 'Question'}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Click to flip</span>
                      </div>
                      <div className="my-2">
                        {isFlipped ? (
                          <p className="text-xs font-medium text-indigo-950 dark:text-indigo-200">{card.answer}</p>
                        ) : (
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{card.question}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Card #{idx + 1}</span>
                    </div>
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
