"use client";
import * as React from "react";

/**
 * BB.7 — Real, dedicated print-only rendering for the two Options Block
 * reference prints the founder asked for, kept deliberately SEPARATE from
 * the main colour-coded timetable grid (Z.3's PrintTimetablePage). This is
 * a plain, high-contrast A4-friendly REFERENCE document — no colour-coded
 * subject cells — since its whole job is to answer "which room/teacher do
 * I actually need for this Options Block period" or "who is in which real
 * subject-combination group", not to double as the day-to-day timetable.
 */

interface VenueRosterSubjectRow {
  subjectName: string;
  subjectCode: string | null;
  teacherName: string | null;
  teacherShortCode: string | null;
  venue: string | null;
}

interface VenueRosterRow {
  classId: string;
  className: string;
  day: string;
  period: number;
  blockName: string;
  slotLabel: string;
  subjects: VenueRosterSubjectRow[];
}

interface VenueRosterData {
  level: string | null;
  classes: { classId: string; className: string; rows: VenueRosterRow[] }[];
}

interface ComboRosterGroup {
  subjectNames: string[];
  studentCount: number;
  students: { name: string; admissionNo: string; currentClass: string }[];
}

interface ComboRosterData {
  level: string;
  groups: ComboRosterGroup[];
}

export function ElectivesRosterPrintView({
  tenantName,
  tenantLogoUrl,
  kind,
  venueData,
  comboData,
}: {
  tenantName?: string | null;
  tenantLogoUrl?: string | null;
  kind: "venue_roster" | "combination_roster";
  venueData?: VenueRosterData;
  comboData?: ComboRosterData;
}) {
  return (
    <div className="print-roster-root">
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; }
        body { background: #fff; }
        .print-roster-root { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; padding: 4px; }
        .pr-header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; }
        .pr-header img { height: 40px; width: 40px; object-fit: contain; }
        .pr-header h1 { font-size: 16px; margin: 0; font-weight: 700; }
        .pr-header p { font-size: 11px; margin: 2px 0 0; color: #333; }
        .pr-class-block { margin-bottom: 20px; page-break-inside: avoid; }
        .pr-class-block h2 { font-size: 13px; margin: 0 0 6px; border-bottom: 1px solid #999; padding-bottom: 3px; }
        table.pr-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        table.pr-table th, table.pr-table td { border: 1px solid #333; padding: 4px 6px; text-align: left; vertical-align: top; }
        table.pr-table th { background: #eee; font-weight: 700; }
        .pr-combo-group { margin-bottom: 18px; page-break-inside: avoid; }
        .pr-combo-group h3 { font-size: 12.5px; margin: 0 0 2px; }
        .pr-combo-group .pr-count { font-size: 10.5px; color: #333; margin: 0 0 6px; }
        .pr-empty { font-size: 12px; color: #555; font-style: italic; padding: 20px 0; }
        @media print { .pr-no-print { display: none; } }
      `}</style>

      <div className="pr-header">
        {tenantLogoUrl && <img src={tenantLogoUrl} alt="" />}
        <div>
          <h1>{tenantName || "NEYO School"}</h1>
          <p>
            {kind === "venue_roster"
              ? `Options Block — Venue & Teacher Roster${venueData?.level ? ` · ${venueData.level}` : " · All levels"}`
              : `Subject-Combination Roster · ${comboData?.level ?? ""}`}
          </p>
        </div>
      </div>

      {kind === "venue_roster" && venueData && (
        venueData.classes.length === 0 ? (
          <p className="pr-empty">No placed Options Block periods found for this level yet. Generate the timetable first, then re-print.</p>
        ) : (
          venueData.classes.map((cls) => (
            <div className="pr-class-block" key={cls.classId}>
              <h2>{cls.className}</h2>
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Period</th>
                    <th>Options Block</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.rows.map((row, ri) =>
                    row.subjects.map((sub, si) => (
                      <tr key={`${row.classId}-${ri}-${si}`}>
                        {si === 0 && (
                          <td rowSpan={row.subjects.length}>{row.day}</td>
                        )}
                        {si === 0 && (
                          <td rowSpan={row.subjects.length}>{row.period}</td>
                        )}
                        {si === 0 && (
                          <td rowSpan={row.subjects.length}>
                            {row.blockName}
                            <br />
                            <span style={{ color: "#555", fontSize: "10px" }}>{row.slotLabel}</span>
                          </td>
                        )}
                        <td>{sub.subjectName}{sub.subjectCode ? ` (${sub.subjectCode})` : ""}</td>
                        <td>{sub.teacherName ?? "—"}{sub.teacherShortCode ? ` (${sub.teacherShortCode})` : ""}</td>
                        <td>{sub.venue ?? "Own home classroom"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))
        )
      )}

      {kind === "combination_roster" && comboData && (
        comboData.groups.length === 0 ? (
          <p className="pr-empty">No confirmed subject choices found for this level yet.</p>
        ) : (
          comboData.groups.map((group, gi) => (
            <div className="pr-combo-group" key={gi}>
              <h3>Combination: {group.subjectNames.join(" + ")}</h3>
              <p className="pr-count">{group.studentCount} student{group.studentCount === 1 ? "" : "s"}</p>
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Admission No.</th>
                    <th>Current Class</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students.map((s, si) => (
                    <tr key={si}>
                      <td>{s.name}</td>
                      <td>{s.admissionNo}</td>
                      <td>{s.currentClass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )
      )}
    </div>
  );
}
