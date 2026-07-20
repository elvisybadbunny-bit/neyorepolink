import { buildThreeOptionBlocks } from "../src/lib/services/senior-option-block.service";
const assert = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const choices = [
  { studentId: "1", studentName: "Amina", subjectIds: ["BIO", "CHE", "PHY"] },
  { studentId: "2", studentName: "Brian", subjectIds: ["BIO", "CSC", "ELC"] },
  { studentId: "3", studentName: "Chebet", subjectIds: ["AGR", "CHE", "HSC"] },
  { studentId: "4", studentName: "David", subjectIds: ["HCT", "BST", "GEO"] },
];
const a = buildThreeOptionBlocks(choices);
const b = buildThreeOptionBlocks(choices);
assert(a.possible, "Expected a valid three-block solution");
assert(JSON.stringify(a.assignment) === JSON.stringify(b.assignment), "Same inputs must produce the same blocks");
assert(a.learnerProof.every((row) => row.valid && row.A && row.B && row.C), "Every learner needs exactly one A/B/C subject");
for (const [subject, conflicts] of Object.entries(a.conflicts)) for (const other of conflicts) assert(a.assignment[subject] !== a.assignment[other], `${subject}/${other} conflict shares a block`);
const k4 = buildThreeOptionBlocks([
  { studentId: "a", studentName: "One", subjectIds: ["A", "B", "C"] },
  { studentId: "b", studentName: "Two", subjectIds: ["A", "B", "D"] },
  { studentId: "c", studentName: "Three", subjectIds: ["A", "C", "D"] },
  { studentId: "d", studentName: "Four", subjectIds: ["B", "C", "D"] },
]);
assert(!k4.possible, "K4 cannot fit three blocks");
assert((k4.affectedLearners?.length ?? 0) > 0, "Impossible result should identify affected learners");
const bad = buildThreeOptionBlocks([{ studentId: "x", studentName: "Invalid", subjectIds: ["A", "B"] }]);
assert(!bad.possible, "Two choices must fail");
console.log("Senior Option Block Phase B: deterministic graph tests passed");
