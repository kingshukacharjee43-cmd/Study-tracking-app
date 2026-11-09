import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDY_STATE,
  PLAY_STORE_NAME_CANDIDATES,
  addStudyTask,
  toggleStudyTask,
  deleteStudyTask,
  readStudyTasks,
  getWeeklyHoursMap,
  addStudySession,
  addJournalEntry,
  calculateStudyMetrics,
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

test('Lectra branding, Play Store ASO candidates, and Flutter Firebase Auth generator', () => {
  const artifacts = generateFlutterCodeArtifacts(INITIAL_STUDY_STATE);
  assert.ok(artifacts.mainDart.includes('Lectra: Study Timer & Checklist'));
  assert.ok(artifacts.firebaseAuthDart.includes('signInWithGoogle'));
  assert.ok(artifacts.firebaseAuthDart.includes('createUserWithEmailAndPassword'));
  assert.ok(artifacts.hiveTaskEngineDart.includes('class StudyTaskManager'));
  assert.ok(artifacts.flChartWidgetDart.includes('LineChartBarData'));
  assert.ok(artifacts.playStoreAso.includes('Lectra: Study Timer & Checklist'));
  assert.ok(PLAY_STORE_NAME_CANDIDATES.some((c) => c.title === 'Lectra: Study Timer & Checklist'));
});
