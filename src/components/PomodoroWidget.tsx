import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, VolumeX, X } from 'lucide-react';

interface PomodoroWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [taskName, setTaskName] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) {
        playBeep();
      }
      if (mode === 'work') {
        const nextCount = completedSessions + 1;
        setCompletedSessions(nextCount);
        if (nextCount % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, mode, soundEnabled, completedSessions]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio context might fail without user interaction
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setSecondsLeft(MODE_TIMES[newMode]);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(MODE_TIMES[mode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - secondsLeft / MODE_TIMES[mode];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Study Focus Timer</span>
          <span className="text-xs text-slate-400">· {completedSessions} done</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle Sound"
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close Timer"
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <button
          onClick={() => switchMode('work')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
            mode === 'work'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <BookOpen className="h-3 w-3" />
          Focus 25
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
            mode === 'shortBreak'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Coffee className="h-3 w-3" />
          Break 5
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
            mode === 'longBreak'
              ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-700 dark:text-amber-300'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Long 15
        </button>
      </div>

      {/* Timer Display */}
      <div className="my-5 text-center">
        <div className="font-mono text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
          {formatTime(secondsLeft)}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'work' ? 'bg-indigo-600' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Current Task Note */}
      <div className="mb-4">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What are you studying right now?"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start Focus
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
