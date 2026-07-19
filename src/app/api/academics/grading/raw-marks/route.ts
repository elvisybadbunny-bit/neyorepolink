import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";

export const dynamic = "force-dynamic";
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

export async function GET(req: NextRequest) {
  const user = await requirePermission("academics.manage");
  const portalId = req.nextUrl.searchParams.get("portalId");
  if (!portalId) return new Response("Portal is required", { status: 400 });
  const data = await withTenant(user.tenantId, async () => {
    const tDb = tenantDb();
    const portal = await tDb.marksPortal.findUnique({ where: { id: portalId }, include: { term: true } });
    if (!portal?.term) return null;
    const exams = await tDb.exam.findMany({ where: { year: portal.term.year, term: portal.term.term }, select: { id: true, name: true, maxMarks: true } });
    const raw = await tDb.examResult.findMany({ where: { examId: { in: exams.map((exam) => exam.id) } } });
    const students = await tDb.student.findMany({ where: { id: { in: Array.from(new Set(raw.map((row) => row.studentId))) } }, include: { schoolClass: { select: { level: true, stream: true } } } });
    const subjects = await tDb.subject.findMany({ where: { id: { in: Array.from(new Set(raw.map((row) => row.subjectId))) } }, select: { id: true, code: true, name: true } });
    const studentById = new Map(students.map((student) => [student.id, student]));
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    const examById = new Map(exams.map((exam) => [exam.id, exam]));
    const results = raw.map((row) => ({ ...row, student: studentById.get(row.studentId), subject: subjectById.get(row.subjectId), exam: examById.get(row.examId) })).filter((row) => row.student && row.subject && row.exam).sort((a, b) => (a.student!.admissionNo || "").localeCompare(b.student!.admissionNo || ""));
    return { portal, results };
  });
  if (!data) return new Response("Portal not found", { status: 404 });
  const rows = data.results.map((row) => `<tr><td>${esc(row.student!.schoolClass?.level)} ${esc(row.student!.schoolClass?.stream)}</td><td>${esc(row.student!.admissionNo)}</td><td>${esc(row.student!.firstName)} ${esc(row.student!.lastName)}</td><td>${esc(row.exam!.name)}</td><td>${esc(row.subject!.code || row.subject!.name)}</td><td>${esc(row.marks)} / ${esc(row.exam!.maxMarks)}</td><td class="confirm"></td></tr>`).join("");
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Raw marks confirmation</title><style>body{font:12px Arial;color:#111;margin:24px}h1{font-size:20px}p{margin:4px 0 16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #555;padding:6px;text-align:left}.confirm{width:90px}@media print{button{display:none}body{margin:8mm}}</style></head><body><button onclick="print()">Print</button><h1>${esc(data.portal.name)} — Raw Marks Confirmation</h1><p>These are marks as entered before weighting, grading, ranking or computation. Learners should check the entries and report corrections to the school.</p><table><thead><tr><th>Class</th><th>Admission</th><th>Learner</th><th>Exam</th><th>Subject</th><th>Raw mark</th><th>Confirmed / Query</th></tr></thead><tbody>${rows}</tbody></table></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
