import React, { useState } from 'react';
import {
  JournalEntry,
  STUDY_CATEGORIES,
  StudyCategory,
  WEEKDAYS,
  Weekday,
  GOOGLE_STUDENT_TRENDING_TOPICS,
} from '../utils/studyEngine';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface JourneyViewProps {
  journal: JournalEntry[];
  onAddEntry: (input: {
    title: string;
    category: StudyCategory;
    date: string;
    weekday: Weekday;
    hoursLogged: number;
    focusRating: 1 | 2 | 3 | 4 | 5;
    reflection: string;
    keyTakeaway: string;
    syncToGraph: boolean;
  }) => string | undefined;
  onDeleteEntry: (id: string) => void;
  onResetJourney: (mode: 'restore_defaults' | 'clear_all') => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  journal,
  onAddEntry,
  onDeleteEntry,
  onResetJourney,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [sampleIdx, setSampleIdx] = useState<number>(0);

  // New Journal Entry Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<StudyCategory>('Computer Science');
  const [weekday, setWeekday] = useState<Weekday>('Mon');
  const [date, setDate] = useState<string>('2026-11-09');
  const [hoursLogged, setHoursLogged] = useState<string>('2.0');
  const [focusRating, setFocusRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reflection, setReflection] = useState<string>('');
  const [keyTakeaway, setKeyTakeaway] = useState<string>('');
  const [syncToGraph, setSyncToGraph] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setStatusBanner(null);

    const parsedHours = parseFloat(hoursLogged);
    const err = onAddEntry({
      title,
      category,
      date,
      weekday,
      hoursLogged: parsedHours,
      focusRating,
      reflection,
      keyTakeaway,
      syncToGraph,
    });

    if (err) {
      setError(err);
      return;
    }

    setTitle('');
    setReflection('');
    setKeyTakeaway('');
    setSuccessMsg('Daily study reflection saved to your offline Journey log.');
  };

  const handleQuickAddGoogleTopicReflection = () => {
    const topicItem =
      GOOGLE_STUDENT_TRENDING_TOPICS[
        sampleIdx % GOOGLE_STUDENT_TRENDING_TOPICS.length
      ];
    setSampleIdx((prev) => prev + 1);
    const hours = Math.round((topicItem.estimatedMinutes / 60) * 10) / 10;
    onAddEntry({
      title: topicItem.topicTitle,
      category: topicItem.category,
      date: '2026-11-09',
      weekday: 'Mon',
      hoursLogged: Math.max(0.5, hours),
      focusRating: 5,
      reflection: `${topicItem.whyStudentsSearchIt} Practiced active recall and derived core proofs (${topicItem.googleSearchTrendTag}).`,
      keyTakeaway: topicItem.recallQuestion.explanation,
      syncToGraph: true,
    });
    setStatusBanner(
      `Added "${topicItem.topicTitle}" reflection (+${Math.max(0.5, hours)}h synced to graph).`
    );
  };

  const filteredEntries = journal.filter((entry) => {
    if (selectedCategory !== 'All' && entry.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.reflection.toLowerCase().includes(q) ||
        entry.keyTakeaway.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalJournalHours =
    Math.round(journal.reduce((acc, j) => acc + j.hoursLogged, 0) * 10) / 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 5 Columns: Write Daily Study Journal Form */}
      <section
        aria-labelledby="new-journal-heading"
        className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h2
              id="new-journal-heading"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              Log Daily Study Journey
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record concepts mastered, active recall notes, and session focus
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label
              htmlFor="journal-title"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Session Title / Concept Studied
            </label>
            <input
              id="journal-title"
              type="text"
              placeholder="e.g. Red-Black Tree Rotations & Amortized Cost"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="journal-category"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Subject Category
              </label>
              <select
                id="journal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                htmlFor="journal-weekday"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Weekday & Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="journal-weekday"
                  aria-label="Journal weekday"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value as Weekday)}
                  className="w-full min-h-[42px] px-2.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  aria-label="Journal date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[42px] px-2 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="journal-hours"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Study Hours Logged
              </label>
              <input
                id="journal-hours"
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={hoursLogged}
                onChange={(e) => setHoursLogged(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Focus Depth Rating (1–5)
              </span>
              <div
                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg"
                role="group"
                aria-label="Focus depth rating"
              >
                {([1, 2, 3, 4, 5] as const).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFocusRating(rating)}
                    aria-pressed={focusRating === rating}
                    className={`flex-1 min-h-[34px] text-xs font-mono tabular-nums font-medium rounded-md transition-colors ${
                      focusRating === rating
                        ? 'bg-slate-900 dark:bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {rating}/5
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="journal-reflection"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Daily Study Reflection & Notes
            </label>
            <textarea
              id="journal-reflection"
              rows={4}
              placeholder="Summarize what you worked through, where you got stuck, and how you resolved it..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="journal-takeaway"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Core Key Takeaway (1-Sentence Recall)
            </label>
            <input
              id="journal-takeaway"
              type="text"
              placeholder="e.g. Balancing height after insertion takes at most 2 rotations."
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncToGraph}
              onChange={(e) => setSyncToGraph(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600"
            />
            <span>Also add these hours to the Home weekly study graph</span>
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {successMsg && (
            <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Save Journal Entry</span>
          </button>
        </form>
      </section>

      {/* Right 7 Columns: Searchable & Filterable Study Journey Feed + Add/Reset Controls */}
      <section
        aria-labelledby="journey-feed-heading"
        className="lg:col-span-7 space-y-5"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2
                id="journey-feed-heading"
                className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Your Study Journey Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                {filteredEntries.length} of {journal.length} entries · {totalJournalHours}h total reflected
              </p>
            </div>

            {/* Add / Reset Journey Stats & Entries Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuickAddGoogleTopicReflection}
                data-testid="add-trending-journal-btn"
                className="min-h-[34px] px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Add Google Topic Log</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onResetJourney('restore_defaults');
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setStatusBanner('Restored default Study Journey reflections.');
                }}
                data-testid="reset-journey-defaults-btn"
                className="min-h-[34px] px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Journey</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onResetJourney('clear_all');
                  setStatusBanner('Cleared all Journey entries for a fresh log.');
                }}
                className="min-h-[34px] px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Clear All
              </button>
            </div>
          </div>

          {statusBanner && (
            <p
              role="status"
              className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusBanner}</span>
            </p>
          )}

          {/* Search Input & Interactive Subject Filter Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search journal entries"
                placeholder="Search reflections or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[40px] pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter journal entries by subject"
            >
              {(['All', ...STUDY_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center transition-colors">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No study journal entries match your current filter.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Restore default entries or add a Google-trending study reflection above.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  onResetJourney('restore_defaults');
                }}
                className="min-h-[40px] px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-medium rounded-lg"
              >
                Restore Default Journey Entries
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="journal-entries-list">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{entry.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {entry.weekday}, {entry.date}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                        {entry.hoursLogged.toFixed(1)} hrs logged
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Focus {entry.focusRating}/5
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                      {entry.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Delete journal entry '${entry.title}'`}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {entry.reflection}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Key Takeaway: </span>
                    <span>{entry.keyTakeaway}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
