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
