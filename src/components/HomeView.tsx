import React, { useState, useEffect } from 'react';
import {
  StudyTrekState,
  STUDY_CATEGORIES,
  StudyCategory,
  WEEKDAYS,
  Weekday,
  calculateStudyMetrics,
} from '../utils/studyEngine';
import { StudyAreaChart } from './StudyAreaChart';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface HomeViewProps {
  state: StudyTrekState;
  onAddSession: (input: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
  }) => string | undefined;
  onDeleteSession: (id: string) => void;
  onUpdateWeeklyGoal: (goalHours: number) => void;
  onNavigateTab: (tab: 'home' | 'journey' | 'todos' | 'flutter') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onAddSession,
  onDeleteSession,
  onUpdateWeeklyGoal,
  onNavigateTab,
}) => {
  const metrics = calculateStudyMetrics(state);
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Inline Quick Session Form
  const [weekday, setWeekday] = useState<Weekday>('Mon');
  const [category, setCategory] = useState<StudyCategory>('Computer Science');
  const [hoursInput, setHoursInput] = useState<string>('1.5');
  const [topic, setTopic] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Built-in Focus / Study Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerPresetMinutes, setTimerPresetMinutes] = useState<number>(25);
  const [timerCategory, setTimerCategory] = useState<StudyCategory>('Computer Science');

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const parsedHours = parseFloat(hoursInput);
    const err = onAddSession({
      weekday,
      category,
      hours: parsedHours,
      topic,
    });

    if (err) {
      setFormError(err);
      return;
    }

    setTopic('');
    setSelectedDay(weekday);
    setFormSuccess(`Added ${parsedHours.toFixed(1)}h of ${category} on ${weekday}.`);
  };

  const handleLogTimerSession = () => {
    const elapsedMinutes = Math.max(6, timerPresetMinutes - Math.floor(timerSeconds / 60));
    const hours = Math.max(0.5, Math.round((elapsedMinutes / 60) * 10) / 10);
    const targetDay: Weekday = selectedDay || 'Mon';
    onAddSession({
      weekday: targetDay,
      category: timerCategory,
      hours,
      topic: `Focused Study Block (${timerPresetMinutes}m preset)`,
    });
    setIsRunning(false);
    setTimerSeconds(timerPresetMinutes * 60);
    setFormSuccess(`Logged ${hours.toFixed(1)}h focus block to ${targetDay}.`);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const filteredSessions = selectedDay
    ? state.sessions.filter((s) => s.weekday === selectedDay)
    : state.sessions;

  const dailyTarget = Math.round((state.weeklyGoalHours / 7) * 10) / 10;

  return (
    <div className="space-y-8">
      {/* Top 4-Column KPI Summary Strip */}
      <section
        aria-label="Weekly study performance metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Weekly Study Hours
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums"
              data-testid="metric-total-hours"
            >
              {metrics.totalWeeklyHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              / {state.weeklyGoalHours}h target ({metrics.goalProgressPct}%)
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-transform duration-150 origin-left"
              style={{ transform: `scaleX(${metrics.goalProgressPct / 100})` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Active Study Consistency
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {metrics.activeDaysCount} / 7
            </span>
            <span className="text-xs text-slate-500">
              days logged this week
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Avg {(metrics.totalWeeklyHours / 7).toFixed(1)} hrs/day across all subjects
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Peak Study Day
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums whitespace-nowrap">
              {metrics.peakDay} · {metrics.peakHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              peak output
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {state.journal.length} structured reflections in Journey log
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Subject Checklist Velocity
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {metrics.completedTasksCount} / {metrics.totalTasksCount}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('todos')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 whitespace-nowrap"
            >
              Open Todos
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {metrics.taskCompletionPct}% of Hive StudyTask items completed
          </p>
        </div>
      </section>

      {/* Main 12-Column Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Weekly Area Chart + Quick Study Session Logger + Sessions Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Weekly Progress Graph Card */}
          <section
            aria-labelledby="weekly-graph-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2
                  id="weekly-graph-heading"
                  className="text-xl font-bold tracking-tight text-slate-900"
                >
                  Weekly Study Progress Graph
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Daily study hours mapped across weekdays with area gradient visualization
                </p>
              </div>

              {/* Interactive Chart Mode Toggle */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div
                  className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                  role="group"
                  aria-label="Chart visualization style"
                >
                  <button
                    type="button"
                    onClick={() => setChartType('area')}
                    className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      chartType === 'area'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Area Gradient
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      chartType === 'bar'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bar Chart
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <StudyAreaChart
                weeklyMap={metrics.weeklyMap}
                dailyTargetHours={dailyTarget}
                selectedDay={selectedDay}
                onSelectDay={(day) =>
                  setSelectedDay((prev) => (prev === day ? null : day))
                }
                chartType={chartType}
              />
            </div>
          </section>

          {/* Inline Study Session Logger */}
          <section
            aria-labelledby="quick-log-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  id="quick-log-heading"
                  className="text-base font-semibold text-slate-900"
                >
                  Log Study Hours to Graph
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add a completed study session to immediately update the weekday progress curve
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="session-weekday"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Weekday
                  </label>
                  <select
                    id="session-weekday"
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value as Weekday)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="session-category"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Subject Category
                  </label>
                  <select
                    id="session-category"
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

                <div className="sm:col-span-2">
                  <label
                    htmlFor="session-hours"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Hours
                  </label>
                  <input
                    id="session-hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="session-topic"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Study Topic / Milestone
                  </label>
                  <input
                    id="session-topic"
                    type="text"
                    placeholder="e.g. Dynamic Programming"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
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

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Persisted locally in offline storage
                </span>
                <button
                  type="submit"
                  className="min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Study Hours</span>
                </button>
              </div>
            </form>
          </section>

          {/* Logged Study Sessions Table */}
          <section
            aria-labelledby="logged-sessions-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3
                  id="logged-sessions-heading"
                  className="text-base font-semibold text-slate-900"
                >
                  {selectedDay
                    ? `Study Sessions on ${selectedDay}`
                    : 'All Logged Study Sessions This Week'}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'}
                </p>
              </div>
              {selectedDay && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Show All Days
                </button>
              )}
            </div>

            {filteredSessions.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600">
                  No study sessions logged for {selectedDay} yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDay) setWeekday(selectedDay);
                    document.getElementById('session-topic')?.focus();
                  }}
                  className="mt-3 min-h-[40px] px-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  Log First Session for {selectedDay}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.topic}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{session.weekday}</span>
                        <span aria-hidden="true">·</span>
                        <span>{session.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{session.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                        {session.hours.toFixed(1)}h
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        aria-label={`Delete study session '${session.topic}'`}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right 4 Columns: Focus Study Timer + Subject Distribution + Weekly Goal Config */}
        <div className="lg:col-span-4 space-y-6">
          {/* Focus Timer Card */}
          <section
            aria-labelledby="focus-timer-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                id="focus-timer-heading"
                className="text-base font-semibold text-slate-900"
              >
                Deep Work Focus Timer
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {timerPresetMinutes} min block
              </span>
            </div>

            {/* Preset Selector */}
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-4"
              role="group"
              aria-label="Timer duration presets"
            >
              {[25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setTimerPresetMinutes(mins);
                    setTimerSeconds(mins * 60);
                  }}
                  className={`flex-1 min-h-[36px] py-1.5 text-xs font-medium rounded-md transition-colors font-mono tabular-nums whitespace-nowrap ${
                    timerPresetMinutes === mins
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <div className="py-5 text-center bg-slate-50 rounded-xl border border-slate-100">
              <div
                className="text-4xl font-bold tracking-tight text-slate-900 font-mono tabular-nums"
                aria-live="polite"
              >
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target subject: {timerCategory}
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="timer-subject-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Focus Subject
              </label>
              <select
                id="timer-subject-select"
                value={timerCategory}
                onChange={(e) => setTimerCategory(e.target.value as StudyCategory)}
                className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {STUDY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setTimerSeconds(timerPresetMinutes * 60);
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogTimerSession}
              className="w-full mt-2 min-h-[42px] px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Complete & Log Block to Graph
            </button>
          </section>

          {/* Subject Distribution Breakdown */}
          <section
            aria-labelledby="subject-breakdown-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <h3
              id="subject-breakdown-heading"
              className="text-base font-semibold text-slate-900"
            >
              Hours by Subject
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Cumulative distribution across {STUDY_CATEGORIES.length} study categories
            </p>

            <div className="space-y-3.5">
              {STUDY_CATEGORIES.map((cat) => {
                const hrs = metrics.categoryHours[cat] || 0;
                const pct =
                  metrics.totalWeeklyHours > 0
                    ? Math.round((hrs / metrics.totalWeeklyHours) * 100)
                    : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{cat}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {hrs.toFixed(1)}h · {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-transform duration-150 origin-left"
                        style={{ transform: `scaleX(${pct / 100})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Weekly Target Adjustment */}
          <section
            aria-labelledby="weekly-goal-heading"
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <h3
              id="weekly-goal-heading"
              className="text-base font-semibold text-slate-900"
            >
              Weekly Study Goal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">
              Adjust your weekly target hours to calibrate daily graph benchmarks
            </p>
            <div className="flex items-center gap-2">
              {[15, 20, 25, 35].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => onUpdateWeeklyGoal(goal)}
                  aria-pressed={state.weeklyGoalHours === goal}
                  className={`flex-1 min-h-[40px] py-2 text-xs font-mono tabular-nums font-medium rounded-lg transition-colors whitespace-nowrap ${
                    state.weeklyGoalHours === goal
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {goal}h/wk
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
