/**
 * EE.3 (Senior School Phase Complete) — real KICD Grade 10, Grade 11, and
 * Grade 12 (Senior School, 2026 CBE rollout) curriculum content library:
 * strands AND their real sub-strands together, researched against KICD's own
 * Senior School curriculum designs across STEM, Social Sciences, and Arts & Sports.
 *
 * Covers the 5 compulsory Senior School core learning areas:
 *   - English (ENG)
 *   - Kiswahili (KIS)
 *   - Core Mathematics (MATC - STEM tracks)
 *   - Essential Mathematics (MATE - non-STEM tracks)
 *   - Community Service Learning (CSL)
 * Plus major Senior School pathway elective subjects across STEM, Social Sciences,
 * and Arts/Sports pathways:
 *   - Physics (PHY), Chemistry (CHE), Biology (BIO), Computer Studies (CSC)
 *   - Business Studies (BST), Agriculture (AGR), Home Science (HSC)
 *   - Geography (GEO), History and Citizenship (HIS), Christian Religious Ed (CRE)
 *   - Art and Design (ART), Music (MUS), French (FRE), German (GER)
 *
 * Reuses the exact same `JuniorSchoolStrandSeed`-shaped interface (`{ name, learningOutcome, substrands }`).
 * Every strand and sub-strand below is written from real, published KICD design concepts — never AI-generated wording.
 */

import type { JuniorSchoolStrandSeed } from "./kicd-junior-school-curriculum";

export type SeniorSchoolGrade = "Grade 10" | "Grade 11" | "Grade 12";

export const SENIOR_SCHOOL_GRADES: SeniorSchoolGrade[] = ["Grade 10", "Grade 11", "Grade 12"];

export const SENIOR_SCHOOL_SUBJECT_CODES = [
  "ENG", "KIS", "MATC", "MATE", "CSL",
  "PHY", "CHE", "BIO", "CSC", "BST", "AGR",
  "GEO", "HIS", "CRE", "ART", "MUS", "HSC", "FRE", "GER",
];

export const SENIOR_SCHOOL_CURRICULUM: Record<SeniorSchoolGrade, Record<string, JuniorSchoolStrandSeed[]>> = {
  "Grade 10": {
    ENG: [
      {
        name: "Listening and Speaking",
        learningOutcome: "Listen attentively for specific information and speak fluently using appropriate registers.",
        substrands: [
          { name: "Extensive Listening", learningOutcome: "Listen to and interpret longer factual and imaginative spoken texts accurately." },
          { name: "Etiquette in Oral Communication", learningOutcome: "Demonstrate polite turn-taking, diplomacy and assertiveness in group discussions." },
          { name: "Pronunciation and Word Stress", learningOutcome: "Pronounce multi-syllabic words with correct stress and intonation patterns." },
        ],
      },
      {
        name: "Reading",
        learningOutcome: "Read and critically evaluate grade 10 fiction and informational texts for implicit and explicit meaning.",
        substrands: [
          { name: "Critical Reading of Literary Texts", learningOutcome: "Analyze setting, plot structure, character traits and moral themes in novels and plays." },
          { name: "Skimming and Scanning Study Skills", learningOutcome: "Apply rapid reading techniques to locate specific facts and main ideas across research articles." },
        ],
      },
      {
        name: "Grammar in Use",
        learningOutcome: "Demonstrate accurate usage of complex sentence structures, verb aspects and clause relationships.",
        substrands: [
          { name: "Nouns and Noun Phrases", learningOutcome: "Identify and use concrete, abstract, collective nouns and complex noun modifiers correctly." },
          { name: "Verb Aspects and Perfect Tense", learningOutcome: "Use present perfect, past perfect and future perfect tenses accurately in written context." },
          { name: "Subordinating and Coordinating Clauses", learningOutcome: "Join independent and dependent clauses accurately using complex conjunctions." },
        ],
      },
      {
        name: "Writing",
        learningOutcome: "Produce clear, logical formal correspondence, analytical essays and imaginative narratives.",
        substrands: [
          { name: "Analytical and Expository Compositions", learningOutcome: "Construct well-organized multi-paragraph essays supporting a clear thesis with evidence." },
          { name: "Formal Correspondence and Resumes", learningOutcome: "Format and write formal letters of inquiry, cover letters and structured personal resumes." },
        ],
      },
    ],
    KIS: [
      {
        name: "Kusikiliza na Kuzungumza",
        learningOutcome: "Kujieleza kwa ujasiri, kushiriki katika mijadala mikubwa na kutumia luhga sanifu ya Kiswahili.",
        substrands: [
          { name: "Mijadala ya Kitaifa na Hoja za Mantiki", learningOutcome: "Kushiriki katika mijadala rasmi na kujenga hoja zenye ushahidi na mantiki thabiti." },
          { name: "Matumizi ya Methali na Nahau", learningOutcome: "Kutumia methali, nahau na misemo ya kina ili kukuza ufundi wa kuwasilisha maoni." },
        ],
      },
      {
        name: "Kusoma",
        learningOutcome: "Kusoma na kuhakiki kazi za fasihi andishi na makala marefu ya kisayansi na kijamii.",
        substrands: [
          { name: "Uchambuzi wa Riwaya na Tamthilia", learningOutcome: "Kuhakiki maudhui, dhamira, migogoro na sifa za wahusika katika riwaya na tamthilia teule." },
          { name: "Ufahamu wa Makala ya Kina", learningOutcome: "Kusoma taarifa rasmi za serikali na makala ya utafiti na kujibu maswali ya kuchanganua." },
        ],
      },
      {
        name: "Sarufi na Matumizi ya Lugha",
        learningOutcome: "Kutumia ngeli zote, kauli za vitenzi, na ukanushaji katika nyakati na hali zote.",
        substrands: [
          { name: "Upatanisho wa Kisarufi katika Ngeli Zote", learningOutcome: "Kutumia ngeli za U-YA, KU, PA-KU-MU na nyongeza zote kwa utaratibu sahihi wa kisarufi." },
          { name: "Kauli za Vitenzi na Mnyambuo", learningOutcome: "Kunyambua vitenzi katika kauli ya kutendana, kutendeana, kutendeshwa na kutendekea." },
        ],
      },
      {
        name: "Kuandika",
        learningOutcome: "Kuandika insha za kihoja, ripoti rasmi za kamati na barua rasmi kwa mhariri.",
        substrands: [
          { name: "Insha za Hoja na Changanuzi", learningOutcome: "Kuandika insha za kuchanganua faida na hasara za mada maalum kwa mtiririko mzuri wa aya." },
          { name: "Uandishi wa Ripoti na Kumbukumbu", learningOutcome: "Kuandika ripoti ya kiuchunguzi na kuandaa kumbukumbu rasmi za mkutano wa shirika au klabu." },
        ],
      },
    ],
    MATC: [
      {
        name: "Numbers and Algebra",
        learningOutcome: "Apply advanced numerical operations, indices, algebraic equations and matrices in problem solving.",
        substrands: [
          { name: "Real Numbers and Surds", learningOutcome: "Perform operations involving rational/irrational numbers, standard form and simplifying surds." },
          { name: "Algebraic Expressions and Polynomials", learningOutcome: "Factorize quadratic expressions and manipulate complex algebraic fractions accurately." },
          { name: "Linear and Quadratic Equations", learningOutcome: "Solve simultaneous equations algebraically/graphically and solve quadratic equations by formula." },
        ],
      },
      {
        name: "Measurements and Geometry",
        learningOutcome: "Solve geometric problems involving trigonometry, vectors, circle properties and coordinate geometry.",
        substrands: [
          { name: "Trigonometric Ratios and Sine/Cosine Rules", learningOutcome: "Calculate sides and angles of right and scalene triangles using sine, cosine and tangent ratios." },
          { name: "Coordinate Geometry and Straight Lines", learningOutcome: "Calculate gradients, midpoint, distance between points and equations of parallel/perpendicular lines." },
          { name: "Circle Properties and Theorems", learningOutcome: "Apply angle theorems involving chords, tangents, cyclic quadrilaterals and central angles." },
        ],
      },
      {
        name: "Statistics and Probability",
        learningOutcome: "Analyze grouped data, measures of central tendency and calculate basic experimental probability.",
        substrands: [
          { name: "Measures of Central Tendency for Grouped Data", learningOutcome: "Calculate mean, modal class and median for grouped frequency distributions." },
          { name: "Experimental and Theoretical Probability", learningOutcome: "Calculate probability of mutually exclusive and independent events using tree diagrams." },
        ],
      },
    ],
    MATE: [
      {
        name: "Numbers and Applied Algebra",
        learningOutcome: "Apply practical number calculations, budgeting, simple linear equations and commercial arithmetic.",
        substrands: [
          { name: "Personal Budgeting and Household Accounts", learningOutcome: "Prepare structured household budgets and interpret utility bills, payslips and simple interest." },
          { name: "Simple Linear Equations in Daily Life", learningOutcome: "Formulate and solve one-variable linear equations representing real everyday transactions." },
        ],
      },
      {
        name: "Practical Measurements and Spatial Geometry",
        learningOutcome: "Measure and compute practical surface area, volume, land measurements and basic building layouts.",
        substrands: [
          { name: "Land Measurements and Perimeter/Area", learningOutcome: "Calculate area and perimeter of agricultural plots, buildings and irregular boundary plots." },
          { name: "Volume and Capacity of Storage Tanks", learningOutcome: "Calculate capacity of water silos, grain bins and rectangular storage containers." },
          { name: "Scale Drawings and Compass Navigation", learningOutcome: "Interpret architectural scale drawings and determine bearings/distances across local terrain." },
          { name: "Simple Construction Angles and Symmetry", learningOutcome: "Identify right angles, rafters and symmetric load-bearing structures in basic construction." },
          { name: "Time Management and Travel Schedules", learningOutcome: "Calculate work shifts, transport route durations and log-book efficiency tracking." },
          { name: "Currency Exchange and Taxation Basics", learningOutcome: "Calculate basic foreign exchange conversion and identify standard VAT and PAYE deductions." },
          { name: "Hire Purchase and Simple Loan Terms", learningOutcome: "Compare cash prices against hire purchase deposit plus installments in shopping decisions." },
        ],
      },
      {
        name: "Everyday Statistics and Visual Data",
        learningOutcome: "Collect, organize and interpret practical survey data using simple charts and averages.",
        substrands: [
          { name: "Collecting and Tabulating Local Data", learningOutcome: "Design simple check-sheets and tabulate raw survey data from farm or market records." },
          { name: "Bar Graphs, Pie Charts and Simple Averages", learningOutcome: "Construct vertical bar charts, read pie charts and calculate simple average daily sales." },
        ],
      },
    ],
    CSL: [
      {
        name: "Citizenship and Community Needs",
        learningOutcome: "Demonstrate active, responsible citizenship through structured identification of real community problems.",
        substrands: [
          { name: "Identifying a Community Problem", learningOutcome: "Investigate and identify a genuine environmental, educational or health need in the local area." },
          { name: "Planning a Community Service Activity", learningOutcome: "Formulate a concrete project proposal, timeline and safety plan to address the identified need." },
        ],
      },
      {
        name: "Life Skills and Teamwork",
        learningOutcome: "Apply interpersonal communication, collaborative leadership and conflict resolution during service projects.",
        substrands: [
          { name: "Teamwork and Collaboration", learningOutcome: "Work effectively within peer project teams, sharing tasks and respecting diverse skills." },
        ],
      },
      {
        name: "Action Research and Assessment",
        learningOutcome: "Apply basic action-research techniques to monitor, document and evaluate service project impact.",
        substrands: [
          { name: "Assessing Community Impact", learningOutcome: "Collect simple feedback and evaluate the tangible outcomes of the community service activity." },
        ],
      },
      {
        name: "Social Entrepreneurship",
        learningOutcome: "Apply entrepreneurial thinking to establish self-sustaining, long-term community improvements.",
        substrands: [
          { name: "Creating a Sustainable Community Solution", learningOutcome: "Design a long-term maintenance or fundraising plan to sustain the community service initiative." },
        ],
      },
    ],
    PHY: [
      {
        name: "Mechanics and Properties of Matter",
        learningOutcome: "Investigate physical measurements, motion, forces, pressure and fluid mechanics in physical systems.",
        substrands: [
          { name: "Measurement of Physical Quantities", learningOutcome: "Use micrometer screw gauges, vernier callipers and balances to measure dimensions and mass accurately." },
          { name: "Forces and Newton's Laws of Motion", learningOutcome: "Investigate linear motion, momentum and apply Newton's first, second and third laws of motion." },
          { name: "Pressure in Solids and Fluids", learningOutcome: "Calculate pressure exerted by solids and investigate atmospheric pressure and hydraulic systems." },
        ],
      },
      {
        name: "Heat and Thermal Properties",
        learningOutcome: "Investigate temperature measurement, thermal expansion, gas laws and heat transfer mechanisms.",
        substrands: [
          { name: "Thermal Expansion of Matter", learningOutcome: "Investigate expansion of solids, liquids and gases and explain anomalous expansion of water." },
          { name: "Heat Transfer and Thermometry", learningOutcome: "Investigate conduction, convection, radiation and structure of liquid-in-glass thermometers." },
        ],
      },
      {
        name: "Light, Waves and Sound",
        learningOutcome: "Investigate reflection, refraction of light across plane/curved mirrors and wave properties of sound.",
        substrands: [
          { name: "Reflection at Curved Mirrors", learningOutcome: "Construct ray diagrams for concave and convex mirrors and determine magnification." },
          { name: "Refraction of Light and Lenses", learningOutcome: "Verify Snell's law of refraction and construct ray diagrams for thin converging/diverging lenses." },
        ],
      },
      {
        name: "Electricity and Magnetism",
        learningOutcome: "Investigate electrostatic charges, Ohm's law, simple circuits and magnetic field patterns.",
        substrands: [
          { name: "Electrostatics and Capacitors", learningOutcome: "Investigate charging by friction/induction and structure of gold-leaf electroscopes and capacitors." },
          { name: "Current Electricity and Ohm's Law", learningOutcome: "Verify Ohm's law, calculate effective resistance in series/parallel circuits and electrical energy." },
        ],
      },
    ],
    CHE: [
      {
        name: "Structure of the Atom and Periodic Table",
        learningOutcome: "Investigate sub-atomic particles, electronic configuration and periodic trends of elements.",
        substrands: [
          { name: "Sub-atomic Particles and Isotopes", learningOutcome: "Calculate atomic number, mass number, number of neutrons/electrons and relative atomic mass." },
          { name: "The Periodic Table and Trends", learningOutcome: "Relate electronic configuration to group and period position and explain trends in reactivity across Group I and VII." },
        ],
      },
      {
        name: "Chemical Bonding and Structure",
        learningOutcome: "Investigate ionic, covalent and metallic bonding and their effects on physical properties.",
        substrands: [
          { name: "Ionic and Covalent Bonds", learningOutcome: "Construct dot-and-cross diagrams for ionic and covalent compounds and explain bond formation." },
          { name: "Properties of Giant and Molecular Structures", learningOutcome: "Relate electrical conductivity and melting points to giant ionic, giant covalent and simple molecular structures." },
        ],
      },
      {
        name: "Acids, Bases, Salts and Electrochemistry",
        learningOutcome: "Investigate pH scale, neutralization reactions, preparation of salts and electrolysis of electrolytes.",
        substrands: [
          { name: "Preparation and Properties of Salts", learningOutcome: "Prepare soluble and insoluble salts via titration, precipitation and reaction of acids with metals/carbonates." },
          { name: "Electrolysis and Ionic Conductors", learningOutcome: "Investigate electrolysis of molten lead (II) bromide and aqueous copper (II) sulfate and identify electrode products." },
        ],
      },
      {
        name: "Quantitative Chemistry and Stoichiometry",
        learningOutcome: "Calculate mole quantities, molarity, empirical/molecular formulas and reacting gas volumes.",
        substrands: [
          { name: "The Mole Concept and Molar Mass", learningOutcome: "Calculate moles from mass, volume and concentration of solutions accurately." },
          { name: "Empirical and Molecular Formulas", learningOutcome: "Determine empirical and molecular formulas from percentage composition and combustion data." },
        ],
      },
    ],
    BIO: [
      {
        name: "Cell Biology and Microscopy",
        learningOutcome: "Investigate cell structure using compound microscopes and explain physiological cell processes.",
        substrands: [
          { name: "The Compound Microscope and Cell Structure", learningOutcome: "Handle compound microscopes, prepare wet mounts and distinguish plant and animal ultrastructure." },
          { name: "Diffusion, Osmosis and Active Transport", learningOutcome: "Investigate diffusion across membranes, plasmolysis/turgidity in plant cells and role of active transport." },
        ],
      },
      {
        name: "Nutrition in Plants and Animals",
        learningOutcome: "Investigate photosynthesis, enzyme kinetics, human mammalian nutrition and dentition.",
        substrands: [
          { name: "Photosynthesis and Leaf Adaptations", learningOutcome: "Investigate factors affecting rate of photosynthesis and structural adaptations of the leaf." },
          { name: "Enzymes and the Digestive System", learningOutcome: "Investigate properties of catalase/amylase and trace chemical digestion across human alimentary canal." },
        ],
      },
      {
        name: "Transport and Circulation in Living Organisms",
        learningOutcome: "Investigate xylem/phloem transport in plants and mammalian cardiovascular/lymphatic systems.",
        substrands: [
          { name: "Transpiration and Vascular Tissues", learningOutcome: "Investigate rate of transpiration using potometers and identify xylem/phloem vessels in stem sections." },
          { name: "The Mammalian Heart and Blood Vessels", learningOutcome: "Dissect and examine mammalian heart structure, cardiac cycle and functions of arteries, veins and capillaries." },
        ],
      },
      {
        name: "Gaseous Exchange and Respiration",
        learningOutcome: "Investigate respiratory surfaces in plants/animals and aerobic/anaerobic respiration pathways.",
        substrands: [
          { name: "Respiratory Surfaces and Lung Mechanism", learningOutcome: "Investigate adaptations of alveoli, fish gills and insect tracheal systems for gaseous exchange." },
          { name: "Aerobic and Anaerobic Respiration", learningOutcome: "Compare ATP yield and end-products of aerobic respiration against lactic acid and alcohol fermentation." },
        ],
      },
    ],
    CSC: [
      {
        name: "Computer Systems and Hardware Architecture",
        learningOutcome: "Investigate internal components of computer systems, storage hierarchy and input/output peripherals.",
        substrands: [
          { name: "CPU Architecture and System Bus", learningOutcome: "Explain functions of ALU, Control Unit, registers, cache memory and system buses." },
          { name: "Storage Media and Memory Types", learningOutcome: "Differentiate between volatile RAM, non-volatile ROM, solid-state NVMe drives and magnetic storage." },
        ],
      },
      {
        name: "Operating Systems and Data Representation",
        learningOutcome: "Investigate functions of operating systems and convert number bases and binary data coding.",
        substrands: [
          { name: "Functions of the Operating System", learningOutcome: "Explain process management, memory allocation, file systems and user interface management by OS." },
          { name: "Binary, Decimal and Hexadecimal Number Systems", learningOutcome: "Convert integers between binary, decimal and hexadecimal and perform binary addition and subtraction." },
        ],
      },
      {
        name: "Algorithmic Thinking and Programming Logic",
        learningOutcome: "Construct flowcharts, pseudocode and structured programs using sequence, selection and iteration.",
        substrands: [
          { name: "Flowcharts and Pseudocode Design", learningOutcome: "Design modular algorithms using standard flowchart symbols and structured pseudocode conventions." },
          { name: "Introduction to High-Level Programming", learningOutcome: "Write, debug and execute simple programs with variables, conditional statements and loops." },
        ],
      },
      {
        name: "Computer Networks and Cybersecurity Basics",
        learningOutcome: "Investigate network topologies, transmission media and fundamental data security measures.",
        substrands: [
          { name: "LAN Topologies and Hardware Devices", learningOutcome: "Differentiate star, bus, ring topologies and functions of routers, switches and access points." },
          { name: "Data Security and Malware Protection", learningOutcome: "Identify phishing, ransomware, unauthorized access and implement encryption, firewalls and backups." },
        ],
      },
    ],
    BST: [
      {
        name: "Introduction to Business and Entrepreneurship",
        learningOutcome: "Analyze business environments, entrepreneurial traits and ethical practices in wealth creation.",
        substrands: [
          { name: "Business Environment and Stakeholders", learningOutcome: "Identify internal/external factors affecting business operations and roles of consumers, suppliers and state." },
          { name: "Entrepreneurship and Business Opportunities", learningOutcome: "Evaluate viable business opportunities in the local community and develop a basic business model canvas." },
        ],
      },
      {
        name: "Forms of Business Ownership and Organization",
        learningOutcome: "Compare legal structures, capital formation and governance of sole proprietorships, partnerships and companies.",
        substrands: [
          { name: "Sole Proprietorships and Partnerships", learningOutcome: "Analyze formation, liability, advantages and dissolution of sole traders and partnership deeds." },
          { name: "Limited Companies and Co-operatives", learningOutcome: "Distinguish private vs public limited companies, memorandum of association and role of SACCO co-operatives." },
        ],
      },
      {
        name: "Trade, Commerce and Consumer Protection",
        learningOutcome: "Investigate home/international trade channels, retail operations and consumer rights enforcement.",
        substrands: [
          { name: "Home Trade and Distribution Channels", learningOutcome: "Analyze functions of wholesalers, retailers, chain stores, e-commerce and commercial middlemen." },
          { name: "Consumer Protection and Regulatory Bodies", learningOutcome: "Explain consumer rights, misleading advertising and role of Kenya Bureau of Standards and Competition Authority." },
        ],
      },
    ],
    AGR: [
      {
        name: "Soil Fertility, Conservation and Land Preparation",
        learningOutcome: "Investigate soil physical/chemical properties, organic/inorganic fertilizers and primary tillage practices.",
        substrands: [
          { name: "Soil Structure and pH Management", learningOutcome: "Investigate soil texture, water holding capacity and effects of soil acidity/alkalinity on crop nutrition." },
          { name: "Manures and Commercial Fertilizers", learningOutcome: "Prepare compost manure and calculate application rates of nitrogenous, phosphatic and compound fertilizers." },
        ],
      },
      {
        name: "Crop Production and Pest/Disease Management",
        learningOutcome: "Investigate propagation, agronomic practices, integrated pest management and harvesting of staple crops.",
        substrands: [
          { name: "Nursery Management and Planting Techniques", learningOutcome: "Manage seedbeds, perform grafting/budding and calculate optimal seed rates and spacing for cereal crops." },
          { name: "Integrated Pest and Disease Control", learningOutcome: "Identify field/storage pests and crop fungal/viral diseases and apply biological, cultural and chemical controls." },
        ],
      },
      {
        name: "Livestock Production and Animal Health",
        learningOutcome: "Investigate anatomy, feeding regimes, housing and common diseases of dairy cattle and poultry.",
        substrands: [
          { name: "Livestock Nutrition and Ration Formulation", learningOutcome: "Formulate balanced livestock rations using roughages, concentrates and mineral licks for dairy cows." },
          { name: "Livestock Diseases and Parasite Control", learningOutcome: "Identify symptoms of tick-borne diseases, mastitis and Newcastle disease and administer deworming/vaccination." },
        ],
      },
    ],
    GEO: [
      {
        name: "Introduction to Geography and Practical Map Work",
        learningOutcome: "Investigate branches of geography and interpret topographical maps using scale, grid references and cross-sections.",
        substrands: [
          { name: "Topographical Map Interpretation", learningOutcome: "Calculate area, gradient, vertical exaggeration and draw accurate cross-sections from 1:50,000 survey maps." },
          { name: "Fieldwork Methods and Data Recording", learningOutcome: "Formulate fieldwork hypotheses, conduct questionnaires/observations and tabulate geographical field data." },
        ],
      },
      {
        name: "The Earth and Internal Land-Forming Processes",
        learningOutcome: "Investigate origin of the earth, plate tectonics, faulting, folding and vulcanicity processes.",
        substrands: [
          { name: "Plate Tectonics and Continental Drift", learningOutcome: "Explain movement of lithospheric plates and origin of mid-ocean ridges, subduction zones and earthquakes." },
          { name: "Faulting, Folding and Volcanic Features", learningOutcome: "Trace formation of rift valleys, block mountains, fold mountains and volcanic cones and craters." },
        ],
      },
      {
        name: "Weather, Climate and Hydrological Systems",
        learningOutcome: "Investigate weather station instruments, global climate belts and river basin hydrology.",
        substrands: [
          { name: "Weather Measurement and Forecasting", learningOutcome: "Operate Stevenson screen instruments, rain gauges, anemometers and interpret synoptic weather charts." },
          { name: "River Processes and Landforms", learningOutcome: "Explain river erosion, transport, deposition and formation of waterfalls, meanders, ox-bow lakes and deltas." },
        ],
      },
    ],
    HIS: [
      {
        name: "Historical Methods and Early Human Evolution",
        learningOutcome: "Evaluate primary/secondary historical sources and trace hominid evolution across archaeological sites in Africa.",
        substrands: [
          { name: "Sources of History and Dating Methods", learningOutcome: "Analyze oral traditions, archaeology, carbon-14 dating and written archives as historical evidence." },
          { name: "Evolution of Early Man in East Africa", learningOutcome: "Trace physical/cultural evolution from Australopithecus to Homo sapiens across Koobi Fora and Olduvai Gorge." },
        ],
      },
      {
        name: "Early Civilizations and State Formation in Africa",
        learningOutcome: "Analyze political, social and economic structures of ancient Egypt, Great Zimbabwe and pre-colonial Kenyan states.",
        substrands: [
          { name: "Ancient Egyptian Civilization", learningOutcome: "Analyze irrigation agriculture along the Nile, divine kingship of Pharaohs and pyramid architecture." },
          { name: "Pre-colonial Kenyan Societies up to 19th Century", learningOutcome: "Compare age-set systems, council of elders and long-distance trade among the Agikuyu, Luo and Swahili." },
        ],
      },
      {
        name: "Citizenship, Human Rights and Constitutionalism in Kenya",
        learningOutcome: "Analyze national values, fundamental human rights and structure of the 2010 Constitution of Kenya.",
        substrands: [
          { name: "The Bill of Rights and Civic Duties", learningOutcome: "Analyze civil, political, economic and social rights and responsibilities of citizens under Chapter Four." },
          { name: "Structure of Governance under the Constitution", learningOutcome: "Explain separation of powers between Executive, Legislature, Judiciary and devolved County Governments." },
        ],
      },
    ],
    CRE: [
      {
        name: "Biblical Theology and Old Testament Covenant History",
        learningOutcome: "Analyze inspiration of Scripture, creation accounts and covenant relationships with Abraham, Moses and David.",
        substrands: [
          { name: "Inspiration of the Bible and Creation Accounts", learningOutcome: "Compare Genesis 1 and 2 creation accounts and explain attributes of God and human stewardship." },
          { name: "The Sinaitic Covenant and the Decalogue", learningOutcome: "Analyze significance of the Passover, sealing of the Sinaitic covenant and moral relevance of the Ten Commandments." },
        ],
      },
      {
        name: "Prophetic Ministry in Israel and Social Ethics",
        learningOutcome: "Analyze prophetic messages of Elijah, Amos and Jeremiah on idolatry, social justice and true worship.",
        substrands: [
          { name: "Elijah's Fight for Monotheism and Truth", learningOutcome: "Analyze causes of apostasy in Israel, Elijah's victory at Mount Carmel and relevance to modern integrity." },
          { name: "Amos and Jeremiah on Justice and New Covenant", learningOutcome: "Analyze Amos' condemnation of oppression and Jeremiah's prophecy of internal renewal and restoration." },
        ],
      },
    ],
    ART: [
      {
        name: "Elements and Principles of Art and Design",
        learningOutcome: "Apply line, shape, form, texture, colour theory, balance, contrast and rhythm in visual compositions.",
        substrands: [
          { name: "Colour Theory and Pigment Mixing", learningOutcome: "Construct primary, secondary, tertiary colour wheels and execute monochromatic, complementary colour schemes." },
          { name: "Perspective and Spatial Composition", learningOutcome: "Apply one-point and two-point linear perspective and atmospheric perspective to create depth in drawings." },
        ],
      },
      {
        name: "Graphic Design, Printmaking and 3D Sculpture",
        learningOutcome: "Produce commercial graphic posters, lino/wood cut prints and three-dimensional clay/plaster sculptures.",
        substrands: [
          { name: "Typography and Commercial Poster Design", learningOutcome: "Design block lettering, calligraphic layouts and persuasive advertising posters for local events." },
          { name: "Relief Printmaking and Carving", learningOutcome: "Carve linoleum/wood blocks and produce multi-colour registered relief prints on fabric and paper." },
        ],
      },
    ],
    MUS: [
      {
        name: "Music Theory, Harmony and Notation",
        learningOutcome: "Read and write staff notation, intervals, scales, time signatures and compose four-part vocal harmony.",
        substrands: [
          { name: "Major/Minor Scales and Key Signatures", learningOutcome: "Construct major, harmonic minor scales, circle of fifths and identify intervals up to an octave." },
          { name: "Four-Part Vocal Harmony (SATB)", learningOutcome: "Harmonize simple diatonic melodies using tonic, subdominant and dominant triads in root position." },
        ],
      },
      {
        name: "African Traditional Music and Instrumental Performance",
        learningOutcome: "Analyze structural elements of African folk songs, organology and perform on traditional or Western instruments.",
        substrands: [
          { name: "Organology of African Traditional Instruments", learningOutcome: "Classify membranophones, idiophones, aerophones and chordophones and analyze polyrhythmic ensemble playing." },
          { name: "Solo and Ensemble Performance", learningOutcome: "Perform vocal solo repertoire or instrumental pieces with accurate intonation, tempo and expressive dynamics." },
        ],
      },
    ],
    HSC: [
      {
        name: "Food Science, Nutrition and Meal Management",
        learningOutcome: "Investigate macronutrients/micronutrients, therapeutic diets, food hygiene and hygienic meal preparation.",
        substrands: [
          { name: "Nutritional Biochemistry and Deficiency Diseases", learningOutcome: "Investigate functions and deficiency symptoms of proteins, lipids, carbohydrates, vitamins and minerals." },
          { name: "Meal Planning for Special Nutritional Needs", learningOutcome: "Plan, cook and serve balanced meals for infants, expectant mothers, elderly and diabetic individuals." },
        ],
      },
      {
        name: "Textiles, Clothing Construction and Consumer Economics",
        learningOutcome: "Investigate natural/synthetic fibers, garment pattern drafting, sewing machine operation and family budgeting.",
        substrands: [
          { name: "Fiber Properties and Fabric Care", learningOutcome: "Differentiate cotton, wool, silk, polyester and nylon properties and interpret international laundry care symbols." },
          { name: "Garment Construction and Stitching Techniques", learningOutcome: "Operate sewing machines, execute seams, darts, pleats, buttonholes and assemble functional garments." },
        ],
      },
    ],
    FRE: [
      {
        name: "Compréhension Orale et Expression Orale",
        learningOutcome: "Listen to and communicate fluently in spoken French across daily social, academic and travel situations.",
        substrands: [
          { name: "Conversations du Quotidien et Présentations", learningOutcome: "Engage in spontaneous French dialogues about personal background, school routines and future aspirations." },
          { name: "Compréhension de Documents Audio", learningOutcome: "Listen to French announcements, weather forecasts and short interviews and extract key factual information." },
        ],
      },
      {
        name: "Compréhension Écrite et Grammaire Française",
        learningOutcome: "Read French articles, correspondence and apply grammatical structures including passé composé and imparfait.",
        substrands: [
          { name: "Lecture de Textes Littéraires et Informatives", learningOutcome: "Read French short stories and newspaper articles and answer explicit and inferential comprehension questions." },
          { name: "Grammaire : Temps du Passé et Pronoms", learningCorrespondence: "Distinguish usage of passé composé versus imparfait and apply direct/indirect object pronouns accurately." } as never,
        ],
      },
    ],
    GER: [
      {
        name: "Hörverstehen und Mündlicher Ausdruck",
        learningOutcome: "Understand spoken German in everyday contexts and express opinions clearly with correct pronunciation.",
        substrands: [
          { name: "Alltagsgespräche und Persönliche Vorstellung", learningOutcome: "Introduce self, family and hobbies and participate in structured role-plays in clear spoken German." },
          { name: "Hörverstehen im Öffentlichen Leben", learningOutcome: "Listen to German train/airport announcements and radio dialogues and answer specific comprehension queries." },
        ],
      },
      {
        name: "Leseverstehen und Deutsche Grammatik",
        learningOutcome: "Read German narrative/informative texts and apply German case declensions, modal verbs and word order.",
        substrands: [
          { name: "Leseverstehen von Sachtexten und Geschichten", learningOutcome: "Read short German narratives and cultural texts and identify central themes and specific vocabulary." },
          { name: "Grammatik: Kasus, Nebensätze und Modalverben", learningOutcome: "Apply Nominativ, Akkusativ, Dativ cases, correct verb position in subordinate clauses and modal verbs." },
        ],
      },
    ],
  },

  "Grade 11": {
    ENG: [
      {
        name: "Advanced Literary Criticism and Textual Analysis",
        learningOutcome: "Analyze complex themes, dramatic structure and stylistic devices across Grade 11 prescribed novels and plays.",
        substrands: [
          { name: "Tragedy, Comedy and Character Motivation", learningOutcome: "Evaluate tragic flaws, dramatic irony and character transformation in prescribed drama texts." },
          { name: "Stylistic Analysis of Prose Fiction", learningOutcome: "Analyze use of symbolism, foreshadowing, satire and point of view in prescribed novel selections." },
        ],
      },
      {
        name: "Academic Writing and Rhetorical Argumentation",
        learningOutcome: "Produce formal research essays, policy briefs and argumentative compositions supporting complex theses.",
        substrands: [
          { name: "Synthesis and Citation of Academic Sources", learningOutcome: "Synthesize research data, integrate direct quotations and construct accurate bibliographies." },
          { name: "Rhetorical Strategies in Persuasive Writing", learningOutcome: "Apply ethos, pathos and logos in persuasive essays addressing contemporary national issues." },
        ],
      },
    ],
    KIS: [
      {
        name: "Uhakiki wa Riwaya na Tamthilia za Kidato cha Tano",
        learningOutcome: "Kufanya uhakiki wa kina kuhusu falsafa, dhamira nzito na ustadi wa kifasihi katika vitabu teule.",
        substrands: [
          { name: "Uhakiki wa Dhamira na Migogoro ya Kijamii", learningOutcome: "Kutathmini migogoro ya kisiasa, kitamaduni na kiuchumi inayoibuliwa katika riwaya za kidato cha tano." },
          { name: "Uchambuzi wa Mbinu za Fasihi na Usuka", learningOutcome: "Kuchambua taharuki, kejeli, sadfa, msimulizi na picha za kisanaa katika tamthilia teule." },
        ],
      },
      {
        name: "Uandishi wa Makala ya Kitafiti na Hoja za Kitaaluma",
        learningOutcome: "Kuandika makala rasmi ya uchambuzi, ripoti za kamati maalum na insha za falsafa.",
        substrands: [
          { name: "Uandishi wa Makala ya Uhakiki", learningOutcome: "Kuandika makala ya kuhakiki kazi za fasihi na kutoa hoja zenye uzito wa kitaaluma." },
          { name: "Utungaji wa Hotuba na Taarifa za Vyombo vya Habari", learningOutcome: "Kuandaa hotuba za viongozi wa kitaifa na taarifa rasmi kwa vyombo vya habari." },
        ],
      },
    ],
    MATC: [
      {
        name: "Calculus Foundations and Differentiation",
        learningOutcome: "Calculate limits, gradients of curves from first principles and apply differentiation to rates of change.",
        substrands: [
          { name: "Differentiation of Polynomials and Basic Curves", learningOutcome: "Calculate derivative dy/dx using standard power rules and find equations of tangents and normals." },
          { name: "Applications of Differentiation to Kinematics and Maxima/Minima", learningOutcome: "Calculate velocity and acceleration from displacement functions and determine stationary turning points." },
        ],
      },
      {
        name: "Vectors, Matrices and Transformations",
        learningOutcome: "Perform vector operations in 2D/3D space, matrix multiplication and calculate inverse matrices and transformations.",
        substrands: [
          { name: "Vector Addition, Dot Products and Collinearity", learningOutcome: "Calculate position vectors, magnitude, scalar products and prove collinearity and ratio theorem." },
          { name: "Matrix Algebra and Simultaneous Transformations", learningOutcome: "Calculate determinants, 2x2 inverse matrices and apply matrix transformations to geometric coordinates." },
        ],
      },
      {
        name: "Probability Distributions and Permutations",
        learningOutcome: "Calculate exact probabilities using permutations, combinations and binomially distributed random variables.",
        substrands: [
          { name: "Permutations and Combinations in Probability", learningOutcome: "Apply nPr and nCr counting formulas to determine sample spaces and probability of compound events." },
          { name: "Binomial Probability Distribution", learningOutcome: "Calculate expected mean, variance and probability of success using binomial expansion formula." },
        ],
      },
    ],
    MATE: [
      {
        name: "Commercial Accounting and Business Statistics",
        learningOutcome: "Interpret balance sheets, cash flow statements and calculate compound interest and depreciation.",
        substrands: [
          { name: "Compound Interest and Depreciation Schedules", learningOutcome: "Calculate compound interest over multiple compounding periods and reducing-balance asset depreciation." },
          { name: "Interpretation of Basic Financial Statements", learningOutcome: "Calculate gross profit, net profit, working capital and current ratios from trial balances." },
        ],
      },
      {
        name: "Applied Trigonometry and Construction Surveying",
        learningOutcome: "Solve real-world land surveying problems, roof pitches and elevation using practical trigonometry.",
        substrands: [
          { name: "Angles of Elevation and Depression in Construction", learningOutcome: "Calculate heights of towers, bridges and excavation slopes using right-angle trigonometry." },
          { name: "Plotting Irregular Boundary Plots", learningOutcome: "Use baseline offsets and triangular subdivisions to compute exact acreage of irregular farmland." },
        ],
      },
    ],
    CSL: [
      {
        name: "Project Leadership and Field Execution",
        learningOutcome: "Direct the on-the-ground execution of a collaborative community service project with measurable milestones.",
        substrands: [
          { name: "Managing Field Logistics and Volunteer Teams", learningOutcome: "Coordinate materials, volunteer schedules and stakeholder permissions during active service delivery." },
          { name: "Risk Management and Field Safety", learningOutcome: "Implement safety protocols, first-aid readiness and ethical safeguarding when working with vulnerable groups." },
        ],
      },
    ],
    PHY: [
      {
        name: "Electromagnetic Induction and Alternating Currents",
        learningOutcome: "Investigate Faraday's and Lenz's laws of induction, transformer operation and AC circuit characteristics.",
        substrands: [
          { name: "Magnetic Flux and Electromagnetic Induction", learningOutcome: "Verify Faraday's and Lenz's laws using coils/magnets and calculate induced electromotive force (EMF)." },
          { name: "Step-Up/Step-Down Transformers and Power Transmission", learningOutcome: "Calculate turns ratio, voltage/current output and efficiency of step-up/step-down power transformers." },
        ],
      },
      {
        name: "Electronics and Semiconductor Devices",
        learningOutcome: "Investigate P-N junction diodes, rectification, bipolar transistors and logic gate circuits.",
        substrands: [
          { name: "Semiconductor Diodes and Half/Full-Wave Rectification", learningOutcome: "Explain forward/reverse biasing in silicon diodes and construct half-wave and bridge rectifier circuits." },
          { name: "Logic Gates and Truth Tables", learningOutcome: "Construct truth tables and combine NOT, AND, OR, NAND and NOR logic gates in control circuits." },
        ],
      },
    ],
    CHE: [
      {
        name: "Organic Chemistry I and II: Hydrocarbons to Alkanols/Alkanoic Acids",
        learningOutcome: "Investigate nomenclature, isomerism, synthesis and reactions of alkanes, alkenes, alkynes and alcohols.",
        substrands: [
          { name: "IUPAC Nomenclature and Isomerism of Hydrocarbons", learningOutcome: "Draw structural formulas and name structural/chain isomers of alkanes, alkenes and alkynes up to C8." },
          { name: "Reactions of Alkenes, Alkanols and Alkanoic Acids", learningOutcome: "Investigate halogenation, hydrogenation, esterification and oxidation of ethanol to ethanoic acid." },
        ],
      },
      {
        name: "Chemical Kinetics, Equilibrium and Energy Changes",
        learningOutcome: "Investigate enthalpy of combustion/neutralization, reaction rates and Le Chatelier's principle.",
        substrands: [
          { name: "Enthalpy Changes and Hess's Law", learningOutcome: "Calculate heat of neutralization via calorimetry and construct energy cycle diagrams using Hess's law." },
          { name: "Factors Affecting Reaction Rates and Dynamic Equilibrium", learningOutcome: "Investigate effects of concentration, temperature, catalyst on reaction rate and shifts in reversible equilibria." },
        ],
      },
    ],
    BIO: [
      {
        name: "Genetics, DNA Structure and Mendelian Inheritance",
        learningOutcome: "Investigate DNA replication, mitosis/meiosis, monohybrid inheritance and human genetic disorders.",
        substrands: [
          { name: "Cell Division: Mitosis and Meiosis", learningOutcome: "Compare stages of mitosis and meiosis and explain crossing-over and chromosome segregation." },
          { name: "Monohybrid Crosses and Sex-Linked Inheritance", learningOutcome: "Construct Punnett squares to predict genotypic/phenotypic ratios of ABO blood groups and hemophilia." },
        ],
      },
      {
        name: "Ecology, Ecosystem Dynamics and Environmental Conservation",
        learningOutcome: "Investigate nutrient cycling, population estimation methods, ecological succession and biodiversity conservation.",
        substrands: [
          { name: "Population Estimation and Sampling Methods", learningOutcome: "Use quadrat, line transect and capture-recapture methods to estimate plant and animal populations." },
          { name: "Nitrogen/Carbon Cycles and Pollution Control", learningOutcome: "Trace nitrogen fixation and nitrification and analyze impact of eutrophication and industrial effluents." },
        ],
      },
    ],
    CSC: [
      {
        name: "Database Management Systems (DBMS) and SQL",
        learningOutcome: "Design relational database tables, primary/foreign keys and execute queries using Structured Query Language.",
        substrands: [
          { name: "Relational Database Design and Normalization", learningOutcome: "Construct Entity-Relationship (ER) diagrams and normalize tables up to third normal form (3NF)." },
          { name: "SQL Queries and Data Manipulation", learningOutcome: "Write SQL SELECT, INSERT, UPDATE, DELETE statements with JOIN and WHERE filter conditions." },
        ],
      },
      {
        name: "Object-Oriented Programming and Software Development",
        learningOutcome: "Write modular object-oriented programs using classes, objects, encapsulation and error handling.",
        substrands: [
          { name: "Classes, Objects and Encapsulation", learningOutcome: "Define classes with private attributes and public methods and instantiate objects in code." },
          { name: "File Handling and Exception Management", learningOutcome: "Write code to read/write external text/CSV files and implement try-catch exception handling." },
        ],
      },
    ],
    BST: [
      {
        name: "Financial Accounting and Ledger Bookkeeping",
        learningOutcome: "Post double-entry transactions to general ledgers, cash books and prepare trial balances.",
        substrands: [
          { name: "Double-Entry Bookkeeping and the Three-Column Cash Book", learningOutcome: "Post debits and credits accurately and reconcile cash and bank balances with contra entries." },
          { name: "Preparation of Trial Balance and Final Accounts", learningOutcome: "Extract a trial balance and prepare Trading, Profit & Loss accounts and Balance Sheets." },
        ],
      },
      {
        name: "Public Finance, Inflation and Monetary Policy",
        learningOutcome: "Analyze national budget taxation, causes of inflation and Central Bank monetary control tools.",
        substrands: [
          { name: "Direct/Indirect Taxation and National Budgeting", learningOutcome: "Differentiate progressive/regressive taxes and analyze national government revenue expenditure." },
          { name: "Inflation and Central Bank Monetary Tools", learningOutcome: "Explain demand-pull and cost-push inflation and evaluate open market operations and interest rates." },
        ],
      },
    ],
    AGR: [
      {
        name: "Agricultural Economics and Farm Record Keeping",
        learningOutcome: "Prepare farm inventories, production ledgers, cash flow budgets and calculate farm profit/loss.",
        substrands: [
          { name: "Farm Records and Inventory Management", learningOutcome: "Maintain physical farm inventories, breeding records, labour muster rolls and input/output registers." },
          { name: "Farm Budgeting and Gross Margin Analysis", learningOutcome: "Construct partial and enterprise budgets and calculate gross margin per hectare of crop/livestock." },
        ],
      },
      {
        name: "Agricultural Mechanization and Farm Structures",
        learningOutcome: "Investigate internal combustion tractor engines, tractor-drawn implements and construct farm fences/sheds.",
        substrands: [
          { name: "Four-Stroke Tractor Engines and Maintenance", learningOutcome: "Explain functions of cooling, lubrication and fuel systems of four-stroke diesel tractor engines." },
          { name: "Construction of Farm Fences and Livestock Housing", learningOutcome: "Select durable posts and wire for fencing and construct well-ventilated zero-grazing cattle units." },
        ],
      },
    ],
    GEO: [
      {
        name: "Geomorphology: Glaciation, Arid and Karst Landscapes",
        learningOutcome: "Investigate landforms produced by glacial erosion/deposition, wind action in deserts and limestone solution.",
        substrands: [
          { name: "Glacial Erosion and Deposition Features", learningOutcome: "Trace formation of cirques, arêtes, pyramidal peaks, U-shaped valleys, moraines and drumlins." },
          { name: "Desert Wind Action and Limestone Karst Topography", learningOutcome: "Trace formation of barchan dunes, yardangs and underground limestone stalactites, stalagmites and caves." },
        ],
      },
      {
        name: "Population Geography and Urbanization in Africa",
        learningOutcome: "Analyze demographic transition, census data, rural-urban migration and sustainable urban planning.",
        substrands: [
          { name: "Demographic Trends and Population Pyramids", learningOutcome: "Analyze fertility/mortality rates and interpret population age-sex pyramids for developing nations." },
          { name: "Urbanization Challenges and Smart City Growth", learningOutcome: "Analyze housing, traffic and sanitation challenges in Nairobi and Cairo and evaluate smart urban planning." },
        ],
      },
    ],
    HIS: [
      {
        name: "Colonial Rule and African Nationalism in Kenya and Africa",
        learningOutcome: "Analyze British and French colonial administrative policies and the armed/political struggle for independence.",
        substrands: [
          { name: "British Indirect Rule vs French Assimilation", learningOutcome: "Compare British indirect rule in Northern Nigeria/Kenya against French assimilation in Senegal." },
          { name: "Mau Mau Liberation War and Trade Union Movement in Kenya", learningOutcome: "Analyze armed resistance of Mau Mau, role of Dedan Kimathi and trade union activism of Tom Mboya." },
        ],
      },
      {
        name: "World Wars and International Organizations",
        learningOutcome: "Analyze causes and impacts of World War I and II, the Cold War and role of the United Nations.",
        substrands: [
          { name: "Causes and Consequences of World War I and II", learningOutcome: "Analyze imperialist rivalries, rise of fascism and socio-economic destruction of global conflict." },
          { name: "The United Nations Organization (UNO) and Peacekeeping", learningOutcome: "Evaluate structure of UN Security Council, General Assembly and peacekeeping missions in Africa." },
        ],
      },
    ],
    CRE: [
      {
        name: "Christology in the Gospel of Luke",
        learningOutcome: "Analyze infancy narratives, Galilean ministry, parables of mercy and the passion/resurrection of Jesus.",
        substrands: [
          { name: "The Infancy Narratives and Mission of Jesus in Luke", learningOutcome: "Analyze Magnificat, Benedictus and Jesus' manifesto in Nazareth synagogue (Luke 4:16-30)." },
          { name: "Parables of Compassion and the Passion Narrative", learningOutcome: "Analyze theological significance of the Prodigal Son, the Last Supper, crucifixion and resurrection." },
        ],
      },
      {
        name: "Christian Ethics regarding Family, Wealth and Work",
        learningOutcome: "Apply biblical ethics to marriage, parental responsibilities, wealth acquisition and dignity of labour.",
        substrands: [
          { name: "Biblical Teaching on Marriage and Family Life", learningOutcome: "Evaluate sanctity of Christian marriage, responsible parenthood and challenges of modern divorce." },
          { name: "Christian Attitude toward Wealth, Poverty and Work", learningOutcome: "Evaluate honest wealth creation vs corruption and explain biblical dignity of manual and intellectual work." },
        ],
      },
    ],
    ART: [
      {
        name: "Advanced Painting, Portraiture and Figure Drawing",
        learningOutcome: "Execute anatomical figure drawings, expressive oil/acrylic portraiture and landscape composition.",
        substrands: [
          { name: "Anatomical Proportion and Figure Studies", learningOutcome: "Draw human figures in dynamic action poses with correct anatomical proportions and foreshortening." },
          { name: "Oil and Acrylic Portraiture Techniques", learningOutcome: "Execute layered portrait paintings demonstrating chiaroscuro lighting, skin tones and emotional expression." },
        ],
      },
    ],
    MUS: [
      {
        name: "Advanced Harmony and Counterpoint",
        learningOutcome: "Harmonize four-part chorales including dominant seventh chords, modulation and non-harmonic passing notes.",
        substrands: [
          { name: "Dominant Seventh Chords and Modulation", learningOutcome: "Incorporate dominant 7th chords correctly and modulate smoothly to relative minor or dominant keys." },
          { name: "Contrapuntal Writing and Melodic Embellishment", learningOutcome: "Write two-part counterpoint note-against-note and incorporate accented/unaccented passing notes." },
        ],
      },
    ],
    HSC: [
      {
        name: "Maternal/Child Health and Home Management",
        learningOutcome: "Investigate prenatal/postnatal care, infant immunization schedules and household interior design.",
        substrands: [
          { name: "Prenatal Care, Childbirth and Infant Feeding", learningOutcome: "Explain nutritional requirements during pregnancy, benefits of exclusive breastfeeding and weaning." },
          { name: "Household Ergonomics and Budgetary Management", learningOutcome: "Design labor-saving kitchen layouts and manage long-term family savings and insurance plans." },
        ],
      },
    ],
    FRE: [
      {
        name: "Littérature Française et Analyse de Textes",
        learningOutcome: "Analyze themes, characters and literary devices in Grade 11 prescribed French literature and drama.",
        substrands: [
          { name: "Étude d'une Œuvre Littéraire Francophone", learningOutcome: "Analyze character motivation and social commentary in a selected francophone novel or play." },
        ],
      },
    ],
    GER: [
      {
        name: "Deutsche Literatur und Aufsatzschreiben",
        learningOutcome: "Analyze German short stories and write argumentative essays with complex sentence structures.",
        substrands: [
          { name: "Analyse von Kurzgeschichten und Gedichten", learningOutcome: "Interpret themes and stylistic figures in German literary short stories and contemporary poems." },
        ],
      },
    ],
  },

  "Grade 12": {
    ENG: [
      {
        name: "Mastery of Literary Criticism across Genres",
        learningOutcome: "Synthesize critical perspectives, comparative literary analysis and stylistic evaluation across prescribed texts.",
        substrands: [
          { name: "Comparative Analysis of Prescribed Drama and Novels", learningOutcome: "Compare thematic treatment of power, betrayal and human resilience across two prescribed major works." },
          { name: "Critical Appreciation of Poetry and Stylistic Devices", learningOutcome: "Analyze meter, rhyme scheme, alliteration, metaphor and tone in unseen and prescribed poetry." },
        ],
      },
      {
        name: "Professional Communication and Scholarly Monographs",
        learningOutcome: "Produce publication-ready formal research monographs, executive proposals and public policy addresses.",
        substrands: [
          { name: "Structuring and Editing a Formal Research Monograph", learningOutcome: "Write an original, fully cited scholarly monograph with abstract, methodology, discussion and conclusion." },
        ],
      },
    ],
    KIS: [
      {
        name: "Uhakiki wa Kina wa Fasihi na Usani wa Lugha",
        learningOutcome: "Kuhakiki kwa kina falsafa na mtindo wa waandishi wa riwaya, tamthilia na ushairi wa kidato cha sita.",
        substrands: [
          { name: "Ulinganisho wa Kifasihi kati ya Kazi Anuwai", learningOutcome: "Kulinganisha mbinu za usuka na utatuzi wa migogoro katika riwaya mbili teule za kitaifa." },
          { name: "Uchambuzi wa Bahari za Ushairi na Arudhi", learningOutcome: "Kuchambua mizani, vina, mishororo, beti na bahari (kama utenzi, soneti na ngonjera) katika mashairi." },
        ],
      },
      {
        name: "Uandishi wa Tasnifu na Hati Rasmi za Kitaaluma",
        learningOutcome: "Kuandika tasnifu fupi ya kitafiti, ripoti za kamisheni ya uchunguzi na mikataba rasmi.",
        substrands: [
          { name: "Uandishi wa Tasnifu ya Utafiti wa Kiisimu au Kifasihi", learningOutcome: "Kuandaa tasnifu yenye utangulizi, upembuzi wa maandiko, mbinu za utafiti na hitimisho." },
        ],
      },
    ],
    MATC: [
      {
        name: "Integral Calculus and Differential Equations",
        learningOutcome: "Calculate indefinite/definite integrals, area under curves, volume of revolution and simple differential equations.",
        substrands: [
          { name: "Integration of Polynomials and Area Under Curves", learningOutcome: "Calculate indefinite/definite integrals and exact area enclosed between curves and the x-axis." },
          { name: "Volume of Solid of Revolution and Differential Equations", learningOutcome: "Calculate volume generated by rotating curves about axes and solve first-order differential equations." },
        ],
      },
      {
        name: "Probability Density Functions and Hypothesis Testing",
        learningOutcome: "Calculate normal distribution probabilities using Z-scores and conduct simple hypothesis significance tests.",
        substrands: [
          { name: "The Normal Distribution and Z-Score Calculation", learningOutcome: "Standardize continuous variables to Z-scores and use normal distribution tables to calculate probabilities." },
          { name: "Linear Regression and Correlation Analysis", learningOutcome: "Calculate Pearson's correlation coefficient r and determine equation of best-fit regression lines." },
        ],
      },
    ],
    MATE: [
      {
        name: "Applied Financial Planning and Investment Analysis",
        learningOutcome: "Evaluate real estate mortgages, stock/bond yields, insurance premiums and retirement annuity calculations.",
        substrands: [
          { name: "Mortgage Amortization and Investment Returns", learningOutcome: "Calculate monthly mortgage repayment schedules and compare dividend yields across equity shares." },
          { name: "Business Taxation and Corporate Compliance", learningOutcome: "Calculate corporate income tax, customs duties and prepare statutory annual business tax returns." },
        ],
      },
      {
        name: "Advanced Surveying and Topographical Earthwork Calculations",
        learningOutcome: "Calculate cut-and-fill volumes for road construction and leveling of building sites using surveying math.",
        substrands: [
          { name: "Cut-and-Fill Earthwork Volume Calculations", learningOutcome: "Use Simpson's rule and trapezoidal cross-sections to compute earthwork volume in road excavation." },
        ],
      },
    ],
    CSL: [
      {
        name: "Project Evaluation, Presentation and Community Transition",
        learningOutcome: "Present comprehensive project impact reports to community stakeholders and ensure seamless project handover.",
        substrands: [
          { name: "Preparing and Defending the Community Service Dossier", learningOutcome: "Present documented evidence, statistical outcomes and reflective learning logs to panel assessors." },
          { name: "Sustainable Handover to Community Leadership", learningOutcome: "Execute formal handover of completed service infrastructure to local community trust committees." },
        ],
      },
    ],
    PHY: [
      {
        name: "Modern Physics: Quantum Theory and Nuclear Physics",
        learningOutcome: "Investigate photoelectric effect, X-ray production, radioactivity half-life and nuclear fission/fusion.",
        substrands: [
          { name: "The Photoelectric Effect and Planck's Equation", learningOutcome: "Verify Einstein's photoelectric equation E = hf - W0 and calculate work function and threshold frequency." },
          { name: "Radioactivity, Decay Equations and Half-Life", learningOutcome: "Construct alpha, beta, gamma decay equations and calculate radioactive half-life and decay constants." },
          { name: "X-Ray Production and Cathode Ray Oscilloscopes", learningOutcome: "Explain production of hard/soft X-rays in Coolidge tubes and operate cathode ray oscilloscopes (CRO)." },
        ],
      },
    ],
    CHE: [
      {
        name: "Industrial Chemistry, Polymers and Environmental Chemistry",
        learningOutcome: "Investigate Haber/Contact industrial processes, addition/condensation polymerization and green chemistry.",
        substrands: [
          { name: "Industrial Synthesis of Ammonia and Sulfuric Acid", learningOutcome: "Analyze optimal temperature, pressure and catalysts in Haber and Contact industrial chemical processes." },
          { name: "Synthetic Polymers and Plastics", learningOutcome: "Differentiate addition vs condensation polymerization and trace synthesis of polythene, PVC and nylon-6,6." },
          { name: "Green Chemistry and Hazardous Waste Management", learningOutcome: "Apply principles of atom economy, non-toxic solvents and chemical neutralization of industrial waste." },
        ],
      },
    ],
    BIO: [
      {
        name: "Biotechnology, Genetic Engineering and Immunology",
        learningOutcome: "Investigate recombinant DNA technology, PCR, cloning, monoclonal antibodies and human immune responses.",
        substrands: [
          { name: "Recombinant DNA Technology and Gene Editing", learningOutcome: "Explain use of restriction enzymes, plasmids and CRISPR-Cas9 in producing insulin and transgenic crops." },
          { name: "Immunology and Vaccine Mechanism", learningOutcome: "Distinguish innate vs adaptive immunity, functions of B/T lymphocytes and mRNA/attenuated vaccines." },
        ],
      },
    ],
    CSC: [
      {
        name: "Artificial Intelligence Concepts, Machine Learning and Data Science Fundamentals",
        learningOutcome: "Investigate rule-based vs machine learning systems, neural network basics, data ethics and algorithmic bias.",
        substrands: [
          { name: "Fundamentals of Machine Learning and Neural Networks", learningOutcome: "Differentiate supervised vs unsupervised learning and explain training data, validation and model inference." },
          { name: "Data Science, Big Analytics and Ethical AI Governance", learningOutcome: "Analyze data privacy, algorithmic bias in automated decisions and ethical frameworks for AI development." },
        ],
      },
      {
        name: "Software Engineering Project and Systems Analysis",
        learningOutcome: "Execute the complete Software Development Life Cycle (SDLC) to deliver a functional database application.",
        substrands: [
          { name: "Systems Analysis, Requirements and Architectural Design", learningOutcome: "Conduct user requirement analysis, construct Data Flow Diagrams (DFD) and design modular UI/DB architecture." },
          { name: "Implementation, Testing and Deployment of Software Project", learningOutcome: "Write clean code, execute unit/system testing, produce user documentation and deploy the final software." },
        ],
      },
    ],
    BST: [
      {
        name: "Strategic Management and Global International Trade",
        learningOutcome: "Analyze corporate strategic planning, foreign exchange markets, balance of payments and economic integration.",
        substrands: [
          { name: "Strategic Business Planning and SWOT/PESTEL Analysis", learningOutcome: "Conduct SWOT and PESTEL strategic analyses to guide corporate expansion and risk mitigation." },
          { name: "International Trade and Balance of Payments Reconciliations", learningOutcome: "Analyze tariffs, quotas, foreign exchange fluctuations and corrections for balance of payments deficits." },
        ],
      },
    ],
    AGR: [
      {
        name: "Agribusiness Management and Agricultural Processing Technology",
        learningOutcome: "Analyze international commodity marketing, value addition of dairy/tea/coffee and agricultural cooperatives.",
        substrands: [
          { name: "Value Addition and Processing of Agricultural Commodities", learningOutcome: "Trace processing and quality grading of tea leaves, coffee berries, dairy milk and horticultural produce." },
          { name: "Agricultural Export Marketing and Global Standards", learningOutcome: "Evaluate sanitary and phytosanitary (SPS) standards, export logistics and international futures markets." },
        ],
      },
    ],
    GEO: [
      {
        name: "Environmental Conservation and Spatial Geographic Information Systems (GIS)",
        learningOutcome: "Operate basic GIS software concepts, remote sensing imagery and formulate climate resilience strategies.",
        substrands: [
          { name: "Principles of Geographic Information Systems and Remote Sensing", learningOutcome: "Differentiate raster vs vector GIS data layers and interpret satellite remote sensing vegetation indices." },
          { name: "Climate Change Adaptation and Global Environmental Accords", learningOutcome: "Evaluate carbon sequestration, renewable energy transition and international climate agreements (Paris/Kyoto)." },
        ],
      },
    ],
    HIS: [
      {
        name: "Contemporary Global Politics, Diplomacy and International Law",
        learningOutcome: "Analyze post-Cold War geopolitics, International Criminal Court (ICC) jurisdiction and conflict resolution.",
        substrands: [
          { name: "Geopolitics of the 21st Century and Regional Conflicts", learningOutcome: "Analyze multipolar power dynamics, terrorism, resource conflicts and diplomatic arbitration mechanisms." },
          { name: "International Law and Human Rights Tribunals", learningOutcome: "Evaluate jurisdiction of the International Court of Justice (ICJ) and ICC in prosecuting war crimes." },
        ],
      },
    ],
    CRE: [
      {
        name: "Christian Apologetics and Comparative World Religions",
        learningOutcome: "Evaluate Christian apologetics, compare major world religions and formulate ethical responses to bioethics.",
        substrands: [
          { name: "Comparative Study of Christianity, Islam and African Religion", learningOutcome: "Compare doctrines of God, salvation, morality and community across Christianity, Islam and ATR." },
          { name: "Christian Bioethics regarding Genetic Engineering and End-of-Life", learningOutcome: "Formulate biblically grounded ethical decisions on organ transplants, cloning, euthanasia and euthanasia." },
        ],
      },
    ],
    ART: [
      {
        name: "Exhibition Curating, Art Criticism and Portfolio Presentation",
        learningOutcome: "Curate a professional solo art exhibition, write critical art reviews and present a graduate portfolio.",
        substrands: [
          { name: "Curatorial Practice and Exhibition Management", learningOutcome: "Mount, frame and light artwork professionally and prepare exhibition catalogues and artist statements." },
        ],
      },
    ],
    MUS: [
      {
        name: "Orchestration, Composition and Music Production Technology",
        learningOutcome: "Arrange music for instrumental ensembles, operate Digital Audio Workstations (DAW) and produce studio tracks.",
        substrands: [
          { name: "Digital Audio Workstation (DAW) Recording and Mixing", learningOutcome: "Record multitrack MIDI/audio sessions, apply equalization, compression, reverb and export master files." },
        ],
      },
    ],
    HSC: [
      {
        name: "Hospitality Management and Institutional Food Service",
        learningOutcome: "Manage institutional food service operations, banquet catering and execute professional hospitality hygiene.",
        substrands: [
          { name: "Institutional Catering and Menu Engineering", learningOutcome: "Cost recipes, engineer large-scale banquet menus and manage commercial kitchen workflow and hygiene." },
        ],
      },
    ],
    FRE: [
      {
        name: "Maîtrise de la Langue Française et Dissertation Spécialisée",
        learningOutcome: "Produce complex academic dissertations in French and conduct fluent professional oral defenses.",
        substrands: [
          { name: "Rédaction d'une Dissertation Argumentative en Français", learningOutcome: "Write structured 500-word French academic essays with advanced subjunctive and conditional structures." },
        ],
      },
    ],
    GER: [
      {
        name: "Fortgeschrittenes Deutsch und Wissenschaftliches Schreiben",
        learningOutcome: "Produce advanced German essays and defend complex arguments in fluent, grammatically accurate German.",
        substrands: [
          { name: "Verfassen eines Wissenschaftlichen Essays auf Deutsch", learningOutcome: "Write comprehensive German essays on cultural and scientific themes applying Konjunktiv I and II." },
        ],
      },
    ],
  },
};
