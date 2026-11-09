import React, { useState, useEffect } from 'react';
import {
  StudyTrekState,
  STUDY_CATEGORIES,
  StudyCategory,
  Weekday,
  StudyGameQuestion,
  generateStudyGameQuestions,
  DEFAULT_STUDY_FRIENDS,
} from '../utils/studyEngine';
import {
  Gamepad2,
  Users,
  Trophy,
  CheckCircle2,
  RotateCcw,
  UserPlus,
  Sparkles,
  Copy,
  Check,
  Zap,
  Plus,
  HelpCircle,
} from 'lucide-react';

interface StudyGameViewProps {
  state: StudyTrekState;
  currentAccountName: string;
  currentAccountUid: string;
  onEarnXp: (xpDelta: number) => void;
  onResetGameStats: (mode: 'reset_zero' | 'restore_default') => void;
  onConnectFriend: (input: {
    friendCodeOrEmail: string;
    displayName?: string;
    topCategory?: StudyCategory;
  }) => string | undefined;
  onLogGameStudySession: (input: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
  }) => void;
}

type GameMode = 'standard' | 'speed_blitz' | 'boss_arena';

export const StudyGameView: React.FC<StudyGameViewProps> = ({
  state,
  currentAccountName,
  currentAccountUid,
  onEarnXp,
  onResetGameStats,
  onConnectFriend,
  onLogGameStudySession,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | 'All'>('All');
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [blitzSecondsLeft, setBlitzSecondsLeft] = useState<number>(60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [sessionLoggedMsg, setSessionLoggedMsg] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<StudyGameQuestion[]>([]);

  // Custom Study Topic Stack / Question Builder
  const [customTopicTitle, setCustomTopicTitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<StudyCategory>('Computer Science');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customCorrectAnswer, setCustomCorrectAnswer] = useState<string>('');
  const [customStatusMsg, setCustomStatusMsg] = useState<string | null>(null);

  // Friend Sign-In / Connect State
  const [friendCodeOrEmail, setFriendCodeOrEmail] = useState<string>('');
  const [friendName, setFriendName] = useState<string>('');
  const [friendCategory, setFriendCategory] = useState<StudyCategory>('Computer Science');
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null);
  const [copiedMyCode, setCopiedMyCode] = useState<boolean>(false);

  // 60s Speed Blitz countdown timer
  useEffect(() => {
    if (gameMode !== 'speed_blitz' || blitzSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setBlitzSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameMode, blitzSecondsLeft]);

  const baseQuestions = generateStudyGameQuestions(state, selectedCategory);
  const filteredCustom = customQuestions.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  );
  const questions = [...filteredCustom, ...baseQuestions];
  const activeQuestion =
    questions[currentQuestionIdx % Math.max(1, questions.length)] || questions[0];

  const myPersonalInviteCode = `LECTRA-${currentAccountName
    .split(' ')[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6)}-88`;

  const friends = state.friends || DEFAULT_STUDY_FRIENDS;
  const userXp = state.gameXp ?? 1320;
  const modeMultiplier =
    gameMode === 'boss_arena' ? 2.0 : gameMode === 'speed_blitz' ? 1.5 : 1.0;

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIdx !== null || !activeQuestion) return;
    setSelectedOptionIdx(idx);
    if (idx === activeQuestion.correctIndex) {
      const baseReward = Math.round(activeQuestion.xpReward * modeMultiplier);
      const bonus = streakCount * 20;
      onEarnXp(baseReward + bonus);
      setStreakCount((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIdx(null);
    setEliminatedOptions([]);
    setCurrentQuestionIdx((prev) => (prev + 1) % Math.max(1, questions.length));
  };

  const handleUse5050Hint = () => {
    if (!activeQuestion || selectedOptionIdx !== null || eliminatedOptions.length > 0)
      return;
    const wrongIndices = activeQuestion.options
      .map((_, i) => i)
      .filter((i) => i !== activeQuestion.correctIndex);
    setEliminatedOptions(wrongIndices.slice(0, 2));
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomStatusMsg(null);
    const topic = customTopicTitle.trim();
    const prompt = customPrompt.trim();
    const answer = customCorrectAnswer.trim();
    if (!topic || !prompt || !answer) {
      setCustomStatusMsg('Please provide a topic title, question prompt, and correct answer.');
      return;
    }

    const newQ: StudyGameQuestion = {
      id: `q-custom-${Date.now()}`,
      category: customCategory,
      sourceLabel: 'Custom Student Study Stack',
      topicTitle: topic,
      prompt,
      options: [
        answer,
        'Skip verification and ignore boundary conditions.',
        'Rely on unindexed O(n²) sequential scans.',
        'Memorize without testing active recall.',
      ],
      correctIndex: 0,
      explanation: `Custom study card added for ${topic}: "${answer}"`,
      xpReward: 150,
    };

    setCustomQuestions((prev) => [newQ, ...prev]);
    setSelectedCategory('All');
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setEliminatedOptions([]);
    onEarnXp(100);
    setCustomTopicTitle('');
    setCustomPrompt('');
    setCustomCorrectAnswer('');
    setCustomStatusMsg(`Added "${topic}" to Study Game deck (+100 Builder XP)!`);
  };

  const handleResetGameSection = (mode: 'reset_zero' | 'restore_default') => {
    onResetGameStats(mode);
    setCustomQuestions([]);
    setStreakCount(0);
    setCorrectCount(0);
    setSelectedOptionIdx(null);
    setEliminatedOptions([]);
    setBlitzSecondsLeft(60);
    setCustomStatusMsg(
      mode === 'reset_zero'
        ? 'Reset Study Game XP to 0 and cleared custom cards.'
        : 'Restored default Study Game XP (1,320 XP) and reset streak stats.'
    );
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFriendError(null);
    setFriendSuccess(null);

    const err = onConnectFriend({
      friendCodeOrEmail,
      displayName: friendName,
      topCategory: friendCategory,
    });
    if (err) {
      setFriendError(err);
      return;
    }
    setFriendCodeOrEmail('');
    setFriendName('');
    setFriendSuccess('Friend connected! Their live study progress is now in your Study Circle.');
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(myPersonalInviteCode);
      setCopiedMyCode(true);
      window.setTimeout(() => setCopiedMyCode(false), 2000);
    } catch {
      setCopiedMyCode(true);
      window.setTimeout(() => setCopiedMyCode(false), 2000);
    }
  };

  const handleLogReviewSession = () => {
    const targetCategory: StudyCategory =
      selectedCategory === 'All'
        ? activeQuestion?.category || 'Computer Science'
        : selectedCategory;
    onLogGameStudySession({
      weekday: 'Mon',
      category: targetCategory,
      hours: 0.5,
      topic: `Active Recall Study Game (${activeQuestion?.topicTitle || targetCategory})`,
    });
    setSessionLoggedMsg(
      `Logged 0.5h of ${targetCategory} active recall to your weekly study graph!`
    );
  };

  // Combine current user + connected friends for live Study Circle leaderboard
  const leaderboard = [
    {
      id: currentAccountUid,
      displayName: `${currentAccountName} (You)`,
      xpScore: userXp,
      weeklyHours: state.sessions.reduce((s, x) => s + x.hours, 0),
      activeTopic: activeQuestion?.topicTitle || 'Active Recall Arena',
      topCategory: activeQuestion?.category || 'Computer Science',
      isCurrentUser: true,
    },
    ...friends.map((f) => ({
      id: f.id,
      displayName: f.displayName,
      xpScore: f.xpScore,
      weeklyHours: f.weeklyHours,
      activeTopic: f.activeTopic,
      topCategory: f.topCategory,
      isCurrentUser: false,
    })),
  ].sort((a, b) => b.xpScore - a.xpScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 7 Columns: Enhanced Topic-Driven Study Game Arena + Add/Reset Stack Controls */}
      <div className="lg:col-span-7 space-y-6">
        <section
          aria-labelledby="study-game-heading"
          data-testid="study-game-arena"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h2
                  id="study-game-heading"
                  className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Active Topic Study Game Arena
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Includes your logged Sessions, Journey, Todos & Google-Trending Student Topics ({questions.length} cards)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums">
              <span
                className="text-blue-600 dark:text-blue-400 font-bold"
                data-testid="game-xp-display"
              >
                {userXp} XP
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Streak {streakCount}x
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                {correctCount} Solved
              </span>
            </div>
          </div>

          {/* Enhanced Game Mode Switcher + Reset Stats Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
              role="group"
              aria-label="Study game challenge mode"
            >
              <button
                type="button"
                onClick={() => setGameMode('standard')}
                className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  gameMode === 'standard'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Standard (1x XP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGameMode('speed_blitz');
                  setBlitzSecondsLeft(60);
                }}
                className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  gameMode === 'speed_blitz'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                60s Blitz ({blitzSecondsLeft}s · 1.5x)
              </button>
              <button
                type="button"
                onClick={() => setGameMode('boss_arena')}
                className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  gameMode === 'boss_arena'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Boss Exam (2x XP)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetGameSection('restore_default')}
                data-testid="reset-game-stats-btn"
                className="min-h-[34px] px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Game Stats</span>
              </button>
              <button
                type="button"
                onClick={() => handleResetGameSection('reset_zero')}
                className="min-h-[34px] px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-xs font-medium rounded-lg whitespace-nowrap"
              >
                Zero XP
              </button>
            </div>
          </div>

          {/* Filter Game by Studying Subject */}
          <div
            className="flex flex-wrap items-center gap-1.5 pb-1"
            role="group"
            aria-label="Filter study game by topic subject"
          >
            {(['All', ...STUDY_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentQuestionIdx(0);
                  setSelectedOptionIdx(null);
                  setEliminatedOptions([]);
                }}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat === 'All' ? 'All Studying Topics' : cat}
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          {activeQuestion ? (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {activeQuestion.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeQuestion.sourceLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      selectedOptionIdx !== null || eliminatedOptions.length > 0
                    }
                    onClick={handleUse5050Hint}
                    className="min-h-[28px] px-2.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-md flex items-center gap-1 whitespace-nowrap"
                  >
                    <HelpCircle className="w-3 h-3 text-blue-500" />
                    <span>50/50 Hint</span>
                  </button>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    Card {(currentQuestionIdx % questions.length) + 1}/{questions.length} · +
                    {Math.round(activeQuestion.xpReward * modeMultiplier)} XP
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                Studying Topic:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {activeQuestion.topicTitle}
                </strong>
              </div>

              <h3
                className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug"
                data-testid="study-game-question-prompt"
              >
                {activeQuestion.prompt}
              </h3>

              <div className="space-y-2.5 pt-1">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  const isCorrect = idx === activeQuestion.correctIndex;
                  const isEliminated = eliminatedOptions.includes(idx);
                  const showResult = selectedOptionIdx !== null;

                  let btnStyle =
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500';
                  if (isEliminated && !showResult) {
                    btnStyle =
                      'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through opacity-50';
                  } else if (showResult) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      btnStyle =
                        'bg-red-50 dark:bg-red-950/50 border-red-600 text-red-900 dark:text-red-200';
                    }
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={showResult || isEliminated}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs leading-relaxed transition-colors flex items-start gap-3 ${btnStyle}`}
                    >
                      <span className="font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOptionIdx !== null && (
                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-slate-100">
                      {selectedOptionIdx === activeQuestion.correctIndex
                        ? `Correct! +${Math.round(activeQuestion.xpReward * modeMultiplier)} XP · `
                        : 'Review Takeaway · '}
                    </strong>
                    <span>{activeQuestion.explanation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="min-h-[38px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
                  >
                    Next Topic Challenge →
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Log Study Game Review Time to Graph */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Completed a study game round? Sync 0.5h of active recall directly to your weekly progress graph.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="min-h-[38px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Skip Card</span>
              </button>
              <button
                type="button"
                onClick={handleLogReviewSession}
                className="min-h-[38px] px-3.5 py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                Log +0.5h Game Review to Graph
              </button>
            </div>
          </div>

          {sessionLoggedMsg && (
            <p
              role="status"
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{sessionLoggedMsg}</span>
            </p>
          )}
        </section>

        {/* Add Custom Study Game Topic Stack / Question Builder */}
        <section
          aria-labelledby="add-game-stack-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3
                  id="add-game-stack-heading"
                  className="text-base font-bold text-slate-900 dark:text-slate-100"
                >
                  Add Custom Study Topic Card to Game Deck
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create your own active recall question stack and earn +100 Builder XP
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {customQuestions.length} custom cards
            </span>
          </div>

          <form onSubmit={handleAddCustomQuestion} className="mt-4 space-y-3" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="custom-game-topic"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Study Topic Title
                </label>
                <input
                  id="custom-game-topic"
                  type="text"
                  placeholder="e.g. B+ Tree Indexing & Page Splits"
                  value={customTopicTitle}
                  onChange={(e) => setCustomTopicTitle(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="custom-game-category"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Subject Category
                </label>
                <select
                  id="custom-game-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as StudyCategory)}
                  className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {STUDY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-game-prompt"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Recall Question Prompt
              </label>
              <input
                id="custom-game-prompt"
                type="text"
                placeholder="e.g. Why do relational databases prefer B+ Trees over binary search trees for disk storage?"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="custom-game-answer"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Correct Answer / Key Takeaway
              </label>
              <input
                id="custom-game-answer"
                type="text"
                placeholder="e.g. High node fanout reduces tree height and minimizes disk I/O page seeks"
                value={customCorrectAnswer}
                onChange={(e) => setCustomCorrectAnswer(e.target.value)}
                className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {customStatusMsg && (
              <p
                role="status"
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{customStatusMsg}</span>
              </p>
            )}

            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic Card to Study Game (+100 XP)</span>
            </button>
          </form>
        </section>
      </div>

      {/* Right 5 Columns: Friend Sign-In Connect & Study Circle Leaderboard */}
      <div className="lg:col-span-5 space-y-6">
        <section
          aria-labelledby="friend-connect-heading"
          data-testid="friend-connect-section"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h2
                id="friend-connect-heading"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Friend Sign-In & Study Circle Connect
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link with study partners via Friend Code or email to compare hours and XP
              </p>
            </div>
          </div>

          {/* Personal Invite Code Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Your Personal Friend Sign-In Code
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {myPersonalInviteCode}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="min-h-[36px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              {copiedMyCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Connect a Friend Form */}
          <form onSubmit={handleConnectSubmit} className="mt-4 space-y-3" noValidate>
            <div>
              <label
                htmlFor="friend-code-input"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Friend Sign-In Code or University Email
              </label>
              <input
                id="friend-code-input"
                type="text"
                placeholder="e.g. LECTRA-LIAM-07 or liam@stanford.edu"
                value={friendCodeOrEmail}
                onChange={(e) => setFriendCodeOrEmail(e.target.value)}
                className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="friend-name-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Friend Display Name
                </label>
                <input
                  id="friend-name-input"
                  type="text"
                  placeholder="e.g. Liam Chen"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="friend-subject-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Studying Subject
                </label>
                <select
                  id="friend-subject-select"
                  value={friendCategory}
                  onChange={(e) => setFriendCategory(e.target.value as StudyCategory)}
                  className="w-full min-h-[40px] px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {STUDY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {friendError && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {friendError}
              </p>
            )}
            {friendSuccess && (
              <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{friendSuccess}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Connect Friend to Study Circle</span>
            </button>
          </form>
        </section>

        {/* Connected Friends & Study Game Leaderboard */}
        <section
          aria-labelledby="study-leaderboard-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <h3
                id="study-leaderboard-heading"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Connected Friends & Topic XP Standings
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              {friends.length} Friends Linked
            </span>
          </div>

          <div className="mt-4 space-y-3" data-testid="friends-leaderboard-list">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.id}
                className={`p-3.5 rounded-xl border transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600/60 dark:border-blue-500/50'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {entry.displayName}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {entry.xpScore} XP · {entry.weeklyHours.toFixed(1)}h
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                  Studying: <span className="text-slate-700 dark:text-slate-300">{entry.activeTopic}</span> ({entry.topCategory})
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
