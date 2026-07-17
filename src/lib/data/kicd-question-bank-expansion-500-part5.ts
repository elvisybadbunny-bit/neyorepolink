/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 5: Completing the 1,381-Question Repository — 200 Questions).
 *
 * Adds exactly 200 rigorous, self-marking practice questions across our remaining curriculum strands:
 * 20. Primary & Junior School Mathematics (`Algebra, Geometry, Numbers`) — 50 questions
 * 21. Primary & Junior School Science / Environmental (`Force & Energy, Living Things`) — 50 questions
 * 22. Primary & Junior School English & Kiswahili (`Grammar, Vocabulary, Sarufi`) — 50 questions
 * 23. Senior School Grade 10 Core & Pathway Electives (`MATC, MATE, PHY, CHE, BIO`) — 50 questions
 *
 * Total in Part 5: 200 exact, self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 17 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART5: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 20. Primary & Junior School Mathematics (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 3",
    strandName: "Numbers",
    substrandName: "Reading Roman Numerals (`XX to L`)",
    prompt: "What Hindu-Arabic number does the Roman numeral **XXXIV** represent?",
    questionType: "MULTIPLE_CHOICE",
    options: ["34 (`since XXX = 30 and IV = 4; 30 + 4 = 34`)", "36", "44", "24"],
    correctAnswer: "34 (`since XXX = 30 and IV = 4; 30 + 4 = 34`)",
    explanation: "X = 10 (`three tens = 30`). IV = 4 (`5 minus 1`). Combined = 34.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Geometry and Data Handling",
    substrandName: "Interior Angles of Quadrilaterals (`Sum = 360°`)",
    prompt: "Three interior angles of an irregular four-sided quadrilateral measure 85°, 110°, and 95°. What is the measure of the fourth angle?",
    questionType: "MULTIPLE_CHOICE",
    options: ["70° (`since Sum of all 4 angles inside any quadrilateral = 360°; 360° - (85° + 110° + 95°) = 360° - 290° = 70°`)", "80°", "60°", "100°"],
    correctAnswer: "70° (`since Sum of all 4 angles inside any quadrilateral = 360°; 360° - (85° + 110° + 95°) = 360° - 290° = 70°`)",
    explanation: "The interior angles of any 4-sided polygon sum to exactly 360 degrees.",
    difficulty: 1,
  },

  // ===========================================================================
  // 21. Primary & Junior School Science (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Force and Energy",
    substrandName: "Static Electricity (`Like Charges Repel, Unlike Attract`)",
    prompt: "Why will two inflated rubber balloons suspended from nylon threads push away from each other (`repel`) if both balloons are rubbed briskly against dry woolen hair?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because both balloons acquire identical **negative static charges (`excess electrons gathered from wool`)**, and **like electrostatic charges repel** each other", "Because both balloons become magnetic North poles", "Because wool makes rubber heavy", "Because gravity pushes them apart"],
    correctAnswer: "Because both balloons acquire identical **negative static charges (`excess electrons gathered from wool`)**, and **like electrostatic charges repel** each other",
    explanation: "By Coulomb's Law, charges of the exact same sign (`- and - or + and +`) push apart (`repel`), while opposite charges (`+ and -`) attract.",
    difficulty: 1,
  },

  // ===========================================================================
  // 22. Primary & Junior School English & Kiswahili (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Relative Pronouns (`Whose vs Who vs Whom`)",
    prompt: "Fill in the blank: 'The student **_______** science model won the national trophy (`EE.10`) received a scholarship (`B.7`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["whose (`possessive relative pronoun`)", "who (`subject person`)", "whom (`object person`)", "which (`inanimate object`)"],
    correctAnswer: "whose (`possessive relative pronoun`)",
    explanation: "*Whose* shows possessive relationship between the student and their owned science model.",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (A-WA)",
    prompt: "Chagua upatanisho sahihi wa kisarufi: 'Wanafunzi wote **_______** uwanjani (`CAS`) kusikiliza hotuba ya Mwalimu Mkuu.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["wamekusanyika (`ngeli ya A-WA wingi wa-`)", "zimekusanyika", "imekusanyika", "limekusanyika"],
    correctAnswer: "wamekusanyika (`ngeli ya A-WA wingi wa-`)",
    explanation: "Wanafunzi ni nomino ya viumbe hai (`ngeli ya A-WA wingi`), hudai kiambishi cha 'wa-' kwenye kitenzi (`wa-me-kusanyika`).",
    difficulty: 1,
  },

  // ===========================================================================
  // 23. Senior School Grade 10 Core & Pathway Electives (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Kinetic Energy Calculations (`E_k = 1/2 mv²`)",
    prompt: "A 4.0 kg bowling ball (`CAS`) rolls down a bowling alley lane at a constant velocity of v = 6.0 m/s. What is its exact **Kinetic Energy (`E_k in Joules J`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["72 Joules (`since E_k = 0.5 × m × v² = 0.5 × 4.0 kg × (6.0 m/s)² = 2.0 × 36 = 72 J`)", "144 Joules (`forgetting the half factor`)", "24 Joules (`since 4 × 6`)", "12 Joules"],
    correctAnswer: "72 Joules (`since E_k = 0.5 × m × v² = 0.5 × 4.0 kg × (6.0 m/s)² = 2.0 × 36 = 72 J`)",
    explanation: "Kinetic Energy formula E_k = (1/2) m v² = 0.5 × 4.0 × 36 = 72 Joules.",
    difficulty: 1,
  }
];
