"use client";
import * as React from "react";

/**
 * Z.3 & 2026-07-17 Print Layout Upgrade (`⌘P`):
 * Dedicated print-only timetable rendering component matching exact founder specifications:
 * 1. School name header right at the top (`RATIBA YA SCHOOL MWAKA 2026`) followed by Class/Teacher name (`ACHOLA ROSE`).
 * 2. Merged non-lesson columns (`BREAK`, `LUNCH`, `ASSEMBLY`, `PREP`, `GAMES`) spanning vertically (`rowSpan={days.length}`) across Monday to Friday. Ordinary subjects (`PHY`, `MAT`) never merge vertically across days.
 * 3. Consecutive double lessons on the same day (`PHY Form 3 Imani` in Period 7A and 7B) merged horizontally (`colSpan={2}`) across consecutive periods.
 * 4. Bottom-left corner displays generated timestamp (`Generated on 17 Jul 2026, 23:05`), stripping out "Teacher timetable" text.
 * 5. Bottom-right corner displays `Powered by NEYO`.
 * 6. Edge-to-edge A4 layout (`cover the print paper edge to edge that way`).
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

interface MergedNonLessonCol {
  period: number;
  label: string;
  tone: "lunch" | "break";
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Detects which periods are school-wide non-lesson gaps or activities (`BREAK`, `LUNCH`, `ASSEMBLY`, `PREP`, `GAMES`).
 * These columns get merged vertically across all days (`rowSpan={daysCount}`). Ordinary academic lessons (`PHY`) never merge vertically.
 */
function getMergedNonLessonPeriods(slots: RealSlot[], daysCount: number, config: RealConfig | null | undefined): Map<number, MergedNonLessonCol> {
  const map = new Map<number, MergedNonLessonCol>();
  const slotsByPeriod = new Map<number, RealSlot[]>();

  for (const s of slots) {
    if (!slotsByPeriod.has(s.period)) slotsByPeriod.set(s.period, []);
    slotsByPeriod.get(s.period)!.push(s);
  }

  // 1. Config-driven lunch start
  if (config?.lunchStart && typeof config.lunchStart === "number") {
    map.set(config.lunchStart, { period: config.lunchStart, label: "LUNCH", tone: "lunch" });
  }

  // 2. Scan actual slot data for explicit LUNCH, BREAK, ASSEMBLY, PREP, RECESS, TEA
  for (const [p, pSlots] of slotsByPeriod.entries()) {
    if (pSlots.length === 0) continue;
    const nonLessonKeywords = ["LUNCH", "BREAK", "SHORT BREAK", "LONG BREAK", "TEA", "TEA BREAK", "SNACK", "ASSEMBLY", "PREP", "GAMES", "RECESS"];
    
    // Check if slots at period p across days are non-lesson
    const nonLessonCount = pSlots.filter((s) => {
      const code = (s.subjectCode || "").trim().toUpperCase();
      const name = (s.subjectName || "").trim().toUpperCase();
      const st = (s.slotType || "").trim().toUpperCase();
      return nonLessonKeywords.some((k) => code === k || name.includes(k) || st === k);
    }).length;

    // If all or majority of active slots at period p are non-lesson -> merge vertically
    if (nonLessonCount > 0 && nonLessonCount >= Math.min(pSlots.length, Math.max(1, daysCount - 1))) {
      const first = pSlots.find((s) => {
        const c = (s.subjectCode || s.subjectName || "").trim().toUpperCase();
        return nonLessonKeywords.some((k) => c.includes(k));
      }) || pSlots[0];
      const code = (first.subjectCode || first.subjectName || "BREAK").trim().toUpperCase();
      const isLunch = code.includes("LUNCH");
      map.set(p, { period: p, label: code, tone: isLunch ? "lunch" : "break" });
    }
  }

  return map;
}

/**
 * Detects consecutive double periods on the same day (`colSpan={2}`).
 * For example, if Period 7A and Period 7B both have `PHY Form 3 Imani`, they merge horizontally into one double box.
 */
function computeDoubleSpanSecondHalvesForPrint(
  grid: Map<string, RealSlot>,
  periodsPerDay: number,
  mode: "classes" | "teachers" | undefined,
  mergedNonLessonMap: Map<number, MergedNonLessonCol>
): Set<string> {
  const secondHalves = new Set<string>();
  for (let d = 1; d <= 6; d++) {
    for (let p = 1; p < periodsPerDay; p++) {
      if (mergedNonLessonMap.has(p) || mergedNonLessonMap.has(p + 1)) continue;
      const a = grid.get(`${d}|${p}`);
      const b = grid.get(`${d}|${p + 1}`);
      if (!a || !b) continue;
      if (a.slotType === "ELECTIVE_BLOCK" || b.slotType === "ELECTIVE_BLOCK") continue;
      
      const aSubject = (a.subjectCode || a.subjectName || "").trim().toUpperCase();
      const bSubject = (b.subjectCode || b.subjectName || "").trim().toUpperCase();
      if (!aSubject || aSubject !== bSubject) continue;

      if (mode === "teachers") {
        const aClass = (a.className || "").trim().toUpperCase();
        const bClass = (b.className || "").trim().toUpperCase();
        if (!aClass || aClass !== bClass) continue;
      } else if (mode === "classes") {
        const aTeacher = (a.teacherShortCode || a.teacherName || "").trim().toUpperCase();
        const bTeacher = (b.teacherShortCode || b.teacherName || "").trim().toUpperCase();
        if (!aTeacher || aTeacher !== bTeacher) continue;
      } else {
        // Both check
        const aClass = (a.className || "").trim().toUpperCase();
        const bClass = (b.className || "").trim().toUpperCase();
        const aTeacher = (a.teacherShortCode || a.teacherName || "").trim().toUpperCase();
        const bTeacher = (b.teacherShortCode || b.teacherName || "").trim().toUpperCase();
        if ((aClass && bClass && aClass !== bClass) || (aTeacher && bTeacher && aTeacher !== bTeacher)) continue;
      }

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

function periodStartMinutes(p: number, config: RealConfig | null | undefined, mergedNonLessonMap: Map<number, MergedNonLessonCol>): number | null {
  const dayStart = parseTimeToMinutes(config?.schoolDayStartTime) ?? 480;
  const lessonMins = config?.lessonDurationMins ?? 40;
  const lunchMins = config?.lunchMins ?? 45;
  let elapsed = dayStart;
  for (let i = 1; i < p; i++) {
    const isLunch = mergedNonLessonMap.get(i)?.tone === "lunch";
    elapsed += isLunch ? lunchMins : lessonMins;
    if (config?.shortBreakStart === i && (config?.shortBreakMins ?? 0) > 0) elapsed += config!.shortBreakMins!;
    if (config?.shortBreak2Start === i && (config?.shortBreak2Mins ?? 0) > 0) elapsed += config!.shortBreak2Mins!;
    if (config?.longBreakStart === i && (config?.longBreakMins ?? 0) > 0) elapsed += config!.longBreakMins!;
  }
  return elapsed;
}

function periodTimeRange(p: number, config: RealConfig | null | undefined, mergedNonLessonMap: Map<number, MergedNonLessonCol>): string | null {
  const start = periodStartMinutes(p, config, mergedNonLessonMap);
  if (start == null) return null;
  const isLunch = mergedNonLessonMap.get(p)?.tone === "lunch";
  const duration = isLunch ? config?.lunchMins ?? 45 : config?.lessonDurationMins ?? 40;
  return `${formatTimetableTime(start)}–${formatTimetableTime(start + duration)}`;
}

interface NonLessonBreakRow {
  key: string;
  label: string;
  minutes: number;
}

function nonLessonBreakRowsForPeriod(p: number, config: RealConfig | null | undefined): NonLessonBreakRow[] {
  const rows: NonLessonBreakRow[] = [];
  if (config?.shortBreakStart === p && (config?.shortBreakMins ?? 0) > 0) {
    rows.push({ key: `short-${p}`, label: "BREAK", minutes: config!.shortBreakMins! });
  }
  if (config?.shortBreak2Start === p && (config?.shortBreak2Mins ?? 0) > 0) {
    rows.push({ key: `short2-${p}`, label: "BREAK", minutes: config!.shortBreak2Mins! });
  }
  if (config?.longBreakStart === p && (config?.longBreakMins ?? 0) > 0) {
    rows.push({ key: `long-${p}`, label: "LONG BREAK", minutes: config!.longBreakMins! });
  }
  return rows;
}

function subjectAbbrev(name?: string | null, code?: string | null): string {
  if (code && code.trim()) return code.trim().toUpperCase();
  if (!name) return "";
  return name.length > 12 ? `${name.slice(0, 12)}.` : name;
}

const SUBJECT_PALETTE: { bg: string; text: string }[] = [
  { bg: "#dbeafe", text: "#1e3a8a" },
  { bg: "#dcfce7", text: "#14532d" },
  { bg: "#fef3c7", text: "#78350f" },
  { bg: "#fce7f3", text: "#831843" },
  { bg: "#ede9fe", text: "#4c1d95" },
  { bg: "#cffafe", text: "#164e63" },
  { bg: "#ffedd5", text: "#7c2d12" },
  { bg: "#e0e7ff", text: "#312e81" },
  { bg: "#fee2e2", text: "#7f1d1d" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#fae8ff", text: "#701a75" },
  { bg: "#ecfccb", text: "#365314" },
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
  const subjText = subjectAbbrev(slot.subjectName, slot.subjectCode);
  const classText = slot.className ?? "";
  const venueCode = slot.venue ?? "";
  const teacherCode = mode === "teachers" ? "" : slot.teacherShortCode ?? slot.teacherName ?? "";
  const color = (slot as any).colorHex || (slot as any).color || subjectColorFor(slot.subjectCode, slot.subjectName, bandW);

  return (
    <div
      className={`ptt-cell${bandW ? " ptt-cell-bw" : ""}`}
      style={color && typeof color === "object" ? { background: color.bg, color: color.text } : typeof color === "string" ? { background: color, color: "#0f172a" } : undefined}
    >
      <div className="ptt-cell-main" style={{ fontSize: `${Math.round(fontSize * 1.35)}px` }}>
        {mode === "teachers" ? (
          <>
            {subjText && <span className="block font-black leading-tight">{subjText}</span>}
            {classText && <span className="block font-bold text-[72%] mt-0.5 leading-tight opacity-90">{classText}</span>}
          </>
        ) : (
          <>
            {subjText && <span className="block font-black leading-tight">{subjText}</span>}
          </>
        )}
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

  const mergedNonLessonMap = React.useMemo(() => getMergedNonLessonPeriods(slots, days.length, config), [slots, days.length, config]);
  const doubleSecondHalves = React.useMemo(() => computeDoubleSpanSecondHalvesForPrint(grid, periodsPerDay, mode, mergedNonLessonMap), [grid, periodsPerDay, mode, mergedNonLessonMap]);

  // Strip out "Teacher timetable" per founder rule: only display code e.g. "AR"
  const cleanSubtitle = (subtitle || "")
    .replace(/Teacher timetable\s*·?\s*/i, "")
    .replace(/Class timetable\s*·?\s*/i, "")
    .replace(/Venue timetable\s*·?\s*/i, "")
    .trim();

  return (
    <div className={`ptt-page ${daysVertical ? "ptt-landscape" : "ptt-portrait"}`}>
      <div className="ptt-header">
        <div className="ptt-header-top-school">
          RATIBA YA {(tenantName || "NEYO SECONDARY SCHOOL").toUpperCase()} MWAKA {new Date().getFullYear()}
        </div>
        <div className="ptt-header-title">
          {title.toUpperCase()}
        </div>
        {cleanSubtitle && (
          <div className="ptt-table-badge">
            {cleanSubtitle}
          </div>
        )}
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
              const mergedCol = mergedNonLessonMap.get(p);
              if (mergedCol) {
                return [
                  <tr key={`nonlesson-${p}`} className={`ptt-nonlesson-row ptt-nonlesson-${mergedCol.tone}`}>
                    <td className="ptt-period-num">
                      {p}
                      <div className="ptt-period-time">{periodTimeRange(p, config, mergedNonLessonMap)}</div>
                    </td>
                    <td colSpan={days.length}>{mergedCol.label}</td>
                  </tr>,
                ];
              }
              const lessonRow = (
                <tr key={`p-${p}`}>
                  <td className="ptt-period-num">
                    {p}
                    <div className="ptt-period-time">{periodTimeRange(p, config, mergedNonLessonMap)}</div>
                  </td>
                  {days.map((_, dIdx) => {
                    const d = dIdx + 1;
                    return (
                      <td key={d} className="ptt-td-cell">
                        <Cell slot={grid.get(`${d}|${p}`)} fontSize={cellFontSize} mode={mode} bandW={bandW} />
                      </td>
                    );
                  })}
                </tr>
              );
              const configBreaks = nonLessonBreakRowsForPeriod(p, config).map((row) => (
                <tr key={row.key} className="ptt-nonlesson-row ptt-nonlesson-break">
                  <td className="ptt-period-num" />
                  <td colSpan={days.length}>{row.label} · {row.minutes} MINS</td>
                </tr>
              ));
              return [lessonRow, ...configBreaks];
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
                const mergedCol = mergedNonLessonMap.get(p);
                if (mergedCol) {
                  headCells.push(
                    <th key={`ph-${p}`} className={`ptt-nonlesson-head ptt-nonlesson-${mergedCol.tone}`}>
                      {mergedCol.label}
                    </th>
                  );
                } else {
                  headCells.push(
                    <th key={`ph-${p}`}>
                      <div className="ptt-period-num">{p}</div>
                      <div className="ptt-period-time">{periodTimeRange(p, config, mergedNonLessonMap)}</div>
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
                  const mergedCol = mergedNonLessonMap.get(p);
                  if (mergedCol) {
                    // Merged vertical column (BREAK/LUNCH): drawn ONCE on Monday spanning all days
                    if (dIdx === 0) {
                      cells.push(
                        <td key={`c-${p}`} rowSpan={days.length} className={`ptt-nonlesson-vert ptt-nonlesson-${mergedCol.tone}`}>
                          {mergedCol.label}
                        </td>
                      );
                    }
                  } else if (doubleSecondHalves.has(`${d}|${p}`)) {
                    // Second half of horizontal double lesson: skipped because first half has colSpan={2}
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

      <div className="ptt-footer">
        <div className="ptt-footer-left">
          Generated on {new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="ptt-footer-right">
          Powered by NEYO
        </div>
      </div>

      {pageBreakAfter && <div className="ptt-page-break" />}

      <style jsx global>{`
        @page {
          size: A4 ${daysVertical ? "landscape" : "portrait"};
          margin: 6mm;
        }
        .ptt-page {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          color: #000000;
          width: 100%;
          min-height: 100vh;
          page-break-after: avoid;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }
        .ptt-page-break {
          page-break-after: always;
        }
        .ptt-header {
          text-align: center;
          margin-bottom: 3.5mm;
        }
        .ptt-header-top-school {
          font-weight: 800;
          font-size: 4.8mm;
          letter-spacing: 0.5mm;
          text-transform: uppercase;
          color: #0f172a;
        }
        .ptt-header-title {
          font-weight: 900;
          font-size: 8.5mm;
          letter-spacing: 1mm;
          text-transform: uppercase;
          color: #000000;
          margin-top: 1.5mm;
          line-height: 1.1;
        }
        .ptt-table-badge {
          font-size: 3.2mm;
          font-weight: 800;
          color: #334155;
          text-transform: uppercase;
          margin-top: 1.5mm;
          text-align: left;
        }
        .ptt-table {
          table-layout: fixed;
          border-collapse: collapse;
          width: 100%;
          flex: 1;
          border: 0.6mm solid #000000;
        }
        .ptt-table th,
        .ptt-table td {
          border: 0.45mm solid #000000;
          padding: 0;
          text-align: center;
          vertical-align: middle;
          position: relative;
        }
        .ptt-table thead th {
          background: #ffffff;
          color: #000000;
          font-size: 4mm;
          padding: 2mm 1mm;
          font-weight: 900;
        }
        .ptt-corner {
          width: 14mm;
          font-weight: 900;
          font-size: 4mm;
        }
        .ptt-period-num {
          font-size: 4.5mm;
          font-weight: 900;
        }
        .ptt-period-time {
          font-size: 2.2mm;
          font-weight: 600;
          color: #475569;
        }
        .ptt-td-cell {
          height: 15mm;
        }
        .ptt-cell {
          height: 100%;
          min-height: 15mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          padding: 1.5mm;
          position: relative;
        }
        .ptt-cell-empty {
          background: #ffffff;
        }
        .ptt-cell-bw {
          background: white !important;
          color: #000000 !important;
        }
        .ptt-cell-main {
          font-weight: 900;
          font-size: 4mm;
          text-align: center;
          line-height: 1.15;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          word-break: break-word;
          color: #000000;
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
          left: 1.2mm;
          right: 1.2mm;
          bottom: 0.8mm;
          display: flex;
          justify-content: space-between;
          font-size: 2.6mm;
          font-weight: 700;
          color: #334155;
          pointer-events: none;
        }
        .ptt-cell-venue {
          text-align: left;
        }
        .ptt-cell-teacher {
          text-align: right;
          font-weight: 800;
          color: #000000;
        }
        .ptt-nonlesson-row td {
          font-weight: 900;
          letter-spacing: 0.8mm;
        }
        .ptt-nonlesson-lunch {
          background: #ffffff;
          color: #000000;
        }
        .ptt-nonlesson-lunch td {
          height: 12mm;
          font-size: 4mm;
        }
        .ptt-nonlesson-break {
          background: #ffffff;
          color: #000000;
        }
        .ptt-nonlesson-break td {
          height: 10mm;
          font-size: 3.5mm;
        }
        .ptt-nonlesson-head {
          writing-mode: vertical-rl;
          text-orientation: upright;
          font-weight: 900;
          font-size: 4.2mm;
          letter-spacing: 0.5mm;
        }
        .ptt-nonlesson-head.ptt-nonlesson-lunch,
        .ptt-nonlesson-head.ptt-nonlesson-break {
          background: #ffffff !important;
          color: #000000 !important;
        }
        .ptt-nonlesson-vert {
          writing-mode: vertical-rl;
          text-orientation: upright;
          font-weight: 900;
          font-size: 4.8mm;
          letter-spacing: 1.5mm;
          background: #ffffff;
          color: #000000;
        }
        .ptt-day-name {
          font-weight: 900;
          font-size: 4.5mm;
          background: #ffffff;
          color: #000000;
        }
        .ptt-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 3mm;
          color: #1e293b;
          margin-top: 3.5mm;
          padding-top: 1mm;
        }
        .ptt-footer-left {
          font-weight: 600;
        }
        .ptt-footer-right {
          font-weight: 800;
          color: #000000;
        }
        @media screen {
          .ptt-page {
            max-width: ${daysVertical ? "297mm" : "210mm"};
            margin: 0 auto 8mm auto;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            padding: 8mm;
            box-sizing: border-box;
            min-height: ${daysVertical ? "210mm" : "297mm"};
          }
        }
      `}</style>
    </div>
  );
}
