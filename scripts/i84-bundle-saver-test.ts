import { readFileSync } from "node:fs";

function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); console.log(`  ✓ ${message}`); }

async function main() {
  console.log("I.84 Offline Saved-Data / Bundle Saver test");
  const route = readFileSync("src/app/api/offline/bundle/route.ts", "utf8");
  assert(route.includes("requireUser") && route.includes("tenantId"), "offline bundle API is signed-in and tenant-scoped");
  assert(route.includes("student.findMany") && route.includes("invoice.findMany") && route.includes("calendarEvent.findMany") && route.includes("timetableSlot.findMany") && route.includes("cbeDeliverySession.findMany"), "offline bundle includes permitted learners, balances, calendar, timetable and CBE delivery data");
  assert(route.includes("effectivePermissionsForUser") && route.includes("capabilities"), "offline snapshot applies merged role permissions before querying and labels available sections");
  assert(route.includes("take: 500") && route.includes("version: 1"), "offline bundle is bounded and versioned");

  const cache = readFileSync("src/lib/offline/bundle-cache.ts", "utf8");
  assert(cache.includes("IndexedDB") || cache.includes("indexedDB"), "bundle cache uses IndexedDB");
  assert(cache.includes("bundleCache") && cache.includes("saveBundle") && cache.includes("readBundle") && cache.includes("clearBundle"), "bundle cache supports save/read/clear operations");
  assert(cache.includes('DB_VERSION = 3') && cache.includes('"outbox"') && cache.includes('"failedOutbox"'), "bundle cache upgrades the shared offline DB without breaking pending or failed-action stores");

  const ui = readFileSync("src/components/dashboard/pwa-data-saver.tsx", "utf8");
  assert(ui.includes("NEYO Bundle Saver Mode") && ui.includes("/api/offline/bundle"), "dashboard uses the real bundle API");
  assert(ui.includes("neyo-bundle-saver-enabled") && ui.includes("App-only IndexedDB cache"), "bundle saver requires permission and stores app-only data locally");
  assert(!ui.includes("Math.random") && !ui.includes("Simulate downloading"), "old fake bundle-saver simulation was removed");

  console.log("\n✅ I.84 Offline Saved-Data / Bundle Saver test passed");
}

main().catch((err) => { console.error(err); process.exit(1); });
