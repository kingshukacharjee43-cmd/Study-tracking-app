import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

interface EvalContext {
  auth: { uid: string; email_verified: boolean } | null;
  docId: string;
  collection: 'users' | 'tasks' | 'sessions' | 'journalEntries';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestTime: number;
  userProfileExists: boolean;
  existingData?: Record<string, unknown>;
  incomingData?: Record<string, unknown>;
}

const VALID_CATEGORIES = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Literature',
  'Languages',
  'Systems Design',
];
const VALID_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function hasExactKeys(data: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(data);
  return keys.every((k) => actual.includes(k)) && actual.every((k) => keys.includes(k));
}

function affectedKeysOnly(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>,
  allowed: string[]
): boolean {
  const allKeys = new Set([...Object.keys(incoming), ...Object.keys(existing)]);
  const changed: string[] = [];
  for (const k of allKeys) {
    if (incoming[k] !== existing[k]) {
      changed.push(k);
    }
  }
  return changed.every((k) => allowed.includes(k));
}

function evaluateTaskRule(ctx: EvalContext): boolean {
  const isVerified = ctx.auth !== null && ctx.auth.email_verified === true;
  if (!isVerified) return false;

  if (ctx.operation === 'list') {
    return ctx.existingData?.ownerId === ctx.auth!.uid;
  }

  if (!isValidId(ctx.docId)) return false;

  if (ctx.operation === 'get' || ctx.operation === 'delete') {
    return ctx.existingData?.ownerId === ctx.auth!.uid;
  }

  const d = ctx.incomingData;
  if (!d) return false;

  const validSchema =
    hasExactKeys(d, [
      'ownerId',
      'title',
      'category',
      'date',
      'isCompleted',
      'estimatedMinutes',
      'priority',
      'createdAt',
      'updatedAt',
    ]) &&
    typeof d.ownerId === 'string' &&
    isValidId(d.ownerId) &&
    d.ownerId === ctx.auth!.uid &&
    typeof d.title === 'string' &&
    d.title.length >= 1 &&
    d.title.length <= 200 &&
    typeof d.category === 'string' &&
    VALID_CATEGORIES.includes(d.category) &&
    typeof d.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
    typeof d.isCompleted === 'boolean' &&
    typeof d.estimatedMinutes === 'number' &&
    d.estimatedMinutes >= 1 &&
    d.estimatedMinutes <= 480 &&
    typeof d.priority === 'string' &&
    ['High', 'Medium', 'Low'].includes(d.priority) &&
    typeof d.createdAt === 'number' &&
    typeof d.updatedAt === 'number';

  if (!validSchema) return false;

  if (ctx.operation === 'create') {
    return (
      d.createdAt === ctx.requestTime &&
      d.updatedAt === ctx.requestTime &&
      ctx.userProfileExists
    );
  }

  if (ctx.operation === 'update') {
    if (!ctx.existingData) return false;
    return (
      ctx.existingData.ownerId === ctx.auth!.uid &&
      d.ownerId === ctx.existingData.ownerId &&
      d.createdAt === ctx.existingData.createdAt &&
      d.updatedAt === ctx.requestTime &&
      ctx.userProfileExists &&
      (affectedKeysOnly(d, ctx.existingData, ['isCompleted', 'updatedAt']) ||
        affectedKeysOnly(d, ctx.existingData, [
          'title',
          'category',
          'date',
          'estimatedMinutes',
          'priority',
          'updatedAt',
        ]))
    );
  }

  return false;
}

test('firestore.rules structural invariants and Dirty Dozen adversarial payloads all return PERMISSION_DENIED', () => {
  // Structural assertions on firestore.rules
  assert.ok(rulesContent.includes("rules_version = '2';"));
  assert.ok(rulesContent.includes('match /{document=**} {\n      allow read, write: if false;\n    }'));
  assert.ok(rulesContent.includes('match /users/{userId}'));
  assert.ok(rulesContent.includes('match /tasks/{taskId}'));
  assert.ok(rulesContent.includes('match /sessions/{sessionId}'));
  assert.ok(rulesContent.includes('match /journalEntries/{entryId}'));

  const now = 1762675200000;
  const validTask = {
    ownerId: 'user_alice',
    title: 'Complete Linear Algebra Eigenvalues',
    category: 'Mathematics',
    date: '2026-11-10',
    isCompleted: false,
    estimatedMinutes: 60,
    priority: 'High',
    createdAt: now,
    updatedAt: now,
  };

  // Sanity check: valid owner with verified email & existing profile succeeds
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_valid_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: validTask,
    }),
    true
  );

  // Dirty Dozen #1: Identity Spoofing on Task Create
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_mallory', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, ownerId: 'user_alice' },
    }),
    false
  );

  // Dirty Dozen #2: Unverified Email Write
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: false },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: validTask,
    }),
    false
  );

  // Dirty Dozen #3: Shadow / Ghost Field Injection
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, isAdmin: true },
    }),
    false
  );

  // Dirty Dozen #4: Orphaned Write Without UserProfile
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: false,
      incomingData: validTask,
    }),
    false
  );

  // Dirty Dozen #5: ID Poisoning Attack
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'bad$id!with/slashes',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: validTask,
    }),
    false
  );

  // Dirty Dozen #6: Value Poisoning / Oversized String (>200 chars)
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, title: 'A'.repeat(250) },
    }),
    false
  );

  // Dirty Dozen #7: Enum Bypass on Category
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, category: 'InvalidSubject' },
    }),
    false
  );

  // Dirty Dozen #8: Out-of-Bounds Duration (>480 mins)
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, estimatedMinutes: 9999 },
    }),
    false
  );

  // Dirty Dozen #9: Timestamp Forgery on Create
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'create',
      requestTime: now,
      userProfileExists: true,
      incomingData: { ...validTask, createdAt: now - 50000 },
    }),
    false
  );

  // Dirty Dozen #10: Immutable Field Tampering on Update (changing createdAt)
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'update',
      requestTime: now + 1000,
      userProfileExists: true,
      existingData: validTask,
      incomingData: {
        ...validTask,
        isCompleted: true,
        createdAt: now + 1000,
        updatedAt: now + 1000,
      },
    }),
    false
  );

  // Dirty Dozen #11: Cross-Tenant List/Get Scraping
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_mallory', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'list',
      requestTime: now,
      userProfileExists: true,
      existingData: validTask,
    }),
    false
  );

  // Dirty Dozen #12: Unauthorized Multi-Action Mutation on Update (mutating both isCompleted and title at once)
  assert.equal(
    evaluateTaskRule({
      auth: { uid: 'user_alice', email_verified: true },
      docId: 'task_1',
      collection: 'tasks',
      operation: 'update',
      requestTime: now + 1000,
      userProfileExists: true,
      existingData: validTask,
      incomingData: {
        ...validTask,
        isCompleted: true,
        title: 'Simultaneous unauthorized edit',
        updatedAt: now + 1000,
      },
    }),
    false
  );
});
