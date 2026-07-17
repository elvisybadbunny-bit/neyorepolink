# Level 11 — Human Resources, Team Structure & Employee Handbook
**Document Id**: `NEYO-BIB-L11`  
**Owner**: NEYO Executive Leadership & People Operations  
**Status**: Living Institutional HR Manual  
**Last Updated**: 2026-07-17  

---

## 1. Company Organizational Structure & Role Tiers (`Y.2`)

To run NEYO securely while distinguishing between the software company's internal staff (`company: NEYO`) and participating school staff, NEYO enforces a strict separation of role tiers inside `src/lib/core/roles.ts`:

```
+----------------------------------------------------------------------------------------------------+
|                                    NEYO COMPANY GOVERNANCE TIERS                                   |
+----------------------------------------------------------------------------------------------------+
| 1. FOUNDER (`Role: FOUNDER` / `SUPER_ADMIN`)                                                       |
|    - Unrestricted access across all school tenants, financial ledgers, and master switches (`EE.15`). |
|    - Sole authority to execute permanent database deletions or change ownership tiers (`A.3`).       |
+----------------------------------------------------------------------------------------------------+
| 2. NEYO OPERATIONS (`Role: NEYO_OPS`)                                                              |
|    - Broad internal operational tooling and system health diagnostics (`Storage Vault I.56`).      |
|    - Can toggle release flags (`assertEeFeatureReleased`) and run background job runners (`t5`).   |
|    - Cannot access founder personal ledgers or execute permanent tenant drop operations.           |
+----------------------------------------------------------------------------------------------------+
| 3. NEYO SUPPORT (`Role: NEYO_SUPPORT`)                                                             |
|    - Customer-facing tier: school onboarding (`ImportWizard`), live demonstrations (`seed.ts`),    |
|      inquiry tickets, and custom feature request vetting (`T.3`).                                  |
|    - Strictly blocked from altering subscription pricing (`Part V`) or modifying platform flags.   |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Hiring & Interview Guide: Evaluating AI Collaboration Aptitude

Because NEYO is built with advanced human-AI collaboration led by a solo founder specialized in **Project Planning and Management (PPM)**, traditional whiteboard coding algorithms (`LeetCode`) are poor indicators of engineering fit.

### 2.1 The NEYO Engineering & Operations Evaluation Rubric
When interviewing candidates for engineering or technical operations (`NEYO_OPS`), evaluate against three core competencies:
1. **Systems Thinking & Work Breakdown Structure (`WBS`) Discipline**:
   - *Interview Prompt*: *"We need to build a feature that scans paper quizzes (`EE.9`) and converts them to 4-point CBC rubrics (`EE, ME, AE, BE`). Walk through your execution plan."*
   - *Target Signal*: Candidate immediately organizes the task into database schemas (`schema.prisma`), validation rules (`Zod`), backend services (`withTenant`), and 4 UX states (`The 8-Chunk Plan`).
2. **AI Command & Review Rigor**:
   - *Interview Prompt*: *"How do you prevent AI coding models from generating technical debt, hallucinations, or unverified mocks?"*
   - *Target Signal*: Candidate explains strict typecheck enforcement (`tsc --noEmit`), standalone verification scripts (`126/126 checks passing`), zero placeholders (`PROMPT 2`), and mandatory human code review before merging.
3. **Kenyan Education Domain Empathy**:
   - *Target Signal*: Candidate understands the differences between Core vs Essential Mathematics (`Grade 10 Senior School P.2`), KNEC placement lookups (`EE.12 22263 style`), and M-Pesa STK Push workflows (`I.41`).

---

## 3. Internal Job Descriptions

### 3.1 NEYO Customer Support & Onboarding Specialist (`Role: NEYO_SUPPORT`)
- **Location**: Nairobi, Kenya (`Hybrid / Field`).
- **Responsibilities**:
  - Lead school onboarding using the `ImportWizard` Step 2 (`BB.4 / DD.4`), guiding bursars to correct unmapped subject warnings (`Agric & Nutr -> Agriculture and Nutrition` via `populateSubjectMap`).
  - Run live interactive product demonstrations (`seed.ts` demo schools: `Karibu High`, `Uhuru Academy`).
  - Triage school trouble tickets and assist teachers in setting up **1-Click Universal Presets (`EE.15`)**.
- **Qualifications**: Excellent verbal and written communication in English and Swahili; deep patience and empathy for non-technical school staff.

---

## 4. Performance Reviews & Internal Appraisal Tooling (`B.9` / `Appraisal`)

NEYO uses its own internal HR & Payroll module (`B.9` / `StaffProfile` / `Appraisal` / `LeaveRequest`) to manage employee performance and staff leave:
- **Quarterly OKR Reviews**: Every NEYO staff member sets objective key results tracked inside their `StaffProfile`.
- **Automated Leave & Substitute Tracking (`SubstituteAssignment` / `t12`)**: When an internal staff member or school teacher requests annual leave (`LeaveRequest`), the system automatically checks schedule continuity and suggests available substitute allocations (`0 classroom downtime`).

---

## 5. Security & Offboarding SOP (`SOP-HR-02`)

When an employee or contractor leaves NEYO (`or when a school teacher leaves a participating institution`):
1. **Instant Session Revocation**: `FOUNDER` or `PRINCIPAL` immediately deactivates the user account (`active: false` inside `User`).
2. **Academic Immutability Enforcement**: Verify that no historical academic records (`CbcAssessment`) or financial invoices were deleted prior to departure (`cant be deleted anyhowly`).
3. **2FA & API Key Rotation (`StorageVault` / `totp.service.ts`)**: Rotate any internal shared integration keys (`Africas Talking`, `Daraja Consumer Secret`) inside `StorageVault` if the departing employee had `NEYO_OPS` access.
