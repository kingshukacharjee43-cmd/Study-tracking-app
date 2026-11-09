import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDY_STATE,
  PLAY_STORE_NAME_CANDIDATES,
  DEFAULT_DEVICE_WIDGETS,
  DEFAULT_STUDY_FRIENDS,
  addStudyTask,
  toggleStudyTask,
  deleteStudyTask,
  readStudyTasks,
  getWeeklyHoursMap,
  addStudySession,
  addJournalEntry,
  calculateStudyMetrics,
  calculateDigitalWellbeingStats,
  getPeriodAchievements,
  toggleDeviceWidget,
  connectStudyFriend,
  generateStudyGameQuestions,
  generateFlutterCodeArtifacts,
} from './studyEngine';

test('StudyTask engine: add, toggle, read, and delete methods work deterministically with ownerId', () => {
  const initialTasks = INITIAL_STUDY_STATE.tasks;

  const invalidAdd = addStudyTask(initialTasks, {
    title: '   ',
    category: 'Mathematics',
    date: '2026-11-15',
  });
  assert.ok(invalidAdd.error);
  assert.equal(invalidAdd.tasks.length, initialTasks.length);

  const validAdd = addStudyTask(initialTasks, {
    title: 'Derive Fourier Transform pairs',
    category: 'Mathematics',
    date: '2026-11-15',
    estimatedMinutes: 60,
    priority: 'High',
    ownerId: 'user_test_1',
  });
  assert.equal(validAdd.error, undefined);
  assert.equal(validAdd.tasks.length, initialTasks.length + 1);
  assert.equal(validAdd.added?.title, 'Derive Fourier Transform pairs');
  assert.equal(validAdd.added?.ownerId, 'user_test_1');
  assert.equal(validAdd.added?.isCompleted, false);

  const addedId = validAdd.added!.id;
  const toggled = toggleStudyTask(validAdd.tasks, addedId);
  const foundAfterToggle = toggled.find((t) => t.id === addedId);
  assert.equal(foundAfterToggle?.isCompleted, true);

  const mathCompleted = readStudyTasks(toggled, {
    category: 'Mathematics',
    status: 'completed',
  });
  assert.ok(mathCompleted.some((t) => t.id === addedId));

  const afterDelete = deleteStudyTask(toggled, addedId);
  assert.equal(afterDelete.length, initialTasks.length);
});

test('Weekly study hours graph aggregation maps Mon-Sun accurately', () => {
  const weeklyMap = getWeeklyHoursMap(INITIAL_STUDY_STATE.sessions);
  assert.equal(weeklyMap.Mon, 3.5);
  assert.equal(weeklyMap.Fri, 4.5);

  const updated = addStudySession(INITIAL_STUDY_STATE.sessions, {
    weekday: 'Mon',
    category: 'Mathematics',
    hours: 1.5,
    topic: 'Vector Calculus Practice',
    ownerId: 'user_test_1',
  });
  assert.equal(updated.error, undefined);
  assert.equal(updated.added?.ownerId, 'user_test_1');

  const newMap = getWeeklyHoursMap(updated.sessions);
  assert.equal(newMap.Mon, 5.0);
});

test('Journal entry validation and metrics calculation', () => {
  const res = addJournalEntry(INITIAL_STUDY_STATE.journal, {
    title: 'Deep Dive into B-Trees',
    category: 'Systems Design',
    date: '2026-11-09',
    weekday: 'Mon',
    hoursLogged: 2.0,
    focusRating: 5,
    reflection: 'Analyzed node splitting and page fanout in SQLite.',
    keyTakeaway: 'B+ Trees minimize disk I/O via high fanout.',
    ownerId: 'user_test_1',
  });
  assert.equal(res.error, undefined);
  assert.equal(res.added?.ownerId, 'user_test_1');
  assert.equal(res.journal.length, INITIAL_STUDY_STATE.journal.length + 1);

  const metrics = calculateStudyMetrics(INITIAL_STUDY_STATE);
  assert.equal(metrics.totalWeeklyHours, 21.5);
  assert.equal(metrics.activeDaysCount, 7);
  assert.equal(metrics.peakDay, 'Fri');
  assert.equal(metrics.peakHours, 4.5);
});

test('Digital Wellbeing stats, Daily/Weekly/Monthly Achievements, Widgets, Friend Connect, and Study Game', () => {
  const wellbeing = calculateDigitalWellbeingStats(INITIAL_STUDY_STATE);
  assert.ok(wellbeing.grandTotalFocusMinutes > 0);
  assert.equal(wellbeing.slices.length, 6);
  assert.ok(wellbeing.wellbeingScore > 0 && wellbeing.wellbeingScore <= 100);

  const daily = getPeriodAchievements(INITIAL_STUDY_STATE, 'daily');
  const weekly = getPeriodAchievements(INITIAL_STUDY_STATE, 'weekly');
  const monthly = getPeriodAchievements(INITIAL_STUDY_STATE, 'monthly');
  assert.equal(daily.badges.length, 3);
  assert.equal(weekly.badges.length, 3);
  assert.equal(monthly.badges.length, 3);
  assert.equal(weekly.badges[0].unlocked, true);

  const toggledWidgets = toggleDeviceWidget(
    DEFAULT_DEVICE_WIDGETS,
    'widget-home-graph'
  );
  const graphWidget = toggledWidgets.find((w) => w.id === 'widget-home-graph');
  assert.equal(graphWidget?.enabled, true);

  const friendAdd = connectStudyFriend(DEFAULT_STUDY_FRIENDS, {
    friendCodeOrEmail: 'LECTRA-LIAM-07',
    displayName: 'Liam Chen',
    topCategory: 'Computer Science',
  });
  assert.equal(friendAdd.error, undefined);
  assert.equal(friendAdd.friends.length, DEFAULT_STUDY_FRIENDS.length + 1);
  assert.equal(friendAdd.added?.displayName, 'Liam Chen');

  const questions = generateStudyGameQuestions(INITIAL_STUDY_STATE, 'All');
  assert.ok(questions.length >= 6);
  assert.ok(questions.some((q) => q.topicTitle.includes('Firebase Auth')));
});

test('Lectra branding, Play Store ASO candidates, themePreference, and Flutter Firebase Auth generator', () => {
  assert.equal(INITIAL_STUDY_STATE.themePreference, 'light');
  const darkState = { ...INITIAL_STUDY_STATE, themePreference: 'dark' as const };
  const artifacts = generateFlutterCodeArtifacts(darkState);
  assert.ok(artifacts.mainDart.includes('Lectra: Study Timer & Checklist'));
  assert.ok(artifacts.mainDart.includes('ThemeMode.dark'));
  assert.ok(artifacts.firebaseAuthDart.includes('signInWithGoogle'));
  assert.ok(artifacts.firebaseAuthDart.includes('updateThemePreference'));
  assert.ok(artifacts.firebaseAuthDart.includes('createUserWithEmailAndPassword'));
  assert.ok(artifacts.hiveTaskEngineDart.includes('class StudyTaskManager'));
  assert.ok(artifacts.flChartWidgetDart.includes('LineChartBarData'));
  assert.ok(artifacts.playStoreAso.includes('Lectra: Study Timer & Checklist'));
  assert.ok(PLAY_STORE_NAME_CANDIDATES.some((c) => c.title === 'Lectra: Study Timer & Checklist'));
});
