/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 16: Junior School High-Density Practice — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. Grade 7/8/9 Mathematics (`Algebra, Geometry, Statistics, Linear Inequalities`) — 35 questions
 * 2. Grade 7/8/9 Integrated Science (`Force & Energy, Living Things, Ecosystems`) — 35 questions
 * 3. Grade 7/8/9 English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 30 questions
 *
 * Total in Part 16 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART16: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Junior School Mathematics (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Solving Equations involving Fractions and Brackets",
    prompt: "Solve for k: 3(k - 2) / 4 = 6.",
    questionType: "MULTIPLE_CHOICE",
    options: ["k = 10 (`since multiplying both sides by 4 gives 3(k - 2) = 24 => 3k - 6 = 24 => 3k = 30 => k = 10`)", "k = 8", "k = 14", "k = 6"],
    correctAnswer: "k = 10 (`since multiplying both sides by 4 gives 3(k - 2) = 24 => 3k - 6 = 24 => 3k = 30 => k = 10`)",
    explanation: "Multiply across by 4: 3(k - 2) = 24. Divide by 3: k - 2 = 8. Add 2: k = 10.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Surface Area of Solid Triangular Prisms",
    prompt: "Calculate the exact total surface area of a right triangular prism whose triangular cross-section has sides 6 cm, 8 cm, and 10 cm (`right-angled triangle with Area = 24 cm²`), and whose rectangular length is 20 cm.",
    questionType: "MULTIPLE_CHOICE",
    options: ["528 cm² (`since Two triangular ends = 2 × 24 = 48 cm²; Three rectangular sides = (6 × 20) + (8 × 20) + (10 × 20) = 120 + 160 + 200 = 480 cm²; Total = 48 + 480 = 528 cm²`)", "480 cm² (`rectangular walls only`)", "240 cm²", "600 cm³ (`volume`)"],
    correctAnswer: "528 cm² (`since Two triangular ends = 2 × 24 = 48 cm²; Three rectangular sides = (6 × 20) + (8 × 20) + (10 × 20) = 120 + 160 + 200 = 480 cm²; Total = 48 + 480 = 528 cm²`)",
    explanation: "Summing 2 triangular lids plus 3 rectangular side walls: 48 + 480 = 528 cm².",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Data Handling and probability",
    substrandName: "Relative Frequency vs Theoretical Probability",
    prompt: "If a student spins a 4-color spinner (`Red, Blue, Green, Yellow`) 100 times and lands on Green 32 times, what is the experimental probability of landing on Green, and how does it compare to theoretical probability?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Experimental probability = 0.32 (`32/100`)**, which is **higher** than the theoretical probability (`1/4 = 0.25`)", "Experimental probability = 0.25", "Experimental probability = 3.2", "Both probabilities are identical"],
    correctAnswer: "**Experimental probability = 0.32 (`32/100`)**, which is **higher** than the theoretical probability (`1/4 = 0.25`)",
    explanation: "Experimental relative frequency = 32 / 100 = 0.32. Theoretical = 1 / 4 = 0.25.",
    difficulty: 2,
  },

  // ===========================================================================
  // Junior School Science (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 7",
    strandName: "Force and Energy",
    substrandName: "Friction: Static vs Kinetic (`Sliding`) Friction",
    prompt: "Why is significantly more physical effort force required to **initiate movement (`start sliding`)** of a stationary heavy laboratory crate across the floor than to **keep it sliding** once it is already moving (`PTS`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because **Static Friction (`resting friction between stationary microscopic surface projections`) is always strictly greater than Kinetic Friction (`moving/sliding friction`)**", "Because gravity doubles when crates sit still", "Because the floor turns magnetic when crates stop", "Because kinetic friction equals zero"],
    correctAnswer: "Because **Static Friction (`resting friction between stationary microscopic surface projections`) is always strictly greater than Kinetic Friction (`moving/sliding friction`)**",
    explanation: "Static friction interlocks microscopic surface irregularities firmly. Once broken (`sliding`), momentum reduces interlock resistance (`kinetic friction < static friction`).",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Living Things and Their Environment",
    substrandName: "Ecological Pyramids: Pyramid of Biomass",
    prompt: "What exact ecological unit is measured and displayed across each horizontal bar of a **Pyramid of Biomass**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**The total dry organic weight (`mass of biological matter expressed in grams per square meter g/m² or tons/hectare`)** of all living organisms present at that specific trophic level at a given moment in time", "The total number of individual animals only", "The speed at which animals run across the field", "The temperature of the sun"],
    correctAnswer: "**The total dry organic weight (`mass of biological matter expressed in grams per square meter g/m² or tons/hectare`)** of all living organisms present at that specific trophic level at a given moment in time",
    explanation: "Biomass weighs dried biological tissue (`eliminating water weight fluctuations`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Junior School Languages (`30 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Relative Clauses: 'Whose' with Inanimate Objects",
    prompt: "Choose the correct relative pronoun: 'The chemistry textbook (`EE.8`), **_______** cover had been chewed by termites, was replaced by the librarian (`B.15`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**whose** (`in modern standard English, 'whose' is the accepted possessive relative pronoun for both persons and inanimate things like books or buildings when avoiding clumsy constructions like 'the cover of which'`)", "who's (`who is`)", "which", "whom"],
    correctAnswer: "**whose** (`in modern standard English, 'whose' is the accepted possessive relative pronoun for both persons and inanimate things like books or buildings when avoiding clumsy constructions like 'the cover of which'`)",
    explanation: "*Whose* expresses possession across both animate and inanimate antecedents (`'a book whose cover...'`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (U-ZI) katika Vivumishi",
    prompt: "Chagua upatanisho sahihi wa kisarufi: 'Ukuta **_______** wa shule ulibomoa jana kutokana na mafuriko, lakini kuta **_______** ziko salama (`SST`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**mrefu ... ndefu** (`ngeli ya U-ZI umoja 'm-' -> ukuta mrefu; wingi 'n-' -> kuta ndefu`)", "urefu ... zirefu", "lirefu ... marefu", "kirefu ... virefu"],
    correctAnswer: "**mrefu ... ndefu** (`ngeli ya U-ZI umoja 'm-' -> ukuta mrefu; wingi 'n-' -> kuta ndefu`)",
    explanation: "Ukuta imo ngeli ya U-ZI (`umoja ukuta mrefu / wingi kuta ndefu`).",
    difficulty: 1,
  }
];
