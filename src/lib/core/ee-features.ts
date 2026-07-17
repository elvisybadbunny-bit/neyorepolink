/**
 * Part-EE feature registry (CBC/CBE deep integration + smart scanning +
 * learning library + quiz bank + contests — founder 2026-07-16 mega-request).
 *
 * Founder requirement (verbatim): "remember that every idea must have a
 * release button to be fully released ... a way to switch it off or on in
 * the neyo ops or neyo system to ensure that it can switched off for all
 * schools before launch of the idea."
 *
 * This reuses the EXACT same PlatformFlag table as the existing J_FEATURES
 * registry (`platform-flags.service.ts`), with the opposite default: a
 * Part-J feature defaults ON (missing row = enabled) because those features
 * were already live before the flag system existed. A Part-EE feature
 * defaults OFF (missing row = disabled) because the founder explicitly
 * wants every EE idea to launch switched off platform-wide until NEYO Ops
 * deliberately releases it — no new mechanism invented, just the same real
 * table read the other way round.
 */

export const EE_FEATURE_PREFIX = "eefeature:";

export interface EeFeatureDef {
  /** stable id used in the flag key, e.g. "EE.1" */
  id: string;
  label: string;
  description: string;
}

export const EE_FEATURES: EeFeatureDef[] = [
  { id: "EE.1", label: "CBC Sub-Strands + Cross-Linked Overview", description: "Real sub-strands under each strand, and one connected view of a learner's strand/competency/portfolio record." },
  { id: "EE.2", label: "Rubric-Driven Comment Auto-Fill", description: "A school's own comment bank, auto-filled by rubric level — never AI-generated." },
  { id: "EE.3", label: "KICD Curriculum Content Library", description: "Real PP1-Grade 12 strand/sub-strand curriculum content, phased by grade band." },
  { id: "EE.4", label: "Printable Mark Sheets + Scan-to-Enter", description: "Print a class mark sheet, scan/upload it back, marks enter automatically with re-scan delta detection." },
  { id: "EE.5", label: "Exam Paper Scanning", description: "Teacher writes an exam on paper, scans it, NEYO tidies it into a professional exam." },
  { id: "EE.6", label: "Exam Privacy Tiers + Cross-School Sharing", description: "Private / school-only / public-shared exam papers, with NEYO Ops approval for sharing." },
  { id: "EE.7", label: "YouTube Learning Library + Strand Linking", description: "Curated, ops-approved learning video links, auto-linked to strands, never storing video." },
  { id: "EE.8", label: "In-App Quiz / Question Bank", description: "Self-marking quizzes per strand/sub-strand, zero running cost." },
  { id: "EE.9", label: "Scan Paper Quiz to Formative Assessment", description: "Scan a paper quiz into a printable, self-marking formative assessment." },
  { id: "EE.10", label: "Inter-School Contests", description: "NEYO-hosted contests (coding or any subject) across schools, built on the quiz engine." },
  { id: "EE.11", label: "QR Gate-Pass Status Scanning", description: "Sub-second QR scan response with a clear allowed/not-allowed/didn't-pass/invalid status." },
  { id: "EE.12", label: "KNEC / KJSEA SMS & Webhook Placement Lookup", description: "Real-time SMS placement query (22263 style) verifying student Senior School pathway & class placement." },
  { id: "EE.13", label: "Interactive STEM Canvas Simulations", description: "Interactive virtual science and math lab simulations (Ohm's Law, Levers, Angles) with real-time sliders and calculations." },
  { id: "EE.14", label: "Automated CBC/CBE Digital Portfolio & Project Album PDF Booklet", description: "Converts student project photos, competency ratings, and rubric observations directly into a downloadable A4 PDF booklet." },
  { id: "EE.15", label: "Universal CBC/CBE Presets Engine", description: "1-Click application of the 7 universal core competencies, official KICD 4-point rubrics, and core values without manual typing." },
  // Idea 13 through 24 — The 12 Final School Management Pillars
  { id: "EE.16", label: "BOM Staff & TSC Statutory Payroll Engine", description: "Automated KRA statutory calculations (SHIF 2.75%, NSSF Tier I/II, Housing Levy 1.5%, PAYE) with bank direct CSV export." },
  { id: "EE.17", label: "Vehicle Fleet & Bus Logbook Suite", description: "Odometer tracking, Bundi OCR fuel station receipt audit, NTSA/Insurance expiration radar, and 8-point safety check." },
  { id: "EE.18", label: "Campus Discipline & Counseling Dossier", description: "4-Tier Demerit Matrix, watermarked PDF Parent Summons Generator, and confidential role-locked Guidance Counselor Vault." },
  { id: "EE.19", label: "Kitchen Store Requisitions & Rationing", description: "Per-capita daily food ration calibrator linking biometric headcounts to dry store drawdowns, divergence alert radar, and LPO studio." },
  { id: "EE.20", label: "Hostel Bed Matrix & Damage Recovery", description: "Interactive 2D dormitory cubicle grid, mattress/locker asset tagging, and automated vandalism recovery fee fee-invoice stamping." },
  { id: "EE.21", label: "School Farm Enterprise Accounting", description: "Double-entry agricultural yield ledger, internal kitchen sell-back transfer pricing, and direct M-Pesa staff purchase counter." },
  { id: "EE.22", label: "Teacher Leave & Lesson Substitution", description: "Clash-free lesson substitution auto-matcher, automated substitute SMS alerts, and 1-click TSC TPAD appraisal dossier export." },
  { id: "EE.23", label: "Capital Asset & Reagent Maintenance Vault", description: "QR asset tags, lab reagent hazmat safety registry, and running-hour telemetry alerts for generators, boreholes, and solar grids." },
  { id: "EE.24", label: "Alumni Association & Endowment Studio", description: "Class of YYYY cohort directory, career mentorship scheduler, and live liquid-glass M-Pesa campaign progress thermometer." },
  { id: "EE.25", label: "Visitor & Vendor Gate Security Log", description: "Rapid check-in with host SMS entry alerts, Custody Dispute Red-Flag Radar, and printable QR visitor security passes." },
  { id: "EE.26", label: "Textbook Ratio 1:1 & Fine Recovery", description: "Real-time 1:1 coursebook allocation dashboard, daily overdue fine engine, and 1-click lost book fee stamping to fee invoice." },
  { id: "EE.27", label: "Master School Diary & Event Scheduler", description: "Color-coded Odoo calendar, 72-hour parent SMS reminders, and interactive guest RSVP counts feeding kitchen rationing." },
];

export const EE_FEATURE_IDS = EE_FEATURES.map((f) => f.id);

export function eeFeatureKey(id: string): string {
  return `${EE_FEATURE_PREFIX}${id}`;
}

export function isEeFeatureKey(key: string): boolean {
  return key.startsWith(EE_FEATURE_PREFIX) && EE_FEATURE_IDS.includes(key.slice(EE_FEATURE_PREFIX.length));
}

export function getEeFeatureDef(id: string): EeFeatureDef | undefined {
  return EE_FEATURES.find((f) => f.id === id);
}
