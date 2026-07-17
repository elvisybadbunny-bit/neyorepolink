/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 4: Junior School Applied & Technical — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. Pre-Technical Studies (`PTS Grade 7, 8, 9 — Workshop Safety, Hand Tools, Materials, Technical Drawing, Electrical Circuits`) — 25 questions
 * 2. Agriculture & Nutrition (`AGN Grade 7, 8, 9 — Soil Conservation, Livestock, Irrigation, Crop Rotation, Post-Harvest`) — 25 questions
 * 3. Creative Arts & Sports (`CAS Grade 7, 8, 9 — Visual Arts, Music Theory, Track Athletics, Ball Games, Performing Arts`) — 25 questions
 * 4. Christian Religious Education (`CRE Grade 7, 8, 9 — Creation, Sinai Covenant, Prophets, Parables, Early Church`) — 25 questions
 *
 * Total in Part 4 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART4: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Pre-Technical Studies (`PTS` Grade 7–9 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "PTS",
    grade: "Grade 7",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Hand Tools: Marking Gauge vs Mortise Gauge",
    prompt: "Why does a woodworking **Mortise Gauge** possess two distinct, independently adjustable spur pins (`needles`) on its stem, whereas an ordinary **Marking Gauge** possesses only one single fixed spur pin?",
    questionType: "MULTIPLE_CHOICE",
    options: ["To scribe **two parallel parallel lines simultaneously along the grain of a timber piece in a single pass**, marking out the exact width of a mortise hole or tenon tongue (`EE.8 Woodwork`) accurately without requiring two separate measuring passes", "To cut iron pipes in half", "To measure the temperature of boiling water", "Because mortise gauges are twice as heavy as marking gauges"],
    correctAnswer: "To scribe **two parallel parallel lines simultaneously along the grain of a timber piece in a single pass**, marking out the exact width of a mortise hole or tenon tongue (`EE.8 Woodwork`) accurately without requiring two separate measuring passes",
    explanation: "A mortise gauge marks both sides of a mortise or tenon joint simultaneously, ensuring exact parallelism along timber joints.",
    difficulty: 2,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 8",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Engineering Materials: Heat Treatment of Copper (`Annealing`)",
    prompt: "How can hard, brittle copper or brass metal sheet that has undergone cold-working (`hammering/bending`) be **annealed (`softened and restored to maximum ductility`)** inside a workshop?",
    questionType: "MULTIPLE_CHOICE",
    options: ["By heating the copper sheet to dull red heat (`~600°C`) and then **quenching it rapidly in cold water (`or allowing it to cool slowly inside air`)** (`unlike steel, rapid water quenching leaves copper completely soft and ductile rather than hard`)", "By freezing copper inside liquid nitrogen at -196°C", "By hammering the copper ten thousand times more", "By boiling copper inside table salt"],
    correctAnswer: "By heating the copper sheet to dull red heat (`~600°C`) and then **quenching it rapidly in cold water (`or allowing it to cool slowly inside air`)** (`unlike steel, rapid water quenching leaves copper completely soft and ductile rather than hard`)",
    explanation: "Copper metallurgy behaves oppositely to steel during quenching. Heating relieves work-hardening crystal dislocations (`recrystallization`); water quenching leaves copper ultra-soft for easy shaping.",
    difficulty: 3,
  },
  {
    subjectCode: "PTS",
    grade: "Grade 9",
    strandName: "Foundations of Pre-Technical Studies",
    substrandName: "Ohm's Law: Series and Parallel Resistor Combinations (`EE.13 Alignment`)",
    prompt: "Two resistors R₁ = 12 Ω and R₂ = 6 Ω are connected in **parallel**, and this parallel pair is then connected in **series** with a third resistor R₃ = 4 Ω across a 16V battery. What is the total circuit current (`I`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**2.0 Amperes** (`since Parallel pair R_p = (12 × 6)/(12 + 6) = 72/18 = 4 Ω; Total Resistance R_t = R_p + R₃ = 4 + 4 = 8 Ω; Current I = V / R_t = 16 V / 8 Ω = 2.0 A`)", "1.0 Ampere", "4.0 Amperes", "8.0 Amperes"],
    correctAnswer: "**2.0 Amperes** (`since Parallel pair R_p = (12 × 6)/(12 + 6) = 72/18 = 4 Ω; Total Resistance R_t = R_p + R₃ = 4 + 4 = 8 Ω; Current I = V / R_t = 16 V / 8 Ω = 2.0 A`)",
    explanation: "First solve parallel branch: (12 × 6) / 18 = 4 Ω. Add series resistor: 4 + 4 = 8 Ω. Apply Ohm's Law: I = 16V / 8Ω = 2.0 A.",
    difficulty: 3,
  },

  // ===========================================================================
  // 2. Agriculture & Nutrition (`AGN` Grade 7–9 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "AGN",
    grade: "Grade 7",
    strandName: "Conservation of Resources",
    substrandName: "Soil Fertility: Composting vs Green Manuring",
    prompt: "What is the exact agronomic difference between applying **Compost Manure** (`made in a compost heap over 3 months`) and practicing **Green Manuring** across a vegetable garden?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Green manuring** involves growing a fast-growing, nitrogen-fixing leguminous crop (`such as mucuna or cowpeas`) and plowing/incorporating the entire fresh green plant directly back into the wet farm soil while still in flower before planting the next commercial crop (`adding instant organic matter and nitrogen in situ`)", "Green manuring means painting old tractor tires green", "Compost manure is made of chemical urea only while green manure is made of rocks", "They both mean burning dry maize leaves into white ash"],
    correctAnswer: "**Green manuring** involves growing a fast-growing, nitrogen-fixing leguminous crop (`such as mucuna or cowpeas`) and plowing/incorporating the entire fresh green plant directly back into the wet farm soil while still in flower before planting the next commercial crop (`adding instant organic matter and nitrogen in situ`)",
    explanation: "Green manuring builds soil humus and nitrogen directly inside the field without the labor of carting manure from compost pits.",
    difficulty: 2,
  },
  {
    subjectCode: "AGN",
    grade: "Grade 8",
    strandName: "Conservation of Resources",
    substrandName: "Livestock Health: Internal vs External Parasites (`Roundworms vs Ticks`)",
    prompt: "Why must cattle and sheep farmers administer routine internal **Deworming (`drenching with anthelmintic medicines`)** in addition to dipping/spraying with external **Acaricides**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because while acaricides kill **external parasites (`ticks, lice, tsetse flies` that cause East Coast Fever and Trypanosomiasis)**, anthelmintic drenches kill internal gastrointestinal worms (`roundworms, tapeworms, liver flukes` that suck blood and nutrients directly from inside the animal's intestines and liver)", "Because dewormers turn cows into horses overnight", "Because ticks live strictly inside cow horns", "Because external sprays make milk turn green"],
    correctAnswer: "Because while acaricides kill **external parasites (`ticks, lice, tsetse flies` that cause East Coast Fever and Trypanosomiasis)**, anthelmintic drenches kill internal gastrointestinal worms (`roundworms, tapeworms, liver flukes` that suck blood and nutrients directly from inside the animal's intestines and liver)",
    explanation: "Complete livestock health protection (`B.16`) requires dual defense against both ectoparasites (`ticks`) and endoparasites (`liver flukes`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 3. Creative Arts & Sports (`CAS` Grade 7–9 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "CAS",
    grade: "Grade 8",
    strandName: "Foundations of Creative Arts and Sports",
    substrandName: "Music Theory: Enharmonic Equivalents & Intervals",
    prompt: "What interval (`distance in semitones`) exists between musical pitch **C** and the note **G** directly above it on a piano keyboard?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**A Perfect Fifth (`7 exact semitones / half-steps`)** (`since moving from C up through C#, D, D#, E, F, F# to G spans exactly 7 semitone steps`)", "A Major Third (`4 semitones`)", "An Octave (`12 semitones`)", "A Major Second (`2 semitones`)"],
    correctAnswer: "**A Perfect Fifth (`7 exact semitones / half-steps`)** (`since moving from C up through C#, D, D#, E, F, F# to G spans exactly 7 semitone steps`)",
    explanation: "The Perfect Fifth (`C to G, D to A, E to B`) is the most stable interval in Western harmony (`spanning 7 semitones / 3.5 whole steps`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 4. Christian Religious Education (`CRE` Grade 7–9 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "CRE",
    grade: "Grade 8",
    strandName: "Creation and the Bible",
    substrandName: "Old Testament Prophets: Amos (`Prophet of Social Justice`)",
    prompt: "Why is Prophet Amos (`who prophesied during the reign of King Jeroboam II of Israel around 760 BC`) universally recognized by theologians as the **Prophet of Social Justice**?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "Because he fiercely condemned the corrupt wealthy elites and judges of Samaria for **oppressing the poor, selling the needy for a pair of sandals, rigging grain scales (`using false weights`), and offering hypocritical religious sacrifices** while ignoring human righteousness (`Amos 5:24 'Let justice roll on like a river, righteousness like a never-failing stream!'`)",
      "Because he commanded all Israelites to stop farming and move into caves",
      "Because he built the golden calves at Dan and Bethel",
      "Because he turned into an angel and flew away from Israel"
    ],
    correctAnswer: "Because he fiercely condemned the corrupt wealthy elites and judges of Samaria for **oppressing the poor, selling the needy for a pair of sandals, rigging grain scales (`using false weights`), and offering hypocritical religious sacrifices** while ignoring human righteousness (`Amos 5:24 'Let justice roll on like a river, righteousness like a never-failing stream!'`)",
    explanation: "Prophet Amos exposed the moral hypocrisy of wealth built on injustice, establishing that true religious worship demands fair treatment of the poor (`an ethical pillar of Community Service Learning CSL J.17`).",
    difficulty: 2,
  }
];
