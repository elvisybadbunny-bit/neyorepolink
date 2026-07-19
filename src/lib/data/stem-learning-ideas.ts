export type SimulationModel = "ohm" | "electricPower" | "speed" | "density" | "moments" | "pythagoras" | "linear" | "ph" | "photosynthesis" | "population";
export interface StemLearningIdea {
  id: string; title: string; subject: string; gradeBand: string; model: SimulationModel;
  variableA: string; unitA: string; minA: number; maxA: number; stepA: number; initialA: number;
  variableB: string; unitB: string; minB: number; maxB: number; stepB: number; initialB: number;
  outputLabel: string; outputUnit: string; learningOutcome: string; context: string;
}
const BASES: Omit<StemLearningIdea,"id"|"title"|"context"|"initialA"|"initialB">[] = [
  {subject:"Physics",gradeBand:"Grade 8–11",model:"ohm",variableA:"Voltage",unitA:"V",minA:1,maxA:24,stepA:1,variableB:"Resistance",unitB:"Ω",minB:1,maxB:50,stepB:1,outputLabel:"Current",outputUnit:"A",learningOutcome:"Relate voltage, resistance and current using Ohm’s law."},
  {subject:"Physics",gradeBand:"Grade 9–12",model:"electricPower",variableA:"Voltage",unitA:"V",minA:1,maxA:240,stepA:1,variableB:"Current",unitB:"A",minB:0.1,maxB:15,stepB:0.1,outputLabel:"Electrical power",outputUnit:"W",learningOutcome:"Investigate electrical power and energy-use decisions."},
  {subject:"Integrated Science",gradeBand:"Grade 7–10",model:"speed",variableA:"Distance",unitA:"m",minA:10,maxA:1000,stepA:10,variableB:"Time",unitB:"s",minB:1,maxB:200,stepB:1,outputLabel:"Speed",outputUnit:"m/s",learningOutcome:"Model how distance and time determine average speed."},
  {subject:"Chemistry",gradeBand:"Grade 8–11",model:"density",variableA:"Mass",unitA:"g",minA:10,maxA:1000,stepA:10,variableB:"Volume",unitB:"cm³",minB:5,maxB:500,stepB:5,outputLabel:"Density",outputUnit:"g/cm³",learningOutcome:"Use mass and volume to compare material density."},
  {subject:"Physics",gradeBand:"Grade 8–11",model:"moments",variableA:"Force",unitA:"N",minA:10,maxA:300,stepA:10,variableB:"Distance from pivot",unitB:"m",minB:0.1,maxB:3,stepB:0.1,outputLabel:"Moment",outputUnit:"N·m",learningOutcome:"Investigate how force and perpendicular distance determine a turning effect."},
  {subject:"Mathematics",gradeBand:"Grade 7–10",model:"pythagoras",variableA:"Perpendicular side",unitA:"cm",minA:1,maxA:20,stepA:1,variableB:"Base side",unitB:"cm",minB:1,maxB:20,stepB:1,outputLabel:"Hypotenuse",outputUnit:"cm",learningOutcome:"Explore Pythagoras’ relationship in right-angled triangles."},
  {subject:"Mathematics",gradeBand:"Grade 8–11",model:"linear",variableA:"Gradient",unitA:"",minA:-10,maxA:10,stepA:1,variableB:"x value",unitB:"",minB:-10,maxB:10,stepB:1,outputLabel:"y = mx + 2",outputUnit:"",learningOutcome:"Explore how gradient and x affect a linear relationship."},
  {subject:"Chemistry",gradeBand:"Grade 8–11",model:"ph",variableA:"Hydrogen ion exponent",unitA:"",minA:0,maxA:14,stepA:1,variableB:"Dilution steps",unitB:"",minB:0,maxB:6,stepB:1,outputLabel:"Estimated pH",outputUnit:"",learningOutcome:"Model acidity, alkalinity and the effect of tenfold dilution."},
  {subject:"Biology",gradeBand:"Grade 8–11",model:"photosynthesis",variableA:"Light intensity",unitA:"%",minA:0,maxA:100,stepA:5,variableB:"Carbon dioxide availability",unitB:"%",minB:0,maxB:100,stepB:5,outputLabel:"Relative photosynthesis rate",outputUnit:"%",learningOutcome:"Investigate limiting factors in photosynthesis."},
  {subject:"Biology",gradeBand:"Grade 9–12",model:"population",variableA:"Starting population",unitA:"",minA:10,maxA:1000,stepA:10,variableB:"Growth rate",unitB:"%",minB:-20,maxB:50,stepB:1,outputLabel:"Population after one cycle",outputUnit:"",learningOutcome:"Explore population growth, decline and carrying-pressure scenarios."},
];
const CONTEXTS = [
  ["Foundation investigation","Use the controls to establish the basic relationship."],
  ["Prediction challenge","Predict the output before moving either control, then test."],
  ["Kenyan school context","Apply the model to a realistic school or community decision."],
  ["Compare two cases","Record two settings and explain the difference in output."],
  ["Target value challenge","Adjust both variables to reach a teacher-selected target."],
] as const;
export const STEM_LEARNING_IDEAS: StemLearningIdea[] = BASES.flatMap((base, baseIndex) => CONTEXTS.map(([variant, context], variantIndex) => ({
  ...base, id:`${base.model}-${variantIndex+1}`, title:`${base.outputLabel}: ${variant}`,
  context, initialA: Math.round((base.minA+(base.maxA-base.minA)*(0.25+variantIndex*0.12))/base.stepA)*base.stepA,
  initialB: Math.round((base.minB+(base.maxB-base.minB)*(0.65-variantIndex*0.1))/base.stepB)*base.stepB,
})));
if (STEM_LEARNING_IDEAS.length !== 50) throw new Error(`Expected first verified batch of 50 simulations, found ${STEM_LEARNING_IDEAS.length}.`);
