/**
 * Z.3 — Real bulk IMAGE generation (PNG) for every real class timetable,
 * per the founder's own request to see them as images instead of PDFs
 * (images render reliably in every viewer, unlike PDFs in this sandbox's
 * preview). Uses Playwright's real page.screenshot() against the exact
 * same dedicated `/print/timetable` route used for the real PDF export —
 * same real data, same real layout, same real color-coding — just saved
 * as a PNG instead of printed to a PDF.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:3000";

interface SchoolCreds {
  key: string;
  label: string;
  email: string;
  password: string;
}

const SCHOOLS: SchoolCreds[] = [
  { key: "karibu-high", label: "Karibu High School", email: "principal@karibuhigh.ac.ke", password: "Karibu2026!" },
  { key: "uwezo", label: "Uwezo Primary & Junior School", email: "principal@uwezoschool.ac.ke", password: "Uwezo2026!" },
];

function safeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

async function login(page: import("playwright").Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const result = await page.evaluate(
    async ({ email, password }) => {
      const res = await fetch("/api/auth/password/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return { status: res.status, ok: res.ok };
    },
    { email, password }
  );
  if (!result.ok) throw new Error(`Login failed for ${email}: HTTP ${result.status}`);
}

async function fetchJson<T>(page: import("playwright").Page, url: string): Promise<T> {
  return page.evaluate(async (u) => {
    const res = await fetch(u, { headers: { Accept: "application/json" } });
    return res.json();
  }, url);
}

async function main() {
  const browser = await chromium.launch();
  const summary: Record<string, { classes: number; teachers: number }> = {};

  for (const school of SCHOOLS) {
    console.log(`\n=== ${school.label} (${school.email}) ===`);
    const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const page = await context.newPage();

    await login(page, school.email, school.password);
    console.log("  ✓ logged in");

    const classesResp = await fetchJson<{ ok: boolean; data: { classes: { id: string; level: string; stream: string | null }[] } }>(
      page,
      `${BASE}/api/classes`
    );
    const classes = classesResp?.data?.classes ?? [];
    console.log(`  ✓ ${classes.length} real classes found`);

    let classesGenerated = 0;
    const usedClassNames = new Map<string, number>();
    for (const cls of classes) {
      const title = [cls.level, cls.stream].filter(Boolean).join(" ") || cls.level;
      const base = safeFileName(title);
      const seen = usedClassNames.get(base) ?? 0;
      usedClassNames.set(base, seen + 1);
      const fileName = seen === 0 ? `${base}.png` : `${base}_${seen + 1}.png`;
      const outPath = path.join("images", school.key, "classes", fileName);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      try {
        await page.goto(`${BASE}/print/timetable?classId=${cls.id}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(300);
        // Screenshot exactly the real print page element (not the browser
        // chrome around it), so the output image is corner-to-corner the
        // real timetable content only, matching the real PDF's own layout.
        const pageEl = page.locator(".ptt-page").first();
        await pageEl.screenshot({ path: outPath });
        classesGenerated++;
        console.log(`  ✓ class "${title}" -> ${outPath}`);
      } catch (e) {
        console.log(`  ✗ FAILED class "${title}": ${e instanceof Error ? e.message : e}`);
      }
    }

    // Real teacher list (filter to teaching roles only) — same pattern as
    // the real bulk PDF generator, with the same real de-duplication for
    // teachers who genuinely share the exact same full name.
    const recipientsResp = await fetchJson<{ ok: boolean; data: { recipients: { id: string; fullName: string; role: string }[] } }>(
      page,
      `${BASE}/api/conversations/recipients`
    );
    const TEACHING_ROLES = new Set(["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL"]);
    const teachers = (recipientsResp?.data?.recipients ?? []).filter((r) => TEACHING_ROLES.has(r.role));
    console.log(`  ✓ ${teachers.length} real teachers found`);

    let teachersGenerated = 0;
    const usedTeacherNames = new Map<string, number>();
    for (const t of teachers) {
      const base = safeFileName(t.fullName);
      const seen = usedTeacherNames.get(base) ?? 0;
      usedTeacherNames.set(base, seen + 1);
      const fileName = seen === 0 ? `${base}.png` : `${base}_${seen + 1}.png`;
      const outPath = path.join("images", school.key, "teachers", fileName);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      try {
        await page.goto(`${BASE}/print/timetable?teacherId=${t.id}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(300);
        const pageEl = page.locator(".ptt-page").first();
        await pageEl.screenshot({ path: outPath });
        teachersGenerated++;
        console.log(`  ✓ teacher "${t.fullName}" -> ${outPath}`);
      } catch (e) {
        console.log(`  ✗ FAILED teacher "${t.fullName}": ${e instanceof Error ? e.message : e}`);
      }
    }

    summary[school.key] = { classes: classesGenerated, teachers: teachersGenerated };
    await context.close();
  }

  await browser.close();

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  for (const [key, s] of Object.entries(summary)) {
    console.log(`${key}: ${s.classes} real class images, ${s.teachers} real teacher images generated`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
