/**
 * PART EE.11 — QR Gate-Pass Status Scanning Validations
 *
 * Strict Zod validation schemas for sub-second gate-pass QR scanning
 * and 1-tap exit/return stamping at the security checkpoint.
 */
import { z } from "zod";

export const scanGatePassSchema = z.object({
  scannedCode: z.string().trim().min(1, "Scanned QR code is required").max(500),
});

export type ScanGatePassInput = z.infer<typeof scanGatePassSchema>;

export const stampGatePassSchema = z.object({
  passId: z.string().min(1, "Gate pass ID is required"),
  action: z.enum(["EXIT", "RETURN"]),
  note: z.string().trim().max(250).optional(),
});

export type StampGatePassInput = z.infer<typeof stampGatePassSchema>;
