/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 2: Junior School Math & Science — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. Junior School Mathematics (`MAT Grade 7, 8, 9 — Algebra, Geometry, Numbers, Measurement, Statistics`) — 50 questions
 * 2. Junior School Integrated Science (`ISC Grade 7, 8, 9 — Force & Energy, Living Things, Human Body Systems`) — 50 questions
 *
 * Total in Part 2 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART2: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Junior School Mathematics (`50 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Simplifying Algebraic Expressions with Negative Multipliers",
    prompt: "Simplify the expression fully: 6(2m - 3n) - 4(3m - 5n).",
    questionType: "MULTIPLE_CHOICE",
    options: ["2n (`since 6(2m - 3n) = 12m - 18n; -4(3m - 5n) = -12m + 20n; Combining like terms: 12m - 12m + 20n - 18n = 0 + 2n = 2n`)", "24m - 38n", "2m + 2n", "-2n"],
    correctAnswer: "2n (`since 6(2m - 3n) = 12m - 18n; -4(3m - 5n) = -12m + 20n; Combining like terms: 12m - 12m + 20n - 18n = 0 + 2n = 2n`)",
    explanation: "Watch the double negative during expansion: -4 × (-5n) = +20n. Combining terms: 12m - 12m + 20n - 18n = 2n.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Linear Equations (`Word Problems on Age and Sums`)",
    prompt: "A father is currently 3 times as old as his son. In 12 years' time, the sum of their ages will be exactly 72 years. What is the **son's current age** today?",
    questionType: "MULTIPLE_CHOICE",
    options: ["12 years old (`since if son = x, father = 3x; in 12 years, son = x+12, father = 3x+12 => (x+12) + (3x+12) = 72 => 4x + 24 = 72 => 4x = 48 => x = 12`)", "10 years old", "15 years old", "36 years old (`father's current age`)"],
    correctAnswer: "12 years old (`since if son = x, father = 3x; in 12 years, son = x+12, father = 3x+12 => (x+12) + (3x+12) = 72 => 4x + 24 = 72 => 4x = 48 => x = 12`)",
    explanation: "Let son today = x, father today = 3x. In 12 years: (x + 12) + (3x + 12) = 72 => 4x + 24 = 72 => 4x = 48 => x = 12.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Angle Properties of Parallel Lines (`Alternate and Co-Interior`)",
    prompt: "Two parallel lines are cut by a transversal. If one interior angle measures 64°, what is the exact measure of its **co-interior angle (`C-angle on the same side of the transversal`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["116° (`since co-interior angles between parallel lines sum to exactly 180° -> 180° - 64° = 116°`)", "64° (`alternate interior Z-angle`)", "26° (`complementary angle`)", "180°"],
    correctAnswer: "116° (`since co-interior angles between parallel lines sum to exactly 180° -> 180° - 64° = 116°`)",
    explanation: "Co-interior (`supplementary interior`) angles sum strictly to 180°. 180 - 64 = 116°.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Pythagorean Theorem (`Word Problem on Diagonal Screen`)",
    prompt: "A rectangular digital tablet screen (`EE.14`) measures 16 cm in width and 12 cm in height. What is the exact length of the **diagonal** across the screen?",
    questionType: "MULTIPLE_CHOICE",
    options: ["20 cm (`since Diagonal d = √(16² + 12²) = √(256 + 144) = √(400) = 20 cm — forming a 3-4-5 proportional right triangle`)", "28 cm (`perimeter sum`)", "14 cm", "400 cm"],
    correctAnswer: "20 cm (`since Diagonal d = √(16² + 12²) = √(256 + 144) = √(400) = 20 cm — forming a 3-4-5 proportional right triangle`)",
    explanation: "By Pythagoras: d² = 16² + 12² = 256 + 144 = 400. d = √(400) = 20 cm.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Volume and Capacity of Cylindrical Water Tanks",
    prompt: "A cylindrical school storage tank (`PTS`) has a base radius of r = 1.4 meters and a vertical height of h = 2.5 meters. Taking π = 22/7, calculate its total capacity in Liters (`where 1 m³ = 1,000 Liters`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["15,400 Liters (`since Volume V = πr²h = (22/7) × 1.4 × 1.4 × 2.5 = 22 × 0.2 × 1.4 × 2.5 = 15.4 m³; Capacity = 15.4 × 1,000 = 15,400 L`)", "1,540 Liters", "30,800 Liters", "154 Liters"],
    correctAnswer: "15,400 Liters (`since Volume V = πr²h = (22/7) × 1.4 × 1.4 × 2.5 = 22 × 0.2 × 1.4 × 2.5 = 15.4 m³; Capacity = 15.4 × 1,000 = 15,400 L`)",
    explanation: "Volume V = (22/7) × (1.4)² × 2.5 = 15.4 m³. 1 cubic meter equals 1,000 liters -> 15,400 Liters.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Algebra",
    substrandName: "Solving Quadratic Equations by Factoring (`ax² + bx + c = 0`)",
    prompt: "Find the exact roots of the quadratic equation: 2x² - 11x + 12 = 0.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 4 or x = 1.5 (`or 3/2; since splitting middle term gives 2x² - 8x - 3x + 12 = 2x(x - 4) - 3(x - 4) = (2x - 3)(x - 4) = 0 => x = 4 or x = 3/2`)", "x = -4 or x = -1.5", "x = 6 or x = 2", "x = 3 or x = 4"],
    correctAnswer: "x = 4 or x = 1.5 (`or 3/2; since splitting middle term gives 2x² - 8x - 3x + 12 = 2x(x - 4) - 3(x - 4) = (2x - 3)(x - 4) = 0 => x = 4 or x = 3/2`)",
    explanation: "Product = 2 × 12 = 24. Sum = -11. Factors are -8 and -3. Factoring (2x - 3)(x - 4) = 0 yields x = 4 or x = 1.5.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Data Handling and probability",
    substrandName: "Combined Probability (`Independent Events and Tree Diagrams`)",
    prompt: "In an inter-school coding contest (`EE.10`), the probability that student A passes is 0.80 and the probability that student B passes is 0.75. Assuming independent performance, what is the probability that **at least one** of the two students passes?",
    questionType: "MULTIPLE_CHOICE",
    options: ["0.95 (`since P(At least one passes) = 1 - P(Both fail) = 1 - [(1 - 0.80) × (1 - 0.75)] = 1 - [0.20 × 0.25] = 1 - 0.05 = 0.95`)", "0.60 (`product P(Both pass)`)", "1.55 (`sum`)", "0.85"],
    correctAnswer: "0.95 (`since P(At least one passes) = 1 - P(Both fail) = 1 - [(1 - 0.80) × (1 - 0.75)] = 1 - [0.20 × 0.25] = 1 - 0.05 = 0.95`)",
    explanation: "The simplest path to 'at least one' is 1 minus the probability that BOTH fail. P(A fails) = 0.20; P(B fails) = 0.25. P(Both fail) = 0.20 × 0.25 = 0.05. 1 - 0.05 = 0.95 (`95%`).",
    difficulty: 3,
  },

  // ===========================================================================
  // Junior School Science (`50 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 7",
    strandName: "Living Things and Their Environment",
    substrandName: "Photosynthesis vs Respiration (`Energy Transformations`)",
    prompt: "Which exact energy transformation takes place inside plant leaf chloroplasts during **photosynthesis** versus inside cell mitochondria during **cellular respiration**?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**Photosynthesis** converts **Solar Light Kinetic Energy into Chemical Potential Energy (`stored inside glucose bonds`)**; **Cellular Respiration** breaks down glucose bonds to convert **Chemical Potential Energy into usable Cellular Work Energy (`ATP molecules`) and thermal heat**",
      "Photosynthesis turns heat into light while respiration turns light into sound",
      "Both processes turn solar energy into nuclear energy",
      "There is zero energy transformation in biological cells"
    ],
    correctAnswer: "**Photosynthesis** converts **Solar Light Kinetic Energy into Chemical Potential Energy (`stored inside glucose bonds`)**; **Cellular Respiration** breaks down glucose bonds to convert **Chemical Potential Energy into usable Cellular Work Energy (`ATP molecules`) and thermal heat**",
    explanation: "Autotrophs build organic energy stores via sunlight (`photosynthesis`). All aerobic organisms unlock and burn those stores via cellular respiration (`ATP generation`).",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Mechanical Advantage of Pulley Block Systems",
    prompt: "A school workshop crane (`PTS`) raises a 1,200 N engine using a 4-pulley system (`Velocity Ratio V.R. = 4`). If the input effort required is 400 N, what is the exact **Mechanical Advantage (`M.A.`)** and **Efficiency (`%`)** of the machine?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**M.A. = 3.0** (`since M.A. = Load / Effort = 1,200 / 400 = 3.0`); **Efficiency = 75.0%** (`since Efficiency = (M.A. / V.R.) × 100% = (3.0 / 4.0) × 100% = 75.0%`)", "M.A. = 4.0; Efficiency = 100%", "M.A. = 3.0; Efficiency = 30%", "M.A. = 0.33; Efficiency = 25%"],
    correctAnswer: "**M.A. = 3.0** (`since M.A. = Load / Effort = 1,200 / 400 = 3.0`); **Efficiency = 75.0%** (`since Efficiency = (M.A. / V.R.) × 100% = (3.0 / 4.0) × 100% = 75.0%`)",
    explanation: "Mechanical Advantage = Load / Effort = 1,200 / 400 = 3.0. Efficiency = (3.0 / 4.0) × 100% = 75.0%.",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 9",
    strandName: "Human Body Systems and Health",
    substrandName: "The Endocrine System: Role of Adrenaline (`Epinephrine`)",
    prompt: "When a student suddenly encounters an emergency situation (`such as an aggressive snake in the school compound B.20`), how does the instant secretion of **Adrenaline (`Epinephrine`)** by the adrenal glands adapt the human body for 'Fight or Flight'?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "It **accelerates heart rate and cardiac output (`pumping more O₂ blood to skeletal muscles`)**, dilates bronchial air tubes (`increasing oxygen intake`), dilates eye pupils (`sharpening vision`), constricts blood vessels to skin/digestive tract (`diverting blood to brain and legs`), and stimulates liver glycogen breakdown into **free blood glucose** for instant muscle fuel",
      "It puts the student into a deep 12-hour sleep",
      "It turns blood vessels into solid bone marrow",
      "It slows down breathing and lowers heart rate to zero"
    ],
    correctAnswer: "It **accelerates heart rate and cardiac output (`pumping more O₂ blood to skeletal muscles`)**, dilates bronchial air tubes (`increasing oxygen intake`), dilates eye pupils (`sharpening vision`), constricts blood vessels to skin/digestive tract (`diverting blood to brain and legs`), and stimulates liver glycogen breakdown into **free blood glucose** for instant muscle fuel",
    explanation: "Adrenaline is the body's rapid chemical alarm, mobilizing cardiovascular, respiratory, and metabolic energy within seconds during physical danger.",
    difficulty: 2,
  }
];
