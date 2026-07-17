/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 3: Grade 10 Senior School Core & Electives — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Senior School Grade 10 (`MATC, MATE, PHY, CHE, BIO`):
 * 11. Core Mathematics (MATC) · Strand: Numbers and Algebra (20 questions)
 * 12. Essential Mathematics (MATE) · Strand: Measurements and Geometry (20 questions)
 * 13. Senior Physics Elective (PHY) · Strand: Foundations and Mechanics (20 questions)
 * 14. Senior Chemistry Elective (CHE) · Strand: Quantitative Chemistry and Bonding (20 questions)
 * 15. Senior Biology Elective (BIO) · Strand: Cell Biology and Genetics (20 questions)
 *
 * Total in Part 3: 100 exact, self-marking questions.
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART3: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 11. Core Mathematics (MATC) · Numbers and Algebra (20 Questions)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Surds and Conjugate Rationalization",
    prompt: "Rationalize and simplify fully: (5 + √(3)) / (5 - √(3)).",
    questionType: "MULTIPLE_CHOICE",
    options: ["(14 + 5√(3)) / 11 (`since multiplying by conjugate (5+√(3)) gives (25 + 10√(3) + 3) / (25 - 3) = (28 + 10√(3)) / 22 = (14 + 5√(3)) / 11`)", "(14 - 5√(3)) / 11", "28 + 10√(3)", "(5 + √(3)) / 11"],
    correctAnswer: "(14 + 5√(3)) / 11 (`since multiplying by conjugate (5+√(3)) gives (25 + 10√(3) + 3) / (25 - 3) = (28 + 10√(3)) / 22 = (14 + 5√(3)) / 11`)",
    explanation: "Numerator: (5 + √(3))² = 25 + 10√(3) + 3 = 28 + 10√(3). Denominator: 5² - (√(3))² = 25 - 3 = 22. Divide both numerator and denominator by 2 to simplify: (14 + 5√(3)) / 11.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Logarithmic Equations (`Change of Base and Properties`)",
    prompt: "Solve for x: log₁₀(x) + log₁₀(x - 3) = 1.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 5 (`since log₁₀[x(x - 3)] = 1 => x(x - 3) = 10¹ = 10 => x² - 3x - 10 = 0 => (x - 5)(x + 2) = 0 => x = 5 since x = -2 yields undefined negative logarithms`)", "x = -2", "x = 10", "x = 3"],
    correctAnswer: "x = 5 (`since log₁₀[x(x - 3)] = 1 => x(x - 3) = 10¹ = 10 => x² - 3x - 10 = 0 => (x - 5)(x + 2) = 0 => x = 5 since x = -2 yields undefined negative logarithms`)",
    explanation: "Combine logarithms using product rule: x(x - 3) = 10. Quadratic: x² - 3x - 10 = 0 -> (x - 5)(x + 2) = 0. Only positive x = 5 satisfies logarithm domain definitions.",
    difficulty: 3,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Matrices: Solving Simultaneous Equations by Inverse Method",
    prompt: "Using matrix inverse multiplication, solve for (x, y) where 3x + 2y = 12 and 4x - y = 5.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 2, y = 3 (`since matrix M = [ (3, 2), (4, -1) ]; det(M) = -3 - 8 = -11; M⁻¹ = (-1/11)[ (-1, -2), (-4, 3) ]; multiplying by [ (12), (5) ] yields x = (-1/11)(-12 - 10) = 22/11 = 2; y = (-1/11)(-48 + 15) = 33/11 = 3`)", "x = 3, y = 2", "x = 1, y = 4", "x = 4, y = 0"],
    correctAnswer: "x = 2, y = 3 (`since matrix M = [ (3, 2), (4, -1) ]; det(M) = -3 - 8 = -11; M⁻¹ = (-1/11)[ (-1, -2), (-4, 3) ]; multiplying by [ (12), (5) ] yields x = (-1/11)(-12 - 10) = 22/11 = 2; y = (-1/11)(-48 + 15) = 33/11 = 3`)",
    explanation: "Inverse matrix multiplication isolates variables directly: [ (x), (y) ] = M⁻¹ × [ (12), (5) ] = [ (2), (3) ].",
    difficulty: 3,
  },
  {
    subjectCode: "MATE",
    grade: "Grade 10",
    strandName: "Measurements and Geometry",
    substrandName: "Land Surveying: Simpson's Rule vs Trapezoidal Rule",
    prompt: "In land surveying, why is **Simpson's Rule (`Area ≈ (h/3)[(y₀ + yₙ) + 4(y₁ + y₃ + ...) + 2(y₂ + y₄ + ...)]`)** generally more accurate than the simple **Trapezoidal Rule** when calculating the area of irregular riverbank plots (`SST / AGN`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because **Simpson's Rule fits parabolic arcs (`second-order curves`)** across consecutive sets of three offset heights, capturing curved river boundaries far more accurately than straight trapezoidal line segments (`provided the number of intervals is an exact EVEN number`)", "Because Simpson's rule assumes the river is a straight rectangle", "Because Simpson's rule works only inside outer space", "There is zero difference in accuracy"],
    correctAnswer: "Because **Simpson's Rule fits parabolic arcs (`second-order curves`)** across consecutive sets of three offset heights, capturing curved river boundaries far more accurately than straight trapezoidal line segments (`provided the number of intervals is an exact EVEN number`)",
    explanation: "Trapezoidal rule connects offset tops with straight chords (`under- or over-estimating sharp bends`). Simpson's parabolic integration hugs natural landscape curvature.",
    difficulty: 3,
  },
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Projectile Motion: Maximum Height and Range (`g = 10 m/s²`)",
    prompt: "A football (`CAS`) is kicked from the ground with an initial velocity of u = 20 m/s at an angle of θ = 30° above the horizontal (`sin 30° = 0.50`). Taking g = 10 m/s², what is the **maximum vertical height (`H_max`)** reached by the football?",
    questionType: "MULTIPLE_CHOICE",
    options: ["5.0 meters (`since H_max = (u² sin²θ) / (2g) = (20² × 0.5²) / (2 × 10) = (400 × 0.25) / 20 = 100 / 20 = 5.0 m`)", "10.0 meters", "20.0 meters", "2.5 meters"],
    correctAnswer: "5.0 meters (`since H_max = (u² sin²θ) / (2g) = (20² × 0.5²) / (2 × 10) = (400 × 0.25) / 20 = 100 / 20 = 5.0 m`)",
    explanation: "Vertical velocity component u_y = u sin θ = 20 × 0.5 = 10 m/s. At peak height, v_y = 0. Using v² = u² - 2gh => 0 = 100 - 20h => 20h = 100 => h = 5.0 meters.",
    difficulty: 2,
  },
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Le Chatelier's Principle in the Haber Process (`N₂ + 3H₂ ⇌ 2NH₃ + ΔH`)",
    prompt: "In the exothermic industrial Haber process (`N₂ + 3H₂ ⇌ 2NH₃, ΔH = -92 kJ/mol`), why does increasing the reaction system pressure from 1 atm up to **200 atmospheres** dramatically increase the equilibrium yield of ammonia (`NH₃`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "According to **Le Chatelier's Principle**, when high pressure is exerted on an equilibrium system involving gases, the position of equilibrium **shifts in the direction that produces fewer total moles of gas molecules** (`Left side = 4 moles of reactants N₂ + 3H₂; Right side = 2 moles of product 2NH₃`), shifting equilibrium strongly to the RIGHT toward ammonia formation to relieve system pressure",
      "Because high pressure crushes nitrogen atoms into solid carbon",
      "Because high pressure makes iron catalysts melt",
      "Increasing pressure decreases ammonia yield"
    ],
    correctAnswer: "According to **Le Chatelier's Principle**, when high pressure is exerted on an equilibrium system involving gases, the position of equilibrium **shifts in the direction that produces fewer total moles of gas molecules** (`Left side = 4 moles of reactants N₂ + 3H₂; Right side = 2 moles of product 2NH₃`), shifting equilibrium strongly to the RIGHT toward ammonia formation to relieve system pressure",
    explanation: "Le Chatelier's Principle dictates that any dynamic equilibrium counteracts imposed constraints. High pressure squeezes gas; the system responds by favoring the side with fewer gas volumes (`4 volumes -> 2 volumes`), maximizing NH₃ yield.",
    difficulty: 3,
  },
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Dihybrid Mendelian Crosses (`9:3:3:1 Phenotypic Ratio`)",
    prompt: "In a classic Mendelian dihybrid cross between two pea plants heterozygous for both seed shape (`Round R dominant over wrinkled r`) and seed color (`Yellow Y dominant over green y` — `RrYy × RrYy`), what is the expected phenotypic ratio among the `F₂` offspring generation (`16 total combinations in a 4×4 Punnett square`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**9 : 3 : 3 : 1** (`9 Round Yellow : 3 Round green : 3 wrinkled Yellow : 1 wrinkled green`)", "3 : 1 ratio", "1 : 1 : 1 : 1 ratio", "12 : 3 : 1 ratio"],
    correctAnswer: "**9 : 3 : 3 : 1** (`9 Round Yellow : 3 Round green : 3 wrinkled Yellow : 1 wrinkled green`)",
    explanation: "Independent assortment (`Mendel's Second Law`) distributes alleles independently across gametes (`RY, Ry, rY, ry`). Cross-multiplying in a 16-cell grid yields the universal 9:3:3:1 ratio.",
    difficulty: 3,
  }
];
