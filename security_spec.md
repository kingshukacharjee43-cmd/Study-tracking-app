# Security Specification — Lectra: Study Timer & Checklist

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every document in `/users/{userId}`, `/tasks/{taskId}`, `/sessions/{sessionId}`, and `/journalEntries/{entryId}` belongs to a single authenticated user (`ownerId == request.auth.uid`) with a verified email (`request.auth.token.email_verified == true`).
2. **Relational Integrity (Master Gate)**: A `StudyTask`, `StudySession`, or `JournalEntry` cannot be created unless the parent user profile `/users/$(request.auth.uid)` exists (`exists(/databases/$(database)/documents/users/$(request.auth.uid))`).
3. **Zero PII Exposure**: No PII (`email`, `phone`, `address`) is stored in Firestore documents; reads (`get` and `list`) are strictly scoped to `resource.data.ownerId == request.auth.uid`.
4. **Immutable Audit & Identity Fields**: `ownerId` and `createdAt` can never be modified after document creation, and `createdAt`/`updatedAt` must always match `request.time`.
5. **Action-Based Updates & Strict Keys**: Every write validates exact key sets (`hasAll` + `hasOnly`), field types, regex patterns, enums, and string length bounds.

## 2. The "Dirty Dozen" Payloads (Designed to Break Identity, Integrity, and State)
1. **Payload 1 (Identity Spoofing on Task Create)**: `{ "ownerId": "victim_uid_123", "title": "Spoofed task", "category": "Mathematics", "date": "2026-11-10", "isCompleted": false, "estimatedMinutes": 30, "priority": "High", "createdAt": "SERVER_TIME", "updatedAt": "SERVER_TIME" }` -> Rejected (`ownerId != request.auth.uid`).
2. **Payload 2 (Unverified Email Write)**: Valid task payload sent by a user token with `email_verified: false` -> Rejected (`isVerifiedUser()` fails).
3. **Payload 3 (Shadow / Ghost Field Injection)**: Valid `/tasks/{taskId}` payload plus `"isAdmin": true` -> Rejected (`data.keys().hasOnly(...)` fails).
4. **Payload 4 (Orphaned Write Without UserProfile)**: Creating `/tasks/task_1` before `/users/$(request.auth.uid)` exists -> Rejected (`exists(...)` check fails).
5. **Payload 5 (ID Poisoning Attack)**: Creating `/tasks/invalid$id!with@spaces` or 200-char ID -> Rejected (`isValidId()` regex/length guard fails).
6. **Payload 6 (Value Poisoning / Oversized String)**: Updating `/tasks/task_1` with a 5,000-character `title` -> Rejected (`isValidStudyTask()` max length `<= 200` fails).
7. **Payload 7 (Enum Bypass on Category)**: Creating `/sessions/sess_1` with `"category": "Hacking 101"` -> Rejected (`isValidCategory()` enum check fails).
8. **Payload 8 (Out-of-Bounds Study Hours)**: Creating `/sessions/sess_1` with `"hours": 999` or `"hours": -2` -> Rejected (`hours >= 0.1 && hours <= 16` fails).
9. **Payload 9 (Timestamp Forgery on Create/Update)**: Creating or updating `/journalEntries/jrnl_1` with a client-forged past/future `createdAt` or `updatedAt` -> Rejected (`== request.time` fails).
10. **Payload 10 (Immutable Field Tampering on Update)**: Updating `/tasks/task_1` to change `createdAt` or `ownerId` -> Rejected (`incoming().createdAt == existing().createdAt` and `affectedKeys().hasOnly(...)` fail).
11. **Payload 11 (Cross-Tenant Read / List Scraping)**: Querying `/tasks` or `/journalEntries` without `where('ownerId', '==', request.auth.uid)` or reading another user's document -> Rejected (`resource.data.ownerId == request.auth.uid` fails).
12. **Payload 12 (Unauthorized Action Update on Session)**: Updating `/sessions/sess_1` to mutate `weekday` and `ownerId` simultaneously -> Rejected (`affectedKeys().hasOnly(...)` fails).
