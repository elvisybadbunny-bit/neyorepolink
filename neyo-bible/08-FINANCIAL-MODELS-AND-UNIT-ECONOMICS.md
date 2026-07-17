# Level 8 — Financial Models, Unit Economics & Cost Cockpit
**Document Id**: `NEYO-BIB-L8`  
**Owner**: NEYO Solo Founder & Chief Financial Operations (`cost-cockpit.service.ts`)  
**Status**: Living Institutional Financial Model  
**Last Updated**: 2026-07-17  

---

## 1. Executive Unit Economics (`Cost Cockpit` / `u1-cost-cockpit-test.ts`)

NEYO's financial model (`Level 8`) focuses strictly on company-level unit economics, cloud infrastructure Cost of Goods Sold (`COGS`), customer acquisition cost (`CAC`), lifetime value (`LTV`), and high operational gross margins (~85%+). This is distinct from the live school pricing engine and package switcher managed in NEYO Ops (`Pricing Control` module), which governs exact school quotation amounts (`school-quote.service.ts` / `pricing-engine.service.ts`).

### 1.1 Cloud Infrastructure & Cost Breakdown (Per Active School / Month)

| Infrastructure Item | Vendor / Service | Cost per School / Month (`KES`) | Cost per School / Year (`KES`) | Strategic Optimization Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Compute & SSR** | Vercel Enterprise / Cloudflare Edge | **KES 800 / mo** | KES 9,600 / yr | Next.js Server Actions run on lightweight serverless/edge workers. Zero idle server instance billing. |
| **Database & ORM** | PostgreSQL (`PrismaPg` WASM Adapter) | **KES 1,200 / mo** | KES 14,400 / yr | Multi-tenant schema abstraction (`TENANT_OWNED_MODELS`) shares database pool across hundreds of schools without data leakage (`A.2`). |
| **File Storage & Vault** | Cloudflare R2 / Storage Vault (`I.56`) | **KES 400 / mo** | KES 4,800 / yr | Zero egress fees on Cloudflare R2. `Storage Intelligence Engine (`Part W`)` auto-compresses and archives old `ScannedExamPaper` and graduated student files. |
| **SMS Gateway Conveyance** | Africas Talking (`KES 1.50/SMS`) | **KES 1,500 / mo** (variable) | KES 18,000 / yr | Used for automated fee reminders (`I.99`) and urgent attendance alerts (`A.7`). Billed directly to school or covered under paid capacity tiers. |
| **M-Pesa API Conveyance** | Safaricom Daraja STK / Paybill | **KES 500 / mo** | KES 6,000 / yr | Direct IPN webhook processing (`/api/webhooks/mpesa`). No intermediary merchant aggregator cut. |
| **TOTAL COGS (Per School)**| — | **KES 4,400 / mo** | **KES 52,800 / yr** | **Gross Margin across active schools (`averaging KES 135,000/yr`): ~60.8% (or ~85% excluding pass-through SMS charges).** |

---

## 2. Revenue & Conversion Architecture: 1-Month Free Trial & Capacity Pricing (`Part V`)

Per founder strategic directive (`2026-07-17`), NEYO has completely removed legacy subscription options (`Free Karibu`, `Options`, and `Elite` are deleted). Instead, NEYO operates on a high-conversion **1-Month Free Trial (`30-Day Trial`) + Capacity-Based Continuation Model ("Neyo Complete")**:

1. **1-Month Free Trial (`30 Days`)**: Every new school (`new users`) signing up receives an immediate **30-Day Free Trial across the full operational system (`status: "TRIAL"`)**. They get zero feature restrictions during onboarding so they can experience the complete academic, financial, attendance, and portfolio capabilities.
2. **Operational Continuation**: At the conclusion of the free month, if the school administration and principal feel the system is operational and valuable to them, their subscription transitions to active billing (`status: "ACTIVE"`).
3. **Capacity-Based Pricing (`SIZE_BASED_V2`)**: Schools are quoted and billed dynamically based on their real school size and active student/staff count (`Msingi` at KES 4,500/term for standard day schools up to 500 students; `Pro` at KES 9,000/term or custom capacity quote for large/boarding networks). Every active school unlocks all modules (`Neyo Complete`).

```
+----------------------------------------------------------------------------------------------------+
|                                    1-YEAR TO 3-YEAR REVENUE HORIZON                                |
+----------------------------------------------------------------------------------------------------+
| 2026 (YEAR 1 TARGET): 100 Active Paying Schools Onboarded                                          |
| - 60 Standard Day Schools (`Msingi / KES 4,500/term × 3 terms = KES 13,500/yr`)  = KES   810,000   |
| - 30 Large Growing Schools (`Pro / KES 9,000/term × 3 terms = KES 27,000/yr`)    = KES   810,000   |
| - 10 Custom Capacity Networks (`averaging KES 150,000/yr`)                       = KES 1,500,000   |
|   Subtotal Subscription Revenue                                                  = KES 3,120,000 / yr|
|   + KNEC SMS Lookup Fees (`EE.12` / KES 30)                                      = KES   600,000 / yr|
|   TOTAL YEAR 1 REVENUE                                                           = KES 3,720,000 / yr|
+----------------------------------------------------------------------------------------------------+
| 2027 (YEAR 2 TARGET): 500 Active Paying Schools Onboarded                        = KES 25,500,000 / yr|
+----------------------------------------------------------------------------------------------------+
| 2028 (YEAR 3 TARGET): 2,000 Active Paying Schools Onboarded (Pan-Kenya Dominance)= KES 140,000,000/yr|
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Micro-Transaction & High-Margin Ancillary Revenue

1. **KNEC / KJSEA Assessment Placement Lookup (`EE.12` / `sms-knec.service.ts`)**:
   - Every time a parent queries `KJSEA-2025-0012345` via SMS or web to confirm their child's Grade 10 Senior School pathway and class placement (`22263 style`), NEYO charges **KES 30 per query**.
   - **Cost to NEYO**: `KES 1.50` (SMS delivery).
   - **Net Profit Margin**: **KES 28.50 per lookup (`95% Margin`)**.
2. **Mzazi Direct Pay & Fee Reminder Remittance (`I.41 / I.99`)**:
   - When a parent pays a KES 50,000 term fee via our 1-tap M-Pesa STK link, NEYO charges a flat **KES 50 convenience and instant reconciliation fee**.
   - **Cost to NEYO**: `KES 0` (`Safaricom charges standard M-Pesa tariffs directly to sender`).
   - **Net Profit Margin**: **100% Margin**.

---

## 4. Quotation Calculator & School Pricing Control (`school-quote.service.ts`)

In NEYO's live Pricing Control module (`pricing-catalog.service.ts` & `pricing-engine.service.ts`), whenever a prospective school requests an automated quotation (`SchoolQuoteRequest`) after or during their 1-Month Free Trial, the backend engine computes their quote based on active capacity:

```typescript
// Conceptual implementation of capacity calculation in school-quote.service.ts / pricing-engine.service.ts
export function calculateSchoolQuote(studentCount: number): {
  annualTotalKes: number;
  termInstallmentKes: number;
  planName: string;
} {
  // Free Karibu, Options, and Elite are completely removed. New users get 1 month free trial.
  if (studentCount <= 500) {
    return { annualTotalKes: 13500, termInstallmentKes: 4500, planName: "Msingi (Neyo Complete)" };
  } else if (studentCount <= 1500) {
    return { annualTotalKes: 27000, termInstallmentKes: 9000, planName: "Pro (Neyo Complete)" };
  } else {
    // Custom Capacity-Based Quote for multi-campus networks
    const customAnnual = studentCount * 45;
    return { annualTotalKes: customAnnual, termInstallmentKes: Math.round(customAnnual / 3), planName: "Capacity-Based Network (Neyo Complete)" };
  }
}
```

---

## 5. Tax Compliance & Statutory Payroll Deductions (`B.8` / `PayrollRun`)

Inside NEYO's internal HR & Payroll module (`PayrollRun`, `StaffSalary`, `Payslip`), all Kenyan statutory deductions are computed automatically during monthly salary processing (`SOP-FIN-02`):
1. **KRA PAYE (Pay As You Earn)**: Calculated against graduated KRA individual tax brackets (`10%, 25%, 30%, 32.5%, 35%`).
2. **NSSF (National Social Security Fund)**: Tier I and Tier II statutory deductions based on current Pension Act ceilings.
3. **SHIF / NHIF (Social Health Insurance Fund)**: 2.75% gross salary deduction per exact Kenyan health authority regulations.
4. **Housing Levy**: 1.5% employee + 1.5% employer statutory deduction computed directly on gross pay before tax.
