import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";
import { recordSuspenseReceipt } from "@/lib/services/mpesa-suspense.service";

export const dynamic = "force-dynamic";

const rowSchema = z.object({
  transId: z.string().trim().min(5),
  transTime: z.string().trim().min(1),
  transAmount: z.coerce.number().positive(),
  billRefNumber: z.string().trim().default("UNASSIGNED"),
  mpesaSenderPhone: z.string().trim().default(""),
  mpesaSenderName: z.string().trim().default("M-PESA USER"),
});

function cells(line: string): string[] {
  const output: string[] = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') { value += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { output.push(value.trim()); value = ""; }
    else value += char;
  }
  output.push(value.trim()); return output;
}

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = cells(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return lines.slice(1).map((line) => {
    const values = cells(line); const row: Record<string, string> = {};
    headers.forEach((header, index) => { row[header] = values[index] ?? ""; });
    const amount = row.transamount || row.amount || row.paidin || row.credit || "";
    return {
      transId: row.transid || row.receiptno || row.receiptnumber || row.transactionid || row.reference,
      transTime: row.transtime || row.completiontime || row.date || row.transactiondate,
      transAmount: String(amount).replace(/[^0-9.]/g, ""),
      billRefNumber: row.billrefnumber || row.accountreference || row.accountref || row.reference || "UNASSIGNED",
      mpesaSenderPhone: row.msisdn || row.phone || row.senderphone || "",
      mpesaSenderName: row.firstname ? [row.firstname, row.middlename, row.lastname].filter(Boolean).join(" ") : row.sendername || row.name || row.details || "M-PESA USER",
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("finance.record_payment");
    const body = await req.json().catch(() => ({}));
    const parsed = Array.isArray(body.rows) ? body.rows : parseCsv(String(body.csv || ""));
    if (!parsed.length) throw new Error("No payment rows were found. Include a header row and at least one payment.");
    let imported = 0, duplicates = 0, rejected = 0;
    const errors: Array<{ row: number; message: string }> = [];
    for (let index = 0; index < parsed.length; index++) {
      const result = rowSchema.safeParse(parsed[index]);
      if (!result.success) { rejected++; errors.push({ row: index + 2, message: result.error.issues[0]?.message || "Invalid row" }); continue; }
      const existing = await db.mpesaSuspenseReceipt.findUnique({ where: { transId: result.data.transId }, select: { id: true } });
      const paid = await db.payment.findUnique({ where: { mpesaRef: result.data.transId }, select: { id: true } });
      if (existing || paid) { duplicates++; continue; }
      await recordSuspenseReceipt({ tenantId: user.tenantId, ...result.data, transAmount: Math.round(result.data.transAmount) });
      imported++;
    }
    return ok({ imported, duplicates, rejected, errors: errors.slice(0, 20) });
  } catch (error) { return handleError(error); }
}
