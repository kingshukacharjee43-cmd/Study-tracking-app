import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  StudyTask,
  StudySession,
  JournalEntry,
  StudyTrekState,
  ThemePreference,
  INITIAL_STUDY_STATE,
  BLUEPRINT_LIMITS,
} from '../utils/studyEngine';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot (Mandatory skill check)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface AuthenticatedAccount {
  uid: string;
  email: string | null;
  displayName: string;
  emailVerified: boolean;
  provider: 'google' | 'password' | 'local-account';
  isCloudSynced: boolean;
}

// Sanitize ID to match ^[a-zA-Z0-9_\-]+$ and length <= 128
export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, BLUEPRINT_LIMITS.MAX_ID_LENGTH);
  return cleaned || `doc-${Date.now()}`;
}

// Per-user local storage key ensuring strict account data isolation even offline
export function getUserStorageKey(uid: string): string {
  return `lectra_user_workspace_v1_${sanitizeDocId(uid)}`;
}

export function loadUserLocalState(uid: string): StudyTrekState {
  try {
    const raw = localStorage.getItem(getUserStorageKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw) as StudyTrekState;
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.sessions)) {
        return {
          ...parsed,
          themePreference: parsed.themePreference === 'dark' ? 'dark' : 'light',
          widgets: Array.isArray(parsed.widgets)
            ? parsed.widgets
            : INITIAL_STUDY_STATE.widgets,
          friends: Array.isArray(parsed.friends)
            ? parsed.friends
            : INITIAL_STUDY_STATE.friends,
          gameXp: typeof parsed.gameXp === 'number' ? parsed.gameXp : INITIAL_STUDY_STATE.gameXp,
        };
      }
    }
  } catch {
    // fallback to initial state
  }
  const seeded: StudyTrekState = {
    weeklyGoalHours: INITIAL_STUDY_STATE.weeklyGoalHours,
    themePreference: INITIAL_STUDY_STATE.themePreference,
    widgets: INITIAL_STUDY_STATE.widgets,
    friends: INITIAL_STUDY_STATE.friends,
    gameXp: INITIAL_STUDY_STATE.gameXp,
    tasks: INITIAL_STUDY_STATE.tasks.map((t) => ({ ...t, ownerId: uid })),
    sessions: INITIAL_STUDY_STATE.sessions.map((s) => ({ ...s, ownerId: uid })),
    journal: INITIAL_STUDY_STATE.journal.map((j) => ({ ...j, ownerId: uid })),
  };
  saveUserLocalState(uid, seeded);
  return seeded;
}

export function saveUserLocalState(uid: string, state: StudyTrekState): void {
  try {
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

// Ensure /users/{uid} exists in Firestore for verified Firebase users
export async function ensureFirestoreUserProfile(
  user: User,
  weeklyGoalHours = 25,
  themePreference: ThemePreference = 'light'
): Promise<boolean> {
  if (!user.emailVerified) {
    return false;
  }
  const userPath = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const safeDisplayName = (
      user.displayName ||
      user.email?.split('@')[0] ||
      'Student'
    )
      .trim()
      .slice(0, BLUEPRINT_LIMITS.MAX_DISPLAY_NAME_LENGTH);

    if (!snap.exists()) {
      await setDoc(userRef, {
        ownerId: user.uid,
        displayName: safeDisplayName || 'Student',
        weeklyGoalHours: Math.min(168, Math.max(1, Math.round(weeklyGoalHours))),
        themePreference: themePreference === 'dark' ? 'dark' : 'light',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Seed initial tasks, sessions, and journal entries for the new verified user
      const seed = loadUserLocalState(user.uid);
      for (const t of seed.tasks) {
        await syncCreateTaskToFirestore(user.uid, t);
      }
      for (const s of seed.sessions) {
        await syncCreateSessionToFirestore(user.uid, s);
      }
      for (const j of seed.journal) {
        await syncCreateJournalToFirestore(user.uid, j);
      }
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function syncCreateTaskToFirestore(uid: string, task: StudyTask): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const docId = sanitizeDocId(task.id);
  const path = `tasks/${docId}`;
  try {
    await setDoc(doc(db, 'tasks', docId), {
      ownerId: uid,
      title: task.title.trim().slice(0, BLUEPRINT_LIMITS.MAX_TITLE_LENGTH),
      category: task.category,
      date: task.date,
      isCompleted: Boolean(task.isCompleted),
      estimatedMinutes: Math.min(
        BLUEPRINT_LIMITS.MAX_ESTIMATED_MINUTES,
        Math.max(BLUEPRINT_LIMITS.MIN_ESTIMATED_MINUTES, Math.round(task.estimatedMinutes))
      ),
      priority: task.priority,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncToggleTaskInFirestore(
  uid: string,
  taskId: string,
  isCompleted: boolean
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const docId = sanitizeDocId(taskId);
  const path = `tasks/${docId}`;
  try {
    await updateDoc(doc(db, 'tasks', docId), {
      isCompleted: Boolean(isCompleted),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncDeleteDocFromFirestore(
  uid: string,
  collectionName: 'tasks' | 'sessions' | 'journalEntries',
  rawId: string
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const docId = sanitizeDocId(rawId);
  const path = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncCreateSessionToFirestore(
  uid: string,
  session: StudySession
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const docId = sanitizeDocId(session.id);
  const path = `sessions/${docId}`;
  try {
    await setDoc(doc(db, 'sessions', docId), {
      ownerId: uid,
      weekday: session.weekday,
      date: session.date,
      category: session.category,
      hours: Math.min(
        BLUEPRINT_LIMITS.MAX_HOURS,
        Math.max(BLUEPRINT_LIMITS.MIN_HOURS, Math.round(session.hours * 10) / 10)
      ),
      topic: session.topic.trim().slice(0, BLUEPRINT_LIMITS.MAX_TOPIC_LENGTH),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncCreateJournalToFirestore(
  uid: string,
  entry: JournalEntry
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const docId = sanitizeDocId(entry.id);
  const path = `journalEntries/${docId}`;
  try {
    await setDoc(doc(db, 'journalEntries', docId), {
      ownerId: uid,
      title: entry.title.trim().slice(0, BLUEPRINT_LIMITS.MAX_TITLE_LENGTH),
      category: entry.category,
      date: entry.date,
      weekday: entry.weekday,
      hoursLogged: Math.min(
        BLUEPRINT_LIMITS.MAX_HOURS,
        Math.max(BLUEPRINT_LIMITS.MIN_HOURS, Math.round(entry.hoursLogged * 10) / 10)
      ),
      focusRating: Math.min(5, Math.max(1, Math.round(entry.focusRating))),
      reflection: entry.reflection.trim().slice(0, BLUEPRINT_LIMITS.MAX_REFLECTION_LENGTH),
      keyTakeaway: entry.keyTakeaway.trim().slice(0, BLUEPRINT_LIMITS.MAX_TAKEAWAY_LENGTH),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncUpdateWeeklyGoalInFirestore(
  uid: string,
  weeklyGoalHours: number
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      weeklyGoalHours: Math.min(168, Math.max(1, Math.round(weeklyGoalHours))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncUpdateThemePreferenceInFirestore(
  uid: string,
  themePreference: ThemePreference
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      themePreference: themePreference === 'dark' ? 'dark' : 'light',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Subscribe to real-time Firestore collections scoped strictly to ownerId == uid
export function subscribeToUserFirestoreData(
  user: User,
  callbacks: {
    onTasks: (tasks: StudyTask[]) => void;
    onSessions: (sessions: StudySession[]) => void;
    onJournal: (entries: JournalEntry[]) => void;
    onWeeklyGoal: (goal: number) => void;
    onThemePreference: (theme: ThemePreference) => void;
  }
): Unsubscribe {
  if (!user.emailVerified) {
    return () => {};
  }

  const uid = user.uid;
  const unsubUser = onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.weeklyGoalHours === 'number') {
          callbacks.onWeeklyGoal(data.weeklyGoalHours);
        }
        if (data.themePreference === 'dark' || data.themePreference === 'light') {
          callbacks.onThemePreference(data.themePreference);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  );

  const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', uid));
  const unsubTasks = onSnapshot(
    tasksQuery,
    (snap) => {
      const items: StudyTask[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ownerId: data.ownerId,
          title: data.title,
          category: data.category,
          date: data.date,
          isCompleted: Boolean(data.isCompleted),
          estimatedMinutes: Number(data.estimatedMinutes) || 45,
          priority: data.priority || 'Medium',
        };
      });
      if (items.length > 0) {
        callbacks.onTasks(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    }
  );

  const sessionsQuery = query(collection(db, 'sessions'), where('ownerId', '==', uid));
  const unsubSessions = onSnapshot(
    sessionsQuery,
    (snap) => {
      const items: StudySession[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ownerId: data.ownerId,
          weekday: data.weekday,
          date: data.date,
          category: data.category,
          hours: Number(data.hours) || 1,
          topic: data.topic,
        };
      });
      if (items.length > 0) {
        callbacks.onSessions(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    }
  );

  const journalQuery = query(collection(db, 'journalEntries'), where('ownerId', '==', uid));
  const unsubJournal = onSnapshot(
    journalQuery,
    (snap) => {
      const items: JournalEntry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ownerId: data.ownerId,
          title: data.title,
          category: data.category,
          date: data.date,
          weekday: data.weekday,
          hoursLogged: Number(data.hoursLogged) || 1,
          focusRating: (Number(data.focusRating) as 1 | 2 | 3 | 4 | 5) || 5,
          reflection: data.reflection,
          keyTakeaway: data.keyTakeaway,
        };
      });
      if (items.length > 0) {
        callbacks.onJournal(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'journalEntries');
    }
  );

  return () => {
    unsubUser();
    unsubTasks();
    unsubSessions();
    unsubJournal();
  };
}

// Auth Actions
export async function loginWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureFirestoreUserProfile(result.user);
  return result.user;
}

export async function loginWithEmailPassword(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (result.user.emailVerified) {
    await ensureFirestoreUserProfile(result.user);
  }
  return result.user;
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const cleanName = displayName.trim().slice(0, BLUEPRINT_LIMITS.MAX_DISPLAY_NAME_LENGTH);
  if (cleanName) {
    await updateProfile(result.user, { displayName: cleanName });
  }
  try {
    await sendEmailVerification(result.user);
  } catch {
    // non-fatal if verification email throttled
  }
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged, sendEmailVerification };
export type { User };
