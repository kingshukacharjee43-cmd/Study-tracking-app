import React, { useState } from 'react';
import {
  StudyTask,
  StudyTrekState,
  STUDY_CATEGORIES,
  StudyCategory,
  AchievementPeriod,
  readStudyTasks,
  calculateDigitalWellbeingStats,
  getPeriodAchievements,
  DEFAULT_DEVICE_WIDGETS,
} from '../utils/studyEngine';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Activity,
  Award,
  Smartphone,
  Lock,
} from 'lucide-react';

interface TodoViewProps {
  state: StudyTrekState;
  tasks: StudyTask[];
  onAddTask: (input: {
    title: string;
    category: StudyCategory;
    date: string;
    estimatedMinutes: number;
    priority: 'High' | 'Medium' | 'Low';
  }) => string | undefined;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleWidget: (widgetId: string) => void;
}

export const TodoView: React.FC<TodoViewProps> = ({
  state,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleWidget,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<StudyCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [achievementPeriod, setAchievementPeriod] = useState<AchievementPeriod>('daily');
  const [widgetSurfacePreview, setWidgetSurfacePreview] = useState<'home_screen' | 'lock_screen'>('home_screen');

  // New StudyTask Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<StudyCategory>('Computer Science');
  const [date, setDate] = useState<string>('2026-11-12');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('45');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const parsedMins = parseInt(estimatedMinutes, 10) || 45;
    const err = onAddTask({
      title,
      category,
      date,
      estimatedMinutes: parsedMins,
      priority,
    });

    if (err) {
      setFormError(err);
      return;
    }

    setTitle('');
    setFormSuccess('Task saved to your account checklist.');
  };

  const visibleTasks = readStudyTasks(tasks, {
    category: categoryFilter,
    status: statusFilter,
    search: searchQuery,
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Digital Wellbeing & Achievements calculations
  const wellbeing = calculateDigitalWellbeingStats(state);
  const achievementSummary = getPeriodAchievements(state, achievementPeriod);
  const widgets = state.widgets || DEFAULT_DEVICE_WIDGETS;
  const homeWidgets = widgets.filter((w) => w.surface === 'home_screen');
  const lockWidgets = widgets.filter((w) => w.surface === 'lock_screen');
  const nextPriorityTask =
    tasks.find((t) => !t.isCompleted && t.priority === 'High') ||
    tasks.find((t) => !t.isCompleted) ||
    tasks[0];

  // SVG Donut ring geometry for Digital Wellbeing
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let cumulativeDash = 0;

  return (
    <div className="space-y-8">
      {/* Top 12-Column Checklist Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Columns: Add StudyTask Form & Subject Completion Summary */}
        <div className="lg:col-span-5 space-y-6">
          <section
            aria-labelledby="add-task-heading"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
          >
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2
                id="add-task-heading"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Add Subject Checklist Task
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create a new StudyTask synced to your authenticated account
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="todo-title"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Task Title
                </label>
                <input
                  id="todo-title"
                  type="text"
                  placeholder="e.g. Implement Dijkstra Priority Queue in Dart"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="todo-category"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Subject Category
                  </label>
                  <select
                    id="todo-category"
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
                    htmlFor="todo-date"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Target Date
                  </label>
                  <input
                    id="todo-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="todo-minutes"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Estimated Minutes
                  </label>
                  <input
                    id="todo-minutes"
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </span>
                  <div
                    className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    role="group"
                    aria-label="Task priority level"
                  >
                    {(['High', 'Medium', 'Low'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        aria-pressed={priority === p}
                        className={`flex-1 min-h-[34px] text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          priority === p
                            ? 'bg-slate-900 dark:bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task to Checklist</span>
              </button>
            </form>
          </section>

          {/* Subject Checklist Progress */}
          <section
            aria-labelledby="checklist-progress-heading"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
          >
            <div className="flex items-baseline justify-between mb-3">
              <h3
                id="checklist-progress-heading"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                Checklist Completion
              </h3>
              <span
                className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
                data-testid="todo-completion-summary"
              >
                {completedCount} / {totalCount} ({completionPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-blue-600 transition-transform duration-150 origin-left"
                style={{ transform: `scaleX(${completionPct / 100})` }}
              />
            </div>

            <div className="space-y-2.5">
              {STUDY_CATEGORIES.map((cat) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                const catDone = catTasks.filter((t) => t.isCompleted).length;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-1 border-b border-slate-50 dark:border-slate-800/60 last:border-none"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cat}</span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {catDone}/{catTasks.length} completed
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right 7 Columns: Interactive StudyTask List */}
        <section
          aria-labelledby="subject-checklists-heading"
          className="lg:col-span-7 space-y-5"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  id="subject-checklists-heading"
                  className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Subject Todo Checklists
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing {visibleTasks.length} of {tasks.length} StudyTask items
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  role="group"
                  aria-label="Filter tasks by completion status"
                >
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'completed', label: 'Done' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        statusFilter === tab.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search & Subject Filter Controls */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Search todo tasks"
                  placeholder="Search tasks by title or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[40px] pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-1"
                role="group"
                aria-label="Filter tasks by subject category"
              >
                {(['All', ...STUDY_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
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

          {/* StudyTask Items */}
          {visibleTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center transition-colors">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No study tasks match your active filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 min-h-[40px] px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-medium rounded-lg"
              >
                Show All Tasks
              </button>
            </div>
          ) : (
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 transition-colors"
              data-testid="todo-tasks-list"
            >
              {visibleTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={`Toggle completion for '${task.title}'`}
                      aria-pressed={task.isCompleted}
                      className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 pt-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          task.isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Zero-Pill Metadata Discipline: Clean unboxed inline text */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">Due {task.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {task.estimatedMinutes}m est
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            task.priority === 'High'
                              ? 'text-amber-700 dark:text-amber-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400'
                          }
                        >
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label={`Delete task '${task.title}'`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Digital Wellbeing Focus Graph & Daily / Weekly / Monthly Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Columns: Digital Wellbeing Focus & Subject Balance Graph */}
        <section
          aria-labelledby="digital-wellbeing-heading"
          data-testid="digital-wellbeing-section"
          className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h2
                  id="digital-wellbeing-heading"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Digital Wellbeing · Study & Checklist Balance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Combined deep-work sessions and completed StudyTask time across subjects
                </p>
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">
              Score {wellbeing.wellbeingScore}/100
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Radial Multi-Segment Digital Wellbeing Ring */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg
                  viewBox="0 0 160 160"
                  className="w-full h-full -rotate-90"
                  role="img"
                  aria-label="Digital Wellbeing subject focus distribution ring"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="16"
                  />
                  {wellbeing.slices.map((slice) => {
                    if (slice.totalFocusMinutes <= 0) return null;
                    const dashLength =
                      (slice.totalFocusMinutes / Math.max(1, wellbeing.grandTotalFocusMinutes)) *
                      circumference;
                    const dashOffset = -cumulativeDash;
                    cumulativeDash += dashLength;
                    return (
                      <circle
                        key={slice.category}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={slice.strokeColor}
                        strokeWidth="16"
                        strokeDasharray={`${Math.max(2, dashLength - 2)} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="butt"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    Total Focus
                  </span>
                  <span
                    className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5"
                    data-testid="wellbeing-total-hours"
                  >
                    {wellbeing.grandTotalFocusHours}h
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {wellbeing.totalCompletedTaskMinutes}m tasks done
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Bars */}
            <div className="sm:col-span-7 space-y-3">
              {/* Stacked Horizontal Wellbeing Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Subject Screen-On Focus Distribution</span>
                  <span className="font-mono tabular-nums">
                    {wellbeing.grandTotalFocusMinutes} mins
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  {wellbeing.slices.map((slice) =>
                    slice.sharePct > 0 ? (
                      <div
                        key={slice.category}
                        className={`${slice.bgClass} h-full`}
                        style={{ width: `${slice.sharePct}%` }}
                        title={`${slice.category}: ${slice.sharePct}%`}
                      />
                    ) : null
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {wellbeing.slices.map((slice) => (
                  <div
                    key={slice.category}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/70 last:border-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-xs shrink-0 ${slice.bgClass}`}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {slice.category}
                      </span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                      {slice.sessionHours.toFixed(1)}h study · {slice.completedTaskMinutes}m todo ({slice.sharePct}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right 6 Columns: Daily, Weekly & Monthly Achievements Stats */}
        <section
          aria-labelledby="achievements-heading"
          data-testid="achievements-section"
          className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h2
                  id="achievements-heading"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Daily, Weekly & Monthly Achievements
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Milestone stats calculated from your study sessions and checklist velocity
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto"
              role="group"
              aria-label="Achievement timeframe selector"
            >
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setAchievementPeriod(period)}
                  aria-pressed={achievementPeriod === period}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                    achievementPeriod === period
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Period KPI Banner */}
          <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {achievementSummary.headlineSubtext}
              </div>
              <div
                className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5"
                data-testid="achievement-headline-stat"
              >
                {achievementSummary.headlineStat}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
              <span>{achievementSummary.secondaryStat}</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {achievementSummary.tertiaryStat}
              </span>
            </div>
          </div>

          {/* Achievement Cards */}
          <div className="mt-4 space-y-3">
            {achievementSummary.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {badge.title}
                      </h3>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          badge.unlocked
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {badge.unlocked ? '· Unlocked' : '· In Progress'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {badge.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {badge.currentLabel} / {badge.targetLabel}
                  </span>
                </div>
                <div className="mt-3 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-transform duration-150 origin-left ${
                      badge.unlocked ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ transform: `scaleX(${badge.progressPct / 100})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Android Home Screen & Lock Screen Widgets Configurator */}
      <section
        aria-labelledby="widgets-config-heading"
        data-testid="device-widgets-section"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h2
                id="widgets-config-heading"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Home Screen & Lock Screen Widgets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pin live Material 3 Glance study widgets to your Android Home Screen and Lock Screen
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto"
            role="group"
            aria-label="Preview device widget surface"
          >
            <button
              type="button"
              onClick={() => setWidgetSurfacePreview('home_screen')}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                widgetSurfacePreview === 'home_screen'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Home Screen Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setWidgetSurfacePreview('lock_screen')}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                widgetSurfacePreview === 'lock_screen'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Screen Preview</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Toggleable Home Screen & Lock Screen Widget Cards */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Home Screen Widgets (Android AppWidget / Glance)
              </h3>
              <div className="space-y-3">
                {homeWidgets.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {w.title}
                        </span>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          · {w.sizeSpec}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {w.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleWidget(w.id)}
                      aria-pressed={w.enabled}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        w.enabled
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {w.enabled ? 'Added to Home Screen' : '+ Add to Home Screen'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Lock Screen Widgets (Android 15 Lockscreen Glance)
              </h3>
              <div className="space-y-3">
                {lockWidgets.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {w.title}
                        </span>
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          · {w.sizeSpec}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {w.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleWidget(w.id)}
                      aria-pressed={w.enabled}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        w.enabled
                          ? 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {w.enabled ? 'Added to Lock Screen' : '+ Add to Lock Screen'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Interactive Android Home / Lock Screen Preview */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>
                  {widgetSurfacePreview === 'home_screen'
                    ? 'ANDROID 15 HOME SCREEN'
                    : 'ANDROID 15 LOCK SCREEN'}
                </span>
                <span>09:41 · Lectra Glance</span>
              </div>

              {widgetSurfacePreview === 'lock_screen' && (
                <div className="py-3 text-center border-b border-slate-800/80">
                  <div className="text-4xl font-bold font-mono tabular-nums tracking-tight text-white">
                    09:41
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Mon, Nov 9 · Focus Mode Active
                  </div>
                </div>
              )}

              {/* Render Active Widgets for the Selected Surface */}
              {widgets
                .filter((w) => w.surface === widgetSurfacePreview && w.enabled)
                .map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-400">{w.title}</span>
                      <span className="font-mono text-slate-400">{w.sizeSpec}</span>
                    </div>

                    {w.id === 'widget-home-wellbeing' && (
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div>
                          <div className="text-xl font-bold font-mono tabular-nums text-white">
                            {wellbeing.grandTotalFocusHours}h Focus
                          </div>
                          <div className="text-xs text-slate-400">
                            Wellbeing Score {wellbeing.wellbeingScore}/100
                          </div>
                        </div>
                        <div className="text-right text-xs font-mono text-emerald-400">
                          {completedCount}/{totalCount} Tasks Done
                        </div>
                      </div>
                    )}

                    {w.id === 'widget-home-checklist' && nextPriorityTask && (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">
                            {nextPriorityTask.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {nextPriorityTask.category} · {nextPriorityTask.estimatedMinutes}m
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleTask(nextPriorityTask.id)}
                          className="min-h-[32px] px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-md shrink-0"
                        >
                          {nextPriorityTask.isCompleted ? 'Completed' : 'Tick Task'}
                        </button>
                      </div>
                    )}

                    {w.id === 'widget-home-graph' && (
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          Weekly Goal: {state.weeklyGoalHours}h target
                        </span>
                        <span className="font-mono text-blue-400 font-semibold">
                          25:00 Focus Ready
                        </span>
                      </div>
                    )}

                    {w.id === 'widget-lock-next-task' && nextPriorityTask && (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-200 truncate">
                          Next: {nextPriorityTask.title}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 shrink-0">
                          {nextPriorityTask.priority}
                        </span>
                      </div>
                    )}

                    {w.id === 'widget-lock-streak-ring' && (
                      <div className="pt-1 flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400">7-Day Study Streak</span>
                        <span className="text-white font-bold">{completionPct}% Checklist</span>
                      </div>
                    )}
                  </div>
                ))}

              {widgets.filter((w) => w.surface === widgetSurfacePreview && w.enabled).length ===
                0 && (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
                  No widgets enabled for this screen. Toggle a widget on the left to preview it live.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
