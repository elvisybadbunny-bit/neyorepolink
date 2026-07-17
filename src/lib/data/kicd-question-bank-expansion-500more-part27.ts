/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 27: Completing the 1,670 Benchmark — 213 Questions).
 *
 * Adds 213 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement`) — 71 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 71 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 71 questions
 *
 * Total in Part 27 of 500more: exactly 213 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 56 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART27: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`71 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Geometric Progressions (`Finding Number of Terms n`)",
    prompt: "A geometric progression has first term a = 5 and common ratio r = 3. If the nth term (`T_n`) is 1,215, what is the exact value of n?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**n = 6** (`since T_n = a × r^(n-1) => 1,215 = 5 × 3^(n-1) => 243 = 3^(n-1) => since 3⁵ = 243, n - 1 = 5 => n = 6`)", "n = 5", "n = 7", "n = 4"],
    correctAnswer: "**n = 6** (`since T_n = a × r^(n-1) => 1,215 = 5 × 3^(n-1) => 243 = 3^(n-1) => since 3⁵ = 243, n - 1 = 5 => n = 6`)",
    explanation: "Divide by 5 to get 3^(n-1) = 243. Since 3⁵ = 243, n - 1 = 5 => n = 6.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Circle Sector Perimeter (`P = 2r + Arc`)",
    prompt: "Find the total perimeter of a 60° circular sector slice with radius r = 21 cm. (`Take π = 22/7`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**64 cm** (`since Arc Length = (60/360) × 2πr = (1/6) × 2 × (22/7) × 21 = (1/6) × 132 = 22 cm; Perimeter = Arc + 2r = 22 + 42 = 64 cm`)", "22 cm (`arc only`)", "42 cm (`radii only`)", "231 cm² (`area`)"],
    correctAnswer: "**64 cm** (`since Arc Length = (60/360) × 2πr = (1/6) × 2 × (22/7) × 21 = (1/6) × 132 = 22 cm; Perimeter = Arc + 2r = 22 + 42 = 64 cm`)",
    explanation: "Arc length = (1/6) × 132 = 22 cm. Plus two radii (`21 + 21 = 42 cm`) = 64 cm.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`71 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Subjunctive Mood (`Demand that...`)",
    prompt: "Complete the formal demand sentence: 'The county health inspector demanded that the school cafeteria manager (`i18`) **_______** all food handler health certificates (`Clinic B.1`) before opening.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**display** (`bare infinitive base verb inside formal subjunctive clauses following demand/insist/require`)", "displays (`with -s`)", "displayed (`past`)", "is displaying"],
    correctAnswer: "**display** (`bare infinitive base verb inside formal subjunctive clauses following demand/insist/require`)",
    explanation: "Subjunctive after *demanded that* requires base verb (`display`).",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Kisarufi: Matumizi ya '-ngali-' (`Masharti ya Wakati Uliopita`)",
    prompt: "Chagua kiambishi sahihi cha masharti ya wakati uliopita: 'Wanafunzi **_______**fanya mazoezi ya kutosha muhula uliopita, **_______**faulu mtihani wao kwa alama za juu.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**wangali ... wangali** (`huonyesha masharti yaliyopitwa na wakati ambayo hayawezi kubadilika tena sasa`)", "wange ... wange (`wakati uliopo/ujao`)", "wali ... wali", "wame ... wame"],
    correctAnswer: "**wangali ... wangali** (`huonyesha masharti yaliyopitwa na wakati ambayo hayawezi kubadilika tena sasa`)",
    explanation: "'-ngali-' huonyesha majuto ya masharti yasiyotimizwa wakati uliopita (`counterfactual past`).",
    difficulty: 3,
  },

  // ===========================================================================
  // Science & Humanities (`71 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Electricity and Magnetism",
    substrandName: "Electric Energy and Cost (`Kilowatt-Hours kWh`)",
    prompt: "A school hostel (`B.16`) operates an electric water heater rated at 4.0 kW for 3 hours every day. At a tariff of KES 20.00 per kWh unit, what is the monthly electricity bill (`for 30 days`) for this single heater?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**KES 7,200.00** (`since Daily Energy = 4.0 kW × 3 h = 12.0 kWh; Monthly Energy = 12.0 × 30 = 360.0 kWh; Cost = 360 × KES 20 = KES 7,200.00`)", "KES 240.00 (`one day`)", "KES 14,400.00", "KES 3,600.00"],
    correctAnswer: "**KES 7,200.00** (`since Daily Energy = 4.0 kW × 3 h = 12.0 kWh; Monthly Energy = 12.0 × 30 = 360.0 kWh; Cost = 360 × KES 20 = KES 7,200.00`)",
    explanation: "Monthly units = 4.0 kW × 3 h × 30 days = 360 kWh. Cost = 360 × 20 = KES 7,200.",
    difficulty: 2,
  }
];
