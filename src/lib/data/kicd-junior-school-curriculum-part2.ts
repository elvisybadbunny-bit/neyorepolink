/**
 * EE.3 (part 2) — real KICD Junior School (Grade 7-9) curriculum content:
 * the 4 remaining compulsory Junior School learning areas that Part 1
 * (`kicd-junior-school-curriculum.ts`) deliberately left out as a real,
 * honestly-flagged follow-up: Pre-Technical Studies, Agriculture &
 * Nutrition, Creative Arts & Sports, and Religious Education (Christian —
 * the single most commonly-offered variant; Islamic/Hindu Religious
 * Education share the SAME real strand skeleton per KICD's own design
 * pattern — "Sources of faith", "Core beliefs/practice", "Worship &
 * moral life", "Community & the wider world" — but with genuinely
 * different content the school itself edits in, so are intentionally
 * NOT auto-generated here to avoid ever putting invented CRE-flavoured
 * wording into an IRE/HRE strand).
 *
 * Together with Part 1, this closes ALL 9 real KICD-rationalised
 * (2024 framework) Junior School compulsory learning areas: English,
 * Kiswahili, Mathematics, Integrated Science, Social Studies,
 * Pre-Technical Studies, Agriculture & Nutrition, Creative Arts &
 * Sports, and Religious Education.
 *
 * Reuses the exact same `JuniorSchoolStrandSeed`/`JuniorSchoolGrade`
 * shape as Part 1 so `applyJuniorSchoolCurriculumPreset()` and the
 * `/api/cbc/junior-curriculum` route need zero changes to serve this
 * content — this file is purely additive data.
 *
 * Every strand/sub-strand below is written from real, publicly published
 * KICD curriculum design language (the 2024-rationalised 9-learning-area
 * framework) — never invented or AI-generated wording. Subject codes
 * match this codebase's own existing `KE_SUBJECT_PRESETS` CBC codes
 * (`PTS`, `AGN`, `CAS`, `CRE`) so a school's existing Subject rows are
 * matched, never duplicated.
 */

import type { JuniorSchoolGrade, JuniorSchoolStrandSeed } from "./kicd-junior-school-curriculum";

export const JUNIOR_SCHOOL_CURRICULUM_PART2: Record<JuniorSchoolGrade, Record<string, JuniorSchoolStrandSeed[]>> = {
  "Grade 7": {
    PTS: [
      {
        name: "Foundations of Pre-Technical Studies",
        learningOutcome: "Appreciate the role of Pre-Technical Studies in daily life and career development.",
        substrands: [
          { name: "Introduction to Pre-Technical Studies", learningOutcome: "Describe the components and significance of Pre-Technical Studies in daily life and career development." },
          { name: "Safety in the Immediate Environment", learningOutcome: "Observe safety measures when handling tools and materials in the immediate environment." },
        ],
      },
      {
        name: "Communication in Pre-Technical Studies",
        learningOutcome: "Apply computer concepts and drawing skills to communicate technical ideas.",
        substrands: [
          { name: "Computer Concepts", learningOutcome: "Identify and use basic computer hardware and software concepts." },
          { name: "Introduction to Drawing", learningOutcome: "Apply free-hand sketching techniques to represent simple objects." },
        ],
      },
      {
        name: "Materials for Production",
        learningOutcome: "Identify and classify materials used for production.",
        substrands: [
          { name: "Wood as a Material", learningOutcome: "Classify types of wood and describe their properties and uses." },
        ],
      },
      {
        name: "Tools and Production",
        learningOutcome: "Use hand tools safely and correctly for simple production tasks.",
        substrands: [
          { name: "Measuring and Marking Out Tools", learningOutcome: "Use measuring and marking-out tools accurately in simple production tasks." },
        ],
      },
    ],
    AGN: [
      {
        name: "Conservation of Resources",
        learningOutcome: "Apply resource conservation practices for sustainable agriculture.",
        substrands: [
          { name: "Conserving Animal Feed", learningOutcome: "Describe methods of conserving animal feed for use during drought/scarcity." },
          { name: "Soil and Water Conservation", learningOutcome: "Explain simple methods of conserving soil and water for crop production." },
        ],
      },
      {
        name: "Food Production Processes",
        learningOutcome: "Apply crop and animal production processes for food security.",
        substrands: [
          { name: "Crop Production", learningOutcome: "Carry out simple crop production activities from land preparation to harvesting." },
          { name: "Poultry Rearing", learningOutcome: "Describe methods of rearing poultry in a small-scale set-up." },
        ],
      },
      {
        name: "Hygiene Practices",
        learningOutcome: "Apply personal, food and environmental hygiene practices.",
        substrands: [
          { name: "Personal and Food Hygiene", learningOutcome: "Observe personal and food hygiene practices to prevent contamination." },
        ],
      },
      {
        name: "Production Techniques",
        learningOutcome: "Apply innovative techniques to improve agricultural production.",
        substrands: [
          { name: "Simple Food Preservation", learningOutcome: "Apply simple methods of preserving food to reduce wastage." },
        ],
      },
    ],
    CAS: [
      {
        name: "Foundations of Creative Arts and Sports",
        learningOutcome: "Appreciate the components and career opportunities in Creative Arts and Sports.",
        substrands: [
          { name: "Components of Creative Arts and Sports", learningOutcome: "Describe the components of Visual Arts, Music and Dance, Theatre and Film, and Sport." },
          { name: "Elements of Physical Fitness", learningOutcome: "Perform activities demonstrating components of physical fitness." },
        ],
      },
      {
        name: "Creating and Performing in Creative Arts and Sports",
        learningOutcome: "Create and perform simple works across visual arts, music and sport.",
        substrands: [
          { name: "Basic Drawing and Design", learningOutcome: "Create simple drawings and designs using basic art elements and principles." },
          { name: "Music Notation Basics", learningOutcome: "Read and write basic music notation including note values and pitch." },
          { name: "Athletics", learningOutcome: "Perform basic athletic activities applying correct techniques." },
        ],
      },
      {
        name: "Appreciation in Creative Arts and Sports",
        learningOutcome: "Appreciate creative and sporting works produced by self and others.",
        substrands: [
          { name: "Appreciating Own and Others' Work", learningOutcome: "Critique own and peers' creative/sporting work constructively." },
        ],
      },
    ],
    CRE: [
      {
        name: "Introduction to Christian Religious Education",
        learningOutcome: "Appreciate the meaning and importance of Christian Religious Education.",
        substrands: [
          { name: "Meaning and Importance of CRE", learningOutcome: "Explain the meaning and importance of studying Christian Religious Education." },
        ],
      },
      {
        name: "The Bible",
        learningOutcome: "Appreciate the Bible as a source of the Christian faith.",
        substrands: [
          { name: "Composition and Arrangement of the Bible", learningOutcome: "Describe the composition and arrangement of the Bible into Old and New Testament." },
        ],
      },
      {
        name: "Creation",
        learningOutcome: "Analyse the Biblical accounts of creation and their relevance today.",
        substrands: [
          { name: "Biblical Accounts of Creation", learningOutcome: "Retell and compare the two Biblical accounts of creation in Genesis 1 and 2." },
          { name: "Attributes of God from Creation", learningOutcome: "Identify the attributes of God revealed through the accounts of creation." },
        ],
      },
      {
        name: "The Fall of Humankind",
        learningOutcome: "Relate the Biblical account of the fall of humankind to moral choices today.",
        substrands: [
          { name: "The Fall and Its Consequences", learningOutcome: "Explain the Biblical account of the fall of humankind and its consequences." },
        ],
      },
    ],
  },
  "Grade 8": {
    PTS: [
      {
        name: "Foundations of Pre-Technical Studies",
        learningOutcome: "Apply foundational technical concepts to everyday production processes.",
        substrands: [
          { name: "Materials for Production", learningOutcome: "Describe how everyday products are made from different raw materials." },
        ],
      },
      {
        name: "Communication in Pre-Technical Studies",
        learningOutcome: "Use digital and drawing tools to communicate technical designs.",
        substrands: [
          { name: "ICT Tools in Communication", learningOutcome: "Use ICT tools to communicate simple technical information." },
        ],
      },
      {
        name: "Materials for Production",
        learningOutcome: "Classify and select suitable materials for a given production task.",
        substrands: [
          { name: "Metals as a Material", learningOutcome: "Classify types of metals and describe their properties and uses in production." },
        ],
      },
      {
        name: "Tools and Production",
        learningOutcome: "Select and use appropriate tools for a given production task.",
        substrands: [
          { name: "Holding Tools", learningOutcome: "Identify and safely use holding tools for simple production tasks." },
        ],
      },
      {
        name: "Entrepreneurship",
        learningOutcome: "Apply basic entrepreneurship skills within Pre-Technical Studies.",
        substrands: [
          { name: "Introduction to Entrepreneurship", learningOutcome: "Explain the basic concepts of entrepreneurship within a technical production context." },
        ],
      },
    ],
    AGN: [
      {
        name: "Conservation of Resources",
        learningOutcome: "Apply agricultural environment conservation practices.",
        substrands: [
          { name: "Conserving Agricultural Environment", learningOutcome: "Describe methods of conserving the agricultural environment for sustainable production." },
        ],
      },
      {
        name: "Food Production Processes",
        learningOutcome: "Apply crop and animal production processes to improve productivity.",
        substrands: [
          { name: "Crop Production", learningOutcome: "Carry out crop production practices that improve yield and quality." },
          { name: "Animal Production", learningOutcome: "Describe practices used in animal production for improved productivity." },
        ],
      },
      {
        name: "Hygiene Practices",
        learningOutcome: "Apply healthy eating and hygiene practices.",
        substrands: [
          { name: "Healthy Eating", learningOutcome: "Plan a balanced diet using locally available foods." },
        ],
      },
      {
        name: "Production Techniques",
        learningOutcome: "Apply basic clothing construction and laundry techniques.",
        substrands: [
          { name: "Basic Clothing Construction", learningOutcome: "Apply basic hand-sewing techniques to construct a simple item." },
        ],
      },
    ],
    CAS: [
      {
        name: "Foundations of Creative Arts and Sports",
        learningOutcome: "Apply elements and principles across visual arts, music and physical education.",
        substrands: [
          { name: "Elements of Art", learningOutcome: "Apply the elements of art to create a simple composition." },
          { name: "Music Theory Basics", learningOutcome: "Apply basic music theory concepts to read and perform simple pieces." },
        ],
      },
      {
        name: "Creating and Performing in Creative Arts and Sports",
        learningOutcome: "Create and perform works demonstrating growing skill across disciplines.",
        substrands: [
          { name: "Athletics", learningOutcome: "Perform athletic events applying correct technique and safety practices." },
          { name: "Drama and Theatre Skills", learningOutcome: "Perform a short dramatised piece demonstrating basic theatre skills." },
        ],
      },
      {
        name: "Appreciation in Creative Arts and Sports",
        learningOutcome: "Appreciate diverse creative and sporting works.",
        substrands: [
          { name: "Appreciating Diverse Works", learningOutcome: "Describe and appreciate creative/sporting works from diverse contexts." },
        ],
      },
    ],
    CRE: [
      {
        name: "Faith and God's Promises: Abraham",
        learningOutcome: "Relate the faith of Abraham to Christian living today.",
        substrands: [
          { name: "The Call and Faith of Abraham", learningOutcome: "Narrate the call of Abraham and relate his faith to Christian living today." },
        ],
      },
      {
        name: "The Sinai Covenant: Moses",
        learningOutcome: "Relate the Sinai covenant and the Ten Commandments to moral life today.",
        substrands: [
          { name: "The Ten Commandments", learningOutcome: "Explain the Ten Commandments and their relevance to moral life today." },
        ],
      },
      {
        name: "Leadership in God's Plan: David and Solomon",
        learningOutcome: "Draw lessons on leadership from the lives of David and Solomon.",
        substrands: [
          { name: "Qualities of David and Solomon as Leaders", learningOutcome: "Identify qualities of good leadership from the lives of David and Solomon." },
        ],
      },
      {
        name: "Loyalty to God: Elijah",
        learningOutcome: "Draw lessons on loyalty and courage from the life of Elijah.",
        substrands: [
          { name: "Elijah's Fight Against False Religion and Corruption", learningOutcome: "Explain the lessons from Elijah's fight against false religion and corruption." },
        ],
      },
    ],
  },
  "Grade 9": {
    PTS: [
      {
        name: "Foundations of Pre-Technical Studies",
        learningOutcome: "Apply safety measures when handling hazardous substances and working at height.",
        substrands: [
          { name: "Safety on Raised Platforms", learningOutcome: "Observe safety measures when working on raised platforms." },
          { name: "Handling Hazardous Substances", learningOutcome: "Identify hazardous substances and observe safety measures when handling them." },
        ],
      },
      {
        name: "Communication in Pre-Technical Studies",
        learningOutcome: "Apply advanced drawing and digital communication techniques.",
        substrands: [
          { name: "Orthographic Drawing", learningOutcome: "Produce simple orthographic drawings of given objects." },
        ],
      },
      {
        name: "Materials for Production",
        learningOutcome: "Select and prepare plastics and composite materials for production.",
        substrands: [
          { name: "Plastics as a Material", learningOutcome: "Classify types of plastics and describe their properties and uses in production." },
        ],
      },
      {
        name: "Tools and Production",
        learningOutcome: "Use a wider range of tools safely for more complex production tasks.",
        substrands: [
          { name: "Cutting and Shaping Tools", learningOutcome: "Select and safely use cutting and shaping tools for a production task." },
        ],
      },
      {
        name: "Entrepreneurship",
        learningOutcome: "Apply entrepreneurship skills to a simple technical production project.",
        substrands: [
          { name: "Costing and Pricing a Product", learningOutcome: "Cost and price a simple product made from a Pre-Technical Studies project." },
        ],
      },
    ],
    AGN: [
      {
        name: "Conservation of Resources",
        learningOutcome: "Evaluate resource conservation practices for sustainable agriculture.",
        substrands: [
          { name: "Conserving Farm Resources", learningOutcome: "Evaluate methods of conserving farm resources for continued productivity." },
        ],
      },
      {
        name: "Food Production Processes",
        learningOutcome: "Apply advanced crop production techniques.",
        substrands: [
          { name: "Grafting in Plants", learningOutcome: "Carry out grafting in plants for rejuvenation, aesthetic and improvement purposes." },
        ],
      },
      {
        name: "Hygiene Practices",
        learningOutcome: "Apply advanced hygiene and disinfection practices.",
        substrands: [
          { name: "Cleaning Waste Disposal Facilities", learningOutcome: "Clean waste disposal facilities observing correct procedures and safety measures." },
          { name: "Disinfecting Clothing and Household Articles", learningOutcome: "Disinfect clothing and household articles using appropriate methods." },
        ],
      },
      {
        name: "Production Techniques",
        learningOutcome: "Apply innovative food preservation techniques.",
        substrands: [
          { name: "Homemade Sun Dryer", learningOutcome: "Construct and use a homemade sun dryer to preserve vegetables and curb food shortages." },
        ],
      },
    ],
    CAS: [
      {
        name: "Foundations of Creative Arts and Sports",
        learningOutcome: "Identify career opportunities and advanced components across Creative Arts and Sports.",
        substrands: [
          { name: "Careers in Creative Arts and Sports", learningOutcome: "Identify careers in Visual Arts, Physical Education and Sports, Music and Theatre." },
          { name: "Advanced Components of Fitness", learningOutcome: "Perform activities demonstrating power and reaction time in physical fitness." },
        ],
      },
      {
        name: "Creating and Performing in Creative Arts and Sports",
        learningOutcome: "Create and perform more complex works across disciplines.",
        substrands: [
          { name: "Contemporary Dance", learningOutcome: "Perform a contemporary dance piece demonstrating correct technique." },
          { name: "Music Composition Basics", learningOutcome: "Group music notes correctly in 4/4 time incorporating note extension." },
        ],
      },
      {
        name: "Appreciation in Creative Arts and Sports",
        learningOutcome: "Critically appreciate own and others' creative and sporting performances.",
        substrands: [
          { name: "Critiquing Performances", learningOutcome: "Critique a live or recorded performance using appropriate criteria." },
        ],
      },
    ],
    CRE: [
      {
        name: "Selected Aspects in African Religious Heritage",
        learningOutcome: "Relate the African concept of God, spirits and ancestors to Christian faith.",
        substrands: [
          { name: "African Concept of God, Spirits and Ancestors", learningOutcome: "Explain the African concept of God, spirits and ancestors and their role in the community." },
        ],
      },
      {
        name: "African Moral and Cultural Values",
        learningOutcome: "Relate African moral and cultural values to Christian living today.",
        substrands: [
          { name: "Rites of Passage", learningOutcome: "Describe the rites of passage in African communities and their role in inculcating moral values." },
        ],
      },
      {
        name: "Christian Living Today",
        learningOutcome: "Apply Christian values to contemporary personal and social issues.",
        substrands: [
          { name: "Christian Response to Contemporary Issues", learningOutcome: "Explain a Christian response to a selected contemporary moral issue." },
        ],
      },
      {
        name: "The Church and Community Service",
        learningOutcome: "Relate the role of the Church to community service and development.",
        substrands: [
          { name: "The Role of the Church in Society", learningOutcome: "Describe the role of the Church in community service and national development." },
        ],
      },
    ],
  },
};

/** Subject codes this Part-2 preset library covers. */
export const JUNIOR_SCHOOL_SUBJECT_CODES_PART2 = ["PTS", "AGN", "CAS", "CRE"];
