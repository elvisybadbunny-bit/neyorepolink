import { z } from "zod";
import { PATHWAY_GROUPS } from "@/lib/validations/pathways";
import { CAREER_AREAS } from "@/lib/validations/career-discovery";

// =============================================================================
// PART Y.1 — NEYO Pathway Guide: validation + real reference data
// =============================================================================
// Founder request 2026-07-09: a NEYO version of the "Career Compass" concept
// (EduPoa) — interest/values questionnaire -> pathway + subject-combination
// recommendation -> real KUCCPS courses that relate to that combination.
//
// Founder correction 2026-07-09: NO grade-entry step anywhere in this
// feature — CBE learners are graded on the 4-point CBC rubric (BE/AE/ME/EE),
// not KCSE A-E letters, and a real Grade 9/Senior School learner genuinely
// has no KCSE-style grade to type in. Matching KUCCPS courses to a learner
// is done purely by SUBJECT COMBINATION: does the learner's recommended (or
// self-chosen) elective set contain a real subject that could satisfy each
// of a cluster's subject-requirement slots. The per-course minimum-grade
// data below is kept ONLY as informational "grades to aim for" display copy
// (useful once the learner eventually sits their Senior Secondary
// Assessment) — never collected as user input.

/** Real KCSE-style grade LABELS — used only for informational "aim for"
 *  display on a course card, never as a field the user fills in. */
export const KUCCPS_INFO_GRADES = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E",
] as const;
export type KuccpsInfoGrade = (typeof KUCCPS_INFO_GRADES)[number];

/** The real KUCCPS subject groups (I-V) referenced across cluster rules. */
export const KUCCPS_SUBJECT_GROUPS: Record<string, { name: string; codes: string[] }> = {
  COMPULSORY: { name: "Compulsory", codes: ["ENG", "KIS", "MAT"] },
  GROUP_II: { name: "Group II (Sciences)", codes: ["CHE", "PHY", "BIO", "GSC"] },
  GROUP_III: { name: "Group III (Humanities)", codes: ["GEO", "CRE", "IRE", "HRE", "HIS"] },
  GROUP_IV: { name: "Group IV (Technical)", codes: ["AVT", "CMP", "MTW", "ELC", "FIN", "BLD"] },
  GROUP_V: { name: "Group V (Languages/Business)", codes: ["GER", "ARB", "FRE", "BST", "MUS"] },
};

/**
 * Real KUCCPS degree-programme cluster reference data — the actual 20
 * official clusters (2025/2026 cycle), each with real, representative
 * subject-requirement rules and a genuinely popular subset of courses per
 * cluster (source: KUCCPS public cluster-requirement tables, cross-checked
 * against multiple 2025/2026 education-sector publications). Seeded via
 * `seedKuccpsClusters()` — idempotent, NEYO Ops can edit/extend afterward as
 * KUCCPS revises requirements each intake year.
 *
 * subjectRules: up to 4 real cluster-subject slots, each `anyOf` a set of
 * subject codes (matching KUCCPS's own "ENG/KIS", "MAT/PHY" style slots).
 * A learner's recommended subject combination "satisfies" a slot if it
 * contains ANY ONE of that slot's codes.
 */
export interface KuccpsSubjectRule {
  slot: number;
  anyOf: string[]; // subject codes, e.g. ["ENG","KIS"]
}

export interface KuccpsCourseSeed {
  name: string;
  /** informational only — "grades to aim for" per slot, shown, never required as input */
  minGrades: { slot: number; minGrade: KuccpsInfoGrade }[];
  minMeanGrade: KuccpsInfoGrade;
  typicalCutoff?: number;
  careerAreas: (typeof CAREER_AREAS)[number][];
}

export interface KuccpsClusterSeed {
  number: number;
  name: string;
  description: string;
  subjectRules: KuccpsSubjectRule[];
  courses: KuccpsCourseSeed[];
}

export const KUCCPS_CLUSTERS: KuccpsClusterSeed[] = [
  { number: 1, name: "Law & Related", description: "Bachelor of Laws (LL.B.) and related legal-studies programmes.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT", "GEO", "HIS", "CRE", "IRE", "HRE"] },
      { slot: 3, anyOf: ["ENG", "KIS", "HIS", "GEO", "CRE", "IRE", "HRE", "BST"] },
      { slot: 4, anyOf: ["MAT", "PHY", "CHE", "BIO", "GSC", "HIS", "GEO", "CRE", "IRE", "HRE", "BST", "FRE", "GER"] },
    ],
    courses: [
      { name: "Bachelor of Laws (LL.B.)", minGrades: [{ slot: 1, minGrade: "B" }], minMeanGrade: "B+", typicalCutoff: 45.0, careerAreas: ["Law & Public Service"] },
    ] },
  { number: 2, name: "Business, Hospitality & Related", description: "Business, commerce, hospitality, tourism, human resources and project management degrees.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT"] },
      { slot: 3, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "CRE", "IRE", "HRE", "HIS"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "CRE", "IRE", "HRE", "HIS", "BST", "CMP", "FRE", "GER"] },
    ],
    courses: [
      { name: "Bachelor of Commerce", minGrades: [{ slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Business Management", minGrades: [{ slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 34.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Hotel & Hospitality Management", minGrades: [{ slot: 2, minGrade: "C-" }], minMeanGrade: "C", typicalCutoff: 30.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Human Resource Management", minGrades: [{ slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 33.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Project Planning and Management", minGrades: [{ slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 33.0, careerAreas: ["Business & Economics"] },
    ] },
  { number: 3, name: "Social Sciences, Media, Fine Arts & Related", description: "Communication, journalism, international relations, fine arts, film and design programmes.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT", "CHE", "PHY", "BIO", "GSC"] },
      { slot: 3, anyOf: ["HIS", "GEO", "CRE", "IRE", "HRE"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "HIS", "GEO", "CRE", "IRE", "HRE", "BST", "MUS", "FIN", "CMP"] },
    ],
    courses: [
      { name: "Bachelor of Arts (Communication & Media)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Creative Arts & Design"] },
      { name: "Bachelor of Journalism and Mass Communication", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 33.0, careerAreas: ["Creative Arts & Design"] },
      { name: "Bachelor of Arts (International Relations and Diplomacy)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "B-", typicalCutoff: 36.0, careerAreas: ["Law & Public Service"] },
      { name: "Bachelor of Arts in Fine Art", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C", typicalCutoff: 28.0, careerAreas: ["Creative Arts & Design"] },
    ] },
  { number: 4, name: "Geoscience & Related", description: "Geology, meteorology, mining and geospatial-science programmes.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["PHY"] },
      { slot: 3, anyOf: ["CHE", "GEO", "BIO"] },
      { slot: 4, anyOf: ["CHE", "GEO", "BIO", "GSC"] },
    ],
    courses: [
      { name: "Bachelor of Science (Geology)", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 34.0, careerAreas: ["Engineering & Technology"] },
      { name: "Bachelor of Science (Meteorology)", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 44.0, careerAreas: ["Engineering & Technology"] },
    ] },
  { number: 5, name: "Engineering, Engineering Technology & Related", description: "Civil, mechanical, electrical, chemical and related engineering degrees.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["PHY"] },
      { slot: 3, anyOf: ["CHE"] },
      { slot: 4, anyOf: ["ENG", "KIS", "GEO", "CMP", "BST"] },
    ],
    courses: [
      { name: "Bachelor of Engineering (Civil Engineering)", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "B", typicalCutoff: 42.0, careerAreas: ["Engineering & Technology"] },
      { name: "Bachelor of Engineering (Mechanical Engineering)", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "B", typicalCutoff: 42.0, careerAreas: ["Engineering & Technology"] },
      { name: "Bachelor of Science (Electrical & Electronic Engineering)", minGrades: [{ slot: 1, minGrade: "B-" }, { slot: 2, minGrade: "B-" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "B", typicalCutoff: 44.0, careerAreas: ["Engineering & Technology"] },
    ] },
  { number: 6, name: "Architecture, Building Construction & Related", description: "Architecture, quantity surveying, urban planning and construction management.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["PHY", "GEO"] },
      { slot: 3, anyOf: ["CHE", "GEO", "BST"] },
      { slot: 4, anyOf: ["ENG", "KIS", "FIN", "CMP"] },
    ],
    courses: [
      { name: "Bachelor of Architecture", minGrades: [{ slot: 1, minGrade: "B" }, { slot: 2, minGrade: "B-" }], minMeanGrade: "B", typicalCutoff: 45.0, careerAreas: ["Engineering & Technology"] },
      { name: "Bachelor of Science in Quantity Surveying", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["Engineering & Technology"] },
    ] },
  { number: 7, name: "Computing, IT & Related", description: "Computer science, software engineering, IT and data-science programmes.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["PHY", "CMP"] },
      { slot: 3, anyOf: ["CHE", "BIO", "GSC", "GEO", "BST", "CMP"] },
      { slot: 4, anyOf: ["ENG", "KIS", "CRE", "IRE", "HRE", "HIS"] },
    ],
    courses: [
      { name: "Bachelor of Science in Computer Science", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["ICT & Computer Science"] },
      { name: "Bachelor of Science in Software Engineering", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 40.0, careerAreas: ["ICT & Computer Science"] },
      { name: "Bachelor of Science in Information Technology", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 34.0, careerAreas: ["ICT & Computer Science"] },
      { name: "Bachelor of Science in Data Science & Analytics", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 40.0, careerAreas: ["ICT & Computer Science"] },
    ] },
  { number: 8, name: "Agribusiness & Related", description: "Agribusiness, agricultural economics and rural enterprise management.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT"] },
      { slot: 3, anyOf: ["BIO", "AGR", "CHE"] },
      { slot: 4, anyOf: ["GEO", "BST", "CHE"] },
    ],
    courses: [
      { name: "Bachelor of Science (Agribusiness Management)", minGrades: [{ slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Agriculture & Environmental"] },
    ] },
  { number: 9, name: "General Science, Biological Sciences, Physics, Chemistry & Related", description: "Pure sciences: biology, chemistry, physics, biochemistry, microbiology.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["CHE"] },
      { slot: 3, anyOf: ["BIO", "PHY", "GSC"] },
      { slot: 4, anyOf: ["ENG", "KIS", "GEO", "AGR"] },
    ],
    courses: [
      { name: "Bachelor of Science (Biochemistry)", minGrades: [{ slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 40.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Science (Microbiology)", minGrades: [{ slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Science (Chemistry)", minGrades: [{ slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 36.0, careerAreas: ["Engineering & Technology"] },
      { name: "Bachelor of Science (Physics)", minGrades: [{ slot: 3, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 36.0, careerAreas: ["Engineering & Technology"] },
    ] },
  { number: 10, name: "Actuarial Science, Accountancy, Mathematics, Economics, Statistics & Related", description: "Actuarial science, accounting, mathematics, economics and statistics.",
    subjectRules: [
      { slot: 1, anyOf: ["MAT"] },
      { slot: 2, anyOf: ["ENG", "KIS"] },
      { slot: 3, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "BST"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "BST", "HIS", "CRE"] },
    ],
    courses: [
      { name: "Bachelor of Science in Actuarial Science", minGrades: [{ slot: 1, minGrade: "B" }], minMeanGrade: "B", typicalCutoff: 48.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Commerce (Accounting)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Science in Statistics", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 38.0, careerAreas: ["Business & Economics"] },
      { name: "Bachelor of Arts in Economics", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 34.0, careerAreas: ["Business & Economics"] },
    ] },
  { number: 11, name: "Interior Design, Fashion Design, Textiles & Related", description: "Interior design, fashion and textile technology.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT", "FIN"] },
      { slot: 3, anyOf: ["CHE", "PHY", "BIO", "GSC", "BST"] },
      { slot: 4, anyOf: ["FIN", "BST", "GEO"] },
    ],
    courses: [
      { name: "Bachelor of Science in Interior Design", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Creative Arts & Design"] },
      { name: "Bachelor of Arts in Fashion Design", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C", typicalCutoff: 28.0, careerAreas: ["Creative Arts & Design"] },
    ] },
  { number: 12, name: "Sport Science & Related", description: "Sports science, coaching and physical education.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["BIO"] },
      { slot: 3, anyOf: ["CHE", "PHY", "MAT"] },
      { slot: 4, anyOf: ["GEO", "BST", "CRE"] },
    ],
    courses: [
      { name: "Bachelor of Science (Sports Science)", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 30.0, careerAreas: ["Sports & Athletics"] },
    ] },
  { number: 13, name: "Medicine, Health, Veterinary Medicine & Related", description: "Medicine, dentistry, pharmacy, nursing, clinical medicine and veterinary medicine.",
    subjectRules: [
      { slot: 1, anyOf: ["BIO"] },
      { slot: 2, anyOf: ["CHE"] },
      { slot: 3, anyOf: ["MAT", "PHY"] },
      { slot: 4, anyOf: ["ENG", "KIS"] },
    ],
    courses: [
      { name: "Bachelor of Medicine and Surgery (MBChB)", minGrades: [{ slot: 1, minGrade: "B" }, { slot: 2, minGrade: "B" }, { slot: 3, minGrade: "B" }, { slot: 4, minGrade: "B" }], minMeanGrade: "A-", typicalCutoff: 60.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Dental Surgery", minGrades: [{ slot: 1, minGrade: "B" }, { slot: 2, minGrade: "B" }, { slot: 3, minGrade: "B" }, { slot: 4, minGrade: "B" }], minMeanGrade: "A-", typicalCutoff: 58.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Pharmacy", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }, { slot: 4, minGrade: "C+" }], minMeanGrade: "B+", typicalCutoff: 52.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Science (Nursing)", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }, { slot: 4, minGrade: "C+" }], minMeanGrade: "B-", typicalCutoff: 44.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Veterinary Medicine", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "B", typicalCutoff: 54.0, careerAreas: ["Medicine & Healthcare", "Agriculture & Environmental"] },
      { name: "Bachelor of Science in Clinical Medicine", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }, { slot: 3, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 40.0, careerAreas: ["Medicine & Healthcare"] },
    ] },
  { number: 14, name: "History, Archaeology & Related", description: "History and archaeology degrees.",
    subjectRules: [
      { slot: 1, anyOf: ["HIS"] },
      { slot: 2, anyOf: ["ENG", "KIS"] },
      { slot: 3, anyOf: ["GEO", "CRE", "IRE", "HRE"] },
      { slot: 4, anyOf: ["MAT", "CHE", "PHY", "BIO", "GSC", "BST"] },
    ],
    courses: [
      { name: "Bachelor of Arts (History)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 30.0, careerAreas: ["Education & Training"] },
    ] },
  { number: 15, name: "Agriculture, Food Science, Environment, Natural Resources & Related", description: "Agriculture, horticulture, food science, nutrition, forestry and environmental science.",
    subjectRules: [
      { slot: 1, anyOf: ["CHE", "PHY"] },
      { slot: 2, anyOf: ["BIO", "AGR"] },
      { slot: 3, anyOf: ["ENG", "KIS"] },
      { slot: 4, anyOf: ["MAT", "PHY", "GEO"] },
    ],
    courses: [
      { name: "Bachelor of Science in Agriculture", minGrades: [{ slot: 1, minGrade: "C" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 34.0, careerAreas: ["Agriculture & Environmental"] },
      { name: "Bachelor of Science in Horticulture", minGrades: [{ slot: 1, minGrade: "C" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Agriculture & Environmental"] },
      { name: "Bachelor of Science in Nutrition & Dietetics", minGrades: [{ slot: 1, minGrade: "C+" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 44.0, careerAreas: ["Medicine & Healthcare"] },
      { name: "Bachelor of Science (Forestry)", minGrades: [{ slot: 1, minGrade: "C" }, { slot: 2, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 33.0, careerAreas: ["Agriculture & Environmental"] },
      { name: "Bachelor of Science (Environmental Science)", minGrades: [{ slot: 1, minGrade: "C" }, { slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Agriculture & Environmental"] },
    ] },
  { number: 16, name: "Geography & Related", description: "Geography and natural-resources management.",
    subjectRules: [
      { slot: 1, anyOf: ["GEO"] },
      { slot: 2, anyOf: ["MAT"] },
      { slot: 3, anyOf: ["CHE", "PHY", "BIO", "GSC"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "HIS", "CRE", "BST"] },
    ],
    courses: [
      { name: "Bachelor of Arts (Geography)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 30.0, careerAreas: ["Agriculture & Environmental"] },
    ] },
  { number: 17, name: "French & German", description: "Bachelor of Arts in French or German.",
    subjectRules: [
      { slot: 1, anyOf: ["FRE", "GER"] },
      { slot: 2, anyOf: ["ENG", "KIS"] },
      { slot: 3, anyOf: ["MAT", "CHE", "PHY", "BIO", "GSC", "HIS", "GEO"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "HIS", "GEO", "BST", "CRE"] },
    ],
    courses: [
      { name: "Bachelor of Arts (French)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 28.0, careerAreas: ["Education & Training"] },
      { name: "Bachelor of Arts (German)", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 28.0, careerAreas: ["Education & Training"] },
    ] },
  { number: 18, name: "Music & Related", description: "Bachelor of Music and Arts (Music) programmes.",
    subjectRules: [
      { slot: 1, anyOf: ["MUS"] },
      { slot: 2, anyOf: ["ENG", "KIS"] },
      { slot: 3, anyOf: ["MAT", "CHE", "PHY", "BIO", "GSC", "HIS", "GEO"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "HIS", "GEO", "BST", "CRE"] },
    ],
    courses: [
      { name: "Bachelor of Music", minGrades: [{ slot: 1, minGrade: "C+" }], minMeanGrade: "C+", typicalCutoff: 28.0, careerAreas: ["Creative Arts & Design"] },
    ] },
  { number: 19, name: "Education & Related", description: "Bachelor of Education (Arts and Science options) and special education.",
    subjectRules: [
      { slot: 1, anyOf: ["ENG", "KIS"] },
      { slot: 2, anyOf: ["MAT"] },
      { slot: 3, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "HIS", "CRE", "IRE", "HRE", "BST"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "GEO", "HIS", "CRE", "IRE", "HRE", "BST", "FRE", "GER", "MUS"] },
    ],
    courses: [
      { name: "Bachelor of Education (Arts)", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 30.0, careerAreas: ["Education & Training"] },
      { name: "Bachelor of Education (Science)", minGrades: [{ slot: 2, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 32.0, careerAreas: ["Education & Training"] },
      { name: "Bachelor of Education (Special Needs Education)", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C+", typicalCutoff: 30.0, careerAreas: ["Education & Training"] },
    ] },
  { number: 20, name: "Religious Studies, Theology, Islamic Studies & Related", description: "Theology, Islamic studies and religious-studies degrees.",
    subjectRules: [
      { slot: 1, anyOf: ["CRE", "IRE", "HRE"] },
      { slot: 2, anyOf: ["ENG", "KIS"] },
      { slot: 3, anyOf: ["MAT", "HIS", "GEO", "BST"] },
      { slot: 4, anyOf: ["CHE", "PHY", "BIO", "GSC", "HIS", "GEO", "BST"] },
    ],
    courses: [
      { name: "Bachelor of Arts in Theology", minGrades: [{ slot: 1, minGrade: "C" }], minMeanGrade: "C", typicalCutoff: 26.0, careerAreas: ["Education & Training"] },
    ] },
];

// -----------------------------------------------------------------------------
// Questionnaire content — the 4-pillar structure (interests, skills, values,
// aspirations), each a set of real, plain-language items a Kenyan Grade 9/
// Senior-School learner or outsider can genuinely relate to. Deliberately
// NOT copying EduPoa's own wording — NEYO's own copy, own pathway groupings.
// -----------------------------------------------------------------------------
export interface GuideQuestionOption {
  id: string;
  label: string;
  signalsGroups: (typeof PATHWAY_GROUPS)[number][];
  signalsCareerAreas: (typeof CAREER_AREAS)[number][];
}

export interface GuideQuestion {
  id: string;
  pillar: "interests" | "skills" | "values" | "aspirations";
  prompt: string;
  helpText?: string;
  options: GuideQuestionOption[];
}

export const PATHWAY_GUIDE_QUESTIONS: GuideQuestion[] = [
  { id: "int_1", pillar: "interests", prompt: "Which of these do you enjoy learning about the most?",
    options: [
      { id: "sci", label: "How things work — machines, science experiments, computers", signalsGroups: ["STEM"], signalsCareerAreas: ["Engineering & Technology", "ICT & Computer Science"] },
      { id: "bodies", label: "The human body, health and helping sick people get better", signalsGroups: ["STEM"], signalsCareerAreas: ["Medicine & Healthcare"] },
      { id: "nature", label: "Plants, animals, farms and the environment", signalsGroups: ["STEM"], signalsCareerAreas: ["Agriculture & Environmental"] },
      { id: "people", label: "How people, communities and countries are organised", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service", "Education & Training"] },
      { id: "money", label: "Business, money and how companies make profit", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Business & Economics"] },
      { id: "art", label: "Drawing, music, drama, film or design", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
      { id: "sport", label: "Sports, athletics and physical training", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Sports & Athletics"] },
    ] },
  { id: "int_2", pillar: "interests", prompt: "If you had a free afternoon, what would you rather do?",
    options: [
      { id: "build", label: "Build or fix something (a gadget, a bike, code a small app)", signalsGroups: ["STEM"], signalsCareerAreas: ["Engineering & Technology", "ICT & Computer Science"] },
      { id: "read_debate", label: "Read the news and debate current affairs with friends", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service"] },
      { id: "perform", label: "Practice a song, dance routine or a play", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
      { id: "play_sport", label: "Play or train for a sport", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Sports & Athletics"] },
      { id: "tutor", label: "Help a younger sibling or classmate understand schoolwork", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Education & Training"] },
      { id: "garden", label: "Tend a garden or look after animals", signalsGroups: ["STEM"], signalsCareerAreas: ["Agriculture & Environmental"] },
    ] },
  { id: "skl_1", pillar: "skills", prompt: "Which subject do you usually find easiest to do well in?",
    options: [
      { id: "math", label: "Mathematics", signalsGroups: ["STEM"], signalsCareerAreas: ["Engineering & Technology", "Business & Economics"] },
      { id: "sciences", label: "Sciences (Biology/Chemistry/Physics/Integrated Science)", signalsGroups: ["STEM"], signalsCareerAreas: ["Medicine & Healthcare", "Engineering & Technology"] },
      { id: "languages", label: "English/Kiswahili or another language", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Education & Training", "Law & Public Service"] },
      { id: "humanities", label: "History, Geography or Religious Education", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service"] },
      { id: "creative_skill", label: "Art, Music or a creative/technical craft", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
    ] },
  { id: "skl_2", pillar: "skills", prompt: "Which of these best describes a real strength of yours?",
    options: [
      { id: "logic", label: "Solving problems step by step, logically", signalsGroups: ["STEM"], signalsCareerAreas: ["Engineering & Technology", "ICT & Computer Science"] },
      { id: "communicate", label: "Explaining ideas clearly and persuading others", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service", "Business & Economics"] },
      { id: "care", label: "Caring for and comforting people who are unwell or upset", signalsGroups: ["STEM"], signalsCareerAreas: ["Medicine & Healthcare"] },
      { id: "create", label: "Coming up with original, creative ideas", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
      { id: "lead", label: "Leading a team and organising people to get things done", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Business & Economics", "Law & Public Service"] },
      { id: "physical", label: "Physical fitness, coordination and discipline in training", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Sports & Athletics"] },
    ] },
  { id: "val_1", pillar: "values", prompt: "Which matters most to you in a future job?",
    options: [
      { id: "impact_health", label: "Directly saving or improving people's health", signalsGroups: ["STEM"], signalsCareerAreas: ["Medicine & Healthcare"] },
      { id: "impact_society", label: "Fighting for justice and fairness in society", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service"] },
      { id: "impact_environment", label: "Protecting the environment and food security", signalsGroups: ["STEM"], signalsCareerAreas: ["Agriculture & Environmental"] },
      { id: "impact_money", label: "Building wealth and financial independence", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Business & Economics"] },
      { id: "impact_expression", label: "Expressing myself and inspiring others creatively", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
      { id: "impact_teaching", label: "Passing on knowledge and mentoring the next generation", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Education & Training"] },
    ] },
  { id: "asp_1", pillar: "aspirations", prompt: "Which of these dreams excites you the most?",
    options: [
      { id: "doctor", label: "Becoming a doctor, nurse or other health professional", signalsGroups: ["STEM"], signalsCareerAreas: ["Medicine & Healthcare"] },
      { id: "engineer", label: "Becoming an engineer, software developer or tech founder", signalsGroups: ["STEM"], signalsCareerAreas: ["Engineering & Technology", "ICT & Computer Science"] },
      { id: "lawyer", label: "Becoming a lawyer, diplomat or civil servant", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Law & Public Service"] },
      { id: "entrepreneur", label: "Running my own business or company", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Business & Economics"] },
      { id: "artist", label: "Becoming a musician, designer, filmmaker or artist", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Creative Arts & Design"] },
      { id: "athlete", label: "Becoming a professional athlete or sports coach", signalsGroups: ["ARTS_SPORTS"], signalsCareerAreas: ["Sports & Athletics"] },
      { id: "farmer", label: "Running a modern farm or agribusiness", signalsGroups: ["STEM"], signalsCareerAreas: ["Agriculture & Environmental"] },
      { id: "teacher", label: "Becoming a teacher, lecturer or trainer", signalsGroups: ["SOCIAL_SCIENCES"], signalsCareerAreas: ["Education & Training"] },
    ] },
];

// -----------------------------------------------------------------------------
// Zod schemas
// -----------------------------------------------------------------------------
export const guideAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export const startGuideSessionSchema = z.object({
  studentId: z.string().cuid().optional().nullable(),
  fullName: z.string().min(2).max(120).optional().nullable(),
  phone: z.string().min(1).optional().nullable(),
});

export const submitGuideAnswersSchema = z.object({
  sessionId: z.string().cuid(),
  answers: z.array(guideAnswerSchema).min(1),
});

export const startGuidePaymentSchema = z.object({
  sessionId: z.string().cuid(),
  phone: z.string().min(1, "Phone is required"),
});

export type StartGuideSessionInput = z.infer<typeof startGuideSessionSchema>;
export type SubmitGuideAnswersInput = z.infer<typeof submitGuideAnswersSchema>;
export type StartGuidePaymentInput = z.infer<typeof startGuidePaymentSchema>;

/** Founder-Ops-editable settings for the public unlock fee (PlatformSetting-backed). */
export const setGuideFeeSchema = z.object({
  amountKes: z.number().int().min(1).max(1000),
});
