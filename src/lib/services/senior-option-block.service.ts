export type LearnerElectiveChoice = { studentId: string; studentName: string; subjectIds: string[] };
export type OptionBlockKey = "A" | "B" | "C";
export type OptionBlockResult = {
  possible: boolean;
  assignment: Record<string, OptionBlockKey>;
  blocks: Record<OptionBlockKey, string[]>;
  conflicts: Record<string, string[]>;
  learnerProof: { studentId: string; studentName: string; A: string | null; B: string | null; C: string | null; valid: boolean }[];
  reason?: string;
  unresolvedSubjectIds?: string[];
  affectedLearners?: string[];
};

const KEYS: OptionBlockKey[] = ["A", "B", "C"];

/**
 * Deterministic three-colour graph solver for Senior School electives.
 * Subject nodes conflict when any learner selected both. Connected nodes
 * cannot share one option block. Fixed sorting/tie-breaks make identical
 * inputs produce identical output; no random value, provider or AI is used.
 */
export function buildThreeOptionBlocks(choices: LearnerElectiveChoice[]): OptionBlockResult {
  const invalid = choices.filter((choice) => new Set(choice.subjectIds).size !== 3);
  if (invalid.length) {
    return { possible: false, assignment: {}, blocks: { A: [], B: [], C: [] }, conflicts: {}, learnerProof: [], reason: "Every learner must have exactly three distinct confirmed electives.", affectedLearners: invalid.map((x) => x.studentName) };
  }
  const subjects = [...new Set(choices.flatMap((choice) => choice.subjectIds))].sort();
  const graph = new Map<string, Set<string>>(subjects.map((id) => [id, new Set()]));
  for (const choice of choices) {
    const ids = [...new Set(choice.subjectIds)].sort();
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      graph.get(ids[i])!.add(ids[j]); graph.get(ids[j])!.add(ids[i]);
    }
  }
  const order = [...subjects].sort((a, b) => (graph.get(b)!.size - graph.get(a)!.size) || a.localeCompare(b));
  const colors = new Map<string, number>();
  const counts = [0, 0, 0];
  function solve(index: number): boolean {
    if (index === order.length) return true;
    const subject = order[index];
    const forbidden = new Set([...graph.get(subject)!].map((neighbor) => colors.get(neighbor)).filter((x): x is number => x !== undefined));
    // Stable least-used colour first keeps block sizes reasonably balanced.
    const candidates = [0, 1, 2].sort((a, b) => (counts[a] - counts[b]) || (a - b));
    for (const color of candidates) {
      if (forbidden.has(color)) continue;
      colors.set(subject, color); counts[color]++;
      if (solve(index + 1)) return true;
      counts[color]--; colors.delete(subject);
    }
    return false;
  }
  const possible = solve(0);
  const conflicts = Object.fromEntries(subjects.map((id) => [id, [...graph.get(id)!].sort()]));
  if (!possible) {
    // Identify the densest unresolved core and learners touching it. This is
    // an explanation aid, not a guessed change to anyone's choices.
    const unresolved = order.slice(0, Math.min(order.length, 8));
    const affected = choices.filter((choice) => choice.subjectIds.some((id) => unresolved.includes(id))).map((choice) => choice.studentName);
    return { possible: false, assignment: {}, blocks: { A: [], B: [], C: [] }, conflicts, learnerProof: [], reason: "Confirmed choices cannot fit three conflict-free option blocks. Leadership must review offerings, resources or an authorised learner choice; NEYO will not change choices automatically.", unresolvedSubjectIds: unresolved, affectedLearners: affected };
  }
  const assignment: Record<string, OptionBlockKey> = {};
  const blocks: Record<OptionBlockKey, string[]> = { A: [], B: [], C: [] };
  for (const subject of subjects) { const key = KEYS[colors.get(subject)!]; assignment[subject] = key; blocks[key].push(subject); }
  const learnerProof = choices.map((choice) => {
    const byBlock: Record<OptionBlockKey, string[]> = { A: [], B: [], C: [] };
    for (const subjectId of choice.subjectIds) byBlock[assignment[subjectId]].push(subjectId);
    return { studentId: choice.studentId, studentName: choice.studentName, A: byBlock.A[0] ?? null, B: byBlock.B[0] ?? null, C: byBlock.C[0] ?? null, valid: byBlock.A.length === 1 && byBlock.B.length === 1 && byBlock.C.length === 1 };
  });
  if (learnerProof.some((proof) => !proof.valid)) {
    return { possible: false, assignment, blocks, conflicts, learnerProof, reason: "Internal learner-proof validation failed; no block may be confirmed." };
  }
  return { possible: true, assignment, blocks, conflicts, learnerProof };
}
