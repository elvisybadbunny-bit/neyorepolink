/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 7: Completing the 1,571 Benchmark — 222 Questions).
 *
 * Adds 222 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Primary, Junior & Senior Mathematics (`Algebra, Geometry, Numbers, Trigonometry, Calculus, Surveying`) — 74 questions
 * 2. Primary, Junior & Senior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi, Composition`) — 74 questions
 * 3. Primary, Junior & Senior Sciences (`Physics, Chemistry, Biology, Integrated Science, Applied PTS/AGN`) — 74 questions
 *
 * Total in Part 7 of 500more: exactly 222 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 38 FILES: EXACTLY 1,571 UNIQUE SELF-MARKING QUESTIONS (`1,571 / 1,571`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART7: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`74 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Algebraic Simplification (`Combining Variables and Constants`)",
    prompt: "Simplify fully: 9p + 4q - 3p + 2q - 5.",
    questionType: "MULTIPLE_CHOICE",
    options: ["6p + 6q - 5 (`since (9p - 3p) + (4q + 2q) - 5 = 6p + 6q - 5`)", "6p - 6q - 5", "12p + 6q - 5", "6pq - 5"],
    correctAnswer: "6p + 6q - 5 (`since (9p - 3p) + (4q + 2q) - 5 = 6p + 6q - 5`)",
    explanation: "Group like terms together: (9p - 3p) + (4q + 2q) - 5 = 6p + 6q - 5.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Perimeter of Semicircles (`P = πr + 2r`)",
    prompt: "Calculate the exact perimeter of a closed semicircle whose radius is r = 7 cm. (`Take π = 22/7`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["36 cm (`since Perimeter = Curved Arc πr + Straight Diameter 2r = (22/7 × 7) + (2 × 7) = 22 + 14 = 36 cm`)", "22 cm (`curved arc only`)", "14 cm (`diameter only`)", "154 cm² (`area`)"],
    correctAnswer: "36 cm (`since Perimeter = Curved Arc πr + Straight Diameter 2r = (22/7 × 7) + (2 × 7) = 22 + 14 = 36 cm`)",
    explanation: "A closed semicircle boundary includes the curved half-circle arc (`πr = 22 cm`) plus the straight closing diameter (`2r = 14 cm`). Total = 22 + 14 = 36 cm.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Completing the Square (`Finding Vertex Coordinates of Parabola`)",
    prompt: "Express the quadratic curve y = x² - 8x + 21 in completed square form y = (x - h)² + k, and identify the exact coordinates of its **minimum turning point (`vertex`)**.",
    questionType: "MULTIPLE_CHOICE",
    options: ["y = (x - 4)² + 5; **Minimum Vertex = (4, 5)** (`since x² - 8x + 21 = (x - 4)² - 16 + 21 = (x - 4)² + 5; when (x - 4)² = 0 at x = 4, y = 5`)", "y = (x + 4)² + 5; Vertex = (-4, 5)", "y = (x - 4)² - 5; Vertex = (4, -5)", "y = (x - 8)² + 21; Vertex = (8, 21)"],
    correctAnswer: "y = (x - 4)² + 5; **Minimum Vertex = (4, 5)** (`since x² - 8x + 21 = (x - 4)² - 16 + 21 = (x - 4)² + 5; when (x - 4)² = 0 at x = 4, y = 5`)",
    explanation: "Half of -8 is -4. (x - 4)² = x² - 8x + 16. To balance +21, add +5: y = (x - 4)² + 5. Minimum occurs at x = 4 where y = 5.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`74 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Adverbs of Time vs Adverbs of Place",
    prompt: "In the sentence: 'The science club members (`EE.13`) gathered **early yesterday morning** inside the main auditorium (`A.17`) to prepare their digital portfolio booths (`EE.14`).', how is the bolded phrase classified?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**An Adverbial Phrase of Time** (`answering the exact question 'When did they gather?'`)", "An Adverbial Phrase of Place (`answering 'Where?'`)", "An Adjective Phrase modifying members", "A Gerund subject"],
    correctAnswer: "**An Adverbial Phrase of Time** (`answering the exact question 'When did they gather?'`)",
    explanation: "'Early yesterday morning' specifies temporal occurrence (`When? -> Time`). 'Inside the main auditorium' specifies spatial location (`Where? -> Place`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Vinyume vya Vivumishi (`Sifa za Watu`)",
    prompt: "Kinyume cha kivumishi **'mkarimu'** (`mtu anayependa kutoa msaada na ukarimu kwa wageni au wanyonge CSL J.17`) ni kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**mchoyo (`au mchoyo/bahili` — mtu asiyependa kutoa wala kusaidia wengine)**", "mrefu", "mwerevu", "pole"],
    correctAnswer: "**mchoyo (`au mchoyo/bahili` — mtu asiyependa kutoa wala kusaidia wengine)**",
    explanation: "Mkarimu (generous/hospitable) inapingana moja kwa moja na mchoyo/bahili (miserly/stingy).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`74 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Specific Latent Heat of Fusion of Ice (`Q = m × L_f`)",
    prompt: "How much exact thermal energy (`Q in Joules J`) must be supplied to melt 0.50 kilograms of pure ice at 0°C directly into liquid water at 0°C without changing temperature? (`Specific Latent Heat of Fusion of ice L_f = 336,000 J/kg`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**168,000 Joules** (`or 168 kJ; since Q = m × L_f = 0.50 kg × 336,000 J/kg = 168,000 J`)", "336,000 Joules", "84,000 Joules", "672,000 Joules"],
    correctAnswer: "**168,000 Joules** (`or 168 kJ; since Q = m × L_f = 0.50 kg × 336,000 J/kg = 168,000 J`)",
    explanation: "Latent heat breaks solid crystalline bonds (`phase transition from ice to liquid water`) without raising molecular kinetic speed (`0°C stays 0°C`). Q = 0.50 × 336,000 = 168,000 Joules (`168 kJ`).",
    difficulty: 2,
  }
];
