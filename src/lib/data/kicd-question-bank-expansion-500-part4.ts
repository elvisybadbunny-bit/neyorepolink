/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 4: Primary Grade 4, 5, & 6 — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Upper Primary (`Grade 4, 5, and 6`):
 * 16. Grade 4/5/6 Mathematics (MAT) · Strand: Fractions, Decimals and Percentages (25 questions)
 * 17. Grade 4/5/6 English (ENG) · Strand: Reading Comprehension and Vocabulary (25 questions)
 * 18. Grade 4/5/6 Kiswahili (KIS) · Strand: Sarufi, Methali na Vitendawili (25 questions)
 * 19. Grade 4/5/6 Integrated Science & Environmental (ISC/ENV) · Strand: Human Body & Living Ecosystems (25 questions)
 *
 * Total in Part 4: 100 exact, self-marking questions.
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART4: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 16. Grade 4/5/6 Mathematics (MAT) · Fractions, Decimals and Percentages (25 Questions)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Converting Mixed Numbers to Improper Fractions",
    prompt: "Express the mixed fraction **3 (4/7)** as an exact improper fraction.",
    questionType: "MULTIPLE_CHOICE",
    options: ["25/7 (`since (3 × 7) + 4 = 21 + 4 = 25 over denominator 7`)", "19/7", "12/7", "34/7"],
    correctAnswer: "25/7 (`since (3 × 7) + 4 = 21 + 4 = 25 over denominator 7`)",
    explanation: "Multiply the whole number (`3`) by the denominator (`7`) to get 21. Add the top numerator (`4`) to get 25. Place 25 over 7 -> 25/7.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Multiplying Fractions by Whole Numbers",
    prompt: "Evaluate: (3/5) × 40.",
    questionType: "MULTIPLE_CHOICE",
    options: ["24 (`since 40 / 5 = 8; 8 × 3 = 24`)", "15", "30", "12"],
    correctAnswer: "24 (`since 40 / 5 = 8; 8 × 3 = 24`)",
    explanation: "Divide whole number by denominator: 40 / 5 = 8. Multiply by top numerator: 8 × 3 = 24.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Division of Fractions (`Multiply by Reciprocal`)",
    prompt: "Calculate: (4/5) / (2/3).",
    questionType: "MULTIPLE_CHOICE",
    options: ["6/5 (`or 1 (1/5); since (4/5) × (3/2) = 12/10 = 6/5`)", "8/15", "5/6", "2/5"],
    correctAnswer: "6/5 (`or 1 (1/5); since (4/5) × (3/2) = 12/10 = 6/5`)",
    explanation: "To divide fractions, multiply the first fraction by the reciprocal (`flipped version`) of the second: (4/5) × (3/2) = 12/10 = 6/5.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Decimals: Multiplication by 10, 100, and 1,000",
    prompt: "Multiply the decimal: 3.486 × 100.",
    questionType: "MULTIPLE_CHOICE",
    options: ["348.6 (`since multiplying by 100 moves the decimal point exactly two places to the right`)", "34.86", "3,486", "0.03486"],
    correctAnswer: "348.6 (`since multiplying by 100 moves the decimal point exactly two places to the right`)",
    explanation: "Each zero in powers of ten (`100 has 2 zeroes`) shifts the decimal point one step right (`3.486 -> 34.86 -> 348.6`).",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Order of Operations (`BODMAS / PEMDAS`)",
    prompt: "Evaluate using BODMAS: 20 + 15 / 5 × 2 - 4.",
    questionType: "MULTIPLE_CHOICE",
    options: ["22 (`since Division first: 15/5 = 3; then Multiplication: 3×2 = 6; then Addition: 20+6 = 26; then Subtraction: 26 - 4 = 22`)", "10", "18", "30"],
    correctAnswer: "22 (`since Division first: 15/5 = 3; then Multiplication: 3×2 = 6; then Addition: 20+6 = 26; then Subtraction: 26 - 4 = 22`)",
    explanation: "BODMAS demands Division/Multiplication before Addition/Subtraction. 15/5 = 3; 3×2 = 6. 20 + 6 - 4 = 22.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Measurement",
    substrandName: "Speed, Distance, and Time (`Speed = Distance / Time`)",
    prompt: "A school transport bus (`T.8`) travels a total distance of 180 km in 3.0 hours. What is its average speed in kilometers per hour (`km/h`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["60 km/h (`since Speed = Distance / Time = 180 km / 3.0 h = 60 km/h`)", "90 km/h", "45 km/h", "540 km/h"],
    correctAnswer: "60 km/h (`since Speed = Distance / Time = 180 km / 3.0 h = 60 km/h`)",
    explanation: "Average Speed equals Total Distance divided by Total Time: 180 / 3 = 60 km/h.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Measurement",
    substrandName: "Converting Speed from km/h to m/s (`Multiply by 5/18`)",
    prompt: "Convert an automobile highway speed of **72 km/h** into exactly meters per second (`m/s`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["20 m/s (`since 72 × (1,000 m / 3,600 s) = 72 × (5/18) = 4 × 5 = 20 m/s`)", "15 m/s", "25 m/s", "720 m/s"],
    correctAnswer: "20 m/s (`since 72 × (1,000 m / 3,600 s) = 72 × (5/18) = 4 × 5 = 20 m/s`)",
    explanation: "To convert km/h to m/s, multiply directly by the conversion fraction 5/18 (`72 / 18 = 4; 4 × 5 = 20 m/s`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 17. Grade 4/5/6 English (ENG) · Reading Comprehension and Vocabulary (25 Questions)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 5",
    strandName: "Reading and Comprehension",
    substrandName: "Synthesizing Story Themes from Character Growth",
    prompt: "In a story where a selfish pupil (`B.11`) who initially refuses to lend his dictionary later breaks his leg during football and is helped by the very classmates he snubbed (`inspiring him to donate half his pocket money to buy class library books B.15`), what is the central moral theme?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Generosity, kindness, and community spirit bring genuine friendship and peace, whereas selfishness leads to lonely regret (`character moral transformation`)", "Never play football near a school library", "Dictionaries cost ten times more than textbooks", "Classmates always want money"],
    correctAnswer: "Generosity, kindness, and community spirit bring genuine friendship and peace, whereas selfishness leads to lonely regret (`character moral transformation`)",
    explanation: "Themes extract the deeper ethical realization gained when characters undergo emotional growth.",
    difficulty: 1,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Comparative and Superlative Adjectives (`Irregular Forms`)",
    prompt: "What are the exact comparative and superlative forms of the irregular adjective **'bad'**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["bad -> **worse** -> **worst**", "bad -> badder -> baddest", "bad -> more bad -> most bad", "bad -> iller -> illest"],
    correctAnswer: "bad -> **worse** -> **worst**",
    explanation: "Irregular adjectives change spelling completely: *good -> better -> best*; *bad -> worse -> worst*.",
    difficulty: 1,
  },

  // ===========================================================================
  // 18. Grade 4/5/6 Kiswahili (KIS) · Sarufi, Methali na Vitendawili (25 Questions)
  // ===========================================================================
  {
    subjectCode: "KIS",
    grade: "Grade 5",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Ngeli za Nomino (KI-VI) katika Wingi",
    prompt: "Chagua wingi sahihi wa sentensi: 'Kichwa cha mtoto kinauma kutokana na homa (`B.1 Medical`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Vichwa vya watoto vinauma kutokana na homa.** (`Kichwa -> Vichwa; cha -> vya; kinauma -> vinauma`)", "Mikichwa ya watoto inauma kutokana na homa.", "Makichwa ya watoto yanauma kutokana na homa.", "Zichwa za watoto zinauma kutokana na homa."],
    correctAnswer: "**Vichwa vya watoto vinauma kutokana na homa.** (`Kichwa -> Vichwa; cha -> vya; kinauma -> vinauma`)",
    explanation: "Nomino 'kichwa' imo ngeli ya KI-VI wingi 'vi-'.",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Fasihi Simulizi na Misemo",
    substrandName: "Methali za Kiswahili (`Elimu na Maarifa`)",
    prompt: "Tegua maana ya methali: **'Elimu ni bahari, haina kimo wala ukomo.'**",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Maarifa na kujifunza ni mchakato usio na mwisho unaoendelea maisha yote ya binadamu (`Skills Passport J.6`)**", "Elimu hupatikana tu ukiogelea ndani ya bahari ya Hindi", "Wavuvi wa samaki wana elimu nyingi kuliko walimu", "Vitabu vya shule lazima vitupwe baharini wakati wa likizo"],
    correctAnswer: "**Maarifa na kujifunza ni mchakato usio na mwisho unaoendelea maisha yote ya binadamu (`Skills Passport J.6`)**",
    explanation: "Bahari ni pana na haipimiki urefu kwa urahisi. Methali huhamiza binadamu kuendelea kutafuta hekima bila kiburi.",
    difficulty: 1,
  },

  // ===========================================================================
  // 19. Grade 4/5/6 Integrated Science & Environmental (ISC/ENV) (25 Questions)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 5",
    strandName: "Living Things and Their Environment",
    substrandName: "Seed Germination: Conditions Required (`Water, Oxygen, Warmth`)",
    prompt: "Why will dry bean seeds inside a glass jar **fail to germinate (`sprout`)** if they are submerged completely under boiled, cooled water covered with a layer of vegetable oil?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because boiling strips dissolved **Oxygen (`O₂`)** from water, and the oil seal prevents fresh air from entering; without oxygen, seeds cannot respire to generate energy for cell division", "Because boiling water turns beans into rocks", "Because seeds hate vegetable oil", "Because seeds need absolute darkness to sprout"],
    correctAnswer: "Because boiling strips dissolved **Oxygen (`O₂`)** from water, and the oil seal prevents fresh air from entering; without oxygen, seeds cannot respire to generate energy for cell division",
    explanation: "Germination requires three exact conditions: Water (`to activate enzymes`), Oxygen (`for aerobic cellular respiration`), and Optimum Warmth (`temperature ~25°C`).",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Human Body Systems and Health",
    substrandName: "Circulatory System: Why Blood is Red (`Hemoglobin & Iron`)",
    prompt: "Why is healthy human and mammalian arterial blood bright red in color?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because red blood cells contain **Hemoglobin**, an iron-rich protein that turns bright crimson red when its iron atoms bind chemically with inhaled **Oxygen (`O₂`)** inside the lungs", "Because blood contains red food coloring dye from tomatoes", "Because red blood cells are made of copper rust", "Because the heart paints blood red every morning"],
    correctAnswer: "Because red blood cells contain **Hemoglobin**, an iron-rich protein that turns bright crimson red when its iron atoms bind chemically with inhaled **Oxygen (`O₂`)** inside the lungs",
    explanation: "The iron (`Fe²⁺`) core of hemoglobin oxygenates into bright red oxyhemoglobin inside pulmonary capillaries.",
    difficulty: 1,
  }
];
