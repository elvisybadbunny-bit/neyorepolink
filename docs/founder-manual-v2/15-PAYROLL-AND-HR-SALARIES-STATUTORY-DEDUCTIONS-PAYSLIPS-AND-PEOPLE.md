# NEYO Founder Manual V2 — Module 15: Payroll & Human Resources

**Pages:** `/payroll`, `/staff`, `/my-payslips`  
**Last verified against code:** 2026-07-18

---

## 1. Separate records

- User/role/access: Module 04.
- StaffProfile/contract/leave/appraisal/training: HR.
- StaffSalary: recurring salary inputs.
- PayrollRun: one month, Draft/Approved.
- Payslip: frozen calculation per staff/run.

Changing HR role does not change salary; changing salary does not rewrite old approved payslip.

---

## 2. Access

Payroll page allows staff managers or finance structure managers. Ordinary staff do not see all
payroll. New **My Payslips** in User Menu gives every school staff member private approved own slips.
Payslip PDF route checks own user or authorized administrator.

---

## 3. Payroll tabs

- Payroll Runs
- Salaries

## 4. Salaries tab

Lists active staff, configured/not set, basic/allowances/deductions. **Edit** opens salary dialog.

Fields:

- Basic salary
- House allowance
- Transport allowance
- Other allowance
- SACCO deduction
- Loan deduction

**Save salary** upserts StaffSalary and audits. Amounts KES/month. Confirm contract/approval; do not
use negative values or put one-off overtime into recurring allowances.

---

## 5. Run Payroll

Press **Run payroll**.

Fields:

- Period `YYYY-MM`
- Per-staff approved overtime KES

Summary shows staff count and statutory computation note. **Run Payroll** creates Draft PayrollRun
and Payslip rows. Duplicate period blocked.

Review every row before approval. Draft can be recalculated only through designed workflow; do not
edit approved database rows.

---

## 6. Statutory calculation

Current service calculates:

- Gross = basic + allowances + overtime
- NSSF employee Tier I/II (current coded caps/rate)
- SHIF/SHA 2.75%, minimum KES 300
- Affordable Housing Levy 1.5%
- Taxable income after coded deductions
- PAYE bands and monthly personal relief
- SACCO and loan deductions
- Net pay

**Critical:** rates are code constants and must be reviewed against current Kenyan Gazette/KRA/SHA/
NSSF guidance before each statutory period. This manual does not certify rates as legally current.

---

## 7. Payroll Run list/detail

Run cards show period, staff count, gross, PAYE, net and Draft/Approved. Click card.

Detail table:

- Staff
- Gross
- PAYE
- SHIF
- NSSF
- AHL
- Net
- Payslip link

**All Runs** returns.

---

## 8. Approve & Lock

On Draft press **Approve & lock**.

- status APPROVED;
- approvedAt set;
- second approval blocked;
- payslips become visible to staff `/my-payslips`;
- calculations freeze as historical evidence.

Before approval reconcile staff list, recurring salary, overtime, statutory deductions, SACCO/loan,
net and funding/bank file.

Approval does not itself send bank/M-Pesa salary unless separate payment integration executes.

---

## 9. Payslip PDF

Admin detail or staff **My Payslips → Download PDF**. Branded PDF shows earnings, statutory/other
deductions, net, confidential marker and QR verification. Staff can only download own id.

Do not email/share payslip to wrong address; treat salary as confidential.

---

## 10. My Payslips — gap fixed

Previously backend allowed staff to download their own payslip only if they somehow knew its id, but
no staff-facing list/page linked to it. Added:

- User Menu **My payslips** for school staff, excluding parents/students/company roles;
- `/my-payslips` server page with staff-role guard;
- only current tenant + own user + APPROVED runs;
- period-sorted cards with gross/deductions/net;
- Download PDF using existing secure route;
- empty state.

No schema/API duplication required.

---

## 11. HR Directory and lifecycle

Module 04 covers Invite, HR record, role, appraisals, training, discipline, leave, substitutes,
recruitment, deactivate/reactivate/terminate/transfer assignments. Payroll consequences:

- inactive/terminated staff should not enter future run list;
- historical payslips remain;
- contract end does not erase payroll;
- transfer teaching assignments is separate from salary;
- reactivation needs salary/contract review.

---

## 12. Leave and payroll

Core payroll currently uses salary/overtime, not a complete automatic unpaid-leave proration engine.
Approved leave Calendar/substitutes do not silently deduct pay. Any unpaid leave adjustment requires
approved salary input/process and audit; do not manually change statutory result without policy.

---

## 13. BOM Payroll distinction

Finance → BOM Payroll extension provides BOM-specific statutory calculations and bank CSV manifest.
Main `/payroll` uses StaffSalary/PayrollRun/Payslip. Avoid running both for same staff/period unless
one is deliberate export of same approved source; prevent duplicate salary payment.

---

## 14. Missing external operations

Checklist items such as M-Pesa B2C bulk salary, annual P9 certificates or bank transfer execution
must be treated by their actual implementation/activation status. A generated CSV/payslip is not
proof money moved or statutory filing occurred.

---

## 15. Full monthly example

1. HR confirms active staff/contracts.
2. Finance/leadership updates salary records and approved overtime.
3. Run `2026-07` Draft.
4. Compare gross/statutory/net to approvals and prior month.
5. Correct source salary/overtime; rerun through valid process if needed.
6. Approve & Lock.
7. Execute authorized bank/payment process separately.
8. Staff opens User Menu → My Payslips → Download own PDF.
9. Reconcile bank/payroll/statutory reports; preserve evidence.

---

## 16. Common errors

| Problem | Check |
|---|---|
| Payroll forbidden | staff.manage or finance.manage_structure |
| Staff missing | inactive/role/user record |
| No salary | configure Salaries first |
| Duplicate run | period already exists |
| Net unexpected | allowances/overtime/SACCO/loan and current coded rates |
| Approve disabled | already approved/busy/permission |
| Staff sees no slip | run not approved, wrong user/tenant |
| PDF forbidden | only own or payroll admin |
| Rate changed by law | update/test constants before period; qualified review |
| Salary not paid | payroll approval is not bank/B2C settlement |

---

## 17. Founder verification checklist

1. Salary create/update and invalid amounts.
2. Gross-to-net spot calculations at low/mid/high salary.
3. Overtime included once.
4. SACCO/loan net deduction.
5. Duplicate period blocked.
6. Draft detail totals equal slips.
7. Approve lock/reapprove blocked.
8. Admin payslip download.
9. Staff User Menu My Payslips only own approved slips (fixed).
10. Parent/student/company roles no My Payslips link/page.
11. Cross-tenant payslip id blocked.
12. Inactive staff excluded future runs, history preserved.
13. BOM/main payroll duplicate-payment review.
14. Mobile/glass/print/error/empty states.

---

## 18. Gap fixed

Added secure self-service payslip list and User Menu entry. This closes the existing service-without-
entry-point gap while reusing real Payslip/PayrollRun and PDF authorization.

---

## 19. Edit points

- Payroll page/client/service/API/PDF route
- Statutory constants: top of `payroll.service.ts`
- Self-service: `src/app/(app)/my-payslips/page.tsx`, `user-menu.tsx`, `topbar.tsx`
- HR/staff lifecycle: Module 04 files
- BOM payroll: extension suite/services
