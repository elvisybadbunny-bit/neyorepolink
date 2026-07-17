import { z } from "zod";

export const bundiOcrConfigSchema = z.object({
  freeAllowancePerTerm: z.coerce.number().int().min(0).default(500),
  bundle500PriceKes: z.coerce.number().int().min(0).default(1000),
  bundle1500PriceKes: z.coerce.number().int().min(0).default(2500),
  bundle5000PriceKes: z.coerce.number().int().min(0).default(6500),
});

export type BundiOcrConfig = z.infer<typeof bundiOcrConfigSchema>;

export function defaultBundiOcrConfig(): BundiOcrConfig {
  return {
    freeAllowancePerTerm: 500,
    bundle500PriceKes: 1000,
    bundle1500PriceKes: 2500,
    bundle5000PriceKes: 6500,
  };
}
