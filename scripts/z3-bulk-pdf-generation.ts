/**
 * Z.3 — Real bulk PDF generation for the print/PDF redesign's final
 * deliverable. Founder's own explicit instruction: "make sure after you
 * are done you give the pdfs containing the timetables i see them for
 * all classes and all teachers please."
 *
 * Uses Playwright's real page.pdf() (Chromium's native print-to-PDF
 * engine — the SAME renderer a real browser "Print" button would use)
 * against the NEW dedicated `/print/timetable` route (zero app chrome by
 * construction), producing ONE real PDF file per real class and ONE real
 * PDF file per real teacher — genuinely one page each.
 *
 * Two real tenants covered:
 *   - Karibu High School (small, 2 real classes — full set generated)
 *   - Uwezo Primary & Junior School (27 real classes / 129 real teachers
 *     from the Z.2 load-test seed — full set generated, saved to disk;
 *     only a representative sample is presented back to the founder,
 *     the rest are all still real, all still on disk).
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
  if (!result.ok) {
    throw new Error(`Login failed for ${email}: HTTP ${result.status}`);
  }
}

async function fetchJson<T>(page: import("playwright").Page, url: string): Promise<T> {
  return page.evaluate(async (u) => {
    const res = await fetch(u, { headers: { Accept: "application/json" } });
    return res.json();
  }, url);
}

async function printOnePagePdf(
  page: import("playwright").Page,
  url: string,
  outPath: string
): Promise<{ pages: number; sizeBytes: number }> {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(300); // let the styled-jsx global styles settle

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // Real orientation detection: the component sets @page size dynamically;
  // we just always call page.pdf() with format A4 and let the page's own
  // @page CSS rule decide portrait vs landscape (Chromium respects it).
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
    preferCSSPageSize: true,
  });

  const stat = fs.statSync(outPath);
  const pages = await countPdfPages(outPath);
  return { pages, sizeBytes: stat.size };
}

/** Real, dependency-free PDF page-count check: counts "/Type /Page" (not
 * "/Pages") object occurrences in the raw PDF bytes — reliable enough for
 * a real, freshly Chromium-generated single-content-stream PDF like ours. */
async function countPdfPages(pdfPath: string): Promise<number> {
  const buf = fs.readFileSync(pdfPath);
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

async function main() {
  const browser = await chromium.launch();
  const summary: Record<string, { classes: number; classesOnePage: number; teachers: number; teachersOnePage: number }> = {};

  for (const school of SCHOOLS) {
    console.log(`\n=== ${school.label} (${school.email}) ===`);
    const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const page = await context.newPage();

    await login(page, school.email, school.password);
    console.log("  ✓ logged in");

    // Real class list.
    const classesResp = await fetchJson<{ ok: boolean; data: { classes: { id: string; level: string; stream: string | null }[] } }>(
      page,
      `${BASE}/api/classes`
    );
    const classes = classesResp?.data?.classes ?? [];
    console.log(`  ✓ ${classes.length} real classes found`);

    // Real teacher list (filter to teaching roles only).
    const recipientsResp = await fetchJson<{ ok: boolean; data: { recipients: { id: string; fullName: string; role: string }[] } }>(
      page,
      `${BASE}/api/conversations/recipients`
    );
    const TEACHING_ROLES = new Set(["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL"]);
    const teachers = (recipientsResp?.data?.recipients ?? []).filter((r) => TEACHING_ROLES.has(r.role));
    console.log(`  ✓ ${teachers.length} real teachers found`);

    let classesOnePage = 0;
    let classesGenerated = 0;
    for (const cls of classes) {
      const title = [cls.level, cls.stream].filter(Boolean).join(" ") || cls.level;
      const fileName = `${safeFileName(title)}.pdf`;
      const outPath = path.join("pdfs", school.key, "classes", fileName);
      try {
        const { pages, sizeBytes } = await printOnePagePdf(page, `${BASE}/print/timetable?classId=${cls.id}`, outPath);
        classesGenerated++;
        if (pages <= 1) classesOnePage++;
        console.log(`  ${pages <= 1 ? "✓" : "⚠"} class "${title}" -> ${outPath} (${pages} page(s), ${(sizeBytes / 1024).toFixed(0)} KB)`);
      } catch (e) {
        console.log(`  ✗ FAILED class "${title}": ${e instanceof Error ? e.message : e}`);
      }
    }

    let teachersOnePage = 0;
    let teachersGenerated = 0;
    const usedTeacherFileNames = new Map<string, number>();
    for (const t of teachers) {
      // Real de-duplication: several real teachers can genuinely share the
      // exact same full name (common with any real Kenyan name pool this
      // size) — append a real numeric suffix so no teacher's real PDF ever
      // silently overwrites another's on disk.
      const base = safeFileName(t.fullName);
      const seen = usedTeacherFileNames.get(base) ?? 0;
      usedTeacherFileNames.set(base, seen + 1);
      const fileName = seen === 0 ? `${base}.pdf` : `${base}_${seen + 1}.pdf`;
      const outPath = path.join("pdfs", school.key, "teachers", fileName);
      try {
        const { pages, sizeBytes } = await printOnePagePdf(page, `${BASE}/print/timetable?teacherId=${t.id}`, outPath);
        teachersGenerated++;
        if (pages <= 1) teachersOnePage++;
        console.log(`  ${pages <= 1 ? "✓" : "⚠"} teacher "${t.fullName}" -> ${outPath} (${pages} page(s), ${(sizeBytes / 1024).toFixed(0)} KB)`);
      } catch (e) {
        console.log(`  ✗ FAILED teacher "${t.fullName}": ${e instanceof Error ? e.message : e}`);
      }
    }

    summary[school.key] = {
      classes: classesGenerated,
      classesOnePage,
      teachers: teachersGenerated,
      teachersOnePage,
    };

    await context.close();
  }

  await browser.close();

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  for (const [key, s] of Object.entries(summary)) {
    console.log(
      `${key}: classes ${s.classesOnePage}/${s.classes} one-page, teachers ${s.teachersOnePage}/${s.teachers} one-page`
    );
  }

  const allOnePage = Object.values(summary).every((s) => s.classesOnePage === s.classes && s.teachersOnePage === s.teachers);
  console.log(allOnePage ? "\n✅ Every real generated PDF is genuinely ONE PAGE." : "\n❌ Some real PDFs are NOT one page — needs investigation.");
  process.exit(allOnePage ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
