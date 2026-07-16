/**
 * EE.3 (Senior School phase) — real KICD Grade 10 (Senior School, 2026 CBE
 * rollout) curriculum content: strands AND their real sub-strands together,
 * researched against KICD's own published 2024 curriculum designs (the
 * versions used for the real January 2026 Senior School launch) and
 * cross-checked against multiple independent lesson-plan/scheme-of-work
 * sources quoting each design's own "Summary of Strands and Sub-strands"
 * section verbatim.
 *
 * PHASED BY DESIGN (founder's own confirmed order, this session):
 * following EE.3's own Junior School phase, this covers the 4 real
 * compulsory Senior School core learning areas every learner takes
 * regardless of pathway — English, Kiswahili, Mathematics (both the
 * Core/STEM and Essential/non-STEM variants, since P.2 already made these
 * two genuinely separate Subject rows) and Community Service Learning —
 * for Grade 10 only. Grade 11/Grade 12 designs and the real pathway
 * elective subjects (Biology, Chemistry, Computer Studies, Business
 * Studies, etc.) are a real, honestly-scoped follow-up, not silently
 * included here — Grade 11 curriculum designs were still being finalised
 * by KICD/the Ministry at the time of writing (confirmed via live web
 * search), so Grade 10 is genuinely the only Senior School grade with a
 * real, published, currently-taught design to source from today.
 *
 * Reuses the exact same `JuniorSchoolStrandSeed`-shaped interface as the
 * Junior School library (deliberately generic field names) so
 * `applyJuniorSchoolCurriculumPreset()` in `cbc.service.ts` needs ZERO
 * changes to also apply a Senior School grade's preset — it already only
 * ever takes a subject id + grade label + a strand/sub-strand array.
 *
 * Subject codes match this codebase's own real, already-existing Senior
 * Pathway subject codes: `ENG`/`KIS`/`CSL` (`SENIOR_SCHOOL_CORE_SUBJECTS`,
 * `pathways.ts`) and `MATC`/`MATE` (`CORE_ESSENTIAL_MATHEMATICS`,
 * `pathways.ts`) — so applying a preset onto a school's own real P.2/P.3
 * seeded Subject rows matches by code, never creates a duplicate.
 */

import type { JuniorSchoolStrandSeed } from "./kicd-junior-school-curriculum";

export type SeniorSchoolGrade = "Grade 10";

export const SENIOR_SCHOOL_CURRICULUM: Record<SeniorSchoolGrade, Record<string, JuniorSchoolStrandSeed[]>> = {
  "Grade 10": {
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen and speak effectively and appropriately across social, academic and professional contexts.",
        substrands: [
          { name: "Extensive Listening", learningOutcome: "Listen collaboratively to record characters, places and memorable events from an extended oral text." },
          { name: "Etiquette", learningOutcome: "Observe conversational etiquette and correct pronunciation in a range of social contexts." },
          { name: "Critical Listening", learningOutcome: "Listen critically to evaluate the message and intent of an oral text." },
          { name: "Non-Verbal Cues", learningOutcome: "Interpret and use non-verbal cues to enhance oral communication." },
          { name: "Interactive Listening and Conducting Meetings", learningOutcome: "Apply active listening skills while conducting or participating in a meeting." },
          { name: "Responsive Listening and Syllabic Stress", learningOutcome: "Respond appropriately to an oral text applying correct syllabic stress." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read a wide range of texts fluently, critically and with comprehension.",
        substrands: [
          { name: "Reading Fluency", learningOutcome: "Read a text fluently applying appropriate pace, intonation and expression." },
          { name: "Extensive Reading", learningOutcome: "Read extensively for information, pleasure and general knowledge." },
          { name: "Study Skills", learningOutcome: "Apply study skills such as skimming, scanning and note-taking to a text." },
          { name: "Intensive Reading", learningOutcome: "Read a text intensively to answer detailed comprehension questions." },
          { name: "Critical Reading", learningOutcome: "Read a text critically to evaluate the writer's viewpoint and purpose." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Apply the rules of English grammar accurately in speech and writing.",
        substrands: [
          { name: "Word Classes", learningOutcome: "Identify and use the various word classes correctly in sentences." },
          { name: "Phrases", learningOutcome: "Identify and construct different types of phrases correctly." },
          { name: "Clauses", learningOutcome: "Identify and construct different types of clauses correctly." },
          { name: "Sentence Structure", learningOutcome: "Construct grammatically correct simple, compound and complex sentences." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write clearly, coherently and for a range of purposes and audiences.",
        substrands: [
          { name: "Sentence Fluency", learningOutcome: "Write fluent, well-constructed sentences free of comma splices and run-ons." },
          { name: "Mechanics of Writing: Spelling", learningOutcome: "Apply correct spelling conventions in written work." },
          { name: "Elements of Effective Writing", learningOutcome: "Apply the elements of effective writing to compose a coherent text." },
          { name: "Mechanics of Writing: Punctuation", learningOutcome: "Apply correct punctuation conventions in written work." },
          { name: "The Writing Process", learningOutcome: "Apply the stages of the writing process (planning, drafting, editing, publishing) to a composition." },
          { name: "Creative Writing", learningOutcome: "Compose an original creative piece applying appropriate literary techniques." },
          { name: "Functional Writing", learningOutcome: "Write functional texts (e.g. reports, memos, minutes) appropriate to a given purpose and audience." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kuwasiliana kwa ufasaha katika miktadha ya kijamii, kitaaluma na kidijitali.",
        substrands: [
          { name: "Ufahamu wa Kusikiliza: Ujumbe na Fani katika Matini Simulizi", learningOutcome: "Kutambua ujumbe na fani katika matini simulizi." },
          { name: "Matamshi Bora", learningOutcome: "Kutamka sauti mahususi za Kiswahili kwa usahihi (mf. /r/ na /l/, /bw/ na /mw/)." },
          { name: "Kuzungumza kwa Kupasha Habari", learningOutcome: "Kuzungumza kwa kupasha habari kwa kuzingatia usahihi, uangavu na mvuto." },
          { name: "Kuzungumza kwa Ufasaha: Midahalo", learningOutcome: "Kushiriki katika mdahalo kwa kuzingatia hoja na lugha fasaha." },
          { name: "Uzungumzaji wa Papo kwa Hapo", learningOutcome: "Kutambua na kutumia vipengele vya uzungumzaji wa papo kwa hapo." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma na kuchambua matini mbalimbali kwa uelewa na tathmini.",
        substrands: [
          { name: "Kusoma kwa Ufasaha: Kifungu Simulizi", learningOutcome: "Kusoma kifungu simulizi kwa ufasaha na kuelewa maudhui yake." },
          { name: "Ufupisho wa Matini", learningOutcome: "Kufupisha kifungu cha habari bila kupoteza ujumbe mkuu." },
          { name: "Kusoma kwa Kina: Mbinu ya Kurashia na Kudondoa Hoja", learningOutcome: "Kutumia mbinu za kusoma kwa kina kudondoa hoja muhimu." },
          { name: "Kusoma Ramani na Michoro", learningOutcome: "Kusoma na kufasiri ramani na michoro kwa usahihi." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika kwa usahihi na ubunifu kwa madhumuni tofauti.",
        substrands: [
          { name: "Uakifishaji", learningOutcome: "Kutumia alama za uakifishaji kwa usahihi (herufi kubwa, nukta, koma na alama za mtajo)." },
          { name: "Barua ya Kirafiki", learningOutcome: "Kuandika barua ya kirafiki ikizingatia ujumbe, muundo na mtindo." },
          { name: "Insha ya Wasifu", learningOutcome: "Kuandika insha ya wasifu ikizingatia muundo wa utangulizi, mwili na hitimisho." },
          { name: "Notisi", learningOutcome: "Kuandika notisi bora ikizingatia vipengele vyake muhimu." },
          { name: "Insha Fafanizi", learningOutcome: "Kuandika insha fafanizi kwa kuzingatia hoja na mifano ifaayo." },
        ],
      },
      {
        name: "Matumizi ya Lugha",
        learningOutcome: "Kutumia Kiswahili sanifu kwa kuzingatia kanuni za sarufi.",
        substrands: [
          { name: "Aina za Maneno: Nomino, Vitenzi, Vivumishi", learningOutcome: "Kutambua na kutumia aina za maneno kwa usahihi katika sentensi." },
          { name: "Nyakati na Hali za Vitenzi", learningOutcome: "Kutumia nyakati na hali za vitenzi kwa usahihi." },
          { name: "Aina za Sentensi na Uundaji wa Maneno", learningOutcome: "Kutambua aina za sentensi na kuunda maneno kwa kutumia mzizi na viambishi." },
        ],
      },
    ],
    MATC: [
      {
        name: "Numbers and Algebra",
        learningOutcome: "Apply number and algebraic concepts to solve real-life and mathematical problems.",
        substrands: [
          { name: "Real Numbers", learningOutcome: "Classify and perform combined operations on real numbers, including finding reciprocals." },
          { name: "Indices and Logarithms", learningOutcome: "Apply the laws of indices and common logarithms to mathematical computations." },
          { name: "Quadratic Expressions and Equations", learningOutcome: "Form, factorise and solve quadratic expressions and equations, applying them to real-life situations." },
        ],
      },
      {
        name: "Measurements and Geometry",
        learningOutcome: "Apply geometric and measurement concepts to solve real-life problems.",
        substrands: [
          { name: "Similarity and Enlargement", learningOutcome: "Determine the centre of enlargement and linear/area/volume scale factors to construct enlarged images." },
          { name: "Reflection and Congruence", learningOutcome: "Apply reflection on a plane surface and Cartesian plane to determine congruent figures." },
          { name: "Rotation", learningOutcome: "Determine the image of an object under rotation and apply it to real-life situations." },
          { name: "Trigonometry", learningOutcome: "Apply the sine, cosine and tangent ratios to solve problems involving angles of elevation and depression." },
        ],
      },
      {
        name: "Statistics and Probability",
        learningOutcome: "Collect, analyse and interpret data, and apply probability concepts to real-life situations.",
        substrands: [
          { name: "Statistics I", learningOutcome: "Collect, organise and analyse grouped data using appropriate measures of central tendency." },
          { name: "Probability", learningOutcome: "Apply probability concepts to determine the likelihood of real-life events." },
        ],
      },
    ],
    MATE: [
      {
        name: "Numbers and Algebra",
        learningOutcome: "Apply number and algebraic concepts to practical, everyday and career-related problems.",
        substrands: [
          { name: "Real Numbers", learningOutcome: "Classify real numbers and perform combined operations on rational numbers, including applications of integers." },
          { name: "Indices", learningOutcome: "Apply the laws of indices to work out mathematical computations." },
          { name: "Quadratic Equations (I)", learningOutcome: "Form and factorise quadratic expressions and solve quadratic equations by factorisation." },
        ],
      },
      {
        name: "Measurements and Geometry",
        learningOutcome: "Apply practical measurement and geometric concepts to everyday and career situations.",
        substrands: [
          { name: "Similarity and Enlargement", learningOutcome: "Apply the properties of similar figures and linear/area/volume scale factors." },
          { name: "Reflection", learningOutcome: "Apply reflection on a plane surface and Cartesian plane to practical situations." },
          { name: "Trigonometry", learningOutcome: "Apply the sine, cosine and tangent ratios and angles of elevation/depression to practical problems." },
          { name: "Area of Polygons", learningOutcome: "Calculate the area of triangles, rhombi, parallelograms and regular polygons using appropriate formulae." },
          { name: "Area of a Part of a Circle", learningOutcome: "Calculate the area of a sector and a segment and apply this to real-life situations." },
          { name: "Surface Area of Solids", learningOutcome: "Calculate the surface area of cones, pyramids, spheres, hemispheres and frustums." },
          { name: "Volume and Capacity", learningOutcome: "Calculate the volume and capacity of solids and apply this to everyday and career contexts." },
        ],
      },
      {
        name: "Statistics and Probability",
        learningOutcome: "Collect, analyse and interpret data for everyday decision-making.",
        substrands: [
          { name: "Statistics I", learningOutcome: "Collect, organise and analyse data using appropriate measures of central tendency for everyday use." },
          { name: "Probability", learningOutcome: "Apply basic probability concepts to everyday and career-related decisions." },
        ],
      },
    ],
    CSL: [
      {
        name: "Citizenship",
        learningOutcome: "Demonstrate active, responsible citizenship through genuine community service.",
        substrands: [
          { name: "Identifying a Community Problem", learningOutcome: "Identify a genuine community problem suitable for a service project." },
          { name: "Planning a Community Service Activity", learningOutcome: "Plan a viable community service activity to address an identified problem." },
        ],
      },
      {
        name: "Life Skills",
        learningOutcome: "Apply life skills to plan for and execute a community service activity effectively.",
        substrands: [
          { name: "Teamwork and Collaboration", learningOutcome: "Work collaboratively within a team to execute a community service activity." },
        ],
      },
      {
        name: "Action Research",
        learningOutcome: "Apply simple action-research methods to evaluate the impact of a service activity.",
        substrands: [
          { name: "Assessing the Needs of the Community", learningOutcome: "Assess the real needs of a community before designing a service activity." },
        ],
      },
      {
        name: "Social Entrepreneurship",
        learningOutcome: "Apply social entrepreneurship principles to create a sustainable community service solution.",
        substrands: [
          { name: "Creating a Sustainable Solution", learningOutcome: "Create a viable, sustainable solution to a real community problem identified by the learner." },
        ],
      },
    ],
  },
};

export const SENIOR_SCHOOL_GRADES: SeniorSchoolGrade[] = ["Grade 10"];
export const SENIOR_SCHOOL_SUBJECT_CODES = ["ENG", "KIS", "MATC", "MATE", "CSL"];
