import { writeFileSync } from "node:fs";

// Deterministic, production-shaped scale simulation. It does not touch a real DB.
const streams = Array.from({ length: 10 }, (_, i) => `Grade 10 ${String.fromCharCode(65 + i)}`);
const subjects = {
  ENG: ["English", 5], KIS: ["Kiswahili", 4], MAT: ["Mathematics", 5], PE: ["Physical Education", 2],
  CSL: ["Community Service Learning", 2], CRE: ["Christian Religious Education", 3],
  BIO: ["Biology", 4], CHE: ["Chemistry", 4], PHY: ["Physics", 4], CSC: ["Computer Science", 4],
  GEO: ["Geography", 4], HIS: ["History and Citizenship", 4], LIT: ["Literature in English", 4],
  BST: ["Business Studies", 4], AGR: ["Agriculture", 4], MUS: ["Music and Dance", 4], FAD: ["Fine Arts", 4],
};
const combinations = [
  ["BIO","CHE","PHY"], ["BIO","CHE","CSC"], ["MAT","PHY","CSC"], ["BIO","AGR","CHE"],
  ["GEO","HIS","BST"], ["GEO","LIT","BST"], ["HIS","LIT","CRE"],
  ["BST","AGR","GEO"], ["MUS","FAD","LIT"], ["FAD","BST","CSC"],
];
const compulsory = ["ENG","KIS","MAT","PE","CSL","CRE"];
const teacherNames = ["Amina Wanjiku","Brian Otieno","Catherine Njeri","David Kiptoo","Esther Achieng","Felix Mwangi","Grace Chebet","Hassan Ali","Irene Wambui","James Ouma","Karen Jepchirchir","Lucas Kamau","Mary Atieno","Noah Mutua","Olivia Wafula","Peter Karanja","Queen Akinyi","Robert Koech","Sarah Nyambura","Tom Odhiambo","Umazi Hassan","Victor Maina","Winfred Moraa","Xavier Barasa","Yvonne Muthoni","Zachary Kirui","Alice Nasimiyu","Benard Kariuki","Carol Kemunto","Dennis Musyoka"];
const codes = Object.keys(subjects);
const teachers = teacherNames.map((name, i) => ({ id: `T${String(i+1).padStart(2,"0")}`, name, qualified: [codes[i % codes.length], codes[(i+7) % codes.length], codes[(i+11) % codes.length]], load: 0 }));
// Ensure every subject has at least three qualified teachers.
for (const [i, code] of codes.entries()) for (let n=0;n<3;n++) if (!teachers[(i*3+n)%teachers.length].qualified.includes(code)) teachers[(i*3+n)%teachers.length].qualified.push(code);

const students=[]; const selections=[];
for (let s=0;s<10;s++) for(let n=1;n<=60;n++) {
  const id=`G10-${String(s*60+n).padStart(4,"0")}`;
  students.push({id,name:`Learner ${String(s*60+n).padStart(3,"0")}`,stream:streams[s]});
  selections.push({studentId:id,stream:streams[s],selectedSubjectCodes:[...new Set([...compulsory,...combinations[s]])]});
}

const needs=[];
for(let s=0;s<10;s++) {
  const streamCodes=[...new Set([...compulsory,...combinations[s]])];
  for(const code of streamCodes) {
    const lessons=subjects[code][1];
    const candidates=teachers.filter(t=>t.qualified.includes(code)&&t.load+lessons<=40).sort((a,b)=>a.load-b.load||a.id.localeCompare(b.id));
    if(!candidates[0]) throw new Error(`No teacher capacity for ${streams[s]} ${code}`);
    candidates[0].load+=lessons;
    needs.push({stream:streams[s],subjectCode:code,subject:subjects[code][0],lessons,teacherId:candidates[0].id,teacher:candidates[0].name});
  }
}

// Place the highest-load teachers first. Prefer a broad day spread and cap a
// subject at two periods per class/day. This models NEYO's spread constraint.
const remaining=[]; const slots=[]; const classBusy=new Set(), teacherBusy=new Set();
const classDayLoad=new Map(), teacherDayLoad=new Map(), subjectDayLoad=new Map();
const orderedNeeds=[...needs].sort((a,b)=>b.lessons-a.lessons||b.teacherId.localeCompare(a.teacherId));
for (const need of orderedNeeds) {
  for (let lesson=0; lesson<need.lessons; lesson++) {
    const candidates=[];
    for(let period=0;period<40;period++) {
      const day=Math.floor(period/8)+1, p=(period%8)+1;
      const ck=`${need.stream}:${day}:${p}`, tk=`${need.teacherId}:${day}:${p}`, sk=`${need.stream}:${need.subjectCode}:${day}`;
      if(classBusy.has(ck)||teacherBusy.has(tk)||(subjectDayLoad.get(sk)||0)>=2) continue;
      const score=(subjectDayLoad.get(sk)||0)*100+(classDayLoad.get(`${need.stream}:${day}`)||0)*10+(teacherDayLoad.get(`${need.teacherId}:${day}`)||0)*4+p/100;
      candidates.push({day,p,ck,tk,sk,score});
    }
    candidates.sort((a,b)=>a.score-b.score);
    const pick=candidates[0];
    if(!pick){remaining.push({...need});continue;}
    slots.push({...need,day:pick.day,period:pick.p}); classBusy.add(pick.ck); teacherBusy.add(pick.tk);
    classDayLoad.set(`${need.stream}:${pick.day}`,(classDayLoad.get(`${need.stream}:${pick.day}`)||0)+1);
    teacherDayLoad.set(`${need.teacherId}:${pick.day}`,(teacherDayLoad.get(`${need.teacherId}:${pick.day}`)||0)+1);
    subjectDayLoad.set(pick.sk,(subjectDayLoad.get(pick.sk)||0)+1);
  }
}
if(remaining.length) throw new Error(`${remaining.length} lessons could not be placed`);

const duplicate=(keyFn)=>{const seen=new Set();for(const x of slots){const k=keyFn(x);if(seen.has(k))return k;seen.add(k);}return null;};
const classConflict=duplicate(x=>`${x.stream}:${x.day}:${x.period}`);
const teacherConflict=duplicate(x=>`${x.teacherId}:${x.day}:${x.period}`);
const countByClass=Object.fromEntries(streams.map(s=>[s,slots.filter(x=>x.stream===s).length]));
const maxSameSubjectPerDay=Math.max(...[...subjectDayLoad.values()]);
const unqualifiedAssignments=needs.filter(n=>!teachers.find(t=>t.id===n.teacherId)?.qualified.includes(n.subjectCode)).length;
const summary={maxSameSubjectPerDay,unqualifiedAssignments,students:students.length,streams:streams.length,studentsPerStream:60,teachers:teachers.length,subjects:codes.length,confirmedSelections:selections.length,classSubjectNeeds:needs.length,lessonsPlaced:slots.length,unplaced:remaining.length,classConflict,teacherConflict,teacherMinLoad:Math.min(...teachers.map(t=>t.load)),teacherMaxLoad:Math.max(...teachers.map(t=>t.load)),teacherAverageLoad:Number((teachers.reduce((n,t)=>n+t.load,0)/teachers.length).toFixed(1)),classLoads:countByClass,freePeriodsByClass:Object.fromEntries(streams.map(s=>[s,40-countByClass[s]]))};
writeFileSync("/tmp/neyo-grade10-scale-result.json",JSON.stringify({summary,teachers,needs,slots,selectionsSample:selections.slice(0,20)},null,2));
writeFileSync("/tmp/neyo-grade10-timetable.csv",["Stream,Day,Period,Subject,Teacher",...slots.sort((a,b)=>a.stream.localeCompare(b.stream)||a.day-b.day||a.period-b.period).map(x=>[x.stream,x.day,x.period,x.subject,x.teacher].map(v=>`"${v}"`).join(","))].join("\n"));
console.log(JSON.stringify(summary,null,2));
if(classConflict||teacherConflict||remaining.length||unqualifiedAssignments||maxSameSubjectPerDay>2||students.length!==600||selections.length!==600)process.exit(1);
