import React, { useState } from 'react';
import {
  StudyTask,
  STUDY_CATEGORIES,
  StudyCategory,
  readStudyTasks,
} from '../utils/studyEngine';
import { CheckSquare, Square, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';

interface TodoViewProps {
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
}

export const TodoView: React.FC<TodoViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<StudyCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 5 Columns: Add StudyTask Form & Subject Completion Summary */}
      <div className="lg:col-span-5 space-y-6">
        <section
          aria-labelledby="add-task-heading"
          className="bg-white border border-slate-200 rounded-xl p-6"
        >
          <div className="pb-4 border-b border-slate-100">
            <h2
              id="add-task-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Add Subject Checklist Task
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new StudyTask synced to your authenticated account
            </p>
          </div>

          <form onSubmit={handleAddSubmit} className="mt-5 space-y-4" noValidate>
            <div>
              <label
                htmlFor="todo-title"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Task Title
              </label>
              <input
                id="todo-title"
                type="text"
                placeholder="e.g. Implement Dijkstra Priority Queue in Dart"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="todo-category"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Subject Category
                </label>
                <select
                  id="todo-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StudyCategory)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Target Date
                </label>
                <input
                  id="todo-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="todo-minutes"
                  className="block text-xs font-medium text-slate-700 mb-1"
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
                  className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Priority Level
                </span>
                <div
                  className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
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
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {formError}
              </p>
            )}
            {formSuccess && (
              <p role="status" className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
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
          className="bg-white border border-slate-200 rounded-xl p-6"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h3
              id="checklist-progress-heading"
              className="text-base font-semibold text-slate-900"
            >
              Checklist Completion
            </h3>
            <span
              className="text-sm font-bold font-mono tabular-nums text-slate-900"
              data-testid="todo-completion-summary"
            >
              {completedCount} / {totalCount} ({completionPct}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
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
                  className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-50 last:border-none"
                >
                  <span className="font-medium text-slate-800">{cat}</span>
                  <span className="font-mono tabular-nums text-slate-500">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2
                id="subject-checklists-heading"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                Subject Todo Checklists
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {visibleTasks.length} of {tasks.length} StudyTask items
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
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
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search & Subject Filter Controls */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search todo tasks"
                placeholder="Search tasks by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[40px] pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
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
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No study tasks match your active filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('All');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 min-h-[40px] px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
            >
              Show All Tasks
            </button>
          </div>
        ) : (
          <div
            className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100"
            data-testid="todo-tasks-list"
          >
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Toggle completion for '${task.title}'`}
                    aria-pressed={task.isCompleted}
                    className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-500 hover:text-blue-600 rounded-lg transition-colors shrink-0"
                  >
                    {task.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 pt-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        task.isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* Zero-Pill Metadata Discipline: Clean unboxed inline text */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{task.category}</span>
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
                            ? 'text-amber-700 font-medium'
                            : 'text-slate-500'
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
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
