export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type StudyCategory =
  | 'Computer Science'
  | 'Mathematics'
  | 'Physics'
  | 'Literature'
  | 'Languages'
  | 'Systems Design';

export const STUDY_CATEGORIES: StudyCategory[] = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Literature',
  'Languages',
  'Systems Design',
];

// Blueprint-synchronized validation constants (matching firebase-blueprint.json & firestore.rules)
export const BLUEPRINT_LIMITS = {
  MAX_ID_LENGTH: 128,
  ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
  MAX_DISPLAY_NAME_LENGTH: 100,
  MAX_TITLE_LENGTH: 200,
  MAX_TOPIC_LENGTH: 200,
  MAX_REFLECTION_LENGTH: 2000,
  MAX_TAKEAWAY_LENGTH: 500,
  MIN_HOURS: 0.1,
  MAX_HOURS: 16,
  MIN_ESTIMATED_MINUTES: 1,
  MAX_ESTIMATED_MINUTES: 480,
} as const;

export interface StudyTask {
  id: string;
  ownerId?: string;
  title: string;
  category: StudyCategory;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  estimatedMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudySession {
  id: string;
  ownerId?: string;
  weekday: Weekday;
  date: string; // YYYY-MM-DD
  category: StudyCategory;
  hours: number;
  topic: string;
}

export interface JournalEntry {
  id: string;
  ownerId?: string;
  title: string;
  category: StudyCategory;
  date: string; // YYYY-MM-DD
  weekday: Weekday;
  hoursLogged: number;
  focusRating: 1 | 2 | 3 | 4 | 5;
  reflection: string;
  keyTakeaway: string;
}

export type ThemePreference = 'light' | 'dark';

export interface DeviceWidgetConfig {
  id: string;
  title: string;
  surface: 'home_screen' | 'lock_screen';
  sizeSpec: '4x2' | '2x2' | '2x1' | '1x1';
  description: string;
  enabled: boolean;
}

export interface StudyFriend {
  id: string;
  friendCode: string;
  displayName: string;
  email: string;
  avatarInitials: string;
  weeklyHours: number;
  streakDays: number;
  activeTopic: string;
  topCategory: StudyCategory;
  status: 'Studying Now' | 'Completed Daily Goal' | 'In Study Game';
  xpScore: number;
}

export interface StudyTrekState {
  tasks: StudyTask[];
  sessions: StudySession[];
  journal: JournalEntry[];
  weeklyGoalHours: number;
  themePreference: ThemePreference;
  widgets?: DeviceWidgetConfig[];
  friends?: StudyFriend[];
  gameXp?: number;
}

export const DEFAULT_DEVICE_WIDGETS: DeviceWidgetConfig[] = [
  {
    id: 'widget-home-wellbeing',
    title: 'Digital Wellbeing Focus Ring',
    surface: 'home_screen',
    sizeSpec: '2x2',
    description: 'Live radial subject focus breakdown, daily screen-on study time, and target ring',
    enabled: true,
  },
  {
    id: 'widget-home-checklist',
    title: 'Subject Todo Checklist',
    surface: 'home_screen',
    sizeSpec: '4x2',
    description: 'Interactive Material 3 checklist to tick off pending StudyTask items from Home Screen',
    enabled: true,
  },
  {
    id: 'widget-home-graph',
    title: 'Weekly Study Curve & Timer',
    surface: 'home_screen',
    sizeSpec: '4x2',
    description: 'Mini fl_chart area gradient with 1-tap 25m Pomodoro focus launcher',
    enabled: false,
  },
  {
    id: 'widget-lock-next-task',
    title: 'Lock Screen Next Priority Task',
    surface: 'lock_screen',
    sizeSpec: '2x1',
    description: 'Android 15 Glance Lock Screen pill displaying top High-priority due task & countdown',
    enabled: true,
  },
  {
    id: 'widget-lock-streak-ring',
    title: 'Lock Screen Daily Goal Ring',
    surface: 'lock_screen',
    sizeSpec: '1x1',
    description: 'Compact circular complication showing daily study hours vs goal & streak flame',
    enabled: true,
  },
];

export const DEFAULT_STUDY_FRIENDS: StudyFriend[] = [
  {
    id: 'friend-priya',
    friendCode: 'LECTRA-PRIYA-42',
    displayName: 'Priya Nair',
    email: 'priya.nair@mit.edu',
    avatarInitials: 'PN',
    weeklyHours: 23.5,
    streakDays: 12,
    activeTopic: 'Quantum Harmonic Oscillator & Ladder Operators',
    topCategory: 'Physics',
    status: 'Studying Now',
    xpScore: 1450,
  },
  {
    id: 'friend-maya',
    friendCode: 'LECTRA-MAYA-19',
    displayName: 'Maya Lin',
    email: 'maya.lin@berkeley.edu',
    avatarInitials: 'ML',
    weeklyHours: 19.8,
    streakDays: 9,
    activeTopic: 'Distributed Consensus & Raft Replication',
    topCategory: 'Systems Design',
    status: 'Completed Daily Goal',
    xpScore: 1280,
  },
];

export interface PlayStoreNameCandidate {
  title: string;
  charCount: number;
  positioning: string;
  primaryKeywords: string[];
}

export const PLAY_STORE_NAME_CANDIDATES: PlayStoreNameCandidate[] = [
  {
    title: 'Lectra: Study Timer & Checklist',
    charCount: 30,
    positioning: 'Selected Official App Name — High-converting functional keywords with distinctive brand recall',
    primaryKeywords: ['Study Timer', 'Checklist', 'Study Tracker'],
  },
  {
    title: 'StudyTrek: Study Log & Graphs',
    charCount: 29,
    positioning: 'High-volume organic search match for visual progress graphing',
    primaryKeywords: ['Study Log', 'Study Graphs', 'Progress Tracker'],
  },
  {
    title: 'ScholarTrek: Study Time Tracker',
    charCount: 30,
    positioning: 'Academic and university research focus',
    primaryKeywords: ['Study Time Tracker', 'Academic Log'],
  },
  {
    title: 'Krono: Study Hours & Todo Log',
    charCount: 29,
    positioning: 'Short, memorable Gen-Z friendly brand with exact-match todo keywords',
    primaryKeywords: ['Study Hours', 'Todo Log', 'Focus'],
  },
  {
    title: 'AcaTrack: Study Graphs & Todo',
    charCount: 29,
    positioning: 'Clear academic positioning combining visual analytics and task checklists',
    primaryKeywords: ['Academic Tracker', 'Study Graphs', 'Todo'],
  },
  {
    title: 'OpenStudy: Offline Study Graph',
    charCount: 30,
    positioning: 'Open-source & privacy-first student community positioning',
    primaryKeywords: ['Offline Study', 'Open Source', 'Study Graph'],
  },
];

export const INITIAL_STUDY_STATE: StudyTrekState = {
  weeklyGoalHours: 25,
  themePreference: 'light',
  widgets: DEFAULT_DEVICE_WIDGETS,
  friends: DEFAULT_STUDY_FRIENDS,
  gameXp: 1320,
  sessions: [
    {
      id: 'sess-1',
      weekday: 'Mon',
      date: '2026-11-02',
      category: 'Computer Science',
      hours: 3.5,
      topic: 'Dart Async Streams & Riverpod Providers',
    },
    {
      id: 'sess-2',
      weekday: 'Tue',
      date: '2026-11-03',
      category: 'Mathematics',
      hours: 2.8,
      topic: 'Linear Algebra Eigenvalues & SVD',
    },
    {
      id: 'sess-3',
      weekday: 'Wed',
      date: '2026-11-04',
      category: 'Systems Design',
      hours: 4.2,
      topic: 'Offline-First SQLite & Hive Indexing',
    },
    {
      id: 'sess-4',
      weekday: 'Thu',
      date: '2026-11-05',
      category: 'Physics',
      hours: 3.0,
      topic: 'Electromagnetism Problem Set 4',
    },
    {
      id: 'sess-5',
      weekday: 'Fri',
      date: '2026-11-06',
      category: 'Computer Science',
      hours: 4.5,
      topic: 'Custom fl_chart Bezier Area Gradients',
    },
    {
      id: 'sess-6',
      weekday: 'Sat',
      date: '2026-11-07',
      category: 'Languages',
      hours: 2.0,
      topic: 'Technical Documentation & Open-Source RFCs',
    },
    {
      id: 'sess-7',
      weekday: 'Sun',
      date: '2026-11-08',
      category: 'Mathematics',
      hours: 1.5,
      topic: 'Probability Distributions Review',
    },
  ],
  journal: [
    {
      id: 'jrnl-1',
      title: 'Implementing Firebase Auth & Offline Hive Sync for Lectra',
      category: 'Computer Science',
      date: '2026-11-08',
      weekday: 'Sun',
      hoursLogged: 2.5,
      focusRating: 5,
      reflection:
        'Configured Firebase Authentication supporting Email/Password and Google Sign-In alongside typed Hive local boxes so each student account maintains isolated, offline-ready study checklists and weekly graphs.',
      keyTakeaway: 'Scope all Firestore queries and local box keys by request.auth.uid for strict multi-account isolation.',
    },
    {
      id: 'jrnl-2',
      title: 'Spectral Decomposition & Matrix Diagonalization',
      category: 'Mathematics',
      date: '2026-11-07',
      weekday: 'Sat',
      hoursLogged: 2.8,
      focusRating: 4,
      reflection:
        'Worked through 12 proofs on symmetric matrices and orthogonal eigenvectors. Drawing geometric transformations alongside algebraic steps resolved my confusion around singular values.',
      keyTakeaway: 'Every real symmetric matrix can be diagonalized by an orthogonal matrix of its eigenvectors.',
    },
    {
      id: 'jrnl-3',
      title: 'Designing Material 3 NavigationBar & fl_chart Area Gradients',
      category: 'Systems Design',
      date: '2026-11-06',
      weekday: 'Fri',
      hoursLogged: 4.2,
      focusRating: 5,
      reflection:
        'Mapped weekly study hours to a smooth cubic curve with a translucent blue-to-transparent gradient beneath the line. Ensured touch targets meet 48dp Material 3 accessibility standards.',
      keyTakeaway: 'Visualizing cumulative weekly hours motivates consistent daily study habits.',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Write Hive Database manager for StudyTask model (add, toggle, read)',
      category: 'Computer Science',
      date: '2026-11-09',
      isCompleted: true,
      estimatedMinutes: 45,
      priority: 'High',
    },
    {
      id: 'task-2',
      title: 'Configure Firebase Auth (Email/Password + Google Sign-In) & UID scoping',
      category: 'Computer Science',
      date: '2026-11-09',
      isCompleted: true,
      estimatedMinutes: 60,
      priority: 'High',
    },
    {
      id: 'task-3',
      title: 'Complete Linear Algebra Chapter 6 Problem Set (Eigenvalues)',
      category: 'Mathematics',
      date: '2026-11-10',
      isCompleted: false,
      estimatedMinutes: 90,
      priority: 'High',
    },
    {
      id: 'task-4',
      title: 'Draft README.md and CONTRIBUTING.md for Lectra open-source repo',
      category: 'Languages',
      date: '2026-11-11',
      isCompleted: false,
      estimatedMinutes: 40,
      priority: 'Medium',
    },
    {
      id: 'task-5',
      title: 'Solve Maxwell Equations boundary condition derivations',
      category: 'Physics',
      date: '2026-11-12',
      isCompleted: false,
      estimatedMinutes: 75,
      priority: 'Medium',
    },
    {
      id: 'task-6',
      title: 'Compile signed Android App Bundle (.aab) & publish Lectra to Play Store',
      category: 'Systems Design',
      date: '2026-11-14',
      isCompleted: false,
      estimatedMinutes: 50,
      priority: 'Low',
    },
  ],
};

// --- Pure StudyTask Manager Methods (Prompt 2: add, toggle, read, delete) ---

export function addStudyTask(
  tasks: StudyTask[],
  input: {
    title: string;
    category: StudyCategory;
    date: string;
    estimatedMinutes?: number;
    priority?: 'High' | 'Medium' | 'Low';
    ownerId?: string;
  }
): { tasks: StudyTask[]; error?: string; added?: StudyTask } {
  const trimmedTitle = input.title.trim().slice(0, BLUEPRINT_LIMITS.MAX_TITLE_LENGTH);
  if (!trimmedTitle) {
    return { tasks, error: 'Task title is required.' };
  }
  if (!input.date || !BLUEPRINT_LIMITS.DATE_PATTERN.test(input.date)) {
    return { tasks, error: 'Valid due date (YYYY-MM-DD) is required.' };
  }
  const newTask: StudyTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: input.ownerId,
    title: trimmedTitle,
    category: input.category,
    date: input.date,
    isCompleted: false,
    estimatedMinutes:
      input.estimatedMinutes && input.estimatedMinutes > 0
        ? Math.min(
            BLUEPRINT_LIMITS.MAX_ESTIMATED_MINUTES,
            Math.max(BLUEPRINT_LIMITS.MIN_ESTIMATED_MINUTES, Math.round(input.estimatedMinutes))
          )
        : 45,
    priority: input.priority || 'Medium',
  };
  return {
    tasks: [newTask, ...tasks],
    added: newTask,
  };
}

export function toggleStudyTask(tasks: StudyTask[], taskId: string): StudyTask[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
  );
}

export function deleteStudyTask(tasks: StudyTask[], taskId: string): StudyTask[] {
  return tasks.filter((task) => task.id !== taskId);
}

export function readStudyTasks(
  tasks: StudyTask[],
  options?: {
    category?: StudyCategory | 'All';
    status?: 'all' | 'pending' | 'completed';
    search?: string;
  }
): StudyTask[] {
  return tasks.filter((task) => {
    if (options?.category && options.category !== 'All' && task.category !== options.category) {
      return false;
    }
    if (options?.status === 'pending' && task.isCompleted) {
      return false;
    }
    if (options?.status === 'completed' && !task.isCompleted) {
      return false;
    }
    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.trim().toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.category.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}

// --- Pure Study Session & Weekly Graph Methods (Prompt 3: Map<Weekday, hours>) ---

export function getWeeklyHoursMap(sessions: StudySession[]): Record<Weekday, number> {
  const base: Record<Weekday, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };
  for (const s of sessions) {
    if (base[s.weekday] !== undefined) {
      base[s.weekday] = Math.round((base[s.weekday] + s.hours) * 10) / 10;
    }
  }
  return base;
}

export function addStudySession(
  sessions: StudySession[],
  input: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
    date?: string;
    ownerId?: string;
  }
): { sessions: StudySession[]; error?: string; added?: StudySession } {
  const trimmedTopic = input.topic.trim().slice(0, BLUEPRINT_LIMITS.MAX_TOPIC_LENGTH);
  if (!trimmedTopic) {
    return { sessions, error: 'Study topic is required.' };
  }
  if (
    typeof input.hours !== 'number' ||
    Number.isNaN(input.hours) ||
    input.hours < BLUEPRINT_LIMITS.MIN_HOURS ||
    input.hours > BLUEPRINT_LIMITS.MAX_HOURS
  ) {
    return { sessions, error: 'Study duration must be between 0.1 and 16.0 hours.' };
  }
  const roundedHours = Math.round(input.hours * 10) / 10;
  const newSession: StudySession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: input.ownerId,
    weekday: input.weekday,
    date: input.date || '2026-11-09',
    category: input.category,
    hours: roundedHours,
    topic: trimmedTopic,
  };
  return {
    sessions: [newSession, ...sessions],
    added: newSession,
  };
}

export function addJournalEntry(
  journal: JournalEntry[],
  input: {
    title: string;
    category: StudyCategory;
    date: string;
    weekday: Weekday;
    hoursLogged: number;
    focusRating: 1 | 2 | 3 | 4 | 5;
    reflection: string;
    keyTakeaway: string;
    ownerId?: string;
  }
): { journal: JournalEntry[]; error?: string; added?: JournalEntry } {
  const title = input.title.trim().slice(0, BLUEPRINT_LIMITS.MAX_TITLE_LENGTH);
  const reflection = input.reflection.trim().slice(0, BLUEPRINT_LIMITS.MAX_REFLECTION_LENGTH);
  const keyTakeaway = input.keyTakeaway.trim().slice(0, BLUEPRINT_LIMITS.MAX_TAKEAWAY_LENGTH);

  if (!title) {
    return { journal, error: 'Journal entry title is required.' };
  }
  if (!reflection) {
    return { journal, error: 'Daily reflection log cannot be empty.' };
  }
  if (
    input.hoursLogged < BLUEPRINT_LIMITS.MIN_HOURS ||
    input.hoursLogged > BLUEPRINT_LIMITS.MAX_HOURS ||
    Number.isNaN(input.hoursLogged)
  ) {
    return { journal, error: 'Hours logged must be between 0.1 and 16.0.' };
  }

  const entry: JournalEntry = {
    id: `jrnl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: input.ownerId,
    title,
    category: input.category,
    date: input.date || '2026-11-09',
    weekday: input.weekday,
    hoursLogged: Math.round(input.hoursLogged * 10) / 10,
    focusRating: input.focusRating,
    reflection,
    keyTakeaway: keyTakeaway || 'Consistent daily review compounds retention.',
  };

  return {
    journal: [entry, ...journal],
    added: entry,
  };
}

export function calculateStudyMetrics(state: StudyTrekState) {
  const weeklyMap = getWeeklyHoursMap(state.sessions);
  const totalWeeklyHours =
    Math.round(
      Object.values(weeklyMap).reduce((sum, val) => sum + val, 0) * 10
    ) / 10;

  const activeDaysCount = WEEKDAYS.filter((day) => weeklyMap[day] > 0).length;
  const completedTasksCount = state.tasks.filter((t) => t.isCompleted).length;
  const totalTasksCount = state.tasks.length;
  const taskCompletionPct =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const goalProgressPct =
    state.weeklyGoalHours > 0
      ? Math.min(100, Math.round((totalWeeklyHours / state.weeklyGoalHours) * 100))
      : 0;

  const categoryHours: Record<StudyCategory, number> = {
    'Computer Science': 0,
    Mathematics: 0,
    Physics: 0,
    Literature: 0,
    Languages: 0,
    'Systems Design': 0,
  };

  for (const s of state.sessions) {
    categoryHours[s.category] =
      Math.round(((categoryHours[s.category] || 0) + s.hours) * 10) / 10;
  }

  let peakDay: Weekday = 'Mon';
  let peakHours = -1;
  for (const day of WEEKDAYS) {
    if (weeklyMap[day] > peakHours) {
      peakHours = weeklyMap[day];
      peakDay = day;
    }
  }

  return {
    weeklyMap,
    totalWeeklyHours,
    activeDaysCount,
    completedTasksCount,
    totalTasksCount,
    taskCompletionPct,
    goalProgressPct,
    categoryHours,
    peakDay,
    peakHours: Math.max(0, peakHours),
  };
}

// --- Digital Wellbeing Graph & Daily/Weekly/Monthly Achievements Engine ---

export interface WellbeingSubjectSlice {
  category: StudyCategory;
  sessionHours: number;
  completedTaskMinutes: number;
  pendingTaskMinutes: number;
  totalFocusMinutes: number;
  sharePct: number;
  strokeColor: string;
  bgClass: string;
}

const CATEGORY_WELLBEING_COLORS: Record<
  StudyCategory,
  { stroke: string; bg: string }
> = {
  'Computer Science': { stroke: '#2563eb', bg: 'bg-blue-600' },
  Mathematics: { stroke: '#0d9488', bg: 'bg-teal-600' },
  Physics: { stroke: '#7c3aed', bg: 'bg-violet-600' },
  'Systems Design': { stroke: '#f59e0b', bg: 'bg-amber-500' },
  Languages: { stroke: '#10b981', bg: 'bg-emerald-500' },
  Literature: { stroke: '#ec4899', bg: 'bg-pink-500' },
};

export function calculateDigitalWellbeingStats(state: StudyTrekState) {
  const rawSlices = STUDY_CATEGORIES.map((category) => {
    const sessionHours = state.sessions
      .filter((s) => s.category === category)
      .reduce((acc, s) => acc + s.hours, 0);
    const catTasks = state.tasks.filter((t) => t.category === category);
    const completedTaskMinutes = catTasks
      .filter((t) => t.isCompleted)
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const pendingTaskMinutes = catTasks
      .filter((t) => !t.isCompleted)
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const totalFocusMinutes = Math.round(sessionHours * 60 + completedTaskMinutes);

    return {
      category,
      sessionHours: Math.round(sessionHours * 10) / 10,
      completedTaskMinutes,
      pendingTaskMinutes,
      totalFocusMinutes,
      strokeColor: CATEGORY_WELLBEING_COLORS[category].stroke,
      bgClass: CATEGORY_WELLBEING_COLORS[category].bg,
    };
  });

  const grandTotalFocusMinutes = rawSlices.reduce(
    (sum, s) => sum + s.totalFocusMinutes,
    0
  );
  const totalPlannedTaskMinutes = state.tasks.reduce(
    (sum, t) => sum + t.estimatedMinutes,
    0
  );
  const totalCompletedTaskMinutes = state.tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const slices: WellbeingSubjectSlice[] = rawSlices.map((s) => ({
    ...s,
    sharePct:
      grandTotalFocusMinutes > 0
        ? Math.round((s.totalFocusMinutes / grandTotalFocusMinutes) * 100)
        : 0,
  }));

  const wellbeingScore = Math.min(
    100,
    Math.round(
      (totalPlannedTaskMinutes > 0
        ? (totalCompletedTaskMinutes / totalPlannedTaskMinutes) * 55
        : 30) +
        Math.min(45, (grandTotalFocusMinutes / (state.weeklyGoalHours * 60 || 1500)) * 45)
    )
  );

  return {
    slices,
    grandTotalFocusMinutes,
    grandTotalFocusHours: Math.round((grandTotalFocusMinutes / 60) * 10) / 10,
    totalPlannedTaskMinutes,
    totalCompletedTaskMinutes,
    wellbeingScore,
  };
}

export type AchievementPeriod = 'daily' | 'weekly' | 'monthly';

export interface AchievementBadge {
  id: string;
  title: string;
  subtitle: string;
  currentLabel: string;
  targetLabel: string;
  progressPct: number;
  unlocked: boolean;
}

export interface PeriodAchievementSummary {
  period: AchievementPeriod;
  headlineStat: string;
  headlineSubtext: string;
  secondaryStat: string;
  tertiaryStat: string;
  badges: AchievementBadge[];
}

export function getPeriodAchievements(
  state: StudyTrekState,
  period: AchievementPeriod
): PeriodAchievementSummary {
  const metrics = calculateStudyMetrics(state);
  const completedTasks = metrics.completedTasksCount;
  const totalTasks = metrics.totalTasksCount;
  const journalCount = state.journal.length;

  if (period === 'daily') {
    const todayHours = metrics.weeklyMap.Mon || metrics.peakHours || 3.5;
    const dailyGoal = Math.max(1, Math.round((state.weeklyGoalHours / 7) * 10) / 10);
    const dailyPct = Math.min(100, Math.round((todayHours / dailyGoal) * 100));

    return {
      period: 'daily',
      headlineStat: `${todayHours.toFixed(1)}h / ${dailyGoal.toFixed(1)}h`,
      headlineSubtext: 'Daily Deep-Work Screen Balance',
      secondaryStat: `${completedTasks} tasks checked off`,
      tertiaryStat: `${dailyPct}% of daily focus target`,
      badges: [
        {
          id: 'daily-sprinter',
          title: 'Deep Work Sprinter',
          subtitle: 'Log at least 2.0 hours of focused study in a single day',
          currentLabel: `${todayHours.toFixed(1)}h`,
          targetLabel: '2.0h',
          progressPct: Math.min(100, Math.round((todayHours / 2.0) * 100)),
          unlocked: todayHours >= 2.0,
        },
        {
          id: 'daily-checklist',
          title: 'Checklist Momentum',
          subtitle: 'Complete 2 or more Subject Todo tasks',
          currentLabel: `${completedTasks} done`,
          targetLabel: '2 tasks',
          progressPct: Math.min(100, Math.round((completedTasks / 2) * 100)),
          unlocked: completedTasks >= 2,
        },
        {
          id: 'daily-recall',
          title: 'Active Recall Scribe',
          subtitle: 'Record at least 1 structured study reflection in Journey',
          currentLabel: `${journalCount} logged`,
          targetLabel: '1 entry',
          progressPct: Math.min(100, journalCount * 100),
          unlocked: journalCount >= 1,
        },
      ],
    };
  }

  if (period === 'weekly') {
    const activeSubjects = STUDY_CATEGORIES.filter(
      (c) => (metrics.categoryHours[c] || 0) > 0
    ).length;

    return {
      period: 'weekly',
      headlineStat: `${metrics.totalWeeklyHours.toFixed(1)}h / ${state.weeklyGoalHours}h`,
      headlineSubtext: 'Weekly Goal Progress & Consistency',
      secondaryStat: `${metrics.activeDaysCount}/7 active days`,
      tertiaryStat: `${activeSubjects} subjects studied`,
      badges: [
        {
          id: 'weekly-streak',
          title: '7-Day Consistency Streak',
          subtitle: 'Log study sessions across all 7 weekdays (Mon–Sun)',
          currentLabel: `${metrics.activeDaysCount}/7 days`,
          targetLabel: '7 days',
          progressPct: Math.min(100, Math.round((metrics.activeDaysCount / 7) * 100)),
          unlocked: metrics.activeDaysCount >= 7,
        },
        {
          id: 'weekly-polymath',
          title: 'Multi-Subject Polymath',
          subtitle: 'Distribute focus across at least 4 distinct academic subjects',
          currentLabel: `${activeSubjects} subjects`,
          targetLabel: '4 subjects',
          progressPct: Math.min(100, Math.round((activeSubjects / 4) * 100)),
          unlocked: activeSubjects >= 4,
        },
        {
          id: 'weekly-goal-crusher',
          title: 'Weekly Target Finisher',
          subtitle: `Reach 100% of your ${state.weeklyGoalHours}h weekly study goal`,
          currentLabel: `${metrics.totalWeeklyHours.toFixed(1)}h`,
          targetLabel: `${state.weeklyGoalHours}h`,
          progressPct: metrics.goalProgressPct,
          unlocked: metrics.totalWeeklyHours >= state.weeklyGoalHours,
        },
      ],
    };
  }

  // Monthly
  const monthlyHours = Math.round(metrics.totalWeeklyHours * 4 * 10) / 10;
  const monthlyTarget = state.weeklyGoalHours * 4;
  const monthlyPct = Math.min(100, Math.round((monthlyHours / monthlyTarget) * 100));
  const monthlyTasksCompleted = completedTasks * 4;

  return {
    period: 'monthly',
    headlineStat: `${monthlyHours.toFixed(1)}h / ${monthlyTarget}h`,
    headlineSubtext: '30-Day Cumulative Study Projection',
    secondaryStat: `${monthlyTasksCompleted} monthly tasks mastered`,
    tertiaryStat: `${monthlyPct}% monthly pace`,
    badges: [
      {
        id: 'monthly-centurion',
        title: 'Centurion Scholar (80h+ Month)',
        subtitle: 'Sustain an 80+ hour monthly study pace across 4 weeks',
        currentLabel: `${monthlyHours.toFixed(0)}h`,
        targetLabel: '80h',
        progressPct: Math.min(100, Math.round((monthlyHours / 80) * 100)),
        unlocked: monthlyHours >= 80,
      },
      {
        id: 'monthly-zero-backlog',
        title: 'Checklist Master',
        subtitle: 'Maintain at least 50% completion across all subject checklists',
        currentLabel: `${metrics.taskCompletionPct}%`,
        targetLabel: '50%',
        progressPct: Math.min(100, Math.round((metrics.taskCompletionPct / 50) * 100)),
        unlocked: metrics.taskCompletionPct >= 50,
      },
      {
        id: 'monthly-journal-habit',
        title: 'Reflective Researcher',
        subtitle: 'Build a repository of 3+ high-depth study journal takeaways',
        currentLabel: `${journalCount} entries`,
        targetLabel: '3 entries',
        progressPct: Math.min(100, Math.round((journalCount / 3) * 100)),
        unlocked: journalCount >= 3,
      },
    ],
  };
}

// --- Home Screen & Lock Screen Widget Management ---

export function toggleDeviceWidget(
  widgets: DeviceWidgetConfig[],
  widgetId: string
): DeviceWidgetConfig[] {
  return widgets.map((w) =>
    w.id === widgetId ? { ...w, enabled: !w.enabled } : w
  );
}

// --- Friend Sign-In & Study Circle Connect ---

export function connectStudyFriend(
  friends: StudyFriend[],
  input: {
    friendCodeOrEmail: string;
    displayName?: string;
    topCategory?: StudyCategory;
  }
): { friends: StudyFriend[]; error?: string; added?: StudyFriend } {
  const raw = input.friendCodeOrEmail.trim();
  if (!raw || raw.length < 3) {
    return {
      friends,
      error: 'Enter a valid Friend Invite Code (e.g. LECTRA-LIAM-07) or friend email.',
    };
  }

  const normalized = raw.toLowerCase();
  const duplicate = friends.find(
    (f) =>
      f.friendCode.toLowerCase() === normalized ||
      f.email.toLowerCase() === normalized
  );
  if (duplicate) {
    return {
      friends,
      error: `${duplicate.displayName} is already connected in your Study Circle.`,
    };
  }

  const isEmail = raw.includes('@');
  const derivedName =
    input.displayName?.trim() ||
    (isEmail
      ? raw
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : raw
          .replace(/^LECTRA-/i, '')
          .replace(/-\d+$/, '')
          .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Study Partner');

  const initials = derivedName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP';

  const category = input.topCategory || 'Computer Science';
  const generatedCode = isEmail
    ? `LECTRA-${derivedName.split(' ')[0].toUpperCase().slice(0, 6)}-${Math.floor(10 + (raw.length * 7) % 89)}`
    : raw.toUpperCase();

  const newFriend: StudyFriend = {
    id: `friend-${Date.now()}`,
    friendCode: generatedCode,
    displayName: derivedName,
    email: isEmail ? raw.toLowerCase() : `${derivedName.toLowerCase().replace(/\s+/g, '.')}@study.edu`,
    avatarInitials: initials,
    weeklyHours: 18.5,
    streakDays: 7,
    activeTopic: `Studying ${category} Problem Sets`,
    topCategory: category,
    status: 'Studying Now',
    xpScore: 1190,
  };

  return {
    friends: [newFriend, ...friends],
    added: newFriend,
  };
}

// --- Topic-Driven Study Game Generator (Built from Active Studying Topics) ---

export interface StudyGameQuestion {
  id: string;
  category: StudyCategory;
  sourceLabel: string;
  topicTitle: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export function generateStudyGameQuestions(
  state: StudyTrekState,
  categoryFilter: StudyCategory | 'All' = 'All'
): StudyGameQuestion[] {
  const questions: StudyGameQuestion[] = [];

  // 1. Dynamically synthesize questions directly from the user's logged study sessions, journal takeaways, and checklist tasks
  for (const entry of state.journal) {
    if (categoryFilter !== 'All' && entry.category !== categoryFilter) continue;
    questions.push({
      id: `q-jrnl-${entry.id}`,
      category: entry.category,
      sourceLabel: `From Your Journey Log (${entry.date})`,
      topicTitle: entry.title,
      prompt: `While studying "${entry.title}" (${entry.category}), which key takeaway did you record for active recall?`,
      options: [
        entry.keyTakeaway,
        'Skip local indexing and query unindexed remote documents on every frame render.',
        'Ignore boundary conditions when solving non-linear differential systems.',
        'Use mutable global singletons without scoping state by user authentication UID.',
      ],
      correctIndex: 0,
      explanation: `Direct match from your ${entry.weekday} Journey reflection: "${entry.keyTakeaway}"`,
      xpReward: 120,
    });
  }

  for (const sess of state.sessions) {
    if (categoryFilter !== 'All' && sess.category !== categoryFilter) continue;
    const topicLower = sess.topic.toLowerCase();

    if (topicLower.includes('eigenvalue') || topicLower.includes('svd') || topicLower.includes('matrix') || sess.category === 'Mathematics') {
      questions.push({
        id: `q-sess-${sess.id}`,
        category: sess.category,
        sourceLabel: `From Your ${sess.weekday} Study Session (${sess.hours}h)`,
        topicTitle: sess.topic,
        prompt: `Active Topic Recall — "${sess.topic}": For a real symmetric matrix A, what property holds for its eigenvalues and eigenvectors?`,
        options: [
          'All eigenvalues are real and eigenvectors of distinct eigenvalues are orthogonal',
          'Eigenvalues are strictly imaginary unless the trace is zero',
          'The determinant equals the sum of the diagonal entries',
          'Symmetric matrices cannot be diagonalized over real numbers',
        ],
        correctIndex: 0,
        explanation: `Spectral theorem mastery for your ${sess.hours}h session on "${sess.topic}".`,
        xpReward: 100,
      });
    } else if (topicLower.includes('stream') || topicLower.includes('riverpod') || topicLower.includes('fl_chart') || sess.category === 'Computer Science') {
      questions.push({
        id: `q-sess-${sess.id}`,
        category: sess.category,
        sourceLabel: `From Your ${sess.weekday} Study Session (${sess.hours}h)`,
        topicTitle: sess.topic,
        prompt: `Active Topic Recall — "${sess.topic}": In Flutter reactive state & chart rendering, why do we scope local Hive boxes and Firestore queries by uid?`,
        options: [
          'To guarantee strict per-account data isolation and offline cache safety',
          'To disable garbage collection on the main UI isolate',
          'To force synchronous blocking network calls inside build()',
          'To bypass Material 3 theme color seed generation',
        ],
        correctIndex: 0,
        explanation: `Core concept from your ${sess.hours}h Computer Science session on "${sess.topic}".`,
        xpReward: 100,
      });
    } else if (sess.category === 'Physics') {
      questions.push({
        id: `q-sess-${sess.id}`,
        category: sess.category,
        sourceLabel: `From Your ${sess.weekday} Study Session (${sess.hours}h)`,
        topicTitle: sess.topic,
        prompt: `Active Topic Recall — "${sess.topic}": According to Faraday's Law of Electromagnetic Induction, what induces an electromotive force (EMF) in a closed loop?`,
        options: [
          'A time-varying magnetic flux passing through the loop surface',
          'A constant, uniform static electric field parallel to the wire',
          'Zero net magnetic flux with stationary conductors',
          'A purely gravitational potential gradient',
        ],
        correctIndex: 0,
        explanation: `Reinforces your ${sess.hours}h Physics session on "${sess.topic}".`,
        xpReward: 110,
      });
    } else if (sess.category === 'Systems Design') {
      questions.push({
        id: `q-sess-${sess.id}`,
        category: sess.category,
        sourceLabel: `From Your ${sess.weekday} Study Session (${sess.hours}h)`,
        topicTitle: sess.topic,
        prompt: `Active Topic Recall — "${sess.topic}": Why does an offline-first storage engine (like Hive or SQLite WAL) improve mobile study tracker reliability?`,
        options: [
          'Writes commit locally with zero network latency and sync asynchronously when online',
          'It requires a persistent 5G connection before rendering any UI widget',
          'It drops all local state whenever the app enters background mode',
          'It stores unindexed plain text inside system clipboard memory',
        ],
        correctIndex: 0,
        explanation: `Reinforces your ${sess.hours}h Systems Design session on "${sess.topic}".`,
        xpReward: 110,
      });
    } else {
      questions.push({
        id: `q-sess-${sess.id}`,
        category: sess.category,
        sourceLabel: `From Your ${sess.weekday} Study Session (${sess.hours}h)`,
        topicTitle: sess.topic,
        prompt: `Active Topic Recall — "${sess.topic}": What is the primary benefit of structured open-source RFCs and clear CONTRIBUTING.md documentation?`,
        options: [
          'Enables contributors to align on architecture, security rules, and testing standards',
          'Prevents external developers from running unit tests locally',
          'Replaces version control with manual file transfers',
          'Eliminates the need for semantic versioning',
        ],
        correctIndex: 0,
        explanation: `Reinforces your ${sess.hours}h session on "${sess.topic}".`,
        xpReward: 95,
      });
    }
  }

  for (const task of state.tasks.slice(0, 3)) {
    if (categoryFilter !== 'All' && task.category !== categoryFilter) continue;
    questions.push({
      id: `q-task-${task.id}`,
      category: task.category,
      sourceLabel: `From Your Todo Checklist (${task.priority} Priority)`,
      topicTitle: task.title,
      prompt: `Checklist Mastery Check — You have "${task.title}" (${task.estimatedMinutes}m est) in ${task.category}. What is the best execution strategy?`,
      options: [
        `Break the ${task.estimatedMinutes}m task into focused deep-work blocks and verify with unit tests`,
        'Context-switch every 3 minutes between unrelated subjects',
        'Mark the task complete without verifying edge cases or proofs',
        'Postpone high-priority tasks until after low-priority backlog items',
      ],
      correctIndex: 0,
      explanation: `Linked directly to your ${task.category} checklist task due ${task.date}.`,
      xpReward: 90,
    });
  }

  return questions;
}

// --- Dynamic Flutter & Open-Source Code / Documentation Generators ---

export function generateFlutterCodeArtifacts(state: StudyTrekState) {
  const metrics = calculateStudyMetrics(state);
  const mapEntries = WEEKDAYS.map(
    (d) => `    '${d}': ${metrics.weeklyMap[d].toFixed(1)},`
  ).join('\n');

  const mainDart = `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'services/auth_service.dart';
import 'widgets/study_line_chart.dart';
import 'models/study_task_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await Hive.initFlutter();
  runApp(const LectraStudyApp());
}

class LectraStudyApp extends StatelessWidget {
  const LectraStudyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lectra: Study Timer & Checklist',
      debugShowCheckedModeBanner: false,
      themeMode: ${state.themePreference === 'dark' ? 'ThemeMode.dark' : 'ThemeMode.light'},
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blueAccent,
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blueAccent,
        brightness: Brightness.dark,
      ),
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          final user = snapshot.data;
          if (user == null) {
            return const LectraAuthScreen();
          }
          return MainDashboard(user: user);
        },
      ),
    );
  }
}

class MainDashboard extends StatefulWidget {
  final User user;
  const MainDashboard({Key? key, required this.user}) : super(key: key);
  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  int _navIndex = 0;

  final Map<String, double> _weeklyHours = const {
${mapEntries}
  };

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      StudyHomeView(weeklyHours: _weeklyHours, uid: widget.user.uid),
      StudyJournalView(uid: widget.user.uid),
      StudyTodoScreen(uid: widget.user.uid),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lectra: Study Timer & Checklist'),
        actions: [
          IconButton(
            tooltip: 'Toggle Dark Theme',
            icon: const Icon(Icons.dark_mode_outlined),
            onPressed: () => AuthService.instance.updateThemePreference(
              widget.user.uid,
              '${state.themePreference === 'dark' ? 'light' : 'dark'}',
            ),
          ),
          IconButton(
            tooltip: 'Sign Out',
            icon: const Icon(Icons.logout),
            onPressed: () => AuthService.instance.signOut(),
          ),
        ],
      ),
      body: pages[_navIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _navIndex,
        onDestinationSelected: (idx) => setState(() => _navIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.auto_graph), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.menu_book), label: 'Journey'),
          NavigationDestination(icon: Icon(Icons.check_circle_outline), label: 'Todos'),
        ],
      ),
    );
  }
}`;

  const firebaseAuthDart = `import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;

  /// Email & Password Registration + UserProfile initialization
  Future<UserCredential> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    await cred.user?.updateDisplayName(displayName.trim());
    await cred.user?.sendEmailVerification();
    await _ensureUserProfile(cred.user!, displayName: displayName.trim());
    return cred;
  }

  /// Email & Password Sign-In
  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    return await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
  }

  /// Google Sign-In for Android / iOS / Web
  Future<UserCredential> signInWithGoogle() async {
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) {
      throw FirebaseAuthException(
        code: 'ERROR_ABORTED_BY_USER',
        message: 'Sign in aborted by user',
      );
    }
    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final userCred = await _auth.signInWithCredential(credential);
    if (userCred.user != null) {
      await _ensureUserProfile(userCred.user!);
    }
    return userCred;
  }

  /// Associates user workspace document in Firestore under /users/{uid}
  Future<void> _ensureUserProfile(User user, {String? displayName}) async {
    final docRef = _db.collection('users').doc(user.uid);
    final snapshot = await docRef.get();
    if (!snapshot.exists) {
      await docRef.set({
        'ownerId': user.uid,
        'displayName': displayName ?? user.displayName ?? 'Student',
        'weeklyGoalHours': ${state.weeklyGoalHours},
        'themePreference': '${state.themePreference}',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
  }

  /// Persist themePreference ('light' or 'dark') in Firestore /users/{uid}
  Future<void> updateThemePreference(String uid, String themePreference) async {
    await _db.collection('users').doc(uid).update({
      'themePreference': themePreference,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> signOut() async {
    await GoogleSignIn().signOut();
    await _auth.signOut();
  }
}`;

  const hiveTaskEngineDart = `import 'package:hive/hive.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class StudyTask {
  final String id;
  final String ownerId;
  final String title;
  final String category;
  final String date;
  final bool isCompleted;
  final int estimatedMinutes;
  final String priority;

  const StudyTask({
    required this.id,
    required this.ownerId,
    required this.title,
    required this.category,
    required this.date,
    this.isCompleted = false,
    this.estimatedMinutes = 45,
    this.priority = 'Medium',
  });

  StudyTask copyWith({bool? isCompleted}) {
    return StudyTask(
      id: id,
      ownerId: ownerId,
      title: title,
      category: category,
      date: date,
      isCompleted: isCompleted ?? this.isCompleted,
      estimatedMinutes: estimatedMinutes,
      priority: priority,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'ownerId': ownerId,
        'title': title,
        'category': category,
        'date': date,
        'isCompleted': isCompleted,
        'estimatedMinutes': estimatedMinutes,
        'priority': priority,
      };

  factory StudyTask.fromMap(Map<dynamic, dynamic> map) => StudyTask(
        id: map['id'] as String,
        ownerId: map['ownerId'] as String? ?? '',
        title: map['title'] as String,
        category: map['category'] as String,
        date: map['date'] as String,
        isCompleted: map['isCompleted'] as bool? ?? false,
        estimatedMinutes: (map['estimatedMinutes'] as num?)?.toInt() ?? 45,
        priority: map['priority'] as String? ?? 'Medium',
      );
}

class StudyTaskManager {
  /// Open a user-scoped Hive box so each authenticated account is strictly isolated
  static Future<Box<Map>> openUserBox(String uid) async {
    return await Hive.openBox<Map>('study_tasks_\$uid');
  }

  /// Read all tasks for the authenticated user
  static List<StudyTask> readTasks(Box<Map> box, String uid) {
    return box.values
        .map((raw) => StudyTask.fromMap(raw))
        .where((task) => task.ownerId == uid)
        .toList();
  }

  /// Add a new StudyTask to Hive and sync with Firestore /tasks/{taskId}
  static Future<void> addTask(Box<Map> box, StudyTask task) async {
    await box.put(task.id, task.toMap());
    await FirebaseFirestore.instance.collection('tasks').doc(task.id).set({
      'ownerId': task.ownerId,
      'title': task.title,
      'category': task.category,
      'date': task.date,
      'isCompleted': task.isCompleted,
      'estimatedMinutes': task.estimatedMinutes,
      'priority': task.priority,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Toggle completion status in Hive and Firestore
  static Future<void> toggleTask(Box<Map> box, String id) async {
    final existing = box.get(id);
    if (existing != null) {
      final task = StudyTask.fromMap(existing);
      final updated = task.copyWith(isCompleted: !task.isCompleted);
      await box.put(id, updated.toMap());
      await FirebaseFirestore.instance.collection('tasks').doc(id).update({
        'isCompleted': updated.isCompleted,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
  }
}`;

  const flChartWidgetDart = `import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class StudyProgressLineChart extends StatelessWidget {
  final Map<String, double> weeklyHours;

  const StudyProgressLineChart({
    Key? key,
    required this.weeklyHours,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final days = weeklyHours.keys.toList();
    final spots = List<FlSpot>.generate(
      days.length,
      (index) => FlSpot(index.toDouble(), weeklyHours[days[index]] ?? 0.0),
    );

    return AspectRatio(
      aspectRatio: 1.75,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 24, 24, 12),
        child: LineChart(
          LineChartData(
            minY: 0,
            gridData: FlGridData(show: true, drawVerticalLine: false),
            titlesData: FlTitlesData(
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) {
                    final idx = value.toInt();
                    if (idx < 0 || idx >= days.length) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(days[idx], style: const TextStyle(fontSize: 12)),
                    );
                  },
                ),
              ),
            ),
            borderData: FlBorderData(show: false),
            lineBarsData: [
              LineChartBarData(
                spots: spots,
                isCurved: true,
                color: Colors.blueAccent,
                barWidth: 3.5,
                dotData: const FlDotData(show: true),
                belowBarData: BarAreaData(
                  show: true,
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.blueAccent.withValues(alpha: 0.35),
                      Colors.blueAccent.withValues(alpha: 0.0),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;

  const readmeMd = `# Lectra: Study Timer & Checklist

**Lectra: Study Timer & Checklist** (formerly Study Trek) is an open-source, offline-first study progress tracker built with **Flutter (Material 3)**, **Firebase Authentication (Email/Password + Google Sign-In)**, **Cloud Firestore**, **Hive Local Storage**, and **fl_chart**.

## Core Architecture
- **Home (Progress Graphs & Focus Timer)**: Visualize weekly study hours (\`Mon\`–\`Sun\`) with customizable \`fl_chart\` area gradients and subject distributions. Currently tracking **${metrics.totalWeeklyHours} hrs** across **${metrics.activeDaysCount} active days**.
- **Journey (Daily Study Log)**: Record structured daily reflections, active recall takeaways, and focus depth ratings associated with your authenticated account.
- **Todos (Subject Checklists)**: Fast \`StudyTask\` engine backed by UID-scoped Hive boxes and Cloud Firestore (\`${metrics.completedTasksCount}/${metrics.totalTasksCount}\` tasks completed).
- **Firebase Authentication & Account Isolation**: Supports Email/Password and Google Sign-In. Every task, session, and journal log is strictly isolated by \`ownerId == request.auth.uid\`.

## Quick Start
\`\`\`bash
git clone https://github.com/lectra-app/lectra-study-tracker.git
cd lectra-study-tracker
flutter pub get
flutter run
\`\`\`

## Building for Google Play Store (.aab)
\`\`\`bash
flutter build appbundle --release
\`\`\`

## License
Distributed under the MIT License.`;

  const contributingMd = `# Contributing to Lectra: Study Timer & Checklist

Thank you for helping make **Lectra: Study Timer & Checklist** a welcoming, high-craft open-source study companion for students everywhere!

## Development Workflow
1. **Fork & Clone** the repository and create a feature branch (\`git checkout -b feat/pomodoro-presets\`).
2. **Respect Account Data Isolation**:
   - All Firestore mutations in \`lib/services/\` must include \`ownerId: currentUser.uid\` and adhere to \`firestore.rules\`.
   - Local Hive boxes must be keyed per user (\`study_tasks_\$uid\`).
3. **Run Tests & Linter**:
   - Execute \`flutter test\` and \`npx eslint firestore.rules\` before submitting a Pull Request.`;

  const playStoreAso = `App Name: Lectra: Study Timer & Checklist
Short Description (80 chars): Track study hours with visual graphs, focus timers, daily journals & checklists.

Full Google Play Store Description (ASO Optimized):
Build unstoppable academic momentum with Lectra: Study Timer & Checklist—the clean, open-source study tracker, focus timer, and subject checklist app built for students, researchers, and lifelong learners. Designed with Material You (Material 3) and seamless Firebase Authentication (Google Sign-In & Email/Password), Lectra keeps your study analytics synchronized and privately scoped to your personal account.

Key Features of Lectra: Study Timer & Checklist:
• Visual Weekly Progress Graphs: Watch your consistency compound with smooth, gradient-filled area and bar charts powered by fl_chart. Track study hours across every weekday, benchmark against your weekly goal (currently ${state.weeklyGoalHours}h/week), and inspect subject-level breakdowns.
• Deep-Work Study Timer & Session Logger: Run 25m, 45m, or 60m focus blocks and log completed study hours directly to your weekly progress graph with a single tap.
• Subject Todo Checklists: Organize problem sets, readings, and exam preparation across Computer Science, Mathematics, Physics, Literature, Languages, and Systems Design.
• Daily Study Journey Log: Strengthen long-term retention by writing daily study reflections, 1-sentence key takeaways, and focus depth ratings (1–5).
• Secure Account Sync & Open-Source Privacy: Sign in with Google or Email/Password to keep your study history tied strictly to your account, backed by zero-trust Firestore security rules and open-source transparency under the MIT License.`;

  return {
    mainDart,
    firebaseAuthDart,
    hiveTaskEngineDart,
    flChartWidgetDart,
    readmeMd,
    contributingMd,
    playStoreAso,
  };
}
