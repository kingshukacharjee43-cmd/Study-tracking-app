import React, { useState, useEffect } from 'react';
import {
  StudyCategory,
  STUDY_CATEGORIES,
  StudyTask,
  Weekday,
} from '../utils/studyEngine';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Sparkles,
} from 'lucide-react';

interface FocusModeViewProps {
  initialDurationMinutes?: number;
  initialCategory?: StudyCategory;
  initialTaskTitle?: string;
  pendingTasks: StudyTask[];
  onCompleteSession: (payload: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
    completedTaskId?: string;
  }) => void;
  onExitFocusMode: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  initialDurationMinutes = 25,
  initialCategory = 'Computer Science',
  initialTaskTitle = '',
  pendingTasks,
  onCompleteSession,
  onExitFocusMode,
}) => {
  const [presetMinutes, setPresetMinutes] = useState<number>(initialDurationMinutes);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [category, setCategory] = useState<StudyCategory>(initialCategory);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    pendingTasks[0]?.id || ''
  );
  const [customTopic, setCustomTopic] = useState<string>(
    initialTaskTitle || pendingTasks[0]?.title || 'Deep Work Focus Session'
  );
  const [markTaskDoneOnFinish, setMarkTaskDoneOnFinish] = useState<boolean>(true);
  const [showEarlyExitConfirm, setShowEarlyExitConfirm] = useState<boolean>(false);

  const totalSeconds = Math.max(60, presetMinutes * 60);
  const elapsedSeconds = Math.max(0, totalSeconds - secondsLeft);
  const progressPct = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));
  const isTimerFinished = secondsLeft === 0;

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const formatClock = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePresetChange = (mins: number) => {
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(true);
    setShowEarlyExitConfirm(false);
  };

  const handleCompleteAndUnlock = () => {
    const studiedMinutes = isTimerFinished
      ? presetMinutes
      : Math.max(15, Math.round(elapsedSeconds / 60) || presetMinutes);
    const hours = Math.max(0.3, Math.round((studiedMinutes / 60) * 10) / 10);
    const topicToLog =
      customTopic.trim() || `${category} Focus Session (${presetMinutes}m)`;

    onCompleteSession({
      weekday: 'Mon',
      category,
      hours,
      topic: topicToLog,
      completedTaskId:
        markTaskDoneOnFinish && selectedTaskId ? selectedTaskId : undefined,
    });
  };

  // SVG Ring calculation
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPct / 100) * circumference;

  return (
    <div
      data-testid="focus-mode-screen"
      role="region"
      aria-label="Distraction-Free Focus Mode"
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between px-4 sm:px-6 py-8 select-none"
    >
      {/* Minimal Top Status Bar — All Navigation & App UI Blocked */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            Lectra Focus Mode Active
          </span>
          <span aria-hidden="true">·</span>
          <span>All navigation & external UI blocked until session completes</span>
        </div>

        <span className="text-xs font-mono tabular-nums text-blue-400">
          {progressPct}% elapsed
        </span>
      </div>

      {/* Central Minimal Timer Core */}
      <main className="w-full max-w-xl my-auto py-8 flex flex-col items-center text-center">
        {/* Preset Selector */}
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-8"
          role="group"
          aria-label="Focus session duration presets"
        >
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handlePresetChange(mins)}
              aria-pressed={presetMinutes === mins}
              className={`min-h-[38px] px-4 py-1.5 text-xs font-mono tabular-nums font-medium rounded-lg transition-colors whitespace-nowrap ${
                presetMinutes === mins
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Minimal Radial Timer Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg
            viewBox="0 0 260 260"
            className="w-full h-full -rotate-90"
            role="img"
            aria-label={`Focus countdown timer: ${formatClock(secondsLeft)} remaining`}
          >
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke={isTimerFinished ? '#10b981' : '#3b82f6'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <span className="text-xs font-medium text-slate-400">
              {category}
            </span>
            <div
              data-testid="focus-mode-clock"
              aria-live="polite"
              className="text-5xl sm:text-6xl font-bold font-mono tabular-nums tracking-tight text-white mt-1"
            >
              {formatClock(secondsLeft)}
            </div>
            <span className="text-xs text-slate-400 mt-2">
              {isTimerFinished
                ? 'Session Complete · Ready to Unlock'
                : isRunning
                ? 'Deep Work in Progress'
                : 'Timer Paused'}
            </span>
          </div>
        </div>

        {/* Active Focus Target Configuration */}
        <div className="w-full mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="focus-mode-category"
                className="block text-xs font-medium text-slate-400 mb-1"
              >
                Subject Category
              </label>
              <select
                id="focus-mode-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="w-full min-h-[42px] px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STUDY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="focus-mode-task"
                className="block text-xs font-medium text-slate-400 mb-1"
              >
                Link Pending Checklist Task
              </label>
              <select
                id="focus-mode-task"
                value={selectedTaskId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedTaskId(id);
                  const found = pendingTasks.find((t) => t.id === id);
                  if (found) {
                    setCustomTopic(found.title);
                    setCategory(found.category);
                  }
                }}
                className="w-full min-h-[42px] px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Custom Focus Topic</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.estimatedMinutes}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="focus-mode-topic-input"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Session Milestone / Goal
            </label>
            <input
              id="focus-mode-topic-input"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="What will you finish before unlocking the UI?"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedTaskId && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={markTaskDoneOnFinish}
                onChange={(e) => setMarkTaskDoneOnFinish(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
              />
              <span>Automatically mark linked Todo task as completed when session finishes</span>
            </label>
          )}
        </div>

        {/* Primary Timer Controls */}
        <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            className="min-h-[46px] px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume Timer</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(presetMinutes * 60);
            }}
            className="min-h-[46px] px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Clock</span>
          </button>

          <button
            type="button"
            onClick={handleCompleteAndUnlock}
            data-testid="complete-focus-session-btn"
            className="min-h-[46px] px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Study Session & Unlock UI</span>
          </button>
        </div>
      </main>

      {/* Bottom Distraction-Lock Guard */}
      <footer className="w-full max-w-2xl border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Completing this focus block logs hours directly to your Weekly Progress Graph.
          </span>
        </div>

        {!showEarlyExitConfirm ? (
          <button
            type="button"
            onClick={() => setShowEarlyExitConfirm(true)}
            className="min-h-[36px] px-3 py-1 text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 whitespace-nowrap"
          >
            End Focus Mode Without Logging
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Abandon active study block?</span>
            </span>
            <button
              type="button"
              onClick={onExitFocusMode}
              className="min-h-[34px] px-3 py-1 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
            >
              Confirm Exit
            </button>
            <button
              type="button"
              onClick={() => setShowEarlyExitConfirm(false)}
              className="min-h-[34px] px-3 py-1 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              Stay Focused
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
