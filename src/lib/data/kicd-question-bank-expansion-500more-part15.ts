/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 15: Upper Primary Grade 4, 5, & 6 Intensive — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Upper Primary (`Grade 4, 5, and 6`):
 * 1. Grade 4 Mathematics, English & Science (`Multiplication, Fractions, Synonyms, Plant Roots`) — 35 questions
 * 2. Grade 5 Mathematics, English & Science (`Decimals, LCM/GCD, Adverbs, Pollination`) — 35 questions
 * 3. Grade 6 Mathematics, English & Science (`Percentages, Cuboid Volume, Active Voice, Circulatory System`) — 30 questions
 *
 * Total in Part 15 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART15: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Grade 4 Mathematics (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 4",
    strandName: "Numbers",
    substrandName: "Multiplication (`Two-Digit by One-Digit with Regrouping`)",
    prompt: "Calculate the exact product: 37 × 8.",
    questionType: "MULTIPLE_CHOICE",
    options: ["296 (`since 7 × 8 = 56 carry 5; 3 × 8 = 24 + 5 = 29 => 296`)", "286", "316", "276"],
    correctAnswer: "296 (`since 7 × 8 = 56 carry 5; 3 × 8 = 24 + 5 = 29 => 296`)",
    explanation: "7 × 8 = 56 (`write 6 carry 5`). 3 × 8 = 24 + 5 = 29. Product = 296.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 4",
    strandName: "Measurement",
    substrandName: "Converting Centimeters to Meters and Centimeters (`100 cm = 1 m`)",
    prompt: "A school library carpet (`B.15`) measures **325 centimeters** in length. How is this exact length expressed in meters and centimeters?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**3 meters and 25 centimeters (`3 m 25 cm`)** (`since 300 cm = 3 m, leaving 25 cm remaining`)", "32 meters and 5 centimeters", "3 meters and 5 centimeters", "30 meters and 25 centimeters"],
    correctAnswer: "**3 meters and 25 centimeters (`3 m 25 cm`)** (`since 300 cm = 3 m, leaving 25 cm remaining`)",
    explanation: "Every 100 centimeters equals 1 meter. 325 cm / 100 = 3 whole meters plus 25 cm remainder (`3 m 25 cm`).",
    difficulty: 1,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 4",
    strandName: "Reading and Comprehension",
    substrandName: "Synonyms (`Words with Similar Meanings`)",
    prompt: "Which of the following words is an exact **Synonym (`word with the same meaning`)** of the adjective **'rapid'** (`as in 'the school bus traveled at a rapid pace T.8'`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**fast (`or quick / swift`)**", "slow", "heavy", "quiet"],
    correctAnswer: "**fast (`or quick / swift`)**",
    explanation: "Synonyms share identical or near-identical definitions. *Rapid* means *fast* or *swift*.",
    difficulty: 1,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 4",
    strandName: "Living Things and Their Environment",
    substrandName: "Functions of Plant Roots (`Anchorage and Water Absorption`)",
    prompt: "What are the two primary biological roles of the **root system** (`taproots and fibrous roots`) of a maize or bean plant (`AGN`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**To anchor (`firmly hold`) the plant upright inside the soil against strong winds, and to absorb underground water and dissolved mineral salts needed for plant nutrition**", "To catch sunlight from the sky", "To attract bees for pollination", "To produce green leaves underground"],
    correctAnswer: "**To anchor (`firmly hold`) the plant upright inside the soil against strong winds, and to absorb underground water and dissolved mineral salts needed for plant nutrition**",
    explanation: "Roots anchor plants firmly and utilize millions of microscopic root hairs to draw soil water/minerals via osmosis/active transport.",
    difficulty: 1,
  },

  // ===========================================================================
  // Grade 5 Mathematics, English & Science (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Adding Decimals (`Three Decimal Places`)",
    prompt: "Find the exact sum: 12.456 + 3.821.",
    questionType: "MULTIPLE_CHOICE",
    options: ["16.277 (`since 6+1=7; 5+2=7; 4+8=12 carry 1; 12+3+1=16 => 16.277`)", "15.277", "16.177", "17.277"],
    correctAnswer: "16.277 (`since 6+1=7; 5+2=7; 4+8=12 carry 1; 12+3+1=16 => 16.277`)",
    explanation: "Align decimal points and carry across thousandths/hundredths/tenths: 12.456 + 3.821 = 16.277.",
    difficulty: 2,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 5",
    strandName: "Grammar in Use",
    substrandName: "Adverbs of Manner (`How an Action is Performed`)",
    prompt: "Which word inside the sentence acts as an **Adverb of Manner**: 'During the inter-school reading competition (`EE.10`), Wanjiru articulated her speech **eloquently** before the judges.'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**eloquently** (`modifying the verb 'articulated' telling exactly HOW she spoke`)", "during", "before", "speech"],
    correctAnswer: "**eloquently** (`modifying the verb 'articulated' telling exactly HOW she spoke`)",
    explanation: "Adverbs of manner (`eloquently, quickly, carefully`) typically end in `-ly` and answer *How?* about the action.",
    difficulty: 1,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 5",
    strandName: "Living Things and Their Environment",
    substrandName: "Agents of Seed Dispersal (`Wind vs Animals vs Explosion`)",
    prompt: "Why do dandelion seeds and cotton seeds possess lightweight, feathery, parachute-like hairs (`pappus`) attached to their seed coats?",
    questionType: "MULTIPLE_CHOICE",
    options: ["To enable **Wind Dispersal**, allowing light afternoon breezes to catch the feathery parachutes and carry the seeds miles away from the parent plant (`preventing overcrowding and competition for sunlight/water`)", "To attract dogs to eat them", "To make the seed heavy so it sinks into mud", "To protect the seed from fire"],
    correctAnswer: "To enable **Wind Dispersal**, allowing light afternoon breezes to catch the feathery parachutes and carry the seeds miles away from the parent plant (`preventing overcrowding and competition for sunlight/water`)",
    explanation: "Seed dispersal adaptations match vectors: feathery parachutes (`dandelion -> wind`), edible fleshy fruits (`guava -> birds/monkeys`), hooked burrs (`blackjack -> animal fur`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Grade 6 Mathematics, English & Science (`30 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Percentage Discounts (`Word Problem on Stationery`)",
    prompt: "A school geometry set (`PTS`) marked at **KES 500** is sold at a **20% discount**. How much exact discount in KES does the pupil save?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 100 (`since 20% of 500 = (20/100) × 500 = 20 × 5 = KES 100`)", "KES 80", "KES 400 (`final price`)", "KES 50"],
    correctAnswer: "KES 100 (`since 20% of 500 = (20/100) × 500 = 20 × 5 = KES 100`)",
    explanation: "20% of KES 500 = 0.20 × 500 = KES 100 discount saved.",
    difficulty: 1,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Active Voice vs Passive Voice (`Simple Present Transformation`)",
    prompt: "Transform into passive voice: 'The school cook (`i18`) prepares nutritious lunch (`AGN`) every noon.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Nutritious lunch is prepared by the school cook every noon.** (`Object 'lunch' becomes passive subject; simple present 'prepares' becomes 'is prepared'`)", "Nutritious lunch was prepared by the school cook every noon.", "Nutritious lunch has been prepared by the school cook.", "The school cook is preparing nutritious lunch."],
    correctAnswer: "**Nutritious lunch is prepared by the school cook every noon.** (`Object 'lunch' becomes passive subject; simple present 'prepares' becomes 'is prepared'`)",
    explanation: "Simple present active (`prepares`) transforms to simple present passive (`is/are + past participle -> is prepared`).",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Human Body Systems and Health",
    substrandName: "The Circulatory System: Arteries vs Veins (`Blood Pressure and Valves`)",
    prompt: "What is the exact structural difference between human **Arteries** (`which carry blood away from the heart`) and **Veins** (`which return blood back to the heart`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**Arteries** possess **thick, highly elastic, muscular walls with narrow lumens and ZERO valves** (`designed to withstand high-pressure ventricular pumping surges`); **Veins** possess **thinner walls with wide lumens and one-way pocket VALVES** (`preventing low-pressure blood from flowing backward`)",
      "Arteries carry blue blood while veins carry green blood",
      "Arteries have twenty valves while veins have zero walls",
      "There is zero difference between them"
    ],
    correctAnswer: "**Arteries** possess **thick, highly elastic, muscular walls with narrow lumens and ZERO valves** (`designed to withstand high-pressure ventricular pumping surges`); **Veins** possess **thinner walls with wide lumens and one-way pocket VALVES** (`preventing low-pressure blood from flowing backward`)",
    explanation: "Arteries withstand rhythmic high-pressure surges from the left ventricle (`pulse`). Veins return low-pressure blood via muscular squeezing and pocket valves.",
    difficulty: 2,
  }
];
