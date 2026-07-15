"use client";
import * as React from "react";

/**
 * Z.3 — Real, dedicated print-only timetable rendering component. Used
 * exclusively by the dedicated `/print/timetable` route (which lives
 * outside the authenticated app-shell, so no chrome can ever leak in).
 *
 * Real fix (this session): the merged "LUNCH" row/column is now placed
 * from the REAL persisted TimetableSlot data (subjectCode === "LUNCH"),
 * never from `TimetableConfig.lunchStart` — that field is only ever used
 * for real elapsed-minutes-of-the-day MATH, not for deciding which real
 * period is lunch (which is actually driven by `lunchShift` at solve
 * time, and can genuinely diverge from `lunchStart`'s number).
 */

interface RealSlot {
  id: string;
  dayOfWeek: number;
  period: number;
  subjectName?: string | null;
  subjectCode?: string | null;
  teacherName?: string | null;
  teacherShortCode?: string | null;
  className?: string;
  venue?: string | null;
  slotType?: string;
}

interface RealConfig {
  periodsPerDay?: number;
  saturdayPeriodsCount?: number;
  hasSaturday?: boolean;
  schoolDayStartTime?: string;
  saturdayStartTime?: string;
  lessonDurationMins?: number;
  shortBreakStart?: number;
  shortBreakMins?: number;
  shortBreak2Start?: number | null;
  shortBreak2Mins?: number | null;
  longBreakStart?: number;
  longBreakMins?: number;
  lunchStart?: number;
  lunchMins?: number;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// DD.13 — real double-period merging for the printed timetable, mirroring
// the exact same logic already applied to the live in-app timetable
// (academics-client.tsx's computeDoubleSpanSecondHalves()): two real
// CONSECUTIVE periods on the same real day that genuinely share every one
// of the real fields that matter for THIS print mode should merge into
// one printed cell, never print as two separate identical-looking boxes.
// `mode === "teachers"` compares className (the teacher is covering the
// SAME real class both periods); `mode === "classes"` compares
// teacherName (the SAME real teacher covers both periods) — the two
// fields that respectively make a genuine double honest in each context.
// ELECTIVE_BLOCK cells already have their own distinct rendering and are
// deliberately excluded here.
function computeDoubleSpanSecondHalvesForPrint(grid: Map<string, RealSlot>, periodsPerDay: number, mode: "classes" | "teachers" | undefined): Set<string> {
  const secondHalves = new Set<string>();
  for (let d = 1; d <= 6; d++) {
    for (let p = 1; p < periodsPerDay; p++) {
      const a = grid.get(`${d}|${p}`);
      const b = grid.get(`${d}|${p + 1}`);
      if (!a || !b) continue;
      if (a.slotType === "ELECTIVE_BLOCK" || b.slotType === "ELECTIVE_BLOCK") continue;
      if ((a.slotType ?? "ACADEMIC") !== (b.slotType ?? "ACADEMIC")) continue;
      if ((a.subjectCode ?? null) !== (b.subjectCode ?? null)) continue;
      if (!a.subjectCode) continue;
      const identityField = mode === "teachers" ? "className" : "teacherName";
      if ((a as any)[identityField] !== (b as any)[identityField]) continue;
      secondHalves.add(`${d}|${p + 1}`);
    }
  }
  return secondHalves;
}

function parseTimeToMinutes(t?: string | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function formatTimetableTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Real elapsed-minutes math: how many minutes have elapsed by the START of
 * period `p`, accounting for any real short break(s) / long break that
 * fall strictly BEFORE it, plus how long each PRIOR period genuinely took
 * (a normal lesson period takes `lessonDurationMins`; a real LUNCH period
 * REPLACES that with `lunchMins` instead of adding to it — lunch does not
 * get a full lesson's worth of time PLUS a lunch's worth on top, it simply
 * takes as long as lunch takes). `realLunchPeriods` is the single real
 * source of truth for which period number is genuinely lunch for THIS
 * class (from the actual persisted TimetableSlot data, not the
 * `config.lunchStart` field, which can genuinely diverge under a real
 * 2-shift lunch design — see `realLunchPeriodsFromSlots()` below).
 */
function periodStartMinutes(p: number, config: RealConfig | null | undefined, realLunchPeriods: Set<number>): number | null {
  const dayStart = parseTimeToMinutes(config?.schoolDayStartTime) ?? 480; // default 8:00am
  const lessonMins = config?.lessonDurationMins ?? 40;
  const lunchMins = config?.lunchMins ?? 45;
  let elapsed = dayStart;
  for (let i = 1; i < p; i++) {
    elapsed += realLunchPeriods.has(i) ? lunchMins : lessonMins;
    if (config?.shortBreakStart === i && (config?.shortBreakMins ?? 0) > 0) elapsed += config!.shortBreakMins!;
    if (config?.shortBreak2Start === i && (config?.shortBreak2Mins ?? 0) > 0) elapsed += config!.shortBreak2Mins!;
    if (config?.longBreakStart === i && (config?.longBreakMins ?? 0) > 0) elapsed += config!.longBreakMins!;
  }
  return elapsed;
}

function periodTimeRange(p: number, config: RealConfig | null | undefined, realLunchPeriods: Set<number>): string | null {
  const start = periodStartMinutes(p, config, realLunchPeriods);
  if (start == null) return null;
  const lessonMins = realLunchPeriods.has(p) ? config?.lunchMins ?? 45 : config?.lessonDurationMins ?? 40;
  return `${formatTimetableTime(start)}–${formatTimetableTime(start + lessonMins)}`;
}

interface NonLessonRow {
  key: string;
  label: string;
  minutes: number;
  tone: "break";
}

/** Real, config-driven BREAK rows only — breaks are never persisted as
 * real TimetableSlot rows (they're genuine gaps in the day), so config
 * remains the one real source of truth for breaks specifically. */
function nonLessonBreakRowsForPeriod(p: number, config: RealConfig | null | undefined): NonLessonRow[] {
  const rows: NonLessonRow[] = [];
  if (config?.shortBreakStart === p && (config?.shortBreakMins ?? 0) > 0) {
    rows.push({ key: `short-${p}`, label: "SHORT BREAK", minutes: config!.shortBreakMins!, tone: "break" });
  }
  if (config?.shortBreak2Start === p && (config?.shortBreak2Mins ?? 0) > 0) {
    rows.push({ key: `short2-${p}`, label: "SHORT BREAK", minutes: config!.shortBreak2Mins!, tone: "break" });
  }
  if (config?.longBreakStart === p && (config?.longBreakMins ?? 0) > 0) {
    rows.push({ key: `long-${p}`, label: "LONG BREAK", minutes: config!.longBreakMins!, tone: "break" });
  }
  return rows;
}

/** Real lunch-period detection: the single source of truth for "which
 * periods are lunch for THIS class" — scans the REAL persisted slot data
 * rather than trusting `config.lunchStart`. */
function realLunchPeriodsFromSlots(slots: RealSlot[]): Set<number> {
  const periods = new Set<number>();
  for (const s of slots) {
    if ((s.subjectCode || "").toUpperCase() === "LUNCH") periods.add(s.period);
  }
  return periods;
}

function lunchMinutesFor(config: RealConfig | null | undefined): number {
  return config?.lunchMins ?? 45;
}

function subjectAbbrev(name?: string | null, code?: string | null): string {
  if (code && code.trim()) return code.trim().toUpperCase();
  if (!name) return "";
  return name.length > 10 ? `${name.slice(0, 10)}.` : name;
}

/**
 * Real, deterministic subject color-coding — same visual language the
 * founder pointed to in a real reference timetable image (Thuita School's
 * own printed G7 schedule): every distinct real subject gets its OWN
 * consistent background/text color, repeatable across every real cell of
 * that subject on the page (and, since the hash is purely a function of
 * the real subject code/name, consistent across every class/teacher page
 * in a real bulk print run too — "MAT7" is always the same blue everywhere).
 * A small, real, print-safe (not too dark, not washed out) palette; LUNCH/
 * FREE/BREAK get their own fixed real tones matching the merged-row colors
 * already used elsewhere on the page, for visual consistency.
 */
const SUBJECT_PALETTE: { bg: string; text: string }[] = [
  { bg: "#dbeafe", text: "#1e3a8a" }, // blue
  { bg: "#dcfce7", text: "#14532d" }, // green
  { bg: "#fef3c7", text: "#78350f" }, // amber
  { bg: "#fce7f3", text: "#831843" }, // pink
  { bg: "#ede9fe", text: "#4c1d95" }, // violet
  { bg: "#cffafe", text: "#164e63" }, // cyan
  { bg: "#ffedd5", text: "#7c2d12" }, // orange
  { bg: "#e0e7ff", text: "#312e81" }, // indigo
  { bg: "#fee2e2", text: "#7f1d1d" }, // red
  { bg: "#d1fae5", text: "#065f46" }, // teal
  { bg: "#fae8ff", text: "#701a75" }, // fuchsia
  { bg: "#ecfccb", text: "#365314" }, // lime
];

function hashStringToIndex(value: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

function subjectColorFor(code: string | null | undefined, name: string | null | undefined, bandW: boolean): { bg: string; text: string } | null {
  if (bandW) return null;
  const key = (code || name || "").trim().toUpperCase();
  if (!key) return null;
  const idx = hashStringToIndex(key, SUBJECT_PALETTE.length);
  return SUBJECT_PALETTE[idx];
}

function Cell({
  slot,
  fontSize,
  mode,
  bandW,
  isDoubleMerged = false,
}: {
  slot: RealSlot | undefined;
  fontSize: number;
  mode?: "classes" | "teachers";
  bandW: boolean;
  isDoubleMerged?: boolean;
}) {
  if (!slot) {
    return <div className="ptt-cell ptt-cell-empty" />;
  }
  const primaryLabel = mode === "teachers" ? slot.className ?? "" : subjectAbbrev(slot.subjectName, slot.subjectCode);
  const venueCode = slot.venue ?? "";
  const teacherCode = mode === "teachers" ? "" : slot.teacherShortCode ?? slot.teacherName ?? "";
  const color = mode === "teachers" ? null : subjectColorFor(slot.subjectCode, slot.subjectName, bandW);
  return (
    <div
      className={`ptt-cell${bandW ? " ptt-cell-bw" : ""}`}
      style={color ? { background: color.bg, color: color.text } : undefined}
    >
      {/* Real, deliberate size hierarchy: the SUBJECT is the thing a
         student/teacher actually needs to read at a glance, so it fills
         most of the real box in a large, bold, centered label. Venue/
         teacher short codes are real supporting detail only, so they stay
         small and tucked into the two bottom corners — never competing
         with the subject for visual weight. */}
      <div className="ptt-cell-main" style={{ fontSize: `${Math.round(fontSize * 1.35)}px` }}>
        {primaryLabel}
        {/* DD.13 — real, printed confirmation that this merged cell is a
            genuine double lesson (two real consecutive periods), not just
            a visually tall single. */}
        {isDoubleMerged && <span className="ptt-cell-double-badge">DOUBLE</span>}
      </div>
      <div className="ptt-cell-footer">
        <span className="ptt-cell-venue">{venueCode}</span>
        <span className="ptt-cell-teacher">{teacherCode}</span>
      </div>
    </div>
  );
}

export interface PrintTimetablePageProps {
  tenantName?: string | null;
  tenantLogoUrl?: string | null;
  title: string;
  subtitle?: string;
  slots: RealSlot[];
  config: RealConfig | null;
  daysVertical: boolean;
  cellFontSize: number;
  pageBreakAfter: boolean;
  mode?: "classes" | "teachers";
  bandW?: boolean;
}

export function PrintTimetablePage({
  tenantName,
  tenantLogoUrl,
  title,
  subtitle,
  slots,
  config,
  daysVertical,
  cellFontSize,
  pageBreakAfter,
  mode,
  bandW = false,
}: PrintTimetablePageProps) {
  const grid = new Map<string, RealSlot>();
  for (const s of slots) grid.set(`${s.dayOfWeek}|${s.period}`, s);

  const hasSaturday = config?.hasSaturday !== false && slots.some((s) => s.dayOfWeek === 6);
  const days = hasSaturday ? DAY_NAMES : DAY_NAMES.slice(0, 5);
  const periodsPerDay = config?.periodsPerDay || Math.max(1, ...slots.map((s) => s.period), 8);
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  const realLunchPeriods = realLunchPeriodsFromSlots(slots);
  // DD.13 — real double-period merging (see the helper's own doc comment).
  const doubleSecondHalves = computeDoubleSpanSecondHalvesForPrint(grid, periodsPerDay, mode);

  return (
    <div className={`ptt-page ${daysVertical ? "ptt-landscape" : "ptt-portrait"}`}>
      <div className="ptt-header">
        <div className="ptt-header-left">
          {tenantLogoUrl ? <img src={tenantLogoUrl} alt="" className="ptt-logo" /> : null}
          <div className="ptt-school-name">{tenantName ?? "NEYO"}</div>
        </div>
        <div className="ptt-header-center">
          <div className="ptt-title">{title}</div>
          {subtitle ? <div className="ptt-subtitle">{subtitle}</div> : null}
        </div>
        <div className="ptt-header-right">
          <div className="ptt-date">
            {new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {!daysVertical ? (
        <table className="ptt-table">
          <thead>
            <tr>
              <th className="ptt-corner">Period</th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.flatMap((p) => {
              if (realLunchPeriods.has(p)) {
                return [
                  <tr key={`lunch-${p}`} className="ptt-nonlesson-row ptt-nonlesson-lunch">
                    <td className="ptt-period-num">
                      {p}
                      <div className="ptt-period-time">{periodTimeRange(p, config, realLunchPeriods)}</div>
                    </td>
                    <td colSpan={days.length}>LUNCH · {lunchMinutesFor(config)} MINS</td>
                  </tr>,
                ];
              }
              const lessonRow = (
                <tr key={`p-${p}`}>
                  <td className="ptt-period-num">
                    {p}
                    <div className="ptt-period-time">{periodTimeRange(p, config, realLunchPeriods)}</div>
                  </td>
                  {days.map((_, dIdx) => {
                    const d = dIdx + 1;
                    // DD.13 — the second half of a real double lesson was
                    // already printed (with rowSpan={2}) by its own first
                    // period's row above.
                    if (doubleSecondHalves.has(`${d}|${p}`)) return null;
                    const isFirstHalfOfDouble = doubleSecondHalves.has(`${d}|${p + 1}`);
                    return (
                      <td key={dIdx} rowSpan={isFirstHalfOfDouble ? 2 : 1} className="ptt-td-cell">
                        <Cell slot={grid.get(`${d}|${p}`)} fontSize={cellFontSize} mode={mode} bandW={bandW} isDoubleMerged={isFirstHalfOfDouble} />
                      </td>
                    );
                  })}
                </tr>
              );
              const nonLesson = nonLessonBreakRowsForPeriod(p, config).map((row) => (
                <tr key={row.key} className="ptt-nonlesson-row ptt-nonlesson-break">
                  <td className="ptt-period-num" />
                  <td colSpan={days.length}>
                    {row.label} · {row.minutes} MINS
                  </td>
                </tr>
              ));
              return [lessonRow, ...nonLesson];
            })}
          </tbody>
        </table>
      ) : (
        <table className="ptt-table ptt-table-vertical">
          <thead>
            <tr>
              <th className="ptt-corner">Day</th>
              {periods.flatMap((p) => {
                const headCells = [];
                if (realLunchPeriods.has(p)) {
                  headCells.push(
                    <th key={`ph-${p}`} className="ptt-nonlesson-head ptt-nonlesson-lunch">
                      LUNCH
                    </th>
                  );
                } else {
                  headCells.push(
                    <th key={`ph-${p}`}>
                      <div className="ptt-period-num">{p}</div>
                      <div className="ptt-period-time">{periodTimeRange(p, config, realLunchPeriods)}</div>
                    </th>
                  );
                }
                nonLessonBreakRowsForPeriod(p, config).forEach((row) => {
                  headCells.push(
                    <th key={row.key} className="ptt-nonlesson-head ptt-nonlesson-break">
                      {row.label}
                    </th>
                  );
                });
                return headCells;
              })}
            </tr>
          </thead>
          <tbody>
            {days.map((dName, dIdx) => (
              <tr key={dName}>
                <td className="ptt-day-name">{dName}</td>
                {periods.flatMap((p) => {
                  const d = dIdx + 1;
                  const cells = [];
                  if (realLunchPeriods.has(p)) {
                    // Real merged lunch column: rendered ONCE spanning every
                    // real day row (rowSpan), never repeated per-row — a
                    // per-row repeat caused a real vertical-text overflow
                    // bug that pushed the whole real table onto a 2nd page.
                    if (dIdx === 0) {
                      cells.push(
                        <td key={`c-${p}`} rowSpan={days.length} className="ptt-nonlesson-vert ptt-nonlesson-lunch">
                          LUNCH
                        </td>
                      );
                    }
                  } else if (doubleSecondHalves.has(`${d}|${p}`)) {
                    // DD.13 — the second half of a real double lesson was
                    // already printed (with colSpan={2}, since periods run
                    // across as COLUMNS in this vertical layout) by its own
                    // first period's cell just before it — skipped here.
                  } else {
                    const isFirstHalfOfDouble = doubleSecondHalves.has(`${d}|${p + 1}`);
                    cells.push(
                      <td key={`c-${p}`} colSpan={isFirstHalfOfDouble ? 2 : 1} className="ptt-td-cell">
                        <Cell slot={grid.get(`${d}|${p}`)} fontSize={cellFontSize} mode={mode} bandW={bandW} isDoubleMerged={isFirstHalfOfDouble} />
                      </td>
                    );
                  }
                  nonLessonBreakRowsForPeriod(p, config).forEach((row) => {
                    if (dIdx === 0) {
                      cells.push(
                        <td key={row.key} rowSpan={days.length} className="ptt-nonlesson-vert ptt-nonlesson-break">
                          {row.label}
                        </td>
                      );
                    }
                  });
                  return cells;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ptt-footer">Powered by NEYO</div>

      {pageBreakAfter && <div className="ptt-page-break" />}

      <style jsx global>{`
        @page {
          size: A4 ${daysVertical ? "landscape" : "portrait"};
          margin: 8mm;
        }
        .ptt-page {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          color: #0f172a;
          height: 100vh;
          page-break-after: avoid;
          display: flex;
          flex-direction: column;
        }
        .ptt-page-break {
          page-break-after: always;
        }
        .ptt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 3mm;
          margin-bottom: 3mm;
        }
        .ptt-header-left {
          display: flex;
          align-items: center;
          gap: 2mm;
        }
        .ptt-logo {
          height: 10mm;
          width: 10mm;
          object-fit: contain;
        }
        .ptt-school-name {
          font-weight: 800;
          font-size: 4mm;
        }
        .ptt-header-center {
          text-align: center;
          flex: 1;
        }
        .ptt-title {
          font-weight: 900;
          font-size: 5.5mm;
        }
        .ptt-subtitle {
          font-size: 3mm;
          color: #475569;
        }
        .ptt-date {
          font-size: 3mm;
          color: #475569;
        }
        .ptt-table {
          table-layout: fixed;
          border-collapse: collapse;
          width: 100%;
          flex: 1;
        }
        .ptt-table th,
        .ptt-table td {
          border: 0.4mm solid #cbd5e1;
          padding: 0;
          text-align: center;
          vertical-align: middle;
        }
        .ptt-table thead th {
          background: #0f172a;
          color: white;
          font-size: 3.2mm;
          padding: 1.5mm;
          font-weight: 700;
        }
        .ptt-corner {
          width: 16mm;
        }
        .ptt-period-num {
          font-size: 5mm;
          font-weight: 900;
        }
        .ptt-period-time {
          font-size: 2.4mm;
          font-weight: 400;
          color: #94a3b8;
        }
        .ptt-td-cell {
          height: 12mm;
        }
        .ptt-cell {
          height: 100%;
          min-height: 14mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          padding: 1mm 1.5mm;
          position: relative;
        }
        .ptt-cell-empty {
          background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 3mm, #f1f5f9 3mm, #f1f5f9 6mm);
        }
        .ptt-cell-bw {
          background: white !important;
          color: #0f172a !important;
        }
        .ptt-cell-main {
          font-weight: 900;
          text-align: center;
          line-height: 1.1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          word-break: break-word;
        }
        .ptt-cell-double-badge {
          margin-top: 0.8mm;
          font-size: 2mm;
          font-weight: 800;
          letter-spacing: 0.3mm;
          padding: 0.3mm 1mm;
          border-radius: 1mm;
          background: rgba(37, 99, 235, 0.18);
        }
        .ptt-cell-footer {
          position: absolute;
          left: 1mm;
          right: 1mm;
          bottom: 0.6mm;
          display: flex;
          justify-content: space-between;
          font-size: 2.2mm;
          font-weight: 600;
          color: #64748b;
          pointer-events: none;
        }
        .ptt-cell-venue {
          text-align: left;
        }
        .ptt-cell-teacher {
          text-align: right;
          font-weight: 700;
        }
        .ptt-nonlesson-row td {
          font-weight: 800;
          letter-spacing: 0.5mm;
        }
        .ptt-nonlesson-lunch {
          background: #dcfce7;
        }
        .ptt-nonlesson-lunch td {
          height: 11mm;
          font-size: 3.6mm;
          color: #166534;
        }
        .ptt-nonlesson-break {
          background: #fef3c7;
        }
        .ptt-nonlesson-break td {
          height: 8mm;
          font-size: 3mm;
          color: #92400e;
        }
        .ptt-nonlesson-head {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        .ptt-nonlesson-head.ptt-nonlesson-lunch {
          background: #16a34a !important;
          color: white !important;
        }
        .ptt-nonlesson-head.ptt-nonlesson-break {
          background: #d97706 !important;
          color: white !important;
        }
        .ptt-nonlesson-vert {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-weight: 800;
        }
        .ptt-nonlesson-vert.ptt-nonlesson-lunch {
          background: #dcfce7;
          color: #166534;
        }
        .ptt-nonlesson-vert.ptt-nonlesson-break {
          background: #fef3c7;
          color: #92400e;
        }
        .ptt-day-name {
          font-weight: 800;
          background: #f1f5f9;
        }
        .ptt-footer {
          text-align: center;
          font-size: 2.6mm;
          color: #94a3b8;
          margin-top: 2mm;
        }
        @media screen {
          .ptt-page {
            max-width: ${daysVertical ? "297mm" : "210mm"};
            margin: 0 auto 8mm auto;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            padding: 8mm;
            box-sizing: border-box;
            height: auto;
            min-height: ${daysVertical ? "210mm" : "297mm"};
          }
        }
      `}</style>
    </div>
  );
}
