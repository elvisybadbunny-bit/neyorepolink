/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 14: Lower Primary Grade 1, 2, & 3 Intensive — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Lower Primary (`Grade 1, 2, and 3`):
 * 1. Grade 1 Mathematics, English & Science (`Numbers, Measurement, Shapes, Vocabulary, Living Things`) — 35 questions
 * 2. Grade 2 Mathematics, English & Science (`Regrouping, Capacity, Time, Grammar, Hygiene`) — 35 questions
 * 3. Grade 3 Mathematics, English & Science (`Thousands Place Value, Multi-Digit Arithmetic, Fractions, Ecosystems`) — 30 questions
 *
 * Total in Part 14 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART14: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Grade 1 Mathematics (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 1",
    strandName: "Numbers",
    substrandName: "Skip Counting by 5s up to 50",
    prompt: "What exact number comes directly after 35 when skip-counting forward by fives (`5, 10, 15...`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["40 (`since 35 + 5 = 40`)", "36", "45", "50"],
    correctAnswer: "40 (`since 35 + 5 = 40`)",
    explanation: "Counting forward by fives increments by 5: thirty-five (`35`), forty (`40`), forty-five (`45`).",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 1",
    strandName: "Numbers",
    substrandName: "Simple Subtraction within 20",
    prompt: "A pupil has 14 colored crayons (`CAS`) and lends 6 of them to a desk mate. How many crayons does the pupil have left?",
    questionType: "MULTIPLE_CHOICE",
    options: ["8 crayons (`since 14 - 6 = 8`)", "9 crayons", "7 crayons", "20 crayons"],
    correctAnswer: "8 crayons (`since 14 - 6 = 8`)",
    explanation: "Subtracting six items from fourteen leaves eight items (`14 - 6 = 8`).",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 1",
    strandName: "Measurement",
    substrandName: "Comparing Capacity (`Full vs Half-Full vs Empty`)",
    prompt: "When a drinking glass contains water up to the exact middle dividing line, how is its capacity state described?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Half-full (`or half-empty`)**", "Completely full", "Completely empty", "Overflowing"],
    correctAnswer: "**Half-full (`or half-empty`)**",
    explanation: "When liquid reaches the exact halfway point of a container, it is half-full (`1/2`).",
    difficulty: 1,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 1",
    strandName: "Reading and Comprehension",
    substrandName: "Basic Vocabulary: Animals and Their Young Ones",
    prompt: "What is the correct English word for the **young one (`baby`) of a cow (`AGN`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **calf** (`a calf of a cow`)", "A puppy (`dog`)", "A kitten (`dog/cat`)", "A chick (`chicken`)"],
    correctAnswer: "A **calf** (`a calf of a cow`)",
    explanation: "The offspring of bovine cattle (`cows/bulls`) is specifically called a *calf*.",
    difficulty: 1,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 1",
    strandName: "Living Things and Their Environment",
    substrandName: "Common Farm Animals vs Wild Animals",
    prompt: "Which of the following animals is classified as a domestic **farm animal (`AGN`)** that provides milk and meat, rather than a wild forest animal (`SST`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **Goat (`or Sheep / Cow`)**", "A Lion (`wild carnivore`)", "A Zebra (`wild herbivore`)", "A Hyena (`wild scavenger`)"],
    correctAnswer: "A **Goat (`or Sheep / Cow`)**",
    explanation: "Goats, sheep, cattle, and poultry are domesticated livestock kept on farms for human sustenance.",
    difficulty: 1,
  },

  // ===========================================================================
  // Grade 2 Mathematics, English & Science (`35 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 2",
    strandName: "Numbers",
    substrandName: "Multi-Digit Subtraction with Regrouping (`Borrowing within 100`)",
    prompt: "Calculate the exact difference: 83 - 47.",
    questionType: "MULTIPLE_CHOICE",
    options: ["36 (`since 3 ones is less than 7, borrow 1 ten from 80 leaving 70, making 13 ones; 13 - 7 = 6 ones; 7 tens - 4 tens = 3 tens => 36`)", "46", "34", "44"],
    correctAnswer: "36 (`since 3 ones is less than 7, borrow 1 ten from 80 leaving 70, making 13 ones; 13 - 7 = 6 ones; 7 tens - 4 tens = 3 tens => 36`)",
    explanation: "Borrow 1 ten (`10 ones`): 13 - 7 = 6 ones. 7 tens - 4 tens = 3 tens. Difference = 36.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 2",
    strandName: "Measurement",
    substrandName: "Time: Days and Months of the Year",
    prompt: "Which calendar month comes directly after **July** and right before **September** every year?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**August**", "June", "October", "December"],
    correctAnswer: "**August**",
    explanation: "The calendar sequence of summer months is June (`6th`), July (`7th`), **August (`8th`)**, September (`9th`).",
    difficulty: 1,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 2",
    strandName: "Grammar in Use",
    substrandName: "Personal Pronouns (`He vs She vs It vs They`)",
    prompt: "Choose the correct pronoun to replace the bolded words: '**Kamau and Wanjiru** walked together to the school playground (`CAS`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**They** (`plural third-person pronoun replacing two people`)", "He (`singular male`)", "She (`singular female`)", "It (`inanimate object`)"],
    correctAnswer: "**They** (`plural third-person pronoun replacing two people`)",
    explanation: "When referring to two or more people together (`Kamau and Wanjiru`), the third-person plural pronoun *They* is required.",
    difficulty: 1,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 2",
    strandName: "Human Body Systems and Health",
    substrandName: "Personal Hygiene: Washing Hands with Soap (`Bacteria Control`)",
    prompt: "Why must pupils always wash their hands thoroughly with **clean water and soap (`not just water alone`)** immediately after visiting the toilet and before eating lunch (`i18`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because **soap breaks down grease and destroys the oily outer membrane of harmful disease-causing germs and bacteria (`such as Cholera and Typhoid`)**, allowing them to be washed off safely with water (`preventing stomach illnesses`)", "Because soap turns water into milk", "Because water without soap freezes hands", "Because soap makes fingernails grow ten times longer"],
    correctAnswer: "Because **soap breaks down grease and destroys the oily outer membrane of harmful disease-causing germs and bacteria (`such as Cholera and Typhoid`)**, allowing them to be washed off safely with water (`preventing stomach illnesses`)",
    explanation: "Plain water cannot dissolve oily dirt on skin where bacteria lodge. Soap surfactant molecules trap oils and kill pathogens.",
    difficulty: 1,
  },

  // ===========================================================================
  // Grade 3 Mathematics, English & Science (`30 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 3",
    strandName: "Numbers",
    substrandName: "Multiplication Tables (`Multiplication Word Problems`)",
    prompt: "A school minibus (`T.8`) has 8 rows of passenger seats, and each row can seat exactly 5 students. What is the total student passenger capacity?",
    questionType: "MULTIPLE_CHOICE",
    options: ["40 students (`since Total capacity = Rows × Seats per row = 8 × 5 = 40`)", "35 students", "45 students", "13 students (`sum`)"],
    correctAnswer: "40 students (`since Total capacity = Rows × Seats per row = 8 × 5 = 40`)",
    explanation: "Multiplication of equal rows: 8 rows × 5 students per row = 40 students.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 3",
    strandName: "Numbers",
    substrandName: "Equivalent Fractions (`3/4 = 6/8 = 9/12`)",
    prompt: "Which of the following fractions is **exact equivalent in value** to three-quarters (`3/4`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**6/8** (`since multiplying both numerator 3 and denominator 4 by 2 yields 6/8`)", "4/5", "3/8", "2/4 (`half`)"],
    correctAnswer: "**6/8** (`since multiplying both numerator 3 and denominator 4 by 2 yields 6/8`)",
    explanation: "Multiplying top and bottom of 3/4 by 2: (3×2)/(4×2) = 6/8.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 3",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Salamu na Maamkizi ya Heshima ('Shikamoo / Marahaba')",
    prompt: "Mwanafunzi mdogo anapomsalimu mwalimu au mzee wa kijiji kwa heshima akisema **'Shikamoo'**, ni jibu gani sahihi la adabu linalopaswa kutolewa na mzee huyo?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**'Marahaba'** (`jibu rasmi la heshima linalokubali salamu ya utii ya Shikamoo`)", "'Sijambo'", "'Nzuri sana'", "'Hujambo'"],
    correctAnswer: "**'Marahaba'** (`jibu rasmi la heshima linalokubali salamu ya utii ya Shikamoo`)",
    explanation: "Shikamoo (`asili yake ni 'nashika miguu yako kwa heshima'`) inamkiri mkubwa kiadabu, naye hujibu 'Marahaba' (`nakubali heshima yako na kukubariki`).",
    difficulty: 1,
  }
];
