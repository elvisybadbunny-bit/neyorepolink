export interface StemLearningIdea {
  id: string;
  title: string;
  subject: string;
  gradeBand: string;
  mode: string;
  summary: string;
  learningOutcome: string;
  materials: string;
}

const TOPICS = [
  ["mat-ratios", "Ratios and Proportion", "Mathematics", "Grade 7–10", "scale recipes, maps and quantities", "paper, ruler, calculator"],
  ["mat-linear", "Linear Equations", "Mathematics", "Grade 8–10", "represent unknowns and solve balanced equations", "paper, counters, calculator"],
  ["mat-graphs", "Coordinates and Graphs", "Mathematics", "Grade 7–10", "plot values and interpret changing relationships", "graph paper, ruler"],
  ["mat-statistics", "Statistics and Sampling", "Mathematics", "Grade 7–10", "collect, summarise and question data", "paper, local class data"],
  ["mat-probability", "Probability", "Mathematics", "Grade 7–10", "compare predicted and experimental chance", "coins, dice, tally sheet"],
  ["mat-geometry", "Area and Volume", "Mathematics", "Grade 7–10", "model dimensions, area, volume and units", "ruler, cartons, paper"],
  ["mat-trig", "Trigonometric Ratios", "Mathematics", "Grade 9–12", "relate angles to side lengths", "protractor, ruler, calculator"],
  ["mat-finance", "Interest and Financial Mathematics", "Mathematics", "Grade 8–12", "compare savings, credit and growth", "calculator, sample price lists"],
  ["phy-motion", "Motion and Speed", "Physics", "Grade 7–10", "measure distance, time, speed and acceleration", "timer, tape measure, toy object"],
  ["phy-forces", "Forces and Friction", "Physics", "Grade 7–10", "explain balanced forces and friction", "blocks, elastic band, surfaces"],
  ["phy-energy", "Energy Transformations", "Physics", "Grade 7–10", "trace energy transfers and losses", "household-device pictures, paper"],
  ["phy-waves", "Waves and Sound", "Physics", "Grade 8–11", "connect frequency, amplitude and observed sound", "string, containers, phone timer"],
  ["phy-light", "Reflection and Refraction", "Physics", "Grade 8–11", "predict and measure paths of light", "mirror, torch, paper"],
  ["phy-pressure", "Pressure in Fluids", "Physics", "Grade 8–11", "relate force, area, depth and pressure", "bottles, water, tray"],
  ["phy-magnetism", "Magnetism and Electromagnets", "Physics", "Grade 7–11", "investigate fields and electromagnet strength", "magnet, wire, nail, cells"],
  ["phy-electricity", "Electric Circuits", "Physics", "Grade 7–11", "relate current, voltage, resistance and power", "cells, bulbs, wires or paper circuit"],
  ["chem-particles", "Particle Model of Matter", "Chemistry", "Grade 7–10", "use particles to explain states and change", "beads or drawn particle cards"],
  ["chem-mixtures", "Mixtures and Separation", "Chemistry", "Grade 7–10", "select separation methods from properties", "sand, salt, water, filter"],
  ["chem-acids", "Acids, Bases and Indicators", "Chemistry", "Grade 8–11", "classify substances and interpret pH", "safe household samples, indicator"],
  ["chem-reactions", "Rates of Reaction", "Chemistry", "Grade 9–12", "explain effects of concentration, temperature and surface area", "safe reaction cards or teacher demo"],
  ["chem-bonding", "Atoms and Bonding", "Chemistry", "Grade 9–12", "model atomic structure and bonding", "paper atoms, counters"],
  ["chem-moles", "Mole and Chemical Quantities", "Chemistry", "Grade 10–12", "connect mass, amount and equations", "periodic table, calculator"],
  ["chem-water", "Water Quality and Treatment", "Chemistry", "Grade 7–11", "evaluate water risks and treatment stages", "sample diagrams, clear containers"],
  ["chem-carbon", "Carbon and Fuels", "Chemistry", "Grade 9–12", "compare fuels, combustion and environmental effects", "fuel data cards, calculator"],
  ["bio-cells", "Cells and Microscopy", "Biology", "Grade 7–10", "identify structures and relate them to function", "cell images, ruler"],
  ["bio-transport", "Transport in Plants and Animals", "Biology", "Grade 8–11", "model movement of water, gases and nutrients", "plant stem, coloured water or diagrams"],
  ["bio-ecology", "Ecosystems and Food Webs", "Biology", "Grade 7–11", "analyse interdependence and population change", "local organism cards, string"],
  ["bio-genetics", "Inheritance and Variation", "Biology", "Grade 9–12", "use models to explain inherited variation", "trait cards, coins"],
  ["bio-human", "Human Body Systems", "Biology", "Grade 7–11", "connect organ structures and coordinated functions", "body-system cards, timer"],
  ["bio-disease", "Disease and Immunity", "Biology", "Grade 8–12", "evaluate transmission and prevention", "scenario cards, outbreak grid"],
  ["bio-reproduction", "Reproduction and Development", "Biology", "Grade 8–11", "explain life cycles and responsible health choices", "life-cycle cards, diagrams"],
  ["bio-evolution", "Adaptation and Natural Selection", "Biology", "Grade 9–12", "explain how environmental pressures affect populations", "variation cards, counters"],
  ["agr-soil", "Soil Properties and Fertility", "Agriculture", "Grade 7–11", "compare soil properties and management", "local soils, jars, water"],
  ["agr-crops", "Crop Growth and Yield", "Agriculture", "Grade 7–11", "relate inputs and conditions to crop performance", "seed data, ruler, observation sheet"],
  ["agr-livestock", "Livestock Nutrition", "Agriculture", "Grade 8–12", "design balanced feed choices under constraints", "feed cards, calculator"],
  ["agr-irrigation", "Water and Irrigation", "Agriculture", "Grade 8–12", "compare irrigation efficiency and conservation", "bottles, soil tray or diagrams"],
  ["geo-weather", "Weather Measurements", "Geography", "Grade 7–10", "collect and interpret local weather data", "thermometer data, rain and wind records"],
  ["geo-maps", "Map Skills and Scale", "Geography", "Grade 7–11", "use scale, direction and symbols", "Kenyan map extract, ruler"],
  ["geo-rivers", "Rivers and Drainage", "Geography", "Grade 8–11", "connect processes to landforms and risk", "sand tray or river diagrams"],
  ["geo-population", "Population and Settlement", "Geography", "Grade 8–12", "interpret patterns, services and movement", "county data, maps"],
  ["geo-climate", "Climate Change and Resilience", "Geography", "Grade 8–12", "evaluate evidence, impacts and local responses", "climate data cards, county scenarios"],
  ["cs-binary", "Binary and Data Representation", "Computer Science", "Grade 7–10", "encode numbers, text and images", "grid paper, counters"],
  ["cs-algorithms", "Algorithms and Flowcharts", "Computer Science", "Grade 7–11", "design, trace and improve procedures", "instruction cards, paper"],
  ["cs-programming", "Programming Logic", "Computer Science", "Grade 8–12", "reason about variables, decisions and loops", "paper code cards or computer"],
  ["cs-networks", "Networks and Internet", "Computer Science", "Grade 8–12", "trace data movement and identify risks", "network role cards, string"],
  ["cs-cyber", "Cyber Safety and Privacy", "Computer Science", "Grade 7–12", "make safe evidence-based digital decisions", "scenario cards, privacy checklist"],
  ["bst-market", "Markets and Pricing", "Business Studies", "Grade 8–12", "explain demand, supply, cost and price choices", "market cards, calculator"],
  ["bst-budget", "Budgeting and Cash Flow", "Business Studies", "Grade 8–12", "prepare and test a simple cash-flow plan", "sample transactions, calculator"],
  ["bst-enterprise", "Enterprise Design", "Business Studies", "Grade 8–12", "test a problem, customer and sustainable solution", "local problem cards, canvas sheet"],
  ["env-waste", "Waste and Circular Design", "Integrated Science", "Grade 7–11", "audit waste and design reduction or reuse", "clean waste samples, tally sheet"],
] as const;

const MODES = [
  ["predict-test", "Predict, Test, Explain", "Make a prediction, change one factor, record what happens, then explain the evidence."],
  ["variable-challenge", "Variable Challenge", "Identify independent, dependent and controlled variables, then design a fair investigation."],
  ["error-detective", "Error Detective", "Inspect a deliberately flawed method or result, locate the error and propose a correction."],
  ["data-table", "Data Table Lab", "Collect or use a small dataset, organise it in a table and identify a defensible pattern."],
  ["graph-explorer", "Graph Explorer", "Represent the relationship on a graph, interpret slope or shape and explain anomalies."],
  ["kenya-context", "Kenyan Context Case", "Apply the concept to a realistic Kenyan home, school, farm, business or county decision."],
  ["design-build", "Design Challenge", "Design a solution under material, cost, safety and performance constraints; justify trade-offs."],
  ["compare", "Compare Two Scenarios", "Hold key factors constant, compare two cases and defend which outcome is more likely."],
  ["teach-back", "Learner Teach-Back", "Create a labelled model or two-minute explanation that another learner can test for clarity."],
  ["exit-check", "Evidence Exit Check", "Answer one calculation, one explanation and one transfer question using the activity evidence."],
] as const;

export const STEM_LEARNING_IDEAS: StemLearningIdea[] = TOPICS.flatMap(([id, topic, subject, gradeBand, outcome, materials]) =>
  MODES.map(([modeId, mode, instruction]) => ({
    id: `${id}-${modeId}`,
    title: `${topic}: ${mode}`,
    subject,
    gradeBand,
    mode,
    summary: `${instruction} Focus the activity on ${topic.toLowerCase()}.`,
    learningOutcome: `Learners will ${outcome}.`,
    materials,
  }))
);

if (STEM_LEARNING_IDEAS.length !== 500) {
  throw new Error(`Expected 500 STEM learning ideas, found ${STEM_LEARNING_IDEAS.length}.`);
}
