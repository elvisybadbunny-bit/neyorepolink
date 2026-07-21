# NEYO offline support matrix

Date: 21 July 2026

## What offline means

NEYO cannot safely make every server workflow fully writable without internet. School records are shared, permission-controlled and tenant-scoped. Offline support therefore has three categories:

1. **Saved read-only snapshot** — data explicitly saved to this device through Bundle Saver.
2. **Queued idempotent write** — a bounded action is stored in IndexedDB and replayed once after reconnection.
3. **Online required** — identity, money-provider, publication or conflict-sensitive actions remain blocked until the server can verify them.

A page must be visited/saved while online before its shell or data can be available offline. Turning Wi-Fi off before the first successful load cannot download that page.

## Implemented offline-capable workflows

| Workflow | Offline behaviour | Safety |
|---|---|---|
| Attendance register save | Queued in IndexedDB and synced on reconnect | Server upsert/idempotency |
| Exam marks autosave | Queued and replayed | Idempotency key |
| CBE rubric observation round | Queued in IndexedDB and synced on reconnect | Tenant-scoped at-most-once replay ledger |
| Teacher record of work/coverage | Queued in IndexedDB and synced on reconnect | Tenant-scoped at-most-once replay ledger |
| CBE Delivery session, learner evidence and support creation | Queued, source records revalidated during sync | Tenant-scoped at-most-once replay ledger |
| Gate-pass proposal/issuance | Queued where supported | Server replay ledger |
| Visitor sign-in | Queued | Idempotency key |
| Plain cash/manual reception payment | Queued where biometric live verification is not required | Duplicate-payment protection |
| Read-only learners, balances, calendar, timetable and CBE delivery sessions | Available in Bundle Saver only when the signed-in user's merged roles permit each section | Local IndexedDB; bounded/versioned |
| Previously opened page shell | Exact URL network-first cache, then saved response | No API mutation caching |
| Static icons/assets | Cache-first | Versioned service-worker cache |

## Infrastructure cost

This offline layer adds no external offline provider, message broker, storage bucket or scheduled polling service. Pending actions and snapshots live in the browser's IndexedDB on the user's own device. Reconnection sends the same bounded API request that an online save would have sent. The server stores one small idempotency receipt for an offline-safe mutation so retries do not duplicate school records. That creates negligible database storage compared with the assessment records themselves, but it is not honest to call it mathematically zero bytes.

Offline video playback is not promised: YouTube and unsaved media still require their provider/network. NEYO does not download copyrighted videos in the background.

## Workflows that remain online-only

- M-Pesa STK initiation and callbacks;
- sign-in, OTP, password recovery and passkey verification;
- biometric/action-ticket protected money actions;
- timetable generation, approval and publication;
- CBE curriculum-design publication and intervention review (stale edits must not overwrite reviewed shared records);
- uploads, YouTube playback/search and external integrations;
- permission changes and sensitive settings;
- any operation needing current conflict/capacity validation.

## Repair in this batch

The service worker previously cached full browser navigations but not Next.js RSC requests used when a signed-in user clicks links. It now caches successful same-origin RSC page responses and can reuse an exact previously loaded response when offline. API calls remain network-only. Cache version moved to `neyo-v2` so clients activate the corrected strategy.

The shared IndexedDB schema is now version 3 across both the action queue and Bundle Saver. This fixes a real version mismatch where Bundle Saver could upgrade the database to version 2 while the queue still attempted to open version 1. A `failedOutbox` store now retains permanently rejected 4xx sync actions with the server reason, timestamp and label. The top-bar Review control lets the user inspect and dismiss them after correcting the source workflow; rejected school work no longer disappears silently.

## Founder verification

1. Sign in online and install/open NEYO once.
2. Enable Bundle Saver and press Sync now.
3. Visit Attendance, Exams and at least two ordinary pages online.
4. In browser developer tools select Offline, or disable Wi-Fi after pages finish loading.
5. Confirm the offline indicator appears.
6. Open `/offline` and confirm the saved timestamp and read-only data.
7. Save one attendance register offline and confirm the queued count increases.
8. Reconnect once and confirm the queue clears and server data appears exactly once.
9. Confirm M-Pesa and protected payment actions clearly refuse offline operation.
10. Clear site data and confirm private offline snapshots disappear.

Offline support on a shared device has privacy implications. Schools should use device locks and clear local data before transferring a device to another person.
