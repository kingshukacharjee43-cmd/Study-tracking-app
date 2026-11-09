import React, { useState } from 'react';
import {
  STUDY_CATEGORIES,
  StudyCategory,
  WEEKDAYS,
  Weekday,
} from '../utils/studyEngine';
import { X, Plus } from 'lucide-react';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (input: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
  }) => string | undefined;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
}) => {
  const [weekday, setWeekday] = useState<Weekday>('Mon');
  const [category, setCategory] = useState<StudyCategory>('Computer Science');
  const [hours, setHours] = useState<string>('2.0');
  const [topic, setTopic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedHours = parseFloat(hours);
    const err = onAddSession({
      weekday,
      category,
      hours: parsedHours,
      topic,
    });
    if (err) {
      setError(err);
      return;
    }
    setTopic('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-log-session-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2
            id="modal-log-session-title"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Log Study Session
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close log study session modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="modal-session-weekday"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Weekday
              </label>
              <select
                id="modal-session-weekday"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value as Weekday)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="modal-session-hours"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Study Hours
              </label>
              <input
                id="modal-session-hours"
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-session-category"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Subject Category
            </label>
            <select
              id="modal-session-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as StudyCategory)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
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
              htmlFor="modal-session-topic"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Study Topic / Milestone
            </label>
            <input
              id="modal-session-topic"
              type="text"
              placeholder="e.g. Graph Traversal & Shortest Paths"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Save Study Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
