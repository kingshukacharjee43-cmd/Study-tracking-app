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

export interface StudyTrekState {
  tasks: StudyTask[];
  sessions: StudySession[];
  journal: JournalEntry[];
  weeklyGoalHours: number;
}

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
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blueAccent,
        brightness: Brightness.light,
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
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
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
