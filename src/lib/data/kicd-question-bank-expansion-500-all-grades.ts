import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

const GRADES = ["PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"] as const;

function optionsFor(answer: number, step = 1) {
  const values = [answer, answer + step, answer - step, answer + 2 * step];
  return Array.from(new Set(values)).slice(0, 4).map(String);
}
function question(grade: string, index: number, gradeIndex: number): UniversalQuestionSeed {
  const mode = index % 5;
  let prompt = "", answer = 0, explanation = "", subjectCode = "MAT", strandName = "Numbers", substrandName = "Number Operations", step = 1;
  if (gradeIndex <= 1) {
    const a = 1 + (index % 9), b = 1 + ((index * 3) % 6);
    if (mode === 0) { answer = a + b; prompt = `${grade} learners arrange ${a} red counters and ${b} blue counters. How many counters are there altogether?`; explanation = `${a} + ${b} = ${answer}.`; }
    else if (mode === 1) { const big=a+b; answer=a; prompt=`There are ${big} bottle tops. ${b} are removed. How many remain?`; explanation=`${big} - ${b} = ${answer}.`; }
    else if (mode === 2) { answer=Math.max(a,b); prompt=`Which is the greater number: ${a} or ${b}?`; explanation=`${answer} is greater because it comes later when counting.`; }
    else if (mode === 3) { answer=a; prompt=`A learner makes ${a} groups with one stone in each group. How many stones are used?`; explanation=`One stone in each of ${a} groups gives ${answer} stones.`; }
    else { answer=a+1; prompt=`What number comes immediately after ${a}?`; explanation=`Counting forward one step after ${a} gives ${answer}.`; }
  } else if (gradeIndex <= 4) {
    const a = 10 + gradeIndex * 5 + index, b = 2 + (index % 9);
    if (mode === 0) { answer=a+b; prompt=`A class collected ${a} exercise books on Monday and ${b} on Tuesday. How many were collected?`; explanation=`${a} + ${b} = ${answer}.`; }
    else if (mode === 1) { answer=a-b; prompt=`A shop had ${a} pencils and sold ${b}. How many pencils remained?`; explanation=`${a} - ${b} = ${answer}.`; }
    else if (mode === 2) { answer=b*(gradeIndex-1); prompt=`There are ${b} groups of ${gradeIndex-1} learners. How many learners are there?`; explanation=`${b} × ${gradeIndex-1} = ${answer}.`; }
    else if (mode === 3) { const divisor=gradeIndex-1, total=b*divisor; answer=b; prompt=`${total} oranges are shared equally among ${divisor} learners. How many does each receive?`; explanation=`${total} ÷ ${divisor} = ${answer}.`; }
    else { answer=a*10+b; prompt=`What number is represented by ${a} tens and ${b} ones?`; explanation=`${a} tens = ${a*10}; adding ${b} ones gives ${answer}.`; step=10; }
  } else if (gradeIndex <= 7) {
    const a=20+index*2, b=2+(index%8);
    if(mode===0){answer=a*b;prompt=`A rectangular school garden is ${a} m long and ${b} m wide. What is its area?`;explanation=`Area = length × width = ${a} × ${b} = ${answer} m².`;strandName="Measurement";substrandName="Area";step=b;}
    else if(mode===1){answer=Math.round(a*25/100);prompt=`What is 25% of ${a}?`;explanation=`25% = 1/4; ${a} ÷ 4 = ${answer}.`;strandName="Fractions and Percentages";substrandName="Percentage";}
    else if(mode===2){answer=a+b;prompt=`Convert ${a} metres and ${b} metres into one total distance in metres.`;explanation=`${a} + ${b} = ${answer} metres.`;strandName="Measurement";substrandName="Length";}
    else if(mode===3){answer=a/b;const total=a-(a%b);answer=total/b;prompt=`${total} kg of maize is packed equally into ${b} bags. How many kilograms are in each bag?`;explanation=`${total} ÷ ${b} = ${answer} kg.`;}
    else {answer=2*(a+b);prompt=`A rectangle measures ${a} m by ${b} m. Find its perimeter.`;explanation=`Perimeter = 2(${a} + ${b}) = ${answer} m.`;strandName="Geometry";substrandName="Perimeter";step=2;}
  } else if (gradeIndex <= 10) {
    const x=2+(index%12), coefficient=2+(index%5), constant=1+(index%7), result=coefficient*x+constant;
    if(mode===0){answer=x;prompt=`Solve ${coefficient}x + ${constant} = ${result}.`;explanation=`Subtract ${constant}: ${coefficient}x = ${result-constant}. Divide by ${coefficient}: x = ${answer}.`;strandName="Algebra";substrandName="Linear Equations";}
    else if(mode===1){const base=40+index*5,rate=10+(index%4)*5;answer=base*rate/100;prompt=`Calculate ${rate}% of ${base}.`;explanation=`${rate}/100 × ${base} = ${answer}.`;strandName="Numbers";substrandName="Percentage";step=5;}
    else if(mode===2){const n1=10+index,n2=20+index,n3=30+index;answer=(n1+n2+n3)/3;prompt=`Find the mean of ${n1}, ${n2}, and ${n3}.`;explanation=`(${n1} + ${n2} + ${n3}) ÷ 3 = ${answer}.`;strandName="Data Handling";substrandName="Mean";}
    else if(mode===3){const length=5+(index%10),width=3+(index%7);answer=length*width;prompt=`A rectangular plot measures ${length} m by ${width} m. Calculate its area.`;explanation=`${length} × ${width} = ${answer} m².`;strandName="Measurement";substrandName="Area";step=length;}
    else {const principal=1000+(index*100),rate=5+(index%6);answer=principal*rate*2/100;prompt=`Find the simple interest on KES ${principal} at ${rate}% per year for 2 years.`;explanation=`I = PRT/100 = ${principal} × ${rate} × 2 ÷ 100 = KES ${answer}.`;strandName="Financial Mathematics";substrandName="Simple Interest";step=100;}
  } else {
    const x=1+(index%10), a=1+(index%4), b=2+(index%7);
    if(mode===0){answer=a*x*x+b;prompt=`Evaluate y = ${a}x² + ${b} when x = ${x}.`;explanation=`y = ${a}(${x}²) + ${b} = ${answer}.`;strandName="Algebra";substrandName="Quadratic Functions";step=a;}
    else if(mode===1){const rise=5+index,run=2+(index%9);answer=Number((rise/run).toFixed(2));prompt=`A straight line rises ${rise} units over a horizontal run of ${run} units. Find its gradient to 2 decimal places.`;explanation=`Gradient = rise/run = ${rise}/${run} = ${answer}.`;strandName="Coordinate Geometry";substrandName="Gradient";step=0.5;}
    else if(mode===2){subjectCode="PHY";const mass=2+(index%20),speed=3+(index%15);answer=0.5*mass*speed*speed;prompt=`A body of mass ${mass} kg moves at ${speed} m/s. Calculate its kinetic energy.`;explanation=`KE = ½mv² = 0.5 × ${mass} × ${speed}² = ${answer} J.`;strandName="Mechanics";substrandName="Energy";step=10;}
    else if(mode===3){const principal=5000+index*500,rate=4+(index%8);answer=principal*rate*3/100;prompt=`Calculate simple interest on KES ${principal} at ${rate}% per annum for 3 years.`;explanation=`I = PRT/100 = ${principal} × ${rate} × 3 ÷ 100 = KES ${answer}.`;strandName="Financial Mathematics";substrandName="Interest";step=100;}
    else {subjectCode="PHY";const voltage=6+(index%19),resistance=2+(index%11);answer=Number((voltage/resistance).toFixed(2));prompt=`A resistor of ${resistance} Ω is connected to ${voltage} V. Calculate current to 2 decimal places.`;explanation=`I = V/R = ${voltage}/${resistance} = ${answer} A.`;strandName="Electricity";substrandName="Ohm's Law";step=0.5;}
  }
  prompt = `${grade}: ${prompt}`;
  const opts=optionsFor(answer,step); while(opts.length<4) opts.push(String(answer+opts.length*step+1));
  return {subjectCode,grade,strandName,substrandName,prompt,questionType:"MULTIPLE_CHOICE",options:opts,correctAnswer:String(answer),explanation,difficulty: gradeIndex<5?1:gradeIndex<9?2:3};
}

export const QUESTION_BANK_EXPANSION_500_ALL_GRADES: UniversalQuestionSeed[] = GRADES.flatMap((grade, gradeIndex) => {
  const count = gradeIndex < 10 ? 36 : 35;
  return Array.from({length:count},(_,index)=>question(grade,index+1,gradeIndex));
});
if(QUESTION_BANK_EXPANSION_500_ALL_GRADES.length!==500) throw new Error(`Expected 500 questions, found ${QUESTION_BANK_EXPANSION_500_ALL_GRADES.length}.`);
