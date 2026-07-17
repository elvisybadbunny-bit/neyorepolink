# Level 5 — Operations & Standard Operating Procedures (SOPs)
**Document Id**: `NEYO-BIB-L5`  
**Owner**: NEYO Executive Operations & Company Management  
**Status**: Living Institutional SOP Manual  
**Last Updated**: 2026-07-17  

---

## Executive Overview: The Operational Rhythm

To run NEYO as an institutional-grade enterprise independent of individual memory, every recurring company workflow is structured into a formal **Standard Operating Procedure (SOP)**. Every SOP adheres to a strict 7-part execution protocol:
1. **Purpose**: Why this procedure exists.
2. **Owner**: The exact role (`FOUNDER`, `NEYO_OPS`, `NEYO_SUPPORT`, `PRINCIPAL`, `BURSAR`) accountable.
3. **Inputs**: Prerequisites, files, or data required before starting.
4. **Steps**: Exact, numbered, reproducible execution instructions.
5. **Expected Output**: The verifiable end state.
6. **Escalation**: What to do and who to notify when anomalies occur.
7. **Checklist**: High-speed checkbox summary for daily operations.

---

## SOP-CS-01: School Onboarding & Excel Student Import (`ImportWizard` / `populateSubjectMap`)

### 1. Purpose
To onboard a new school (`e.g. Bahari View Secondary School`) and import hundreds of student records from messy Excel/CSV spreadsheets (`BB.4 / DD.4`) without introducing unmapped subject strings or corrupting the academic catalog.

### 2. Owner
`NEYO_SUPPORT` (Customer Support Specialist) / School `PRINCIPAL`.

### 3. Inputs
- Cleaned or raw school spreadsheet (`students.xlsx`) containing Admission Number, Full Name, Class/Grade, Stream, and Assigned Subjects (`e.g. "Mathematics, English, Agriculture & Nutrition"`).
- Active school `tenantId` and initialized `SchoolClass` / `Subject` catalog in NEYO.

### 4. Steps
1. Log into NEYO under `NEYO_SUPPORT` or `PRINCIPAL`. Navigate to **Students -> Import Students (`BB.4`)**.
2. Click **[ + Upload Spreadsheet ]** and select `students.xlsx`.
3. Proceed to **Step 2: Preview & Validation Tab**. NEYO's `previewImport()` service (`POST /api/students/import/preview`) automatically scans all rows.
4. **Inspect Subject Catalog Normalization**:
   - `previewImport()` invokes `populateSubjectMap()`, which normalizes character variations (`&` vs `and`, e.g. `Agriculture & Nutrition` matches `Agriculture and Nutrition`).
   - Check the **Unmapped Subject Warning Box** (`unknownSubjects`). If the spreadsheet contains a genuine typo (e.g. `Agric & Nutr`), NEYO highlights it in red.
5. **Resolve Unmapped Subjects**: Do NOT force import. Instruct the school bursar or teacher to correct `Agric & Nutr` to `Agriculture and Nutrition` in the source file or map it via the dropdown selector.
6. Check **Pathway & Mathematics Allocation Summary**: Ensure Grade 10 Senior School learners are assigned Core vs Essential Mathematics (`P.2` / `dd4-pathway-aware-math-variant-import-test.ts`).
7. Click **[ Commit Import to Database ]**. Verify `commitImport()` returns `success: true` and `rowsCreated: N`.

### 5. Expected Output
- Hundreds of `Student` records cleanly inserted into Postgres with exact `classId` and `StudentSubjectSelection` links. Zero duplicate errors on re-run.

### 6. Escalation
- If `previewImport()` returns `HTTP 500` due to spreadsheet encoding errors or over 5,000 rows, escalate to `NEYO_OPS` to run background job batching (`t5-background-job-runner-test.ts`).

### 7. SOP-CS-01 Verification Checklist
- [ ] School `Tenant` and `SchoolClass` catalog created prior to import.
- [ ] Spreadsheet uploaded to `ImportWizard` Step 2.
- [ ] `unknownSubjects` array confirmed empty (`0 unmapped warnings`).
- [ ] Grade 10 Mathematics pathway (`MATC` vs `MATE`) verified.
- [ ] Import committed and total student count verified on `Students` dashboard.

---

## SOP-DEV-01: Feature Flag Release via NEYO Ops Platform Switches (`platform-flags.service.ts`)

### 1. Purpose
To safely release new high-leverage strategic features (`Part EE: EE.1 through EE.15`) across participating schools, ensuring every idea launches switched OFF by default until NEYO Ops explicitly toggles it ON (`The Founder's Release Switch Rule`).

### 2. Owner
`FOUNDER` or `NEYO_OPS` Tier.

### 3. Inputs
- Target Feature ID (`e.g. "EE.15"` for Universal CBC Presets or `"EE.11"` for QR Gate Checkpoint).
- Verification test pass confirmation (`scripts/ee12-ee15-strategic-roadmaps-test.ts` showing `7/7 passing`).

### 4. Steps
1. Log into NEYO via `founder@neyo.co.ke` (`Role: FOUNDER`).
2. Open the **AppGrid Switcher (top-left 9 dots)** and select **NEYO Ops -> Platform Feature Switches (`platform-flags.service.ts`)**.
3. Locate the target feature flag row: `Key: eefeature:EE.15 | Label: Universal CBC/CBE Presets Engine`.
4. Verify current status is **[ Switched OFF (`Disabled`) ]** (`assertEeFeatureReleased("EE.15")` returns `false`).
5. Review school readiness and training status.
6. Toggle the master switch to **[ Switched ON (`Released Platform-Wide`) ]**.
7. NEYO emits an audit event (`auditLog.create({ action: "FLAG_TOGGLE", details: { key: "eefeature:EE.15", enabled: true } })`).
8. Open a test school account (`principal@karibuhigh.ac.ke`) and verify `Universal Presets (EE.15)` button now appears inside **CBC -> Strands tab**.

### 5. Expected Output
- Feature unlocked in real time for all school tenants without server restart or redeployment.

### 6. Escalation
- If a feature causes UI layout bugs after release, immediately toggle the flag back to **OFF** (`Disabled`) to isolate the issue, then notify engineering.

### 7. SOP-DEV-01 Verification Checklist
- [ ] Standalone test script (`scripts/ee*-test.ts`) executed and passing before toggle.
- [ ] Logged in with `FOUNDER` or `NEYO_OPS` credentials.
- [ ] Target flag located in Platform Feature Switches table.
- [ ] Flag toggled ON and `AuditLog` entry verified.
- [ ] Live school portal checked to verify feature visibility.

---

## SOP-FIN-01: M-Pesa IPN Reconciliation & Manual Receipt Delivery (`R.5` / `I.41`)

### 1. Purpose
To reconcile mobile money fee settlements, handle Safaricom Daraja API Instant Payment Notification (IPN) webhooks, and process manual receipt drop-offs when parents pay via cash or bank deposit.

### 2. Owner
School `BURSAR` / `ACCOUNTANT` / `NEYO_OPS`.

### 3. Inputs
- Safaricom Daraja IPN payload (`transactionReference`, `amount`, `phoneNumber`).
- Or physical bank deposit slip presented by parent at school reception (`Receipt Delivery R.5`).

### 4. Steps
1. **Automated M-Pesa STK / Paybill Verification**:
   - When a parent pays via **Mzazi Direct Pay (`I.41`)**, the Daraja webhook hits `/api/webhooks/mpesa`.
   - The **Biometric Finance Gate (`R.3`)** checks IPN signature and matches `phoneNumber` or `billRefNumber` (Admission Number) against `Student` ledger.
   - If matched cleanly, `Payment` record created automatically with status `VERIFIED`.
2. **Manual Receipt Delivery (`R.5`) (When parent presents physical slip)**:
   - Log in as `BURSAR`. Navigate to **Finance -> Enter Payment (`R.5`)**.
   - Search student via `StudentSearchSelect` (`mode: "insensitive"`).
   - Enter `Amount KES`, `Payment Method: BANK_DEPOSIT`, and `Bank Receipt Number`.
   - Click **[ Record & Verify Payment ]**. System checks that `Bank Receipt Number` has not been used on any prior transaction (`zero double-counting`).
3. **Installment Plan Check (`InstallmentPlanDialog` `I.99`)**:
   - If the payment fulfills an active `PromiseToPay` schedule, the system auto-marks that installment slot as `PAID` on the **Fee Promise Calendar**.

### 5. Expected Output
- Exact student fee balance updated immediately; PDF receipt generated (`A.10`) and sent via SMS to parent (`Africas Talking`).

### 6. Escalation
- If an M-Pesa transaction succeeds on the parent's phone but IPN fails due to Safaricom network timeouts, use **Central Money Reconnect (`I.49`)** inside **NEYO Ops -> Finance Diagnostics** to query transaction status by code (`e.g. SH12345678`) directly from Daraja servers.

### 7. SOP-FIN-01 Verification Checklist
- [ ] Transaction ID verified unique (`no duplicates`).
- [ ] Correct student ledger matched via `StudentSearchSelect`.
- [ ] Payment amount accurately split across outstanding `FeeItem` invoices (`partial-payment-friendly-test.ts`).
- [ ] SMS receipt dispatched and `PromiseToPay` calendar updated.

---

## SOP-SEC-01: Database Corruption Recovery & Raw SQL Migration Execution (`fix-prisma-wasm.sh`)

### 1. Purpose
To recover the database when sandboxed terminal environments wipe `node_modules` during restart or when `binaries.prisma.sh` engine downloads fail (`SSL_ERROR_SYSCALL`), restoring full-stack operation in under 60 seconds without data loss.

### 2. Owner
`FOUNDER` / Lead Technical Architect.

### 3. Inputs
- Sandboxed workspace at `/home/user/neyorepolink`.
- Chronological migration files (`prisma/migrations/*/migration.sql`).

### 4. Steps
1. **Install Embedded Postgres & JSQR Shims**:
   ```bash
   npm install jsqr --no-save && npm install --no-save embedded-postgres
   ```
2. **Initialize and Start Embedded PostgreSQL 18.4 on `127.0.0.1:5432`**:
   ```bash
   node -e 'const EmbeddedPostgres = require("embedded-postgres").default; const pg = new EmbeddedPostgres({ databaseDir: "/home/user/pgdata", port: 5432 }); pg.initialise().then(() => pg.start()).then(() => console.log("PG Started cleanly"));'
   ```
3. **Execute Raw SQL Migrations in Chronological Order**:
   Because `prisma migrate deploy` fails trying to download network binaries, execute our custom recovery script applying all 14 migrations (`20260713174433_init_postgres` through `20260717050000_ee11_qr_gate_pass`) directly via `postgres://postgres:postgres@127.0.0.1:5432/neyo` and stamping `_prisma_migrations` (`id: crypto.randomUUID(), checksum: "checksum", applied_steps_count: 1`).
4. **Patch WASM Query Engine & Driver Adapters (`fix-prisma-wasm.sh`)**:
   Ensure `previewFeatures = ["driverAdapters"]` in `schema.prisma`, stub `/tmp/dummy_engine`, and run `./scripts/fix-prisma-wasm.sh` to overwrite `default.js` with `auto-adapter-entry.js` using `PrismaPg(pool)` and `WasmPrismaClient`.
5. **Re-Seed Seed Accounts**:
   ```bash
   export $(grep -v '^#' .env | xargs) && ./node_modules/.bin/tsx prisma/seed.ts
   ```

### 5. Expected Output
- All 15 verification suites (`scripts/ee*-test.ts`) run cleanly (`126/126 checks passing`).

### 6. Escalation
- If port `5432` is already bound by a stale process, kill it using `fuser -k 5432/tcp` and restart `EmbeddedPostgres`.

### 7. SOP-SEC-01 Verification Checklist
- [ ] PostgreSQL 18.4 listening on `127.0.0.1:5432`.
- [ ] All 14 migrations recorded inside `_prisma_migrations`.
- [ ] `fix-prisma-wasm.sh` patch applied to `.prisma/client/default.js`.
- [ ] `seed.ts` executed (`Karibu High`, `Uhuru Academy`, `Mji Mpya`, `Mombasa Coast` seeded).
- [ ] `tsc --noEmit` returns 0 errors.

---

## SOP-HR-01: Staff Hiring, Role Assignment & 2FA Enrollment (`A.3 / G.34`)

### 1. Purpose
To onboard new school staff (`TEACHER`, `BURSAR`, `PRINCIPAL`, `LIBRARIAN`) or NEYO company personnel (`NEYO_OPS`, `NEYO_SUPPORT`), assign canonical roles, and enforce mandatory Two-Factor Authentication (`2FA / TOTP`) for privileged accounts.

### 2. Owner
`PRINCIPAL` (for school staff) / `FOUNDER` (for company staff).

### 3. Inputs
- Staff full name, email address (`e.g. wanjiru@karibuhigh.ac.ke`), national ID, and target role (`TEACHER`).

### 4. Steps
1. Log into **HR & Payroll -> Staff Management (`B.9`)**.
2. Click **[ + Add New Staff ]**. Enter basic demographics and assign canonical role (`Role: TEACHER`).
3. **Verify Academic Record Immutability Restrictions**: Ensure that `Role: TEACHER` accounts do not get elevated to `PRINCIPAL` unless they explicitly require leadership deletion powers (`cant be deleted anyhowly`).
4. **Enforce 2FA Enrollment (`G.34 / totp.service.ts`) (For `PRINCIPAL`, `BURSAR`, `FOUNDER`, `NEYO_OPS`)**:
   - Upon first login, NEYO intercepts the user with `TotpChallengeModal`.
   - User scans QR code using Google Authenticator / Authy on their phone and enters the 6-digit OTP code (`verifyTotp`).
   - Backup recovery codes (`RecoveryCode`) generated and saved by user.

### 5. Expected Output
- Secure user account provisioned with role-based navigation visibility (`H.2`) and active 2FA defense.

### 6. Escalation
- If a staff member loses their 2FA authenticator device, `PRINCIPAL` or `NEYO_OPS` must verify physical identity before running `resetTotpForUser(userId)` inside `totp.service.ts`.

### 7. SOP-HR-01 Verification Checklist
- [ ] Canonical role selected from `ROLES` registry (`roles.ts`).
- [ ] `StaffProfile` linked with salary and tax PIN (`KRA PIN`).
- [ ] 2FA (`TOTP`) enrolled for all leadership/finance roles.
- [ ] Welcome SMS dispatched with initial login credentials (`Karibu2026!`).
