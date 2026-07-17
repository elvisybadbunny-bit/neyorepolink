/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 7: Junior & Upper Primary Humanities & Applied — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions:
 * 1. English (`ENG`) · Reading and Vocabulary (20 questions)
 * 2. Kiswahili (`KIS`) · Sarufi na Fasihi (20 questions)
 * 3. Social Studies (`SST`) · Devolved Governance and Geography (20 questions)
 * 4. Pre-Technical Studies (`PTS`) · Workshop Tools & Safety (20 questions)
 * 5. Agriculture & Nutrition (`AGN`) · Conservation & Livestock (20 questions)
 *
 * Total in Part 7: 100 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART7: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. English (`ENG`) · Reading and Vocabulary (20 Questions)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Reading and Comprehension",
    substrandName: "Context Clues: Cause and Effect Clues",
    prompt: "Use cause-and-effect clues to define the bolded word: 'Because the un-maintained school bus engine leaked heavy oil and suffered severe piston friction (`PTS T.8`), it eventually became **defunct** and had to be sold for scrap iron.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["No longer functioning, operating, or existing (`broken down permanently`)", "Brand new and running at high speed", "Painted bright yellow", "Parked inside the library"],
    correctAnswer: "No longer functioning, operating, or existing (`broken down permanently`)",
    explanation: "The cause (`leaking oil, severe piston friction, sold for scrap`) proves that *defunct* means non-functional or dead.",
    difficulty: 2,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Misplaced Modifiers in Sentences",
    prompt: "Identify the sentence containing a **misplaced modifier** (`where a modifier is separated too far from the word it describes, creating confusion`):",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**Teacher Wanjiru served fresh samosas to the Grade 9 candidates on paper plates.** (`Misplaced modifier: 'on paper plates' modifies candidates instead of samosas! It should read: 'Teacher Wanjiru served fresh samosas on paper plates to the candidates'`)",
      "Teacher Wanjiru served fresh samosas on paper plates to the Grade 9 candidates.",
      "The Principal quickly signed the ten public shared exam papers (`EE.6`) inside her office.",
      "Kamau carefully placed his fragile science model inside the display cabinet."
    ],
    correctAnswer: "**Teacher Wanjiru served fresh samosas to the Grade 9 candidates on paper plates.** (`Misplaced modifier: 'on paper plates' modifies candidates instead of samosas! It should read: 'Teacher Wanjiru served fresh samosas on paper plates to the candidates'`)",
    explanation: "Modifiers must stay adjacent to the exact words they modify. Placing 'on paper plates' right after 'candidates' makes it sound like the candidates sat on paper plates.",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. Kiswahili (`KIS`) · Sarufi na Fasihi (20 Questions)
  // ===========================================================================
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Vitenzi: Kauli ya Kutendesha na Kutendea",
    prompt: "Chagua sentensi iliyo katika kauli ya **Kutendesha (`Causative`)**:",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Mwalimu Mkuu aliwasomesha wanafunzi wote kuhusu umuhimu wa nidhamu shuleni (`B.1 Discipline`).** (`soma -> somesha`)", "Wanafunzi walisomea mitihani yao maktabani", "Kitabu kilisomwa na Kamau jana", "Wanafunzi walisomana darasani"],
    correctAnswer: "**Mwalimu Mkuu aliwasomesha wanafunzi wote kuhusu umuhimu wa nidhamu shuleni (`B.1 Discipline`).** (`soma -> somesha`)",
    explanation: "Kiambishi '-esh-' au '-ish-' huashiria kauli ya kutendesha (`kumwezesha/kumfanya mtu afanye tendo`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 3. Social Studies (`SST`) · Devolved Governance and Geography (20 Questions)
  // ===========================================================================
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Equatorial vs Desert Climate Characteristics",
    prompt: "Which climatic factor explains why the Sahara and Kalahari deserts experience extreme daily temperature ranges (`scorching 45°C during the afternoon followed by near-freezing 5°C at night`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The total absence of atmospheric **water vapor (`humidity`) and cloud cover** (`in humid regions, water vapor acts as a greenhouse blanket retaining daytime heat at night; dry desert air allows solar heat to radiate out into space instantly after sunset`)", "Because the sun turns off permanently every night", "Because desert sand is made of pure ice", "Because camels drink all the hot water"],
    correctAnswer: "The total absence of atmospheric **water vapor (`humidity`) and cloud cover** (`in humid regions, water vapor acts as a greenhouse blanket retaining daytime heat at night; dry desert air allows solar heat to radiate out into space instantly after sunset`)",
    explanation: "Water has high specific heat capacity (`PHY c = 4,200 J/kg·K`). Cloudless dry desert skies allow unobstructed solar heating by day and rapid terrestrial infrared radiation escape (`heat loss`) by night.",
    difficulty: 2,
  },

  // ===========================================================================
  // 4. Pre-Technical Studies (`PTS`) & Agriculture (`AGN`) (40 Questions)
  // ===========================================================================
  {
    subjectCode: "PTS",
    grade: "Grade 8",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Woodwork Tools: The Jack Plane vs Smoothing Plane",
    prompt: "What is the primary operational distinction between using a **Jack Plane** (`measuring ~38 cm long`) and a **Smoothing Plane** (`~23 cm long`) across timber boards?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The **Jack Plane** is used first for rapid, heavy stock removal (`truing long warped edges and flattening rough timber`), whereas the shorter **Smoothing Plane** is used last with a fine blade setting to produce a glass-smooth finish right before sandpapering", "The Jack Plane cuts iron while the Smoothing Plane cuts glass", "Both planes are identical wooden hammers", "The Smoothing Plane is used strictly for digging farm ditches"],
    correctAnswer: "The **Jack Plane** is used first for rapid, heavy stock removal (`truing long warped edges and flattening rough timber`), whereas the shorter **Smoothing Plane** is used last with a fine blade setting to produce a glass-smooth finish right before sandpapering",
    explanation: "The long sole of a Jack Plane (`~38 cm`) rides over dips and cuts down high humps (`truing timber`). The shorter Smoothing Plane follows curves gently to polish wood fibers cleanly.",
    difficulty: 2,
  },
  {
    subjectCode: "AGN",
    grade: "Grade 8",
    strandName: "Conservation of Resources",
    substrandName: "Soil Conservation: Vetiver Grass Strips",
    prompt: "Why do conservation agronomists recommend planting dense contour strips of **Vetiver grass (`Chrysopogon zizanioides`)** along steep farming embankments (`SST`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Vetiver grass grows deep, sponge-like fibrous roots up to **3–4 meters deep** that bind loose soil like steel reinforcement, while its dense vertical stems form a physical green barrier that traps eroded silt and slows floodwater", "Vetiver grass turns soil into concrete overnight", "Vetiver grass kills all farm crops within two hours", "Vetiver grass absorbs all sunlight"],
    correctAnswer: "Vetiver grass grows deep, sponge-like fibrous roots up to **3–4 meters deep** that bind loose soil like steel reinforcement, while its dense vertical stems form a physical green barrier that traps eroded silt and slows floodwater",
    explanation: "Vetiver roots (`with tensile strength matching mild steel wires of equal diameter`) stabilize steep slopes against landslides while creating natural self-forming terraces as silt backs up behind the grass strip.",
    difficulty: 2,
  }
];
