import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

const PRESETS = [
  ["strategy-icp", "Strategy", "Define the first ideal school profile", "Avoid trying to serve every school at launch.", "Write learner range, school type, county, buyer and urgent problem.", "CRITICAL", "QUARTERLY"],
  ["pilot-recruit", "Pilots", "Recruit 3 founding schools", "Real use is the evidence NEYO currently lacks.", "Contact 20 qualified schools and book five workflow demonstrations.", "CRITICAL", "WEEKLY"],
  ["pilot-contract", "Pilots", "Prepare pilot agreement and data-processing terms", "Children's and school financial data require explicit responsibilities.", "Ask a Kenyan lawyer to review the pilot, privacy, exit and data terms.", "CRITICAL", "ONCE"],
  ["pilot-baseline", "Pilots", "Capture each pilot school's baseline", "Savings cannot be proven without before-and-after measurements.", "Record reconciliation hours, paper pages, SMS volume, marks days and support time.", "HIGH", "ONCE"],
  ["pilot-weekly", "Customer Success", "Run weekly pilot review", "A young solo founder needs a predictable feedback rhythm.", "Review usage, blockers, value evidence and next week's owner with each champion.", "HIGH", "WEEKLY"],
  ["conversion", "Sales", "Hold pilot-to-paid decision by Day 27", "Free pilots must not become indefinite unpaid support.", "Present value report, open issues, price, payment date and exit option.", "CRITICAL", "ONCE"],
  ["pipeline", "Sales", "Update school sales pipeline", "Founder-led sales needs visible follow-up.", "Record leads contacted, demos booked, pilots proposed, objections and next dates.", "HIGH", "WEEKLY"],
  ["interviews", "Product", "Interview school users", "Pre-launch priorities should come from observed pain, not feature count.", "Complete two role-specific interviews and save exact quotes and current workarounds.", "HIGH", "WEEKLY"],
  ["release-gate", "Product", "Run the NEYO Way release gate", "Existing code is not proof that a workflow is launch-ready.", "Verify real user completion, roles, mobile, fallback, audit, cost, docs and rollback.", "CRITICAL", "WEEKLY"],
  ["support-triage", "Support", "Triage open school support", "School-day blockers become trust failures quickly.", "Classify urgent, today, this week and feature request; assign one next action.", "CRITICAL", "DAILY"],
  ["security-morning", "Security", "Review security and system alerts", "Solo-founder response must not depend on memory.", "Check failed jobs, auth anomalies, backups, webhook failures and privileged changes.", "CRITICAL", "DAILY"],
  ["backup-restore", "Reliability", "Test a backup restore", "A successful backup is unproven until restoration works.", "Restore to an isolated environment and record duration, result and gaps.", "CRITICAL", "MONTHLY"],
  ["incident-drill", "Reliability", "Run incident-response drill", "Practice reduces panic during a school-day outage.", "Simulate one outage, data issue or provider failure and update the runbook.", "HIGH", "QUARTERLY"],
  ["cost-review", "Finance", "Review cost per school", "NEYO cannot price safely without tenant-level economics.", "Allocate infrastructure, storage, SMS, extraction, onboarding and support hours.", "HIGH", "MONTHLY"],
  ["cash-runway", "Finance", "Update cash runway", "Founder and university commitments require an honest survival horizon.", "Record cash, committed bills, monthly burn, revenue and runway months.", "CRITICAL", "MONTHLY"],
  ["bookkeeping", "Finance", "Reconcile company money", "Company funds and school collections must remain separate and auditable.", "Reconcile bank, M-Pesa, invoices, receipts and founder expenses.", "CRITICAL", "MONTHLY"],
  ["tax-legal", "Compliance", "Review statutory and tax calendar", "Missed filings can damage a young company.", "Confirm BRS, KRA, eTIMS, county, contracts and professional advice due dates.", "HIGH", "MONTHLY"],
  ["odpc", "Compliance", "Complete privacy and ODPC readiness", "NEYO processes children's and sensitive school data.", "Confirm registration advice, records of processing, DPIA needs, retention and breach process.", "CRITICAL", "ONCE"],
  ["access-review", "Security", "Review privileged access", "Old access and shared credentials create avoidable risk.", "Review founder/team accounts, secrets, 2FA, sessions and least privilege.", "CRITICAL", "MONTHLY"],
  ["vendor-review", "Vendors", "Review critical providers", "M-Pesa, SMS, storage and hosting can stop school workflows.", "Record owner, cost, status, fallback, renewal and incident contact for each provider.", "HIGH", "MONTHLY"],
  ["metrics-weekly", "Metrics", "Publish weekly truth metrics", "Pre-PMF decisions need retention and task completion, not vanity totals.", "Record active schools, active roles, core workflow completion, support and pilot conversion.", "HIGH", "WEEKLY"],
  ["roadmap", "Product", "Limit the active roadmap", "Too many simultaneous features will overwhelm a solo student founder.", "Keep one reliability, one customer-value and one revenue priority active.", "HIGH", "WEEKLY"],
  ["university-plan", "Founder Capacity", "Protect university and founder time", "NEYO must survive without harming your education or health.", "Block lectures, study, sleep, sales, support and build windows; name an emergency backup.", "CRITICAL", "WEEKLY"],
  ["advisor", "Founder Capacity", "Build a small advisor circle", "You do not need to personally know law, accounting, security and school operations.", "Secure one school operator, accountant, Kenyan lawyer and technical/security mentor.", "HIGH", "QUARTERLY"],
  ["bus-factor", "Founder Capacity", "Reduce founder-only dependency", "Schools cannot depend on one person's availability.", "Document deployment, restore, incident, billing and support access for an authorised backup.", "CRITICAL", "MONTHLY"],
  ["monthly-board", "Governance", "Write a monthly founder report", "A disciplined record improves decisions and future investor diligence.", "Summarise users, value, revenue, cost, risks, decisions and next-month priorities.", "HIGH", "MONTHLY"],
] as const;

const taskSchema = z.object({
  id: z.string().optional(), category: z.string().trim().min(2).max(50), title: z.string().trim().min(3).max(160),
  why: z.string().trim().max(500).optional().nullable(), nextAction: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["TODO", "DOING", "BLOCKED", "DONE", "NOT_NOW"]), priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  cadence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ONCE"]), dueDate: z.coerce.date().optional().nullable(),
  evidence: z.string().trim().max(1000).optional().nullable(), owner: z.string().trim().min(2).max(80).default("Founder"),
});

export async function GET() {
  try { await requirePermission("platform.founder_ops"); return ok({ tasks: await db.founderOperatingTask.findMany({ orderBy: [{ status: "asc" }, { priority: "asc" }, { updatedAt: "desc" }] }) }); }
  catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission("platform.founder_ops");
    const body = await req.json();
    if (body.action === "seed") {
      for (const [presetKey, category, title, why, nextAction, priority, cadence] of PRESETS) {
        await db.founderOperatingTask.upsert({ where: { presetKey }, update: {}, create: { presetKey, category, title, why, nextAction, priority, cadence } });
      }
      return ok({ seeded: PRESETS.length });
    }
    if (body.action === "delete") { await db.founderOperatingTask.delete({ where: { id: z.string().parse(body.id) } }); return ok({ deleted: true }); }
    const input = taskSchema.parse(body.task);
    const { id, ...data } = input;
    const task = id ? await db.founderOperatingTask.update({ where: { id }, data }) : await db.founderOperatingTask.create({ data });
    return ok({ task });
  } catch (error) { return handleError(error); }
}
