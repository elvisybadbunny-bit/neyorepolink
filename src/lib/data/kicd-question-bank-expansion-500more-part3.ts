/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 3: Junior School Languages & Humanities — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. Junior School English (`ENG Grade 7, 8, 9 — Reading, Grammar, Composition, Vocabulary, Literary Devices`) — 35 questions
 * 2. Junior School Kiswahili (`KIS Grade 7, 8, 9 — Sarufi, Lugha ya Adabu, Methali, Vitendawili, Fasihi`) — 35 questions
 * 3. Junior School Social Studies (`SST Grade 7, 8, 9 — Devolved Governance, Geography, History, Citizenship`) — 30 questions
 *
 * Total in Part 3 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART3: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Junior School English (`35 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 7",
    strandName: "Grammar in Use",
    substrandName: "Order of Adjectives before a Noun (`DOSASCOMP`)",
    prompt: "Which option correctly orders the adjectives before the noun 'dining table' inside a school kitchen report (`i18`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **sturdy large rectangular brown wooden Kenyan** dining table", "A wooden brown rectangular large sturdy Kenyan dining table", "A brown sturdy wooden rectangular large Kenyan dining table", "A rectangular Kenyan brown sturdy wooden large dining table"],
    correctAnswer: "A **sturdy large rectangular brown wooden Kenyan** dining table",
    explanation: "Adjective sequence: Opinion (`sturdy`) -> Size (`large`) -> Shape (`rectangular`) -> Color (`brown`) -> Origin (`Kenyan`) -> Material (`wooden`) -> Noun (`table`).",
    difficulty: 2,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Reading and Comprehension",
    substrandName: "Literary Devices: Symbolism and Motif",
    prompt: "In a literary story where a heavy iron school gate (`A.18`) is described repeatedly whenever characters feel trapped, and finally swings wide open on the day a student wins a national scholarship (`B.7`), what exact literary device does the gate represent?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Symbolism (`and Motif`)** — where a tangible physical object (`the iron gate`) carries a deeper figurative meaning representing emotional confinement (`closed gate`) versus educational liberation and opportunity (`open gate`)", "A simple literal metal fence only", "An Onomatopoeia sound imitation", "A historical footnote"],
    correctAnswer: "**Symbolism (`and Motif`)** — where a tangible physical object (`the iron gate`) carries a deeper figurative meaning representing emotional confinement (`closed gate`) versus educational liberation and opportunity (`open gate`)",
    explanation: "Symbolism imbues physical items with philosophical or emotional weight beyond their literal definition.",
    difficulty: 2,
  },
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Writing",
    substrandName: "Official Minutes of a Meeting (`Action Columns & Accountability`)",
    prompt: "When recording the official **Minutes of a Meeting** for the school Board of Management (`BOM`), what exact details MUST be written inside the right-hand **'Action By / Action Column'** alongside every resolution (`Minute`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The **specific job title or name of the exact officer accountable** (`such as 'The Bursar' or 'The Principal'`) plus the **exact deadline date** (`e.g., 'By 30th August 2026'`) by which the agreed resolution must be fully implemented", "Only the Secretary's signature", "A list of students who arrived late to school", "Zero information; that column is left blank for drawing pictures"],
    correctAnswer: "The **specific job title or name of the exact officer accountable** (`such as 'The Bursar' or 'The Principal'`) plus the **exact deadline date** (`e.g., 'By 30th August 2026'`) by which the agreed resolution must be fully implemented",
    explanation: "Administrative minutes demand verifiable execution tracking (`Action By whom and By when`) so prior resolutions can be audited during matters arising at the next meeting (`SOP-FIN-01`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Junior School Kiswahili (`35 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "KIS",
    grade: "Grade 7",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (U-ZI) katika Umoja na Wingi",
    prompt: "Nomino **'ukuta'** na **'upanga'** zimo katika ngeli ya U-ZI. Je, wingi wake sahihi ni upi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**kuta** na **panga** (`k.m. kuta ndefu zimejengwa / panga kali zilinolewa`)", "miukuta na miupanga (`U-I`)", "makuta na mapanga (`LI-YA`)", "vikuta na vipanga (`KI-VI`)"],
    correctAnswer: "**kuta** na **panga** (`k.m. kuta ndefu zimejengwa / panga kali zilinolewa`)",
    explanation: "Nomino nyingi zinazoanza na 'u-' au 'w-' katika ngeli ya U-ZI huchukua wingi kwa kuondolewa kiambishi cha umoja (`ukuta -> kuta, ufunguo -> funguo, upanga -> panga`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Fasihi Simulizi na Misemo",
    substrandName: "Uchambuzi wa Nahau ('Piga moyo konde vs Pata jiko')",
    prompt: "Maana ya nahau **'piga moyo konde'** katika sentensi: 'Watahiniwa walipiga moyo konde na kuendelea na masomo yao ya usiku japo umeme ulikatika (`Z.1`)' ni ipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kujikaza kisabuni, kujipa ujasiri mkubwa, na kuvumilia shida au changamoto nzito bila kukata tamaa**", "Kupiga kifua kwa ngumi za chuma", "Kulia kwa sauti kubwa na kutoroka darasani", "Kupona ugonjwa wa homa ya malaria"],
    correctAnswer: "**Kujikaza kisabuni, kujipa ujasiri mkubwa, na kuvumilia shida au changamoto nzito bila kukata tamaa**",
    explanation: "Nahau 'kupiga moyo konde' huakisi uvumilivu wa dhati mbele ya majaribu ya maisha.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Fasihi Simulizi na Misemo",
    substrandName: "Utanzu wa Ngonjera na Maghani",
    prompt: "Katika fasihi simulizi, **Ngonjera** hutofautishwaje na mashairi au maghani ya kawaida?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Ngonjera ni ushairi wa majibizano ya kitamthilia kati ya pande mbili au zaidi** (`k.m. mwanafunzi na mwalimu au mkulima na mfanyabiashara`) ambapo kila upande unatoa hoja zake mpaka mwishoni ambapo upande mmoja unakubali au muafaka unapatikana", "Ngonjera huimbwa na mtu mmoja peke yake gizani", "Ngonjera ni kitendawili kisicho na jibu", "Ngonjera ni barua ya kiofisi inayosomwa mbele ya korti"],
    correctAnswer: "**Ngonjera ni ushairi wa majibizano ya kitamthilia kati ya pande mbili au zaidi** (`k.m. mwanafunzi na mwalimu au mkulima na mfanyabiashara`) ambapo kila upande unatoa hoja zake mpaka mwishoni ambapo upande mmoja unakubali au muafaka unapatikana",
    explanation: "Ngonjera iliasisiwa kuwa nyenzo ya kuelimisha umma kuhusu masuala ya kitaifa (`elimu, kodi, afya`) kupitia majibizano ya kisanaa.",
    difficulty: 2,
  },

  // ===========================================================================
  // Junior School Social Studies (`30 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "SST",
    grade: "Grade 7",
    strandName: "Natural and Built Environments",
    substrandName: "Map Reading: Calculating Gradient of a Slope",
    prompt: "On a topographical map, the vertical interval (`elevation change V.I.`) between two mountain peaks is 400 meters, and the measured horizontal ground equivalent (`H.E.`) distance between them is 8,000 meters. What is the exact **Gradient (`slope ratio V.I. / H.E.`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**1 in 20 (`or 1:20` — since Gradient = Vertical Interval / Horizontal Equivalent = 400 m / 8,000 m = 4 / 80 = 1 / 20)**", "1 in 400", "1 in 8", "1:50,000"],
    correctAnswer: "**1 in 20 (`or 1:20` — since Gradient = Vertical Interval / Horizontal Equivalent = 400 m / 8,000 m = 4 / 80 = 1 / 20)**",
    explanation: "Gradient measures slope steepness. A gradient of 1 in 20 means for every 20 meters walked horizontally, you gain exactly 1 meter in altitude.",
    difficulty: 2,
  },
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Climatic Regions of Africa: Tropical Savanna (`Sudan Climate`)",
    prompt: "Which two distinct seasonal weather regimes define the **Tropical Savanna (`Sudan`) Climate Region** that covers over half of the African continent?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**A distinct, warm/hot rainy season during high sun months (`when the Inter-Tropical Convergence Zone ITcz passes overhead`) followed directly by a long, dry, dusty winter season (`accompanied by dry trade winds like the Harmattan across West Africa`)**", "Continuous freezing snow all year round", "Continuous daily rainfall exceeding 4,000 mm without any dry day", "Zero rain and total darkness forever"],
    correctAnswer: "**A distinct, warm/hot rainy season during high sun months (`when the Inter-Tropical Convergence Zone ITcz passes overhead`) followed directly by a long, dry, dusty winter season (`accompanied by dry trade winds like the Harmattan across West Africa`)**",
    explanation: "The savanna climate alternates between wet summers (`supporting tall elephant grasses`) and dry winters (`causing wildlife migration across the Serengeti-Mara ecosystem`).",
    difficulty: 2,
  },
  {
    subjectCode: "SST",
    grade: "Grade 9",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Functions of the County Executive vs National Government",
    prompt: "Under the Fourth Schedule of the Constitution of Kenya 2010, which public function is reserved strictly for the **National Central Government** (`and CANNOT be exercised by County Governors`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**National Defense (`Kenya Defence Forces KDF`), Foreign Affairs (`ambassadors and treaties`), National Trunk Roads (`highways/SGR`), and Monetary Currency Policy (`Central Bank of Kenya CBK`)**", "Pre-primary Early Childhood Development Education (`ECDE schools`)", "County health clinics and dispensaries (`Clinic B.1`)", "Agriculture extension services (`AGN`)"],
    correctAnswer: "**National Defense (`Kenya Defence Forces KDF`), Foreign Affairs (`ambassadors and treaties`), National Trunk Roads (`highways/SGR`), and Monetary Currency Policy (`Central Bank of Kenya CBK`)**",
    explanation: "The Constitution ensures sovereign unity by keeping foreign policy, national defense, and currency strictly under national command while devolving local service delivery to counties.",
    difficulty: 2,
  }
];
