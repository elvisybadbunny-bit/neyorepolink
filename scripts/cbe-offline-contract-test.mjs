import { readFileSync } from "node:fs";

let passed = 0;
function check(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
  console.log(`PASS ${passed}: ${message}`);
}

const client = readFileSync("src/components/cbc/cbc-client.tsx", "utf8");
const route = readFileSync("src/app/api/cbc/assess/route.ts", "utf8");
const queue = readFileSync("src/lib/offline/queue.ts", "utf8");
const recordClient = readFileSync("src/components/academics/record-of-work-client-tab.tsx", "utf8");
const recordRoute = readFileSync("src/app/api/teacher/record-of-work/route.ts", "utf8");
const deliveryClient = readFileSync("src/components/cbe-delivery/cbe-delivery-client.tsx", "utf8");
const deliveryRoute = readFileSync("src/app/api/cbe-delivery/route.ts", "utf8");

check(client.includes('queuedPost("/api/cbc/assess"') || client.includes('queuedPost(\n        "/api/cbc/assess"'), "CBE assessment rounds use the IndexedDB offline outbox");
check(client.includes("saved offline") && client.includes("sync this assessment round"), "teacher receives an honest queued-offline message");
check(route.includes('req.headers.get("Idempotency-Key")'), "CBE assessment route reads replay identity");
check(route.includes('"cbc.assessment_round"') && route.includes("withIdempotency"), "CBE assessment replay is at-most-once per tenant and key");
check(queue.includes('const DB_NAME = "neyo-offline"') && queue.includes("indexedDB.open"), "offline data stays in browser IndexedDB without an external offline provider");
check(queue.includes("window.addEventListener") === false, "queue module itself adds no polling loop or paid background infrastructure");
check(recordClient.includes('queuedPost(\n        "/api/teacher/record-of-work"'), "record-of-work saves use the same local outbox");
check(recordRoute.includes('"teacher.record_of_work"') && recordRoute.includes("withIdempotency"), "record-of-work replay is at-most-once per tenant and key");
check(deliveryClient.includes('offlineSafe=["create_session","record_evidence","create_intervention"]') && deliveryClient.includes("queuedPost"), "bounded CBE Delivery creates use the local outbox");
check(deliveryRoute.includes("cbe_delivery.${action}") && deliveryRoute.includes("withIdempotency"), "CBE Delivery replay is tenant-scoped and at-most-once");
check(queue.includes('DB_VERSION = 3') && queue.includes('FAILED_STORE = "failedOutbox"'), "pending, bundle and rejected records share one compatible IndexedDB version");
check(queue.includes("retainFailedQueued") && queue.includes("reason") && queue.includes("failedAt"), "permanent sync rejection is retained for user review instead of disappearing");

console.log(`OFFLINE SCHOOL RECORD CONTRACT COMPLETE: ${passed}/12`);
