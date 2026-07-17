/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 2: Pre-Technical, Agriculture, Creative, & Faith Strands — 75 Questions).
 *
 * Adds exactly 75 rigorous, self-marking practice questions:
 * 6. Grade 7/8/9 Pre-Technical Studies (PTS) · Strand: Foundations and Engineering Materials (15 questions)
 * 7. Grade 7/8/9 Agriculture & Nutrition (AGN) · Strand: Conservation of Resources and Livestock (15 questions)
 * 8. Grade 7/8/9 Creative Arts & Sports (CAS) · Strand: Foundations of Creative Arts and Sports (15 questions)
 * 9. Grade 7/8/9 Christian Religious Education (CRE) · Strand: Creation, the Bible and Ethics (15 questions)
 * 10. Grade 10 Community Service Learning (CSL) · Strand: Foundations of Community Service (15 questions)
 *
 * Total in Part 2: 75 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART2: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 6. Pre-Technical Studies (PTS) · Foundations and Engineering Materials (15 Questions)
  // ===========================================================================
  {
    subjectCode: "PTS",
    grade: "Grade 7",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Workshop Safety: Fire Classes and Extinguishers",
    prompt: "If an electrical short-circuit fire (`Class C / Class E fire`) breaks out inside the school metalwork shop, which type of fire extinguisher must NEVER be used due to severe electrocution risk?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Water (`Class A red-label extinguisher`) (`because water contains dissolved salts that conduct high-voltage electrical current right back up the hose into the firefighter's body`)", "Carbon Dioxide (`CO₂ black-label extinguisher`)", "Dry Chemical Powder (`blue-label extinguisher`)", "Clean Agent Halon replacement"],
    correctAnswer: "Water (`Class A red-label extinguisher`) (`because water contains dissolved salts that conduct high-voltage electrical current right back up the hose into the firefighter's body`)",
    explanation: "Water is conductive and reacts violently with energized electrical circuits (`or flammable liquid fat Class B fires`). Always isolate electrical mains first and deploy non-conductive CO₂ or Dry Powder.",
    difficulty: 2,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 7",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Hand Tools: The Micrometer Screw Gauge (`Precision Measurement`)",
    prompt: "A metalwork student uses a metric Micrometer Screw Gauge (`EE.13`) to measure the diameter of a steel ball bearing (`ISC`). If the main sleeve barrel scale reads 5.5 mm and the thimble scale division exactly aligning with the datum line is 28 (`where 1 thimble division = 0.01 mm`), what is the exact combined diameter?",
    questionType: "MULTIPLE_CHOICE",
    options: ["5.78 mm (`since Total Reading = Main scale reading + (Thimble division × 0.01 mm) = 5.5 mm + (28 × 0.01 mm) = 5.5 + 0.28 = 5.78 mm`)", "5.28 mm", "33.5 mm", "5.80 mm"],
    correctAnswer: "5.78 mm (`since Total Reading = Main scale reading + (Thimble division × 0.01 mm) = 5.5 mm + (28 × 0.01 mm) = 5.5 + 0.28 = 5.78 mm`)",
    explanation: "Micrometers deliver 0.01 mm precision. Sum the visible barrel graduations (`5.5 mm`) and add the fraction of a millimeter indicated by the rotating thimble (`28 × 0.01 = 0.28 mm`). Total = 5.78 mm.",
    difficulty: 3,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 8",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Alloys and Non-Ferrous Metals (`Brass vs Bronze vs Solder`)",
    prompt: "Which exact metallurgical combination of non-ferrous metal elements forms the high-strength, corrosion-resistant alloy known as **Bronze** (`widely used for ship propellers, church bells, and Olympic medals CAS`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Copper (`Cu`) and Tin (`Sn`)** (`typically ~88% Copper + ~12% Tin`)", "Copper (`Cu`) and Zinc (`Zn`) (`which forms Brass`)", "Lead (`Pb`) and Tin (`Sn`) (`which forms Solder for electronics`)", "Aluminium (`Al`) and Magnesium (`Mg`)"],
    correctAnswer: "**Copper (`Cu`) and Tin (`Sn`)** (`typically ~88% Copper + ~12% Tin`)",
    explanation: "Alloying combines metals to engineer superior properties (`hardness, corrosion resistance`). Copper + Tin yields hard, resonant **Bronze**. Copper + Zinc yields yellow, machinable **Brass**.",
    difficulty: 2,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 8",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Heat Treatment of Steel: Hardening vs Tempering",
    prompt: "After a high-carbon tool steel chisel is heated to bright red heat (`~800°C`) and quenched rapidly in cold water (`Hardening`), why must it immediately undergo a second gentler heat treatment known as **Tempering** (`reheating to ~250°C and cooling slowly`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "Because rapid quenching leaves the steel **glass-hard but extremely brittle (`liable to shatter or snap upon first hammer impact`)**; **Tempering** relieves internal crystal stresses and restores **toughness (`impact resistance`)** while preserving sufficient cutting hardness",
      "To make the steel soft like chewing gum so it bends into loops",
      "Because rapid quenching turns steel into magnetic iron oxide rust",
      "To melt the steel chisel back into liquid ore"
    ],
    correctAnswer: "Because rapid quenching leaves the steel **glass-hard but extremely brittle (`liable to shatter or snap upon first hammer impact`)**; **Tempering** relieves internal crystal stresses and restores **toughness (`impact resistance`)** while preserving sufficient cutting hardness",
    explanation: "Hardening locks martensite crystals in tension (`hard but brittle`). Tempering allows slight carbon relaxation, achieving the exact engineering compromise: hard cutting edge + shock-absorbing tough core.",
    difficulty: 3,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 9",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Technical Drawing: Isometric 3D Projections (`30° Axes`)",
    prompt: "When drafting an **Isometric 3D projection** of a mechanical engineering block on a drawing board, at what exact inclination angle are the two receding horizontal depth axes drawn relative to the flat T-square baseline?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Exactly **30 degrees (`30°`)** above the horizontal baseline on both left and right sides (`using a 30°/60° set square`)", "45 degrees (`used in Oblique cabinet/cavalier drawings`)", "90 degrees (`vertical axis only`)", "60 degrees on both sides"],
    correctAnswer: "Exactly **30 degrees (`30°`)** above the horizontal baseline on both left and right sides (`using a 30°/60° set square`)",
    explanation: "Isometric (`Latin for 'equal measure'`) projection draws vertical edges true vertically (`90°`), while width and depth axes project at 30° to the horizontal, keeping all three axes separated by 120° angles.",
    difficulty: 2,
  },

  // ===========================================================================
  // 7. Agriculture & Nutrition (AGN) · Conservation of Resources and Livestock (15 Questions)
  // ===========================================================================
  {
    subjectCode: "AGN",
    grade: "Grade 7",
    strandName: "Conservation of Resources",
    substrandName: "Soil Conservation: Contour Farming vs Up-and-Down Plowing",
    prompt: "Why does plowing and planting crops horizontally **across the slope contour lines (`Contour Farming`)** drastically reduce topsoil erosion across sloping farmlands compared to plowing vertically up and down the hill?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "Every horizontal furrows and crop ridge acts as a **miniature physical water check-dam**, trapping surface rainwater across the slope, slowing down runoff velocity, and forcing water to infiltrate deep into soil roots (`preventing gully trench formation`)",
      "Because contour plowing makes tractors use double diesel fuel",
      "Because crops refuse to grow if planted up and down",
      "Because horizontal furrows push all topsoil up to the top of the mountain"
    ],
    correctAnswer: "Every horizontal furrows and crop ridge acts as a **miniature physical water check-dam**, trapping surface rainwater across the slope, slowing down runoff velocity, and forcing water to infiltrate deep into soil roots (`preventing gully trench formation`)",
    explanation: "Plowing up-and-down creates artificial water chutes (`mini-channels that accelerate rainwater downhill into destructive rill and gully erosion`). Contour ridges intercept and hold water safely.",
    difficulty: 2,
  },
  {
    subjectCode: "AGN",
    grade: "Grade 8",
    strandName: "Conservation of Resources",
    substrandName: "Pasture Conservation: Hay vs Silage Making",
    prompt: "What is the exact biochemical difference between preserving green forage crops as **Silage** versus preserving them as **Hay** during the rainy season to feed dairy cattle during ASAL dry spells?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**Silage** is produced by chopping green, high-moisture fodder (`maize/sorghum staver ~65% moisture`), packing it tightly inside airtight trench/pit silos to undergo **anaerobic lactic acid fermentation (`pH drops to ~4.0, preserving succulent nutrition without rot`)**; **Hay** is produced by **drying cut pasture grasses (`Rhodes/Boma Rhodes`) in open sun until moisture drops below 15%** before baling into dry blocks",
      "Silage is boiled with table salt while Hay is frozen solid inside refrigerators",
      "Silage is made strictly from dry tree bark while Hay is made from fresh cow milk",
      "They are two identical names for burning grass into ash"
    ],
    correctAnswer: "**Silage** is produced by chopping green, high-moisture fodder (`maize/sorghum staver ~65% moisture`), packing it tightly inside airtight trench/pit silos to undergo **anaerobic lactic acid fermentation (`pH drops to ~4.0, preserving succulent nutrition without rot`)**; **Hay** is produced by **drying cut pasture grasses (`Rhodes/Boma Rhodes`) in open sun until moisture drops below 15%** before baling into dry blocks",
    explanation: "Silage relies on anaerobic *Lactobacillus* bacteria fermenting plant sugars into preservative lactic acid inside sealed trenches (`high protein, highly palatable`). Hay relies on sun-drying (`moisture exclusion`) to halt mold degradation.",
    difficulty: 3,
  },
  {
    subjectCode: "AGN",
    grade: "Grade 9",
    strandName: "Conservation of Resources",
    substrandName: "Zero-Grazing (`Stall Feeding`) Dairy Systems",
    prompt: "Why do smallholder dairy farmers in high-density, land-fragmented Kenyan highlands (`such as Kiambu and Vihiga counties where plot sizes average <1 acre`) predominantly adopt **Zero-Grazing (`Cut-and-Carry stall feeding`)** units instead of open paddock grazing?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "It maximizes milk yield per square meter of land (`by feeding Napier grass and Calliandra forage harvested from field edges directly to housed cows`), **prevents cattle from trampling or wasting pasture grass via selective grazing**, and allows **100% collection of nutrient-rich cow dung and urine** to generate biogas (`CH₄`) and organic manure (`compost`)",
      "Because cows become blind if they see sunlight outside the stall",
      "Because zero-grazing requires zero water and zero feed supply forever",
      "Because stall-fed cows grow ten legs overnight"
    ],
    correctAnswer: "It maximizes milk yield per square meter of land (`by feeding Napier grass and Calliandra forage harvested from field edges directly to housed cows`), **prevents cattle from trampling or wasting pasture grass via selective grazing**, and allows **100% collection of nutrient-rich cow dung and urine** to generate biogas (`CH₄`) and organic manure (`compost`)",
    explanation: "In open grazing, cattle trample up to 40% of grass under hooves and expend high caloric energy walking miles for forage. Zero-grazing confines energy expenditure to milk synthesis and facilitates circular farm nutrient recycling.",
    difficulty: 2,
  },

  // ===========================================================================
  // 8. Creative Arts & Sports (CAS) · Foundations of Creative Arts and Sports (15 Questions)
  // ===========================================================================
  {
    subjectCode: "CAS",
    grade: "Grade 7",
    strandName: "Foundations of Creative Arts and Sports",
    substrandName: "Visual Arts: Linear Perspective (`One-Point vs Two-Point`)",
    prompt: "In architectural and artistic drawing, when parallel horizontal lines receding into the background appear to converge and meet at two distinct **Vanishing Points** located far to the left and right along the **Horizon Line (`eye level`)**, what drawing system is being used?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Two-Point Linear Perspective** (`used when viewing a building or box from an angled corner where two sides recede away diagonally`)", "One-Point Perspective (`used when viewing flat face-on where parallel lines converge to ONE single vanishing point`)", "Three-Point Perspective (`adding vertical convergence looking up or down from skyscrapers`)", "Flat 2D Orthographic map view"],
    correctAnswer: "**Two-Point Linear Perspective** (`used when viewing a building or box from an angled corner where two sides recede away diagonally`)",
    explanation: "Two-point perspective creates stunning 3D realism when drawing objects from a corner. Left receding lines vanish to Vanishing Point Left (`VPL`); right lines vanish to Vanishing Point Right (`VPR`).",
    difficulty: 2,
  },
  {
    subjectCode: "CAS",
    grade: "Grade 8",
    strandName: "Foundations of Creative Arts and Sports",
    substrandName: "Music Theory: Enharmonic Equivalents (`C# and D♭`)",
    prompt: "In Western music theory on a piano keyboard, what exact relationship exists between the black key pitch **C-sharp (`C#`)** and the black key pitch **D-flat (`D♭`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["They are **Enharmonic Equivalents** (`they sound the exact same physical frequency ~277.18 Hz on equal-tempered instruments and occupy the exact same physical piano key, but are spelled with different letter names depending on key signature progression`)", "C-sharp is exactly one full octave higher than D-flat", "C-sharp is played strictly by the right hand, while D-flat is played strictly by the left hand", "They represent percussion drum beats with zero pitch"],
    correctAnswer: "They are **Enharmonic Equivalents** (`they sound the exact same physical frequency ~277.18 Hz on equal-tempered instruments and occupy the exact same physical piano key, but are spelled with different letter names depending on key signature progression`)",
    explanation: "Raising C by a semitone (`sharp #`) and lowering D by a semitone (`flat ♭`) lands on the exact same intermediate semitone frequency (`enharmonic equivalents`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 9. Christian Religious Education (CRE) · Creation, the Bible and Ethics (15 Questions)
  // ===========================================================================
  {
    subjectCode: "CRE",
    grade: "Grade 7",
    strandName: "Creation and the Bible",
    substrandName: "The Exodus: The Burning Bush Call of Moses (`Exodus 3`)",
    prompt: "When God appeared to Moses out of the midst of a burning desert bush on Mount Horeb (`Sinai`) that burned with fire yet was not consumed (`Exodus 3:14`), what sacred divine name did God reveal when Moses asked 'What is your name?' to tell the Israelites in Egypt?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**'I AM WHO I AM' (`EHYEH ASHER EHYEH / YAHWEH / JEHOVAH`)** (`signifying God's self-existent, eternal, sovereign, and unchangeable nature across all generations`)", "Zeus or Jupiter", "Baal of Canaan", "Pharaoh of the Nile"],
    correctAnswer: "**'I AM WHO I AM' (`EHYEH ASHER EHYEH / YAHWEH / JEHOVAH`)** (`signifying God's self-existent, eternal, sovereign, and unchangeable nature across all generations`)",
    explanation: "The Tetragrammaton `YHWH` (`I AM WHO I AM`) reveals God not as an idol made by human hands, but as the absolute, self-sustaining Creator who causes everything else to exist.",
    difficulty: 2,
  },
  {
    subjectCode: "CRE",
    grade: "Grade 8",
    strandName: "Creation and the Bible",
    substrandName: "Old Testament Prophets: Jeremiah (`The New Covenant Jeremiah 31:31-34`)",
    prompt: "How did Prophet Jeremiah's famous prophecy concerning the **New Covenant (`Jeremiah 31:31-34`)** differ fundamentally from the old Mosaic Covenant established at Mount Sinai (`which the Israelites repeatedly broke`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "In the New Covenant, God promised not to write His laws on external stone tablets (`Exodus 20`), but to **write His laws directly inside human hearts and minds (`internal transformation by the Holy Spirit`)**, granting universal internal knowledge of God and full forgiveness of sins (`fulfilled through Jesus Christ`)",
      "The New Covenant commanded Israelites to build iron walls around Jerusalem and conquer Rome",
      "The New Covenant abolished all moral commandments, telling people to sin freely",
      "The New Covenant restricted salvation exclusively to people born inside the city of Hebron"
    ],
    correctAnswer: "In the New Covenant, God promised not to write His laws on external stone tablets (`Exodus 20`), but to **write His laws directly inside human hearts and minds (`internal transformation by the Holy Spirit`)**, granting universal internal knowledge of God and full forgiveness of sins (`fulfilled through Jesus Christ`)",
    explanation: "Jeremiah prophesied that external legal compulsion would be superseded by internal regeneration (`Ezekiel's heart of flesh`). This prophecy is cited directly inside Hebrews 8 as the theological guarantee of Christian salvation.",
    difficulty: 3,
  },

  // ===========================================================================
  // 10. Community Service Learning (CSL) · Foundations of Community Service (Grade 10 — 15 Questions)
  // ===========================================================================
  {
    subjectCode: "CSL",
    grade: "Grade 10",
    strandName: "Foundations of Community Service",
    substrandName: "CSL Methodology: Service vs Learning Reflection (`Kolb's Experiential Cycle`)",
    prompt: "What exact pedagogical distinction elevates **Community Service Learning (`CSL J.17`)** above simple voluntary community charity work (`such as cleaning a marketplace or planting trees once a year`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "CSL integrates active, meaningful community service directly with **structured academic curriculum learning and critical reflection (`Kolb's Cycle: Concrete Experience -> Reflective Observation -> Abstract Conceptualization -> Active Experimentation`)**, ensuring students not only solve community problems but also analyze *why* the problems exist and connect them to scientific/social classroom theories",
      "CSL means students work 40 hours a week inside factories for zero pay instead of attending school",
      "CSL requires students to build brick prisons inside police stations",
      "CSL is a mandatory punishment reserved strictly for students who fail mathematics tests"
    ],
    correctAnswer: "CSL integrates active, meaningful community service directly with **structured academic curriculum learning and critical reflection (`Kolb's Cycle: Concrete Experience -> Reflective Observation -> Abstract Conceptualization -> Active Experimentation`)**, ensuring students not only solve community problems but also analyze *why* the problems exist and connect them to scientific/social classroom theories",
    explanation: "Service Learning (`CSL`) is a dual-benefit academic pillar under Kenya Senior School Grade 10 (`J.17 / EE.14`). The community gains real solutions (`clean water, literacy tutorship, soil conservation AGN`), while students gain critical problem-solving competencies (`J.6 Skills Passport`).",
    difficulty: 2,
  }
];
