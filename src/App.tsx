/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StudyTrekState,
  StudyCategory,
  Weekday,
  ThemePreference,
  addStudyTask,
  toggleStudyTask,
  deleteStudyTask,
  addStudySession,
  addJournalEntry,
} from './utils/studyEngine';
import {
  auth,
  AuthenticatedAccount,
  onAuthStateChanged,
  loadUserLocalState,
  saveUserLocalState,
  ensureFirestoreUserProfile,
  subscribeToUserFirestoreData,
  syncCreateTaskToFirestore,
  syncToggleTaskInFirestore,
  syncDeleteDocFromFirestore,
  syncCreateSessionToFirestore,
  syncCreateJournalToFirestore,
  syncUpdateWeeklyGoalInFirestore,
  syncUpdateThemePreferenceInFirestore,
  signOutCurrentUser,
} from './services/firebaseService';
import { HomeView } from './components/HomeView';
import { JourneyView } from './components/JourneyView';
import { TodoView } from './components/TodoView';
import { StudyGameView } from './components/StudyGameView';
import { FlutterReleaseView } from './components/FlutterReleaseView';
import { AuthModal } from './components/AuthModal';
import { LogSessionModal } from './components/LogSessionModal';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Gamepad2,
  UserCheck,
  LogOut,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import {
  toggleDeviceWidget,
  connectStudyFriend,
  DEFAULT_DEVICE_WIDGETS,
  DEFAULT_STUDY_FRIENDS,
} from './utils/studyEngine';

type ActiveTab = 'home' | 'journey' | 'todos' | 'game' | 'flutter';

const PRESET_STUDENT_ACCOUNTS: AuthenticatedAccount[] = [
  {
    uid: 'student-alex-rivera',
    email: 'alex.rivera@stanford.edu',
    displayName: 'Alex Rivera (CS & Math)',
    emailVerified: false,
    provider: 'local-account',
    isCloudSynced: false,
  },
  {
    uid: 'student-priya-nair',
    email: 'priya.nair@mit.edu',
    displayName: 'Priya Nair (Physics & Systems)',
    emailVerified: false,
    provider: 'local-account',
    isCloudSynced: false,
  },
];

// Give the second preset student account distinct initial data so switching accounts visibly demonstrates strict UID data isolation
function ensureSecondAccountSeed() {
  const key = 'lectra_user_workspace_v1_student-priya-nair';
  if (!localStorage.getItem(key)) {
    const priyaState: StudyTrekState = {
      weeklyGoalHours: 30,
      themePreference: 'light',
      widgets: DEFAULT_DEVICE_WIDGETS,
      friends: DEFAULT_STUDY_FRIENDS,
      gameXp: 1450,
      sessions: [
        {
          id: 'priya-sess-1',
          ownerId: 'student-priya-nair',
          weekday: 'Mon',
          date: '2026-11-02',
          category: 'Physics',
          hours: 4.5,
          topic: 'Quantum Harmonic Oscillator & Ladder Operators',
        },
        {
          id: 'priya-sess-2',
          ownerId: 'student-priya-nair',
          weekday: 'Wed',
          date: '2026-11-04',
          category: 'Mathematics',
          hours: 5.0,
          topic: 'Partial Differential Equations & Fourier Series',
        },
        {
          id: 'priya-sess-3',
          ownerId: 'student-priya-nair',
          weekday: 'Fri',
          date: '2026-11-06',
          category: 'Systems Design',
          hours: 3.5,
          topic: 'Distributed Consensus & Raft Replication',
        },
      ],
      journal: [
        {
          id: 'priya-jrnl-1',
          ownerId: 'student-priya-nair',
          title: 'Deriving Creation and Annihilation Operators in Quantum Mechanics',
          category: 'Physics',
          date: '2026-11-08',
          weekday: 'Sun',
          hoursLogged: 4.5,
          focusRating: 5,
          reflection:
            'Solved the time-independent Schrödinger equation for the harmonic potential using algebraic ladder operators instead of power-series recursion.',
          keyTakeaway: 'Commutation relations [a, a†] = 1 yield the entire energy spectrum directly.',
        },
      ],
      tasks: [
        {
          id: 'priya-task-1',
          ownerId: 'student-priya-nair',
          title: 'Complete Quantum Mechanics Problem Set 7 (Wavefunction Normalization)',
          category: 'Physics',
          date: '2026-11-11',
          isCompleted: false,
          estimatedMinutes: 90,
          priority: 'High',
        },
        {
          id: 'priya-task-2',
          ownerId: 'student-priya-nair',
          title: 'Verify Raft leader election safety proofs',
          category: 'Systems Design',
          date: '2026-11-12',
          isCompleted: true,
          estimatedMinutes: 60,
          priority: 'Medium',
        },
      ],
    };
    localStorage.setItem(key, JSON.stringify(priyaState));
  }
}

export default function App() {
  ensureSecondAccountSeed();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentAccount, setCurrentAccount] = useState<AuthenticatedAccount>(() => {
    try {
      const savedAcct = localStorage.getItem('lectra_active_account_v1');
      if (savedAcct) {
        return JSON.parse(savedAcct) as AuthenticatedAccount;
      }
    } catch {
      // fallback
    }
    return PRESET_STUDENT_ACCOUNTS[0];
  });

  const [studyState, setStudyState] = useState<StudyTrekState>(() =>
    loadUserLocalState(currentAccount.uid)
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  // Sync the active user's themePreference with the root <html> element for Tailwind dark:* variants
  useEffect(() => {
    const isDark = studyState.themePreference === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [studyState.themePreference]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (firebaseUser) {
        const provider = firebaseUser.providerData.some(
          (p) => p.providerId === 'google.com'
        )
          ? 'google'
          : 'password';

        const acct: AuthenticatedAccount = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'Authenticated Student',
          emailVerified: firebaseUser.emailVerified,
          provider,
          isCloudSynced: firebaseUser.emailVerified,
        };
        setCurrentAccount(acct);
        localStorage.setItem('lectra_active_account_v1', JSON.stringify(acct));
        setStudyState(loadUserLocalState(firebaseUser.uid));

        if (firebaseUser.emailVerified) {
          try {
            await ensureFirestoreUserProfile(firebaseUser);
            unsubFirestore = subscribeToUserFirestoreData(firebaseUser, {
              onTasks: (tasks) =>
                setStudyState((prev) => ({ ...prev, tasks })),
              onSessions: (sessions) =>
                setStudyState((prev) => ({ ...prev, sessions })),
              onJournal: (journal) =>
                setStudyState((prev) => ({ ...prev, journal })),
              onWeeklyGoal: (weeklyGoalHours) =>
                setStudyState((prev) => ({ ...prev, weeklyGoalHours })),
              onThemePreference: (themePreference) =>
                setStudyState((prev) => ({ ...prev, themePreference })),
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  // Load isolated workspace data whenever currentAccount.uid changes
  const handleSelectAccount = (account: AuthenticatedAccount) => {
    setCurrentAccount(account);
    try {
      localStorage.setItem('lectra_active_account_v1', JSON.stringify(account));
    } catch {
      // ignore
    }
    setStudyState(loadUserLocalState(account.uid));
  };

  // Persist changes to the current authenticated user's isolated local store
  useEffect(() => {
    saveUserLocalState(currentAccount.uid, studyState);
  }, [currentAccount.uid, studyState]);

  // Toggle dark/light theme and persist to Firestore user profile + isolated account store
  const handleToggleTheme = () => {
    const nextTheme: ThemePreference =
      studyState.themePreference === 'dark' ? 'light' : 'dark';
    setStudyState((prev) => ({ ...prev, themePreference: nextTheme }));
    if (currentAccount.isCloudSynced) {
      syncUpdateThemePreferenceInFirestore(currentAccount.uid, nextTheme).catch(
        console.error
      );
    }
  };

  // Toggle Home Screen / Lock Screen Widget
  const handleToggleWidget = (widgetId: string) => {
    setStudyState((prev) => ({
      ...prev,
      widgets: toggleDeviceWidget(
        prev.widgets || DEFAULT_DEVICE_WIDGETS,
        widgetId
      ),
    }));
  };

  // Connect Friend via Friend Sign-In Code or Email
  const handleConnectFriend = (input: {
    friendCodeOrEmail: string;
    displayName?: string;
    topCategory?: StudyCategory;
  }): string | undefined => {
    const res = connectStudyFriend(
      studyState.friends || DEFAULT_STUDY_FRIENDS,
      input
    );
    if (res.error) return res.error;
    setStudyState((prev) => ({ ...prev, friends: res.friends }));
    return undefined;
  };

  // Earn XP in Study Game
  const handleEarnGameXp = (xpDelta: number) => {
    setStudyState((prev) => ({
      ...prev,
      gameXp: (prev.gameXp ?? 1320) + xpDelta,
    }));
  };

  // Handlers for Sessions
  const handleAddSession = (input: {
    weekday: Weekday;
    category: StudyCategory;
    hours: number;
    topic: string;
  }): string | undefined => {
    const res = addStudySession(studyState.sessions, {
      ...input,
      ownerId: currentAccount.uid,
    });
    if (res.error) return res.error;
    setStudyState((prev) => ({ ...prev, sessions: res.sessions }));
    if (res.added && currentAccount.isCloudSynced) {
      syncCreateSessionToFirestore(currentAccount.uid, res.added).catch(console.error);
    }
    return undefined;
  };

  const handleDeleteSession = (id: string) => {
    setStudyState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
    if (currentAccount.isCloudSynced) {
      syncDeleteDocFromFirestore(currentAccount.uid, 'sessions', id).catch(console.error);
    }
  };

  const handleUpdateWeeklyGoal = (weeklyGoalHours: number) => {
    setStudyState((prev) => ({ ...prev, weeklyGoalHours }));
    if (currentAccount.isCloudSynced) {
      syncUpdateWeeklyGoalInFirestore(currentAccount.uid, weeklyGoalHours).catch(
        console.error
      );
    }
  };

  // Handlers for Journey (Journal Entries)
  const handleAddJournalEntry = (input: {
    title: string;
    category: StudyCategory;
    date: string;
    weekday: Weekday;
    hoursLogged: number;
    focusRating: 1 | 2 | 3 | 4 | 5;
    reflection: string;
    keyTakeaway: string;
    syncToGraph: boolean;
  }): string | undefined => {
    const res = addJournalEntry(studyState.journal, {
      ...input,
      ownerId: currentAccount.uid,
    });
    if (res.error) return res.error;

    let updatedSessions = studyState.sessions;
    if (input.syncToGraph) {
      const sessRes = addStudySession(studyState.sessions, {
        weekday: input.weekday,
        category: input.category,
        hours: input.hoursLogged,
        topic: input.title,
        date: input.date,
        ownerId: currentAccount.uid,
      });
      if (!sessRes.error) {
        updatedSessions = sessRes.sessions;
        if (sessRes.added && currentAccount.isCloudSynced) {
          syncCreateSessionToFirestore(currentAccount.uid, sessRes.added).catch(
            console.error
          );
        }
      }
    }

    setStudyState((prev) => ({
      ...prev,
      journal: res.journal,
      sessions: updatedSessions,
    }));

    if (res.added && currentAccount.isCloudSynced) {
      syncCreateJournalToFirestore(currentAccount.uid, res.added).catch(console.error);
    }
    return undefined;
  };

  const handleDeleteJournalEntry = (id: string) => {
    setStudyState((prev) => ({
      ...prev,
      journal: prev.journal.filter((j) => j.id !== id),
    }));
    if (currentAccount.isCloudSynced) {
      syncDeleteDocFromFirestore(currentAccount.uid, 'journalEntries', id).catch(
        console.error
      );
    }
  };

  // Handlers for Todos (StudyTask Manager)
  const handleAddTask = (input: {
    title: string;
    category: StudyCategory;
    date: string;
    estimatedMinutes: number;
    priority: 'High' | 'Medium' | 'Low';
  }): string | undefined => {
    const res = addStudyTask(studyState.tasks, {
      ...input,
      ownerId: currentAccount.uid,
    });
    if (res.error) return res.error;
    setStudyState((prev) => ({ ...prev, tasks: res.tasks }));
    if (res.added && currentAccount.isCloudSynced) {
      syncCreateTaskToFirestore(currentAccount.uid, res.added).catch(console.error);
    }
    return undefined;
  };

  const handleToggleTask = (id: string) => {
    const target = studyState.tasks.find((t) => t.id === id);
    const updatedTasks = toggleStudyTask(studyState.tasks, id);
    setStudyState((prev) => ({ ...prev, tasks: updatedTasks }));
    if (target && currentAccount.isCloudSynced) {
      syncToggleTaskInFirestore(
        currentAccount.uid,
        id,
        !target.isCompleted
      ).catch(console.error);
    }
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = deleteStudyTask(studyState.tasks, id);
    setStudyState((prev) => ({ ...prev, tasks: updatedTasks }));
    if (currentAccount.isCloudSynced) {
      syncDeleteDocFromFirestore(currentAccount.uid, 'tasks', id).catch(console.error);
    }
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(`lectra_user_workspace_v1_${currentAccount.uid}`);
    ensureSecondAccountSeed();
    setStudyState(loadUserLocalState(currentAccount.uid));
  };

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } catch {
      // ignore if local account
    }
    const nextAcct =
      currentAccount.uid === PRESET_STUDENT_ACCOUNTS[0].uid
        ? PRESET_STUDENT_ACCOUNTS[1]
        : PRESET_STUDENT_ACCOUNTS[0];
    handleSelectAccount(nextAcct);
  };

  const isDark = studyState.themePreference === 'dark';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-12 transition-colors">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-14">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap shrink-0"
          >
            Lectra: Study Timer & Checklist
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('home');
              }}
              aria-current={activeTab === 'home' ? 'page' : undefined}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'home'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold underline decoration-blue-600 dark:decoration-blue-400 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-8'
              }`}
            >
              Home
            </a>
            <a
              href="#journey"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('journey');
              }}
              aria-current={activeTab === 'journey' ? 'page' : undefined}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'journey'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold underline decoration-blue-600 dark:decoration-blue-400 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-8'
              }`}
            >
              Journey
            </a>
            <a
              href="#todos"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('todos');
              }}
              aria-current={activeTab === 'todos' ? 'page' : undefined}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'todos'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold underline decoration-blue-600 dark:decoration-blue-400 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-8'
              }`}
            >
              Todos
            </a>
            <a
              href="#game"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('game');
              }}
              aria-current={activeTab === 'game' ? 'page' : undefined}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'game'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold underline decoration-blue-600 dark:decoration-blue-400 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-8'
              }`}
            >
              Study Game
            </a>
            <a
              href="#flutter"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('flutter');
              }}
              aria-current={activeTab === 'flutter' ? 'page' : undefined}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'flutter'
                  ? 'text-slate-900 dark:text-slate-100 font-semibold underline decoration-blue-600 dark:decoration-blue-400 decoration-2 underline-offset-8'
                  : 'hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-8'
              }`}
            >
              Flutter & ASO
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="min-h-[38px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Log Study Session
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Account Context Bar (Below the fold of the Top Bar) */}
      <div className="bg-slate-100/80 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100" data-testid="active-account-name">
              {currentAccount.displayName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {currentAccount.email || currentAccount.uid}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {currentAccount.isCloudSynced
                ? 'Firebase Auth + Firestore Synced'
                : 'Account-Scoped Local + Firebase Auth Ready'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dark / Light Theme Toggle persisted in Firestore profile & account workspace */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label="Toggle dark theme"
              aria-pressed={isDark}
              data-testid="theme-toggle-button"
              className="min-h-[34px] px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[34px] px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Firebase & Friend Sign-In
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out or switch active student account"
              className="min-h-[34px] px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch User</span>
            </button>
            <button
              type="button"
              onClick={handleResetDemoData}
              aria-label="Reset current account demo data"
              className="min-h-[34px] px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'home' && (
          <HomeView
            state={studyState}
            onAddSession={handleAddSession}
            onDeleteSession={handleDeleteSession}
            onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyView
            journal={studyState.journal}
            onAddEntry={handleAddJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        )}

        {activeTab === 'todos' && (
          <TodoView
            state={studyState}
            tasks={studyState.tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onToggleWidget={handleToggleWidget}
          />
        )}

        {activeTab === 'game' && (
          <StudyGameView
            state={studyState}
            currentAccountName={currentAccount.displayName}
            currentAccountUid={currentAccount.uid}
            onEarnXp={handleEarnGameXp}
            onConnectFriend={handleConnectFriend}
            onLogGameStudySession={(input) => {
              handleAddSession(input);
            }}
          />
        )}

        {activeTab === 'flutter' && <FlutterReleaseView state={studyState} />}
      </main>

      {/* Quiet Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Lectra: Study Timer & Checklist · Open-Source MIT License · Material 3 Architecture
        </span>
        <span>
          Data strictly isolated per authenticated UID ({currentAccount.uid}) · Theme: {studyState.themePreference}
        </span>
      </footer>

      {/* Mobile Material 3 Bottom NavigationBar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-14"
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('journey')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === 'journey'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Journey</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('todos')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === 'todos'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Todos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === 'game'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Game</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flutter')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeTab === 'flutter'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Code2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Flutter</span>
        </button>
      </nav>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentAccount={currentAccount}
        presetAccounts={PRESET_STUDENT_ACCOUNTS}
        onSelectAccount={handleSelectAccount}
        onConnectFriend={handleConnectFriend}
      />

      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddSession={handleAddSession}
      />
    </div>
  );
}
