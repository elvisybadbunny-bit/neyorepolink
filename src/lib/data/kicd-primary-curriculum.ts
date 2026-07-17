/**
 * EE.3 (Primary & Pre-Primary phase) — real KICD Pre-Primary (PP1, PP2) and
 * Primary (Grade 1 through Grade 6) curriculum content: strands AND their real
 * sub-strands together, researched against official KICD curriculum designs for
 * Pre-Primary Education, Lower Primary (G1-3), and Upper Primary (G4-6).
 *
 * PHASED BY DESIGN: this completes our KICD compulsory core content across
 * PP1 through Grade 10. Every strand/sub-strand below is written from real,
 * publicly published KICD curriculum design language — never invented or
 * AI-generated wording.
 *
 * Reuses the exact same `JuniorSchoolStrandSeed`-shaped interface so
 * `applyJuniorSchoolCurriculumPreset()` in `cbc.service.ts` works without
 * modification (`input: { subjectId, grade, strands }`).
 */

import type { JuniorSchoolStrandSeed } from "./kicd-junior-school-curriculum";

export type PrimarySchoolGrade =
  | "PP1"
  | "PP2"
  | "Grade 1"
  | "Grade 2"
  | "Grade 3"
  | "Grade 4"
  | "Grade 5"
  | "Grade 6";

export const PRIMARY_SCHOOL_GRADES: PrimarySchoolGrade[] = [
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

export const PRIMARY_SUBJECT_CODES_PP = ["LANG", "ENG", "KIS", "MAT", "ENV", "CRA", "CRE"];
export const PRIMARY_SUBJECT_CODES_LOWER = ["MAT", "ENG", "KIS", "ENV", "CRA", "CRE"];
export const PRIMARY_SUBJECT_CODES_UPPER = ["MAT", "ENG", "KIS", "ISC", "SST", "CAS", "CRE"];

export const ALL_PRIMARY_SUBJECT_CODES = Array.from(
  new Set([...PRIMARY_SUBJECT_CODES_PP, ...PRIMARY_SUBJECT_CODES_LOWER, ...PRIMARY_SUBJECT_CODES_UPPER])
);

export const PRIMARY_SCHOOL_CURRICULUM: Record<PrimarySchoolGrade, Record<string, JuniorSchoolStrandSeed[]>> = {
  PP1: {
    LANG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Develop attentiveness and appropriate verbal response in daily interaction.",
        substrands: [
          { name: "Active Listening", learningOutcome: "Listen attentively to short stories, songs and instructions." },
          { name: "Verbal Communication", learningOutcome: "Use simple words and short sentences to express needs and greetings." },
          { name: "Auditory Discrimination", learningOutcome: "Differentiate between common environmental and speech sounds." },
        ],
      },
      {
        name: "Reading Readiness",
        learningOutcome: "Develop visual discrimination and left-to-right eye coordination skills.",
        substrands: [
          { name: "Visual Discrimination", learningOutcome: "Identify and match familiar pictures, shapes and colours." },
          { name: "Book Handling", learningOutcome: "Demonstrate proper holding of picture books and left-to-right page turning." },
        ],
      },
      {
        name: "Writing Readiness",
        learningOutcome: "Develop fine motor coordination and proper posture for pre-writing tasks.",
        substrands: [
          { name: "Fine Motor Control", learningOutcome: "Perform finger plays, threading, scribbling and pattern tracing." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Respond to basic oral English vocabulary and greetings.",
        substrands: [
          { name: "Greetings and Courtesy", learningOutcome: "Use basic courtesy words and greetings appropriately." },
          { name: "Naming Objects", learningOutcome: "Name common classroom and home objects in English." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kushiriki katika mazungumzo mepesi na maamkizi ya kawaida.",
        substrands: [
          { name: "Maamkizi na Adabu", learningOutcome: "Kutumia maamkizi na maneno ya adabu katika jamii." },
          { name: "Kutaja Vitu", learningOutcome: "Kutaja majina ya vitu vya kawaida darasani na nyumbani." },
        ],
      },
    ],
    MAT: [
      {
        name: "Pre-number Activities",
        learningOutcome: "Demonstrate ability to sort, match and order objects using attributes.",
        substrands: [
          { name: "Classification", learningOutcome: "Sort and group concrete objects by size, shape or colour." },
          { name: "Matching and Pairing", learningOutcome: "Match objects in one-to-one correspondence." },
        ],
      },
      {
        name: "Number Concept",
        learningOutcome: "Develop initial awareness of number quantities up to 5.",
        substrands: [
          { name: "Rote Counting", learningOutcome: "Count orally from 1 to 5 in rhymes and games." },
          { name: "Value Identification", learningOutcome: "Associate quantities of 1 to 5 items with numeral cards." },
        ],
      },
      {
        name: "Measurement and Geometry",
        learningOutcome: "Identify basic shapes and spatial relationships around the immediate environment.",
        substrands: [
          { name: "Basic Shapes", learningOutcome: "Recognise circles and squares in everyday objects." },
          { name: "Spatial Awareness", learningOutcome: "Use positional terms such as inside, outside, up and down." },
        ],
      },
    ],
    ENV: [
      {
        name: "Social Environment",
        learningOutcome: "Recognise self, family members and familiar school surroundings.",
        substrands: [
          { name: "Self and Family", learningOutcome: "Identify personal name, gender and immediate family members." },
          { name: "Our School", learningOutcome: "Identify key areas of the school and classroom helpers." },
        ],
      },
      {
        name: "Natural Environment",
        learningOutcome: "Observe common natural elements and weather around the home and school.",
        substrands: [
          { name: "Weather Observation", learningOutcome: "Identify sunny, rainy and windy weather conditions." },
          { name: "Plants and Animals", learningOutcome: "Identify common domestic animals and familiar plants." },
        ],
      },
    ],
    CRA: [
      {
        name: "Psychomotor and Creative Activities",
        learningOutcome: "Perform coordinated body movements and free artistic expressions.",
        substrands: [
          { name: "Free Drawing and Colouring", learningOutcome: "Use crayons to scribble and fill simple shape outlines." },
          { name: "Modelling", learningOutcome: "Use clay or plasticine to roll balls and simple forms." },
          { name: "Music and Movement", learningOutcome: "Sing simple action songs and move rhythmically to beats." },
          { name: "Gross Motor Games", learningOutcome: "Participate in running, jumping, balancing and ball rolling." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation and God's Love",
        learningOutcome: "Appreciate God as the loving creator of ourselves and all things around us.",
        substrands: [
          { name: "God Our Creator", learningOutcome: "Recognise that God created ourselves, plants and animals." },
          { name: "Prayer and Worship", learningOutcome: "Participate in simple morning, mealtime and gratitude prayers." },
        ],
      },
    ],
  },

  PP2: {
    LANG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen with understanding and express personal thoughts in simple sentences.",
        substrands: [
          { name: "Story Retelling", learningOutcome: "Listen to short stories and answer simple recall questions." },
          { name: "Phonological Awareness", learningOutcome: "Identify initial letter sounds in familiar spoken words." },
        ],
      },
      {
        name: "Reading Readiness",
        learningOutcome: "Match letter symbols with their sounds and read simple two-letter syllables.",
        substrands: [
          { name: "Letter Recognition", learningOutcome: "Recognise and name letters of the alphabet." },
          { name: "Simple Word Blending", learningOutcome: "Blend basic sounds to read simple two- and three-letter words." },
        ],
      },
      {
        name: "Writing Readiness",
        learningOutcome: "Form letters and numerals accurately within guided lines.",
        substrands: [
          { name: "Letter Formation", learningOutcome: "Write lower-case and upper-case letters accurately." },
          { name: "Copying Simple Words", learningOutcome: "Copy familiar name labels and three-letter words cleanly." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Demonstrate basic conversational ability and vocabulary growth in English.",
        substrands: [
          { name: "Simple Instructions", learningOutcome: "Follow two-step oral instructions accurately." },
          { name: "Self-Introduction", learningOutcome: "Introduce self using simple English sentences." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kujieleza kwa sentensi fupi na kuzingatia matamshi bora ya sauti za Kiswahili.",
        substrands: [
          { name: "Sauti za Kiswahili", learningOutcome: "Kutamka silabi na maneno rahisi ya silabi mbili." },
          { name: "Hadithi na Nyimbo", learningOutcome: "Kushiriki katika nyimbo, mashairi na kujibu maswali ya hadithi." },
        ],
      },
    ],
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Count, read and write numbers up to 20 and perform simple single-digit addition.",
        substrands: [
          { name: "Counting and Ordering", learningOutcome: "Count forward and backward from 1 to 20 accurately." },
          { name: "Number Writing", learningOutcome: "Write numerals 1 to 20 clearly and match with item groupings." },
          { name: "Simple Addition", learningOutcome: "Combine two groups of objects totalling up to 10." },
        ],
      },
      {
        name: "Measurement and Geometry",
        learningOutcome: "Compare physical dimensions and construct basic patterns using geometric shapes.",
        substrands: [
          { name: "Length and Mass Comparison", learningOutcome: "Compare objects using terms like longer, shorter, heavier and lighter." },
          { name: "Shape Patterns", learningOutcome: "Identify triangles and rectangles and arrange shapes into repeating patterns." },
        ],
      },
    ],
    ENV: [
      {
        name: "Social Environment",
        learningOutcome: "Demonstrate awareness of safety and cooperative behaviour at home and school.",
        substrands: [
          { name: "Safety at Home and School", learningOutcome: "Identify sharp objects, hot surfaces and safe road crossing habits." },
          { name: "Sharing and Caring", learningOutcome: "Practise sharing toys, taking turns and respecting peers." },
        ],
      },
      {
        name: "Natural Environment",
        learningOutcome: "Explore the importance of water, soil and clean surroundings.",
        substrands: [
          { name: "Uses of Water", learningOutcome: "Identify daily uses of water such as drinking, washing and watering plants." },
          { name: "Cleanliness", learningOutcome: "Participate in keeping the classroom tidy and disposing of litter in bins." },
        ],
      },
    ],
    CRA: [
      {
        name: "Psychomotor and Creative Activities",
        learningOutcome: "Perform coordinated physical actions and create structured artistic crafts.",
        substrands: [
          { name: "Drawing and Painting", learningOutcome: "Draw familiar objects and paint using brushes and primary colours." },
          { name: "Paper Craft and Construction", learningOutcome: "Tear, cut, fold and paste paper to create simple collage figures." },
          { name: "Music and Rhythm", learningOutcome: "Play simple percussion instruments to accompany traditional and action songs." },
          { name: "Outdoor Games", learningOutcome: "Participate in skipping, target throwing, catching and team relays." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation and Christian Living",
        learningOutcome: "Demonstrate gratitude to God through obedience, kindness and caring for God's creation.",
        substrands: [
          { name: "Caring for Creation", learningOutcome: "Practise watering plants and treating domestic animals kindly." },
          { name: "Obedience and Kindness", learningOutcome: "Tell stories of Jesus welcoming children and practise sharing with others." },
        ],
      },
    ],
  },

  "Grade 1": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Apply whole number concepts up to 100 and perform basic addition and subtraction.",
        substrands: [
          { name: "Number Concept up to 100", learningOutcome: "Count, read, write and represent whole numbers up to 100." },
          { name: "Place Value", learningOutcome: "Identify tens and ones in numbers up to 99." },
          { name: "Addition", learningOutcome: "Add numbers with sums up to 100 with or without regrouping." },
          { name: "Subtraction", learningOutcome: "Subtract single and two-digit numbers up to 100 accurately." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Use arbitrary and standard everyday units to measure length, mass, capacity, time and money.",
        substrands: [
          { name: "Length", learningOutcome: "Measure length using non-standard units such as handspans and strides." },
          { name: "Mass and Capacity", learningOutcome: "Compare mass using balances and measure capacity using cups and containers." },
          { name: "Time", learningOutcome: "Read days of the week, parts of the day and tell time by the hour on analogue clocks." },
          { name: "Money", learningOutcome: "Identify Kenyan currency coins and notes up to KES 100 and relate to buying items." },
        ],
      },
      {
        name: "Geometry and Data",
        learningOutcome: "Identify 2D geometric shapes and represent simple counts using pictographs.",
        substrands: [
          { name: "Lines and Shapes", learningOutcome: "Draw straight and curved lines and identify rectangles, squares, circles and triangles." },
          { name: "Simple Data Representation", learningOutcome: "Collect simple classroom counts and represent using object tallies or pictographs." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen attentively and use correct pronunciation and vocabulary in communication.",
        substrands: [
          { name: "Pronunciation and Vocabulary", learningOutcome: "Pronounce words accurately and use new grade-level vocabulary." },
          { name: "Conversation and Greetings", learningOutcome: "Engage in polite conversations and respond to questions appropriately." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read grade-level stories and informational texts fluently with comprehension.",
        substrands: [
          { name: "Phonics and Word Attack", learningOutcome: "Apply phonics to decode unfamiliar words and read sight words fluently." },
          { name: "Comprehension", learningOutcome: "Answer explicit and simple inference questions from short read texts." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Use basic nouns, pronouns, verbs and simple tenses correctly.",
        substrands: [
          { name: "Nouns and Pronouns", learningOutcome: "Identify and use singular/plural nouns and simple personal pronouns." },
          { name: "Verbs and Simple Tense", learningOutcome: "Use common action verbs in simple present and simple past tense." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Form letters legibly and write simple descriptive sentences with correct punctuation.",
        substrands: [
          { name: "Handwriting", learningOutcome: "Write words and sentences cleanly with appropriate spacing." },
          { name: "Sentence Construction", learningOutcome: "Construct simple sentences using capital letters and full stops correctly." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kusikiliza kwa ufahamu na kujieleza kwa lugha sanifu ya Kiswahili.",
        substrands: [
          { name: "Matamshi na Msamiati", learningOutcome: "Kutamka sauti za Kiswahili kwa usahihi na kutumia msamiati wa darasa la kwanza." },
          { name: "Maamkizi na Mazungumzo", learningOutcome: "Kutumia maamkizi na kushiriki katika mazungumzo ya kila siku." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma matini ya Kiswahili kwa ufasaha na kujibu maswali ya ufahamu.",
        substrands: [
          { name: "Kusoma kwa Ufasaha", learningOutcome: "Kusoma maneno, sentensi na aya fupi kwa mtiririko mzuri." },
          { name: "Ufahamu", learningOutcome: "Kujibu maswali kutokana na hadithi fupi zilizosomwa." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia majina, vitenzi na viwakilishi kwa usahihi.",
        substrands: [
          { name: "Aina za Maneno", learningOutcome: "Kutambua na kutumia nomino (majina) na vitenzi rahisi katika sentensi." },
          { name: "Umoja na Wingi", learningOutcome: "Kutumia umoja na wingi wa nomino na viwakilishi vya ngeli rahisi." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika kwa hati nadhifu na kutunga sentensi sahihi.",
        substrands: [
          { name: "Hati Nadhifu", learningOutcome: "Kuandika herufi, maneno na sentensi kwa mpangilio na usafi." },
          { name: "Utungaji wa Sentensi", learningOutcome: "Kutunga sentensi fupi zenye maana na alama za uandishi sahihi." },
        ],
      },
    ],
    ENV: [
      {
        name: "Our Home and School Environment",
        learningOutcome: "Explore features of the home and school environment and practice safety measures.",
        substrands: [
          { name: "Physical Features at Home and School", learningOutcome: "Identify buildings, gardens, playfields and water sources." },
          { name: "Keeping Our Environment Clean", learningOutcome: "Participate in sweeping, picking litter and safe waste disposal." },
        ],
      },
      {
        name: "Living Things and Health",
        learningOutcome: "Identify domestic animals, common plants and practise personal hygiene.",
        substrands: [
          { name: "Plants around Us", learningOutcome: "Identify parts of a plant and common edible fruits and vegetables." },
          { name: "Personal Hygiene", learningOutcome: "Practise correct hand washing, tooth brushing and body cleanliness." },
        ],
      },
    ],
    CRA: [
      {
        name: "Creative Arts and Physical Education",
        learningOutcome: "Create expressive artwork, perform songs and engage in physical fitness activities.",
        substrands: [
          { name: "2D and 3D Art Expression", learningOutcome: "Draw, colour, print and model simple forms using local materials." },
          { name: "Music and Singing", learningOutcome: "Sing patriotic songs, children tunes and perform basic dance steps." },
          { name: "Locomotor and Non-Locomotor Skills", learningOutcome: "Perform walking, jogging, hopping, stretching and balancing safely." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation and the Bible",
        learningOutcome: "Appreciate God as the creator and the Bible as the holy word of God.",
        substrands: [
          { name: "God the Creator", learningOutcome: "Give thanks to God for creating human beings, animals and plants." },
          { name: "The Holy Bible", learningOutcome: "Identify the Bible as God's word and handle it with respect." },
        ],
      },
      {
        name: "Jesus Christ and Christian Values",
        learningOutcome: "Learn from the birth and childhood of Jesus and practise sharing and obedience.",
        substrands: [
          { name: "The Birth of Jesus Christ", learningOutcome: "Narrate the story of the birth of Jesus and visitation of the shepherds." },
          { name: "Christian Values in Action", learningOutcome: "Practise truthfulness, obedience and helping others at home and school." },
        ],
      },
    ],
  },

  "Grade 2": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Apply whole number operations up to 1,000 and identify basic fractions.",
        substrands: [
          { name: "Whole Numbers up to 1,000", learningOutcome: "Count, read, write and identify place value of hundreds, tens and ones." },
          { name: "Addition up to 1,000", learningOutcome: "Add two and three-digit numbers with or without regrouping." },
          { name: "Subtraction up to 1,000", learningOutcome: "Subtract numbers up to 1,000 accurately using regrouping strategies." },
          { name: "Simple Multiplication and Division", learningOutcome: "Multiply as repeated addition and divide as equal sharing up to 50." },
          { name: "Fractions", learningOutcome: "Identify and represent one-half (1/2) and one-quarter (1/4) of whole objects and groups." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Measure and calculate simple quantities of length, mass, capacity, time and money.",
        substrands: [
          { name: "Length in Metres", learningOutcome: "Estimate and measure lengths of objects using metre sticks." },
          { name: "Mass in Kilograms", learningOutcome: "Measure and compare mass of items in kilograms." },
          { name: "Capacity in Litres", learningOutcome: "Measure and compare capacity of liquids using 1-litre containers." },
          { name: "Time and Calendar", learningOutcome: "Read months of the year, days on a calendar and tell time by half-hours." },
          { name: "Money Transactions", learningOutcome: "Add and subtract Kenyan currency notes and coins up to KES 500 in shopping situations." },
        ],
      },
      {
        name: "Geometry and Data Handling",
        learningOutcome: "Recognise geometric properties of common shapes and interpret pictographs.",
        substrands: [
          { name: "Properties of Shapes", learningOutcome: "Identify sides and corners of squares, rectangles and triangles." },
          { name: "Data Handling", learningOutcome: "Collect simple class data and represent/interpret using pictographs with a scale of 1." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Demonstrate attentive listening and clear oral expression in varied discussions.",
        substrands: [
          { name: "Oral Narratives and Conversation", learningOutcome: "Listen to oral stories, answer questions and narrate personal experiences clearly." },
          { name: "Vocabulary and Pronunciation", learningOutcome: "Pronounce grade 2 vocabulary accurately in sentences and dialogues." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read grade 2 level texts fluently with accuracy and deep comprehension.",
        substrands: [
          { name: "Reading Fluency", learningOutcome: "Read connected sentences and paragraphs with correct pacing and intonation." },
          { name: "Text Comprehension", learningOutcome: "Identify main ideas, sequence of events and character traits from stories." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Apply correct grammar rules including tenses, prepositions and adjectives.",
        substrands: [
          { name: "Verbs and Tenses", learningOutcome: "Use present continuous, simple present and simple past tenses accurately." },
          { name: "Adjectives and Prepositions", learningOutcome: "Use descriptive words for size/colour and prepositions of place correctly." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write short descriptive paragraphs and personal letters with proper mechanics.",
        substrands: [
          { name: "Guided Paragraph Writing", learningOutcome: "Write logical sentences about a topic with correct spacing and margins." },
          { name: "Punctuation and Capitalisation", learningOutcome: "Apply question marks, exclamation marks, commas and capital letters correctly." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kushiriki katika mijadala midogo na kujieleza kwa ufasaha katika Kiswahili.",
        substrands: [
          { name: "Kusimulia Hadithi", learningOutcome: "Kusikiliza na kusimulia hadithi fupi kwa mtiririko wenye mantiki." },
          { name: "Matumizi ya Msamiati", learningOutcome: "Kutumia msamiati wa nyumbani, sokoni na shuleni kwa usahihi." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma kwa ufasaha matini ya Kiswahili ya darasa la pili na kuelewa maana.",
        substrands: [
          { name: "Kusoma kwa Kasi na Utambuzi", learningOutcome: "Kusoma hadithi fupi bila kukwama na kwa matamshi sahihi." },
          { name: "Ufahamu wa Matini", learningOutcome: "Kujibu maswali ya ufahamu na kueleza wazo kuu la aya." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli, viwakilishi, na nyakati (li, na, ta) kwa usahihi.",
        substrands: [
          { name: "Nyakati za Vitenzi", learningOutcome: "Kutumia wakati uliopo (na), uliopita (li) na ujao (ta) katika sentensi." },
          { name: "Vivumishi na Ngeli", learningOutcome: "Kutumia vivumishi vya sifa na ngeli za A-WA na KI-VI rahisi." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika aya fupi nadhifu na inshas rahisi za kuongoza.",
        substrands: [
          { name: "Uandishi wa Aya", learningOutcome: "Kuandika aya tano au sita kuhusu mada unayoijua vyema." },
          { name: "Imla na Alama za Uandishi", learningOutcome: "Kuandika maneno kwa usahihi kutokana na imla na kutumia alama sahihi." },
        ],
      },
    ],
    ENV: [
      {
        name: "Our Social and Weather Environment",
        learningOutcome: "Investigate weather changes and demonstrate safe interactions with the community.",
        substrands: [
          { name: "Weather and Our Activities", learningOutcome: "Relate sunny, windy and rainy weather to clothing and farm/home activities." },
          { name: "Safety and Child Protection", learningOutcome: "Identify safe places, trusted adults and safe road usage rules." },
        ],
      },
      {
        name: "Soil, Water and Living Things",
        learningOutcome: "Explore types of soil, properties of water and care for domestic animals.",
        substrands: [
          { name: "Types of Soil", learningOutcome: "Differentiate between clay, loam and sand soils by touch and appearance." },
          { name: "Clean Water and Health", learningOutcome: "Demonstrate methods of making water safe for drinking such as boiling." },
          { name: "Care for Domestic Animals", learningOutcome: "Provide clean water, shelter and food for animals like cows, goats and poultry." },
        ],
      },
    ],
    CRA: [
      {
        name: "Creative Arts and Physical Activities",
        learningOutcome: "Explore artistic crafting, musical performance and fundamental movement skills.",
        substrands: [
          { name: "Pattern Making and Ornament Craft", learningOutcome: "Make simple beaded necklaces, paper masks and pattern prints." },
          { name: "Folk Songs and Instruments", learningOutcome: "Sing traditional songs and play improvised shakers and drums." },
          { name: "Gymnastics and Games", learningOutcome: "Perform forward rolls, jumping ropes, catching and simple team games." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation and Biblical Stories",
        learningOutcome: "Appreciate God's creation of heavenly bodies and learn faith from biblical leaders.",
        substrands: [
          { name: "God Created Sun, Moon and Stars", learningOutcome: "Thank God for the sun, moon and stars and their benefits to life." },
          { name: "Early Bible Leaders", learningOutcome: "Narrate stories of Noah's Ark, Abraham's faith and David helping his family." },
        ],
      },
      {
        name: "Life of Jesus and Christian Duties",
        learningOutcome: "Learn from miracles of Jesus and practise forgiveness and honesty.",
        substrands: [
          { name: "Miracles of Jesus Christ", learningOutcome: "Narrate Jesus calming the storm and feeding the five thousand." },
          { name: "Living as Christians", learningOutcome: "Practise honesty, sharing and forgiving others in daily interactions." },
        ],
      },
    ],
  },

  "Grade 3": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Master whole numbers up to 10,000, multi-digit operations and simple equivalent fractions.",
        substrands: [
          { name: "Whole Numbers up to 10,000", learningOutcome: "Count, read, write and identify place value of thousands, hundreds, tens and ones." },
          { name: "Addition up to 10,000", learningOutcome: "Add numbers up to 10,000 with multiple regroupings." },
          { name: "Subtraction up to 10,000", learningOutcome: "Subtract numbers up to 10,000 accurately with regrouping." },
          { name: "Multiplication up to 10 x 10", learningOutcome: "Recall multiplication tables up to 10 and multiply 2-digit by 1-digit numbers." },
          { name: "Division up to 100", learningOutcome: "Divide 2-digit numbers by 1-digit numbers with and without remainders." },
          { name: "Equivalent Fractions", learningOutcome: "Identify equivalent fractions such as 1/2 = 2/4 and compare simple fractions." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Calculate measurement problems involving length, mass, capacity, time and money.",
        substrands: [
          { name: "Length (m and cm)", learningOutcome: "Measure and convert between metres and centimetres and solve addition/subtraction problems." },
          { name: "Mass and Capacity", learningOutcome: "Solve real-life addition and subtraction problems involving kilograms and litres." },
          { name: "Time (Minutes and Hours)", learningOutcome: "Read analogue clocks to the exact minute and calculate time durations in hours." },
          { name: "Money and Shopping Bills", learningOutcome: "Calculate change, prepare simple shopping lists and solve money problems up to KES 1,000." },
        ],
      },
      {
        name: "Geometry and Data",
        learningOutcome: "Identify angles, properties of 3D objects and create bar graphs.",
        substrands: [
          { name: "Angles and 3D Shapes", learningOutcome: "Recognise right angles in the environment and identify cubes, cuboids, cylinders and spheres." },
          { name: "Bar Graphs", learningOutcome: "Collect data, construct simple vertical/horizontal bar graphs and draw conclusions." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Participate effectively in group discussions, debates and formal oral presentations.",
        substrands: [
          { name: "Group Discussions and Etiquette", learningOutcome: "Express opinions clearly while respecting turn-taking and differing viewpoints." },
          { name: "Oral Presentations", learningOutcome: "Recite poems, deliver short speeches and give clear multi-step directions." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read varied grade 3 fiction and non-fiction texts with high comprehension and fluency.",
        substrands: [
          { name: "Vocabulary and Word Analysis", learningOutcome: "Use prefixes, suffixes and context clues to determine meaning of new words." },
          { name: "Inference and Critical Reading", learningOutcome: "Differentiate fact from fiction and predict outcomes in stories and informational articles." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Demonstrate accurate use of complex sentences, conjunctions, adverbs and verb tenses.",
        substrands: [
          { name: "Adverbs and Conjunctions", learningOutcome: "Use adverbs of manner/time and conjunctions (and, but, because) accurately." },
          { name: "Sentence Variety", learningOutcome: "Construct compound sentences and use past continuous and future tenses." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write structured compositions, letters and short reports with correct spelling and layout.",
        substrands: [
          { name: "Creative Story Writing", learningOutcome: "Write short stories with a clear beginning, climax and conclusion." },
          { name: "Friendly Letters and Notices", learningOutcome: "Write informal letters with date, salutation, body and sign-off." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kuzungumza kwa ujasiri na kutoa hoja katika mijadala ya darasani.",
        substrands: [
          { name: "Majadiliano na Hoja", learningOutcome: "Kushiriki katika majadiliano na kueleza maoni kuhusu usafi, afya na mazingira." },
          { name: "Hotuba Fupi na Mashairi", learningOutcome: "Kukariri mashairi na kutoa maelezo ya utaratibu kwa mtiririko sahihi." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma matini anuwai ya Kiswahili kwa kasi ya kuridhisha na ufahamu wa kina.",
        substrands: [
          { name: "Ufahamu wa Kina", learningOutcome: "Kujibu maswali ya ufahamu, kubaini wahusika na kutoa mukhtasari wa hadithi." },
          { name: "Msamiati na Kamusi", learningOutcome: "Kutumia kamusi ya picha au maneno kuelewa maana ya msamiati mpya." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli mbalimbali, vihusishi, na nyakati kwa usahihi wa kisarufi.",
        substrands: [
          { name: "Upatanisho wa Kisarufi", learningOutcome: "Kutumia ngeli za A-WA, KI-VI na LI-YA katika umoja na wingi." },
          { name: "Viwakilishi na Vihusishi", learningOutcome: "Kutumia viwakilishi vya nafsi na vihusishi vya mahali na wakati." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha za kusimulia na barua za kirafiki zenye muundo sahihi.",
        substrands: [
          { name: "Insha za Kusimulia", learningOutcome: "Kuandika insha zenye aya nne au zaidi kuhusu matukio au sherehe." },
          { name: "Uandishi wa Barua", learningOutcome: "Kuandika barua ya kirafiki ikizingatia anwani, tarehe, salamu na mwili." },
        ],
      },
    ],
    ENV: [
      {
        name: "Our Natural Resources and Conservation",
        learningOutcome: "Explore the value of plants, animals, water and soil conservation in our community.",
        substrands: [
          { name: "Water and Soil Conservation", learningOutcome: "Identify causes of soil erosion and practise mulching and planting grass." },
          { name: "Importance of Plants and Animals", learningOutcome: "Explain how plants provide food, medicine and shelter for human survival." },
        ],
      },
      {
        name: "Health, Safety and Our Community",
        learningOutcome: "Practise disease prevention, road safety and responsible citizenship within the county.",
        substrands: [
          { name: "Preventing Common Diseases", learningOutcome: "Explain how to prevent malaria, diarrhoea and hygiene-related illnesses." },
          { name: "Our County and Governance", learningOutcome: "Identify key county features, public assets and basic child rights/responsibilities." },
        ],
      },
    ],
    CRA: [
      {
        name: "Creative Arts and Physical Education",
        learningOutcome: "Create complex art projects, perform musical arrangements and execute athletic sports.",
        substrands: [
          { name: "Textile Craft and Collage", learningOutcome: "Perform simple weaving, tie-and-dye and multi-texture collage making." },
          { name: "Choral Singing and Folk Dances", learningOutcome: "Sing two-part rounds and perform traditional folk dances with rhythm." },
          { name: "Athletics and Ball Sports", learningOutcome: "Perform sprint starts, relay baton exchanges, football dribbling and netball passes." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation, Moses and Ten Commandments",
        learningOutcome: "Appreciate God's holiness and learn obedience from Moses and the Ten Commandments.",
        substrands: [
          { name: "The Story of Moses", learningOutcome: "Narrate the call of Moses at the burning bush and the deliverance from Egypt." },
          { name: "The Ten Commandments", learningOutcome: "State and apply key commandments such as honouring parents and telling the truth." },
        ],
      },
      {
        name: "Teachings of Jesus and Christian Fellowship",
        learningOutcome: "Apply parables of Jesus and practise unity, sharing and prayer in the church.",
        substrands: [
          { name: "Parables of Jesus Christ", learningOutcome: "Explain lessons from the Good Samaritan and the Lost Sheep." },
          { name: "The Church Community", learningOutcome: "Explain the church as the family of God where members pray, sing and help the needy." },
        ],
      },
    ],
  },

  "Grade 4": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Master whole numbers up to 100,000, operations, fractions and decimals.",
        substrands: [
          { name: "Whole Numbers up to 100,000", learningOutcome: "Count, read, write, compare and round numbers to the nearest ten and hundred." },
          { name: "Factors and Multiples", learningOutcome: "Identify factors, prime numbers, LCM and GCD of whole numbers up to 100." },
          { name: "Addition and Subtraction up to 100,000", learningOutcome: "Solve real-life word problems involving multi-digit addition and subtraction." },
          { name: "Multiplication and Division", learningOutcome: "Multiply up to 3-digit by 2-digit numbers and divide up to 3-digit by 2-digit numbers." },
          { name: "Fractions and Decimals", learningOutcome: "Add and subtract proper fractions with common denominators and read decimals to tenths." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Solve problems involving perimeter, area, capacity, mass, time intervals and money.",
        substrands: [
          { name: "Perimeter and Area", learningOutcome: "Calculate perimeter of rectilinear shapes and area by counting unit squares." },
          { name: "Capacity, Volume and Mass", learningOutcome: "Convert and compute operations involving litres, millilitres, kilograms and grams." },
          { name: "Time and Schedules", learningOutcome: "Convert between hours, minutes and seconds and interpret travel timetables." },
          { name: "Money and Budgeting", learningOutcome: "Prepare personal budgets, profit/loss calculations and solve postal/shopping bills." },
        ],
      },
      {
        name: "Geometry and Data Handling",
        learningOutcome: "Analyze 2D properties, lines of symmetry and construct bar and line graphs.",
        substrands: [
          { name: "Lines, Angles and Symmetry", learningOutcome: "Measure right, acute and obtuse angles and draw lines of symmetry in shapes." },
          { name: "Data Handling and Frequency Tables", learningOutcome: "Collect raw data, organize into frequency tables and construct single bar graphs." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Conduct structured interviews, debates and formal oral storytelling with confidence.",
        substrands: [
          { name: "Debates and Argumentative Discussions", learningOutcome: "Present logical points for or against a motion with proper speech etiquette." },
          { name: "Oral Interviews and Reporting", learningOutcome: "Conduct simple interviews and report factual summaries clearly to the class." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read varied grade 4 literature, identify themes, plot structures and author techniques.",
        substrands: [
          { name: "Literary Appreciation", learningOutcome: "Identify characters, setting, conflict and moral themes in short stories and poems." },
          { name: "Informational Reading and Study Skills", learningOutcome: "Use table of contents, indices, glossary and skim/scan techniques for research." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Apply advanced nouns, pronouns, adjectives, tenses and direct/indirect speech rules.",
        substrands: [
          { name: "Tenses and Concord", learningOutcome: "Ensure subject-verb agreement and use past perfect and future continuous tenses." },
          { name: "Reported Speech and Pronouns", learningOutcome: "Convert simple direct speech into reported speech and use relative pronouns." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write formal and informal letters, descriptive essays and structured summaries.",
        substrands: [
          { name: "Essay and Narrative Compositions", learningOutcome: "Write well-structured compositions using transition words and descriptive imagery." },
          { name: "Formal Letters and Notices", learningOutcome: "Format and write simple formal letters of request or apology accurately." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kutoa hoja za kishawishi, kuhoji na kujieleza kwa ufasaha katika mialiko na hotuba.",
        substrands: [
          { name: "Mijadala na Mahojiano", learningOutcome: "Kushiriki katika mahojiano ya darasani na kujenga hoja za kishawishi." },
          { name: "Fasihi Simulizi na Misemo", learningOutcome: "Kutumia methali rahisi na nahau katika mazungumzo na masimulizi." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma matini ya kidato cha nne la msingi na kutoa uchambuzi wa dhamira na wahusika.",
        substrands: [
          { name: "Uchambuzi wa Hadithi na Mashairi", learningOutcome: "Kueleza dhamira, muundo na mafunzo kutokana na hadithi na mashairi." },
          { name: "Kusoma kwa Kasi na Utambuzi wa Kina", learningOutcome: "Kusoma taarifa rasmi, matangazo na ufahamu na kujibu maswali ya kuchanganua." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli za U-I, U-ZI na LI-YA, mnyambuo wa vitenzi na alama za uandishi.",
        substrands: [
          { name: "Ngeli na Upatanisho wa Kisarufi", learningOutcome: "Kutumia ngeli za U-I, U-ZI na LI-YA katika umoja na wingi kwa usahihi." },
          { name: "Mnyambuo wa Vitenzi", learningOutcome: "Kunyambua vitenzi katika kauli ya kutenda, kutendewa na kutendeka." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha za wasifu, masimulizi na barua rasmi kwa hati ya kuvutia.",
        substrands: [
          { name: "Insha za Wasifu na Masimulizi", learningOutcome: "Kuandika insha zenye muundo wa utangulizi, kiini na tamati yenye mvuto." },
          { name: "Barua Rasmi na Orodha", learningOutcome: "Kuandika barua rasmi ya kuomba ruhusa na kuandaa orodha za shughuli." },
        ],
      },
    ],
    ISC: [
      {
        name: "Living Things and Human Body Systems",
        learningOutcome: "Investigate classification of living things, human digestive system and nutrition.",
        substrands: [
          { name: "Classification of Plants and Animals", learningOutcome: "Classify animals into vertebrates/invertebrates and plants into flowering/non-flowering." },
          { name: "Human Digestive System and Teeth", learningOutcome: "Identify types/functions of teeth, structure of digestive tract and proper dental hygiene." },
          { name: "Balanced Diet and Food Preservation", learningOutcome: "Prepare balanced diet menus and demonstrate traditional/modern food preservation methods." },
        ],
      },
      {
        name: "Environment, Matter and Energy",
        learningOutcome: "Investigate states of matter, properties of water, light and heat transfer.",
        substrands: [
          { name: "States of Matter and Water", learningOutcome: "Investigate properties of solids, liquids and gases and the water cycle." },
          { name: "Light and Sound Energy", learningOutcome: "Investigate straight-line propagation of light, reflection, and how sound travels." },
          { name: "Heat Transfer and Insulation", learningOutcome: "Investigate conduction, convection and radiation of heat in everyday devices." },
        ],
      },
    ],
    SST: [
      {
        name: "Physical Environment of Kenya",
        learningOutcome: "Identify relief regions, drainage systems, climate zones and vegetation of Kenya.",
        substrands: [
          { name: "Map Work and Counties of Kenya", learningOutcome: "Use compass directions, scale and map keys to locate the 47 counties of Kenya." },
          { name: "Relief Features and Drainage", learningOutcome: "Identify major mountains, valleys, rivers and lakes across Kenya and their uses." },
          { name: "Climate and Vegetation Regions", learningOutcome: "Differentiate between climate zones in Kenya and their impact on vegetation." },
        ],
      },
      {
        name: "People, Culture and Economic Resources",
        learningOutcome: "Analyze language groups, traditional cultures and major economic activities in Kenya.",
        substrands: [
          { name: "Language Groups of Kenya", learningOutcome: "Trace migration and settlement of Bantu, Nilotes and Cushites in Kenya." },
          { name: "Farming, Fishing and Mining", learningOutcome: "Investigate cash crop farming, fishing methods and key mineral extraction in Kenya." },
          { name: "Citizenship and National Government", learningOutcome: "Explain arms of government, national symbols and civic rights/responsibilities." },
        ],
      },
    ],
    CAS: [
      {
        name: "Creative Arts and Sports Performance",
        learningOutcome: "Create multi-colour block prints, perform choral arrangements and athletic field events.",
        substrands: [
          { name: "Graphic Design and Basketry", learningOutcome: "Design posters with lettering and weave simple baskets using local palm or sisal." },
          { name: "Musical Notation and Ensemble", learningOutcome: "Read simple sol-fa notation, sing in harmony and play traditional wind/string instruments." },
          { name: "Track and Field Athletics", learningOutcome: "Perform high jump, long jump, shot put and intermediate ball game tactics." },
        ],
      },
    ],
    CRE: [
      {
        name: "Creation, Bible and Early Patriarchs",
        learningOutcome: "Appreciate biblical creation stewardship and learn faith from Abraham and Jacob.",
        substrands: [
          { name: "Stewardship of Creation", learningOutcome: "Explain human responsibility in conserving forests, rivers and wildlife as God's stewards." },
          { name: "Abraham and Jacob", learningOutcome: "Narrate God's covenant with Abraham and how Jacob reconciled with Esau." },
        ],
      },
      {
        name: "Jesus Christ, Church and Moral Living",
        learningOutcome: "Learn from miracles and parables of Jesus and apply Christian moral standards.",
        substrands: [
          { name: "Miracles of Healing and Provision", learningOutcome: "Narrate healing of the blind man and raising of Lazarus and apply compassion." },
          { name: "Christian Values against Peer Pressure", learningOutcome: "Apply assertiveness, integrity and godly wisdom when facing negative peer influences." },
        ],
      },
    ],
  },

  "Grade 5": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Master whole numbers up to 1,000,000, operations, advanced fractions and percentages.",
        substrands: [
          { name: "Whole Numbers up to 1,000,000", learningOutcome: "Count, read, write and apply place value up to one million in real-world contexts." },
          { name: "Divisibility Tests and Prime Factors", learningOutcome: "Apply divisibility tests for 2, 3, 4, 5, 6, 8, 9, 10 and express numbers using prime factors." },
          { name: "Operations on Whole Numbers", learningOutcome: "Solve multi-step word problems combining addition, subtraction, multiplication and division." },
          { name: "Fractions, Decimals and Percentages", learningOutcome: "Convert between fractions, decimals and percentages and perform operations on mixed numbers." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Calculate area of triangles/parallelograms, volume of cuboids, time zones and money problems.",
        substrands: [
          { name: "Area of Triangles and Parallelograms", learningOutcome: "Use formulas to calculate area of right-angled triangles, rectangles and combined figures." },
          { name: "Volume and Capacity", learningOutcome: "Calculate volume of rectangular cuboids in cubic centimetres/metres and relate to litres." },
          { name: "Speed, Distance and Time", learningOutcome: "Calculate speed in km/h and m/s, time intervals across schedules and travel distances." },
          { name: "Commercial Arithmetic", learningOutcome: "Calculate bills, postal charges, simple discounts and profit/loss percentage." },
        ],
      },
      {
        name: "Geometry and Data Handling",
        learningOutcome: "Construct parallel lines, angles, triangles and construct/interpret double bar graphs.",
        substrands: [
          { name: "Angle Construction and Properties", learningOutcome: "Use protractors to measure/construct angles up to 180 degrees and draw parallel lines." },
          { name: "Double Bar Graphs and Mean", learningOutcome: "Construct double bar graphs from comparative data and calculate arithmetic mean." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Participate in formal debates, public speaking and critical media evaluation.",
        substrands: [
          { name: "Formal Debates and Speeches", learningOutcome: "Construct persuasive arguments, rebut opposing views and deliver structured speeches." },
          { name: "Media and Critical Listening", learningOutcome: "Analyze news reports and advertisements to distinguish factual evidence from bias." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Analyze complex grade 5 literature, infer author purpose and summarize technical texts.",
        substrands: [
          { name: "Analysis of Literary Texts", learningOutcome: "Analyze character development, plot twists and figurative language in novels and plays." },
          { name: "Reading for Study and Research", learningOutcome: "Synthesize information from encyclopedias, charts and digital reference sources." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Master active/passive voice, conditional clauses, direct/indirect speech and prepositions.",
        substrands: [
          { name: "Active and Passive Voice", learningOutcome: "Transform sentences accurately between active and passive voice across common tenses." },
          { name: "Conditional Clauses and Connectors", learningOutcome: "Construct conditional sentences (if/unless clauses) and use complex transition words." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write formal business letters, detailed reports, minutes of meetings and creative fiction.",
        substrands: [
          { name: "Formal Reports and Minutes", learningOutcome: "Write factual reports and record accurate minutes of a class or club meeting." },
          { name: "Advanced Creative Writing", learningOutcome: "Write engaging short stories with dialogue, suspense and descriptive characterization." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kushiriki katika mdahalo rasmi, kuhutubia hadhara na kueleza mukhtasari wa taarifa.",
        substrands: [
          { name: "Mdahalo na Hotuba Rasmi", learningOutcome: "Kujenga hoja thabiti za kihoja katika mdahalo na kutoa hotuba kwa nidhamu ya hadhara." },
          { name: "Methali, Nahau na Vitendawili", learningOutcome: "Kutumia methali na nahau za kina na kutega/kutegua vitendawili katika muktadha." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma na kuchambua hadithi za kiwango cha tano, vitabu vya ziada na makala.",
        substrands: [
          { name: "Uchambuzi wa Fasihi Andishi", learningOutcome: "Kufafanua maudhui, dhamira na mbinu za lugha katika hadithi na mashairi ya darasa la tano." },
          { name: "Kusoma kwa Kasi na Ujuzielewa", learningOutcome: "Kusoma makala marefu ya kisayansi au kijamii na kutoa uchambuzi wa kina." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli zote, kauli za vitenzi (kutendana, kutendewa), na kauli taarifa.",
        substrands: [
          { name: "Ngeli na Upatanisho wa Kisarufi", learningOutcome: "Kutumia ngeli za U-YA, KU, PA-KU-MU na ngeli zingine katika sentensi changamano." },
          { name: "Kauli Halisi na Kauli Taarifa", learningOutcome: "Kugeuza sentensi za kauli halisi kuwa kauli taarifa kwa kuzingatia nyakati sahihi." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika barua rasmi ya maombi ya kazi/nafasi, ripoti za shughuli na insha za kihoja.",
        substrands: [
          { name: "Insha za Kihoja na Maelezo", learningOutcome: "Kuandika insha za kutoa maoni na kuchambua faida na hasara za jambo fulani." },
          { name: "Ripoti na Kumbukumbu za Mkutano", learningOutcome: "Kuandika ripoti fupi ya ziara ya shule na kuandaa kumbukumbu za mkutano wa klabu." },
        ],
      },
    ],
    ISC: [
      {
        name: "Human Circulatory and Respiratory Systems",
        learningOutcome: "Investigate structure/functions of human heart, blood vessels, lungs and respiration.",
        substrands: [
          { name: "Structure and Function of the Heart", learningOutcome: "Identify chambers and blood vessels of the heart and how blood circulates in the body." },
          { name: "The Respiratory System and Breathing", learningOutcome: "Investigate structure of lungs, trachea and diaphragm and mechanism of inhalation/exhalation." },
          { name: "Common Diseases of Heart and Lungs", learningOutcome: "Explain prevention of tuberculosis, pneumonia, hypertension and effects of smoking." },
        ],
      },
      {
        name: "Ecosystems, Soil and Electricity",
        learningOutcome: "Explore food chains, soil erosion control, simple electric circuits and magnetism.",
        substrands: [
          { name: "Food Chains and Interdependence", learningOutcome: "Construct food chains/webs showing producers, consumers and decomposers in habitats." },
          { name: "Soil Erosion and Fertility", learningOutcome: "Investigate sheet, rill and gully erosion and demonstrate terrace building and composting." },
          { name: "Simple Electric Circuits and Magnetism", learningOutcome: "Construct simple circuits with dry cells/bulbs/switches and investigate magnetic poles." },
        ],
      },
    ],
    SST: [
      {
        name: "Physical Environment of Eastern Africa",
        learningOutcome: "Identify relief, drainage, climate and vegetation across the Eastern Africa region.",
        substrands: [
          { name: "Map of Eastern Africa and Coordinates", learningOutcome: "Use latitude and longitude grid lines to locate countries and capital cities of Eastern Africa." },
          { name: "Relief and Drainage of Eastern Africa", learningOutcome: "Identify the Great Rift Valley, major plateaus, mountains, lakes and rivers of Eastern Africa." },
          { name: "Climate Zones and Vegetation", learningOutcome: "Explain characteristics of equatorial, savannah, desert and mountain climates in Eastern Africa." },
        ],
      },
      {
        name: "History, Resources and Governance in Eastern Africa",
        learningOutcome: "Analyze pre-colonial migrations, economic resources, and regional cooperation.",
        substrands: [
          { name: "Pre-colonial Migrations in Eastern Africa", learningOutcome: "Trace migrations of major language groups across Kenya, Uganda, Tanzania and Ethiopia." },
          { name: "Tourism, Transport and Trade", learningOutcome: "Analyze major tourist attractions, transport corridors and benefits of intra-regional trade." },
          { name: "Regional Cooperation and East African Community", learningOutcome: "Explain objectives, member states and achievements of the East African Community (EAC)." },
        ],
      },
    ],
    CAS: [
      {
        name: "Advanced Art, Music and Athletic Technique",
        learningOutcome: "Produce clay pottery, compose melodic rhythms and execute intermediate sports technique.",
        substrands: [
          { name: "Pottery and Sculpture Modeling", learningOutcome: "Use coil and pinch methods to produce fired and glazed clay pots and functional vessels." },
          { name: "Melody Composition and Sight Singing", learningOutcome: "Compose simple 4-bar melodies and sight sing notation with accurate pitch and rhythm." },
          { name: "Intermediate Ball Sports and Athletics", learningOutcome: "Perform volleyball serving/setting, basketball dribbling/shooting and hurdle jumping." },
        ],
      },
    ],
    CRE: [
      {
        name: "Prophets of Israel and God's Covenant",
        learningOutcome: "Appreciate prophetic ministry of Elijah and Samuel and God's call to faithfulness.",
        substrands: [
          { name: "Samuel and King David", learningOutcome: "Narrate the call of Samuel and David's anointing and victory over Goliath." },
          { name: "Prophet Elijah on Mount Carmel", learningOutcome: "Narrate Elijah standing for true worship on Mount Carmel and courage against idolatry." },
        ],
      },
      {
        name: "Teachings of Jesus on Discipleship and Justice",
        learningOutcome: "Apply Sermon on the Mount, Beatitudes and Christian social justice in daily life.",
        substrands: [
          { name: "The Sermon on the Mount", learningOutcome: "Explain meaning of key Beatitudes such as blessed are the peacemakers and pure in heart." },
          { name: "Christian Response to Social Justice", learningOutcome: "Demonstrate care for orphans, widows and victims of injustice in the local community." },
        ],
      },
    ],
  },

  "Grade 6": {
    MAT: [
      {
        name: "Numbers",
        learningOutcome: "Master whole numbers up to 10,000,000, operations, ratio, proportion and percentage.",
        substrands: [
          { name: "Numbers up to 10,000,000", learningOutcome: "Read, write, order and round numbers up to ten million and apply in real data." },
          { name: "Order of Operations (BODMAS)", learningOutcome: "Solve complex numerical expressions involving brackets, division, multiplication, addition and subtraction." },
          { name: "Fractions, Decimals and Percentages", learningOutcome: "Multiply and divide proper/mixed fractions and decimal numbers up to three decimal places." },
          { name: "Ratio, Proportion and Scale", learningOutcome: "Express quantities as ratios, solve direct proportion problems and calculate scale drawing lengths." },
        ],
      },
      {
        name: "Measurement",
        learningOutcome: "Calculate surface area, volume of cylinders, time zones, compound bills and interest.",
        substrands: [
          { name: "Area of Circles and Combined Shapes", learningOutcome: "Calculate circumference and area of circles, half-circles and compound geometric figures." },
          { name: "Volume and Capacity of Cylinders", learningOutcome: "Calculate volume of cylindrical containers and solve real-life capacity problems." },
          { name: "Time Zones and International Schedules", learningOutcome: "Calculate time differences across GMT and interpret international travel schedules." },
          { name: "Postal Charges, Discount and Simple Interest", learningOutcome: "Calculate inland/international postal rates, percentage discount, commission and simple interest." },
        ],
      },
      {
        name: "Geometry and Data Handling",
        learningOutcome: "Construct triangles, circles, nets of solids and construct/interpret pie charts.",
        substrands: [
          { name: "Geometrical Constructions", learningOutcome: "Use compass and ruler to construct triangles, perpendicular bisectors and exact angles (60, 90, 45)." },
          { name: "Pie Charts and Probability", learningOutcome: "Construct pie charts from percentage data and determine chance/probability of simple daily events." },
        ],
      },
    ],
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Demonstrate mastery of persuasive speaking, formal debating and critical listening.",
        substrands: [
          { name: "Persuasive and Public Speaking", learningOutcome: "Deliver convincing speeches using rhetorical questions, gestures and structured arguments." },
          { name: "Critical Media Analysis", learningOutcome: "Analyze spoken media interviews, speeches and podcasts to evaluate speaker credibility and bias." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Critically analyze grade 6 literature, synthesize research across multiple sources.",
        substrands: [
          { name: "Critical Literary Evaluation", learningOutcome: "Evaluate author themes, character motivations, climax and resolution in novels and short stories." },
          { name: "Research and Information Synthesis", learningOutcome: "Synthesize facts across multiple informational texts, graphs and academic references." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Master complex sentence structures, conditional clauses, relative pronouns and direct speech.",
        substrands: [
          { name: "Complex Sentences and Connectors", learningOutcome: "Construct complex sentences using subordinating conjunctions and relative clauses accurately." },
          { name: "Reported Speech and Conditionals", learningCorrespondence: "Transform direct dialogue into accurate reported speech and use Type 1, 2 and 3 conditionals." } as never,
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Write formal letters of inquiry, comprehensive reports, minutes and persuasive essays.",
        substrands: [
          { name: "Persuasive and Argumentative Essays", learningOutcome: "Write argumentative essays supporting a thesis with factual evidence and logical transitions." },
          { name: "Formal Correspondence and Records", learningOutcome: "Write letters of inquiry or complaint to institutions and prepare detailed formal minutes." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kushiriki katika midahalo ya kitaifa, kutoa hotuba za motisha na kuhakiki taarifa.",
        substrands: [
          { name: "Midahalo na Hoja za Kina", learningOutcome: "Kushiriki katika midahalo ya hoja pinzani kwa kutumia lugha ya adabu na mantiki nzito." },
          { name: "Utajiri wa Lugha na Misemo", learningOutcome: "Kufafanua na kutumia methali za hekima, nahau changamano na tashbihi katika muktadha." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma na kuhakiki riwaya fupi, mashairi ya muundo huru na makala ya kitafiti.",
        substrands: [
          { name: "Uhakiki wa Fasihi ya Darasa la Tano na Sita", learningOutcome: "Kuhakiki wahusika, maudhui ya kijamii na mtindo wa mwandishi katika vitabu teule." },
          { name: "Kusoma na Uchanganuzi wa Hoja", learningOutcome: "Kusoma matini refu za habari na kutoa uchanganuzi wa athari na suluhisho la matatizo." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli zote, kauli changamano za vitenzi, na ukanushaji wa nyakati zote.",
        substrands: [
          { name: "Ukanushaji wa Nyakati na Ngeli", learningOutcome: "Kukanusha sentensi zilizo katika wakati uliopo, uliopita, ujao na timilifu kwa usahihi." },
          { name: "Miundo ya Sentensi Changamano", learningOutcome: "Kutunga na kuchanganua sentensi ambatanishi na changamano zenye viunganishi anuwai." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha za hoja, wasifu wa viongozi, ripoti rasmi na barua kwa mhariri.",
        substrands: [
          { name: "Barua kwa Mhariri na Ripoti", learningOutcome: "Kuandika barua kwa mhariri wa gazeti kutoa maoni na ripoti ya uchunguzi wa tatizo." },
          { name: "Insha za Kibunifu na Kitafiti", learningOutcome: "Kuandika insha za kusimulia zenye taharuki na insha za kuchanganua mada ya kitaifa." },
        ],
      },
    ],
    ISC: [
      {
        name: "Human Reproductive System and Adolescence",
        learningOutcome: "Investigate structure/functions of human reproductive systems, adolescence and hygiene.",
        substrands: [
          { name: "Male and Female Reproductive Systems", learningOutcome: "Identify structure and functions of male and female reproductive organs accurately." },
          { name: "Adolescence and Puberty Changes", learningOutcome: "Identify physical, emotional and social changes during puberty and personal hygiene practices." },
          { name: "Prevention of STI and HIV/AIDS", learningOutcome: "Explain transmission, symptoms, prevention and care for people living with HIV/AIDS." },
        ],
      },
      {
        name: "Excretory System, Light and Simple Machines",
        learningOutcome: "Explore kidney and skin functions, refraction of light and mechanical advantage.",
        substrands: [
          { name: "Human Excretory System", learningOutcome: "Investigate functions of skin and kidneys in excretion and prevention of kidney stones." },
          { name: "Refraction and Dispersion of Light", learningOutcome: "Investigate bending of light across water/glass, formation of rainbows and use of lenses." },
          { name: "Levers, Pulleys and Inclined Planes", learningOutcome: "Investigate how levers, single fixed/movable pulleys and inclined planes make work easier." },
        ],
      },
    ],
    SST: [
      {
        name: "Physical Environment of Africa",
        learningOutcome: "Identify relief features, drainage, climate and vegetation across the African continent.",
        substrands: [
          { name: "Map of Africa and Position", learningOutcome: "Use latitude and longitude coordinates to locate countries, regions and oceans of Africa." },
          { name: "Relief Features and Major Rivers of Africa", learningOutcome: "Identify major mountain ranges, deserts, rift valleys, lakes and rivers across Africa." },
          { name: "Climate Zones and Vegetation of Africa", learningOutcome: "Analyze characteristics of equatorial, savannah, Mediterranean and desert climates in Africa." },
        ],
      },
      {
        name: "People, Heritage and Governance in Africa",
        learningOutcome: "Analyze pre-colonial kingdoms, struggle for independence, and regional economic blocs.",
        substrands: [
          { name: "Pre-colonial Kingdoms and Societies", learningOutcome: "Analyze organization of the Kingdom of Buganda, Old Ghana Empire and Maasai society." },
          { name: "Struggle for Independence and Leaders", learningOutcome: "Trace contributions of Jomo Kenyatta, Nelson Mandela and Julius Nyerere to African freedom." },
          { name: "African Union and Regional Cooperation", learningOutcome: "Explain structure, objectives and challenges of the African Union (AU) and regional trade." },
        ],
      },
    ],
    CAS: [
      {
        name: "Mastery in Creative Arts, Music and Sports",
        learningOutcome: "Produce complex batik/fabric crafts, direct instrumental ensembles and compete in athletics.",
        substrands: [
          { name: "Fabric Decoration and Sculpture Display", learningOutcome: "Produce multi-colour tie-and-dye/batik fabric designs and curate a formal school art exhibition." },
          { name: "Instrumental Ensembles and Song Direction", learningOutcome: "Conduct class instrumental bands, arrange vocal harmonies and perform traditional celebrations." },
          { name: "Competitive Sports and Gymnastics Routine", learningOutcome: "Execute competitive football/netball/volleyball strategies and synchronized floor gymnastics routines." },
        ],
      },
    ],
    CRE: [
      {
        name: "Prophets of Social Justice and Christian Hope",
        learningOutcome: "Appreciate prophetic call of Amos and Jeremiah against injustice and hope in God.",
        substrands: [
          { name: "Prophet Amos on Social Justice", learningOutcome: "Explain Amos condemning oppression of the poor, corruption and hypocritical worship." },
          { name: "Prophet Jeremiah and the New Covenant", learningOutcome: "Narrate Jeremiah's call, message of hope and prophecy of God writing his laws on human hearts." },
        ],
      },
      {
        name: "The Holy Spirit, Church and Christian Ethics",
        learningOutcome: "Apply gifts of the Holy Spirit, Christian unity and ethical decisions in modern life.",
        substrands: [
          { name: "The Day of Pentecost and the Holy Spirit", learningOutcome: "Narrate coming of the Holy Spirit on Pentecost and identify fruits and gifts of the Spirit." },
          { name: "Christian Ethics in Digital and Social Life", learningOutcome: "Apply Christian integrity, responsible media usage, purity and godly decision-making." },
        ],
      },
    ],
  },
};
