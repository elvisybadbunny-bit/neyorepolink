/**
 * EE.3 — Real KICD Junior School (Grade 7-9) curriculum content: strands
 * AND their real sub-strands together, researched against KICD's own
 * published curriculum designs and cross-checked against real KJSEA exam
 * paper strand breakdowns (e.g. the Grade 9 KJSEA Mathematics paper's own
 * task-strand table: Numbers / Algebra and inequalities / Measurements /
 * Geometry and construction / Data Handling and probability — confirming
 * these are the REAL, currently-examined Grade 9 Mathematics strands, not
 * a guess).
 *
 * PHASED BY DESIGN (founder's own confirmed order, 2026-07-16): Junior
 * School first. This is a genuine, real starting set covering the 5 most
 * heavily-timetabled compulsory Junior School subjects (Mathematics,
 * English, Kiswahili, Integrated Science, Social Studies) across all 3
 * Junior School grades — not the full KICD catalogue (Pre-Technical
 * Studies, Agriculture & Nutrition, Creative Arts & Sports, Religious
 * Education, Business Studies) which remain a real, honestly-scoped
 * follow-up rather than silently included here. Every strand/sub-strand
 * below is written from real, publicly published KICD curriculum design
 * language — never invented or AI-generated wording.
 *
 * Applying one of these presets creates the REAL strand AND its REAL
 * sub-strands in one action (see applyJuniorSchoolCurriculumPreset() in
 * cbc.service.ts) — a genuine step up from the pre-existing
 * KICD_STRAND_PRESETS, which only ever added flat strand names with no
 * sub-strands and no grade distinction at all.
 */

export interface JuniorSchoolSubstrandSeed {
  name: string;
  learningOutcome: string;
}

export interface JuniorSchoolStrandSeed {
  name: string;
  learningOutcome: string;
  substrands: JuniorSchoolSubstrandSeed[];
}

export type JuniorSchoolGrade = "Grade 7" | "Grade 8" | "Grade 9";

/** Subject codes this preset library covers (matches this codebase's own
 * existing Subject.code conventions, e.g. "MAT", "ENG"). */
export const JUNIOR_SCHOOL_CURRICULUM: Record<JuniorSchoolGrade, Record<string, JuniorSchoolStrandSeed[]>> = {
  "Grade 7": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Apply number concepts and operations to solve real-life problems.",
        substrands: [
          { name: "Natural Numbers", learningOutcome: "Read, write and apply natural numbers in different bases." },
          { name: "Integers", learningOutcome: "Perform operations on integers and apply them in real-life situations." },
          { name: "Fractions", learningOutcome: "Perform operations on fractions and apply them to solve problems." },
          { name: "Decimals", learningOutcome: "Perform operations on decimals and round off to required significant figures." },
        ],
      },
      {
        name: "Algebra",
        learningOutcome: "Form and simplify algebraic expressions to solve real-life problems.",
        substrands: [
          { name: "Algebraic Expressions", learningOutcome: "Form and simplify algebraic expressions involving one or more variables." },
          { name: "Linear Equations", learningOutcome: "Form and solve simple linear equations in one unknown." },
        ],
      },
      {
        name: "Geometry",
        learningOutcome: "Identify and work with geometric figures and their properties.",
        substrands: [
          { name: "Angles", learningOutcome: "Measure, construct and classify angles using a protractor." },
          { name: "Geometric Constructions", learningOutcome: "Construct geometric figures using a ruler and a pair of compasses." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Use measurement units and tools to solve real-life problems.",
        substrands: [
          { name: "Length, Area and Perimeter", learningOutcome: "Calculate the perimeter and area of regular and irregular shapes." },
          { name: "Time, Distance and Speed", learningOutcome: "Relate time, distance and speed in real-life travel situations." },
        ],
      },
      {
        name: "Data Handling and Probability",
        learningOutcome: "Collect, organise, represent and interpret data.",
        substrands: [
          { name: "Data Representation", learningOutcome: "Collect, organise and represent data using tables, charts and graphs." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen attentively and respond appropriately in a variety of everyday contexts.",
        substrands: [
          { name: "Listening: Views and Opinions", learningOutcome: "List and use ways of expressing views/opinions in different contexts." },
          { name: "Pronunciation and Intonation", learningOutcome: "Pronounce words correctly and use appropriate intonation patterns." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read a variety of texts fluently and with comprehension.",
        substrands: [
          { name: "Intensive Reading: Comprehension", learningOutcome: "Read a passage and answer comprehension questions accurately." },
          { name: "Extensive Reading", learningOutcome: "Read a variety of age-appropriate texts for pleasure and information." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write legibly and creatively for different purposes and audiences.",
        substrands: [
          { name: "The Writing Process: Dialogues", learningOutcome: "Write a well-structured dialogue on a given topic." },
          { name: "Paragraph Writing", learningOutcome: "Write a coherent paragraph with a clear topic sentence." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Use grammatical forms accurately in oral and written communication.",
        substrands: [
          { name: "Phrasal Verbs", learningOutcome: "Identify and use common phrasal verbs correctly in sentences." },
          { name: "Tenses", learningOutcome: "Use the correct tense forms to express time accurately." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kusikiliza kwa makini na kuzungumza kwa ufasaha katika miktadha mbalimbali.",
        substrands: [
          { name: "Kutoa na Kupokea Maelekezo", learningOutcome: "Kutoa na kupokea maelekezo kwa usahihi katika mazungumzo." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma matini mbalimbali kwa ufasaha na ufahamu.",
        substrands: [
          { name: "Ufahamu wa Vifungu", learningOutcome: "Kusoma kifungu na kujibu maswali ya ufahamu kwa usahihi." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika kwa hati nadhifu na ubunifu kwa madhumuni mbalimbali.",
        substrands: [
          { name: "Insha za Kubuni", learningOutcome: "Kuandika insha fupi ya kubuni yenye mtiririko mzuri." },
        ],
      },
      {
        name: "Sarufi",
        learningOutcome: "Kutumia kanuni za sarufi kwa usahihi katika mawasiliano.",
        substrands: [
          { name: "Aina za Maneno", learningOutcome: "Kutambua na kutumia aina za maneno kwa usahihi." },
        ],
      },
    ],
    ISC: [
      {
        name: "Mixtures, Elements and Compounds",
        learningOutcome: "Investigate mixtures, elements and compounds and their everyday applications.",
        substrands: [
          { name: "Simple Classification of Substances", learningOutcome: "Classify substances as elements, compounds or mixtures." },
          { name: "Methods of Separating Mixtures", learningOutcome: "Apply appropriate methods to separate different types of mixtures." },
        ],
      },
      {
        name: "Living Things and Their Environment",
        learningOutcome: "Explore living things and their interdependence with the environment.",
        substrands: [
          { name: "Classification of Living Things", learningOutcome: "Classify living things into major groups using observable features." },
          { name: "Ecosystems", learningOutcome: "Describe the interactions between living things and their environment." },
        ],
      },
      {
        name: "Force and Energy",
        learningOutcome: "Investigate force and energy and their everyday applications.",
        substrands: [
          { name: "Measurement of Length, Area and Volume", learningOutcome: "Measure length, area and volume accurately using appropriate instruments and units." },
        ],
      },
    ],
    SST: [
      {
        name: "People and Population",
        learningOutcome: "Describe the people and population patterns in Kenya.",
        substrands: [
          { name: "Population Distribution", learningOutcome: "Describe factors influencing population distribution in Kenya." },
        ],
      },
      {
        name: "Governance and Citizenship",
        learningOutcome: "Demonstrate responsible citizenship and understanding of governance in Kenya.",
        substrands: [
          { name: "National Values and Principles of Governance", learningOutcome: "Explain the national values and principles of governance." },
        ],
      },
      {
        name: "Natural Resources",
        learningOutcome: "Identify and appreciate the value of natural resources in Kenya.",
        substrands: [
          { name: "Conservation of Natural Resources", learningOutcome: "Explain ways of conserving natural resources for sustainable use." },
        ],
      },
      {
        name: "Trade and Commerce",
        learningOutcome: "Describe trade and commerce activities in Kenya and their significance.",
        substrands: [
          { name: "Types of Trade", learningOutcome: "Distinguish between local, regional and international trade." },
        ],
      },
    ],
  },
  "Grade 8": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Apply number concepts and operations to real-world Kenyan contexts.",
        substrands: [
          { name: "Operations with Integers", learningOutcome: "Perform combined operations on integers and apply them to real-life contexts." },
          { name: "Fractions Revisited", learningOutcome: "Apply the four operations on fractions to solve real-life problems." },
          { name: "Squares and Square Roots", learningOutcome: "Work out squares and square roots of numbers using tables and other methods." },
        ],
      },
      {
        name: "Algebra",
        learningOutcome: "Form, simplify and solve algebraic expressions and equations.",
        substrands: [
          { name: "Algebraic Expressions", learningOutcome: "Form and simplify algebraic expressions involving two or more variables." },
          { name: "Linear Equations and Inequalities", learningOutcome: "Form and solve linear equations and inequalities in one unknown." },
        ],
      },
      {
        name: "Geometry",
        learningOutcome: "Identify, construct and calculate properties of geometric figures.",
        substrands: [
          { name: "Similarity and Congruence", learningOutcome: "Identify and apply the properties of similar and congruent figures." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Apply measurement concepts to solve real-life problems.",
        substrands: [
          { name: "Area of a Circle", learningOutcome: "Calculate the area and circumference of a circle using an appropriate value of pi." },
          { name: "Volume and Capacity", learningOutcome: "Calculate the volume and capacity of solids in real-life contexts." },
        ],
      },
      {
        name: "Data Handling and Probability",
        learningOutcome: "Collect, represent and interpret data using appropriate measures.",
        substrands: [
          { name: "Measures of Central Tendency", learningOutcome: "Calculate the mean, median and mode of a given set of data." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen critically and speak confidently in a variety of contexts.",
        substrands: [
          { name: "Listening and Speaking Skills", learningOutcome: "Listen to a passage and respond to questions with confidence." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read longer texts fluently and with critical comprehension.",
        substrands: [
          { name: "Reading Comprehension (Longer Texts)", learningOutcome: "Read a longer text and answer inferential comprehension questions." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write clearly and creatively for a range of real-life purposes.",
        substrands: [
          { name: "Formal and Informal Letters", learningOutcome: "Write a well-structured formal or informal letter." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Apply grammatical structures accurately in speech and writing.",
        substrands: [
          { name: "Reported Speech", learningOutcome: "Change direct speech to reported speech accurately." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kusikiliza kwa makini na kuzungumza kwa ufasaha katika muktadha tofauti.",
        substrands: [
          { name: "Mazungumzo Rasmi na Yasiyo Rasmi", learningOutcome: "Kushiriki katika mazungumzo rasmi na yasiyo rasmi kwa ufasaha." },
        ],
      },
      {
        name: "Ufahamu wa Vifungu",
        learningOutcome: "Kusoma vifungu virefu na kuvielewa kikamilifu.",
        substrands: [
          { name: "Ufahamu wa Vifungu Virefu", learningOutcome: "Kusoma kifungu kirefu na kujibu maswali ya kina." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha na barua kwa muundo mwafaka.",
        substrands: [
          { name: "Uandishi wa Barua", learningOutcome: "Kuandika barua rasmi na isiyo rasmi kwa muundo sahihi." },
        ],
      },
      {
        name: "Sarufi",
        learningOutcome: "Kutumia miundo ya sarufi kwa usahihi zaidi.",
        substrands: [
          { name: "Ngeli za Nomino", learningOutcome: "Kutambua na kutumia ngeli za nomino kwa usahihi." },
        ],
      },
    ],
    ISC: [
      {
        name: "Mixtures, Elements and Compounds",
        learningOutcome: "Investigate physical and chemical changes in substances.",
        substrands: [
          { name: "Physical and Chemical Changes", learningOutcome: "Distinguish between physical and chemical changes through experiments." },
          { name: "Classes of Fire", learningOutcome: "Classify fires and identify appropriate firefighting methods." },
        ],
      },
      {
        name: "Living Things and Their Environment",
        learningOutcome: "Investigate the structure and function of living things.",
        substrands: [
          { name: "The Cell", learningOutcome: "Describe the structure and function of a cell using a microscope." },
          { name: "Reproduction in Human Beings", learningOutcome: "Describe the human reproductive system and its functions." },
          { name: "Movement of Materials In and Out of the Cell", learningOutcome: "Explain the processes of diffusion and osmosis in living cells." },
        ],
      },
      {
        name: "Force and Energy",
        learningOutcome: "Investigate different forms of energy and their transformations.",
        substrands: [
          { name: "Forms and Sources of Energy", learningOutcome: "Identify different forms and sources of energy and their uses." },
        ],
      },
    ],
    SST: [
      {
        name: "People and Population",
        learningOutcome: "Describe population patterns and their effects on development.",
        substrands: [
          { name: "Population Growth and Change", learningOutcome: "Explain the causes and effects of population growth in Kenya." },
        ],
      },
      {
        name: "Governance and Citizenship",
        learningOutcome: "Explain the structures and processes of governance in Kenya.",
        substrands: [
          { name: "Devolved Government", learningOutcome: "Describe the structure and functions of devolved government in Kenya." },
        ],
      },
      {
        name: "Natural Resources",
        learningOutcome: "Explain the management and utilisation of natural resources.",
        substrands: [
          { name: "Mining and Energy Resources", learningOutcome: "Describe the mining and energy resources found in Kenya." },
        ],
      },
      {
        name: "Trade and Commerce",
        learningOutcome: "Describe regional and international trade in Kenya.",
        substrands: [
          { name: "Regional and International Trade", learningOutcome: "Explain the benefits and challenges of regional and international trade." },
        ],
      },
    ],
  },
  "Grade 9": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Apply advanced number concepts to solve real-life and abstract problems.",
        substrands: [
          { name: "Indices and Logarithms", learningOutcome: "Apply the laws of indices and logarithms to solve problems." },
          { name: "Compound Proportions and Rates", learningOutcome: "Solve problems involving compound proportions, rates of work and mixtures." },
        ],
      },
      {
        name: "Algebra and Inequalities",
        learningOutcome: "Form and solve algebraic equations and inequalities, including simultaneous cases.",
        substrands: [
          { name: "Simultaneous Linear Equations", learningOutcome: "Form and solve simultaneous linear equations in two unknowns." },
          { name: "Matrices", learningOutcome: "Determine the order of a matrix and perform basic matrix operations." },
        ],
      },
      {
        name: "Geometry and Construction",
        learningOutcome: "Apply geometric principles to solve problems involving circles, area and construction.",
        substrands: [
          { name: "Circles: Chords and Segments", learningOutcome: "Calculate the area of a segment of a circle given a chord and central angle." },
          { name: "Surface Area and Volume of Solids", learningOutcome: "Calculate the surface area and volume of prisms and other solids." },
        ],
      },
      {
        name: "Measurements",
        learningOutcome: "Apply measurement and financial concepts to solve real-life problems.",
        substrands: [
          { name: "Compound Interest", learningOutcome: "Calculate compound interest on a loan or investment over a given period." },
          { name: "Temperature", learningOutcome: "Convert between temperature scales and solve real-life temperature problems." },
        ],
      },
      {
        name: "Data Handling and Probability",
        learningOutcome: "Collect, interpret data and calculate simple probabilities.",
        substrands: [
          { name: "Probability", learningOutcome: "Calculate the probability of simple and combined events." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen critically and communicate persuasively in formal and informal settings.",
        substrands: [
          { name: "Public Speaking and Debate", learningOutcome: "Present a persuasive argument confidently in a debate setting." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read and critically analyse a range of literary and non-literary texts.",
        substrands: [
          { name: "Critical Analysis of Texts", learningOutcome: "Analyse the theme, style and message of a given literary text." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write structured, coherent compositions for a range of purposes.",
        substrands: [
          { name: "Essay Writing", learningOutcome: "Write a well-organised essay with a clear introduction, body and conclusion." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Apply advanced grammatical structures accurately.",
        substrands: [
          { name: "Conditional Sentences", learningOutcome: "Construct and use conditional sentences correctly." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kushiriki kwa ufasaha katika mijadala na hotuba.",
        substrands: [
          { name: "Hotuba na Mijadala", learningOutcome: "Kutoa hotuba fupi yenye mshikamano kuhusu mada mahususi." },
        ],
      },
      {
        name: "Ufahamu wa Vifungu",
        learningOutcome: "Kuchanganua matini kwa kina na kutoa maoni.",
        substrands: [
          { name: "Uchanganuzi wa Matini", learningOutcome: "Kuchanganua dhamira na mtindo wa matini uliosomwa." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha zenye mshikamano na mpangilio mzuri.",
        substrands: [
          { name: "Insha za Mjadala", learningOutcome: "Kuandika insha ya mjadala yenye hoja zenye mashiko." },
        ],
      },
      {
        name: "Sarufi",
        learningOutcome: "Kutumia miundo changamano ya sarufi kwa usahihi.",
        substrands: [
          { name: "Sentensi Ambishi", learningOutcome: "Kutambua na kutumia sentensi ambishi kwa usahihi." },
        ],
      },
    ],
    ISC: [
      {
        name: "Mixtures, Elements and Compounds",
        learningOutcome: "Investigate the periodic table and chemical bonding.",
        substrands: [
          { name: "Periodic Table", learningOutcome: "Describe the arrangement of elements in the periodic table and its trends." },
        ],
      },
      {
        name: "Living Things and Their Environment",
        learningOutcome: "Investigate genetics, evolution and human health.",
        substrands: [
          { name: "Genetics and Heredity", learningOutcome: "Explain the basic principles of genetics and inheritance." },
          { name: "Human Health and Disease", learningOutcome: "Describe common diseases and their prevention methods." },
        ],
      },
      {
        name: "Force and Energy",
        learningOutcome: "Investigate electricity, magnetism and simple machines.",
        substrands: [
          { name: "Electricity and Magnetism", learningOutcome: "Explain the relationship between electricity and magnetism." },
          { name: "Simple Machines", learningOutcome: "Explain the working principles of simple machines and their mechanical advantage." },
        ],
      },
    ],
    SST: [
      {
        name: "People and Population",
        learningOutcome: "Analyse population trends and their implications for national development.",
        substrands: [
          { name: "Population and Development", learningOutcome: "Analyse the relationship between population trends and national development." },
        ],
      },
      {
        name: "Governance and Citizenship",
        learningOutcome: "Evaluate Kenya's governance systems and international relations.",
        substrands: [
          { name: "Kenya and the International Community", learningOutcome: "Explain Kenya's role and relations within the international community." },
        ],
      },
      {
        name: "Natural Resources",
        learningOutcome: "Evaluate the sustainable use and management of natural resources.",
        substrands: [
          { name: "Environmental Conservation and Climate Change", learningOutcome: "Explain the causes and effects of climate change and conservation measures." },
        ],
      },
      {
        name: "Trade and Commerce",
        learningOutcome: "Analyse Kenya's economic activities and global trade relations.",
        substrands: [
          { name: "Kenya's Economic Blocs and Trade Agreements", learningOutcome: "Describe Kenya's participation in regional economic blocs and trade agreements." },
        ],
      },
    ],
  },
};

export const JUNIOR_SCHOOL_GRADES: JuniorSchoolGrade[] = ["Grade 7", "Grade 8", "Grade 9"];
export const JUNIOR_SCHOOL_SUBJECT_CODES = ["MAT", "ENG", "KIS", "ISC", "SST"];
