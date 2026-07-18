# NEYO Bible — Level 11: Data Architecture & Domain Model

*Created 2026-07-18 by inspecting `prisma/schema.prisma` (341 models), tenant scoping, migrations,
and domain services. This is an orientation map—not a replacement for the Prisma schema.*

## 1. Database foundation

NEYO uses one PostgreSQL database through Prisma 5.17.0. `Tenant` is the school boundary. Most
school-owned rows contain `tenantId`; platform/company rows intentionally do not. Relations,
unique keys, indexes, status fields, timestamps, and JSON payloads encode operational history.

The production migration chain currently contains 19 tracked directories, beginning with
`20260713174433_init_postgres` and ending with
`20260718002715_schema_drift_fix_ideas13_24_and_long_index_names` at this verification.

## 2. Tenancy categories

### Tenant-owned

School data such as `Student`, `Invoice`, `AttendanceRecord`, `Subject`, and `ClinicVisit` is
registered in `TENANT_OWNED_MODELS`. `tenantDb()` injects scope and stamps creates.

### Platform-wide

Company configuration/operations such as `PlatformFlag`, some pricing settings, and pre-tenant
quote requests are deliberately queried across schools by authorized company roles.

### Pre-tenant or mixed lifecycle

Prospects, contracts, and customer threads may have nullable tenant association until onboarding.
Nullable tenancy must be a documented business reason, not a shortcut around isolation.

## 3. Identity, access, and audit domain

Core models:

- `User`, `Session`, `OtpCode`, `MagicLink`, `TotpChallenge`, `RecoveryCode`.
- `Credential`, `WebAuthnChallenge`, `OAuthConnectedAccount`, `OAuthState`.
- `LinkedGuardianAccount`, `BiometricActionTicket`.
- `TenantModule`, `IdSequence`, `AuditLog`, `IdempotentRequest`.

`User` carries the canonical role string and tenant association. `Session` is the server-side
session authority. Auth challenges are short-lived/single-use. `IdSequence` produces tenant
business ids. `AuditLog` is append-only evidence, not editable notes.

## 4. School, people, and admissions

- `Tenant`: school identity, configuration, curriculum, branding, subscription linkage.
- `SchoolClass`: level/stream/capacity/class-teacher structure.
- `Student`, `Guardian`, `StudentGuardian`: learner and family graph.
- `StudentDocument`, `StudentRequirement`, `StudentCustomField`.
- `AdmissionApplication`, `AdmissionInquiry`, `EntranceExamPaper`.
- `StudentImport`, `ClassAllocationRun`, `StudentTransfer`, `PromotionRun`, `ClassYearHistory`.
- `StaffProfile`, `LeaveRequest`, `JobPosting`, `JobApplication`, `Appraisal`, `TrainingRecord`.

The guardian is reusable across siblings. Transfers/promotions retain history rather than replacing
student identity. Imports record batch outcomes and exceptions. Admissions create student records
only at the legitimate admit step.

## 5. Curriculum and academics

Reference/configuration:

- `Curriculum`, `EducationLevel`, `GradeBand`, `LearningArea`.
- `Department`, `Subject`, `AcademicTerm`.
- `CbcStrand`, `CbcSubstrand`, `CbcCommentBankEntry`.
- `CompetencyGroup`, `Competency`, `Rubric`, `RubricLevel`.

Evidence/teaching:

- `LessonPlan`, `LessonResource`, `LessonObservation`, `SyllabusTopic`.
- `CbcAssessment`, `AssessmentType`, `AssessmentPlan`, `AssessmentRecord`,
  `AssessmentEvidence`, `CompetencyEvidence`.
- `SkillsPassportEntry`, `PortfolioItem`, `LearnerJourneyPin`, `StudentGoal`.
- `TeacherRecordOfWork`, `CommunityServiceActivity`, `CareerDiscoveryRecord`.

Curriculum configuration describes what can be taught. Assessment and observation rows are learner
evidence. A syllabus “covered” claim is stronger when backed by delivered plans/assessments.

## 6. Timetable, allocation, and venues

- `TeacherSubject`, `ClassSubjectNeed`, `TeacherWorkloadRule`, `TeacherContinuityAssignment`.
- `TimetableConfig`, `TimetableConstraint`, `TeacherTimeOff`, `BlockedTimetableSlot`.
- `Venue`, `VenueSessionHistory`.
- `CombinationGroup`, `CombinationGroupClass`.
- `ElectiveBlock`, `ElectiveBlockClass`, `ElectiveBlockSlot`,
  `ElectiveBlockSlotSubject`, `ElectiveBlockAutoBuildRun`.
- `TimetableGenerationJob`, `TimetableSlot`, `ClassCapacityOverflowRun`.
- `ExamTimetableGeneratorRun`, `ExamTimetableSlot`.

Input models express school policy and real assignment. Generation-run/history models preserve what
an engine attempted. `TimetableSlot` is the resulting schedule. Elective blocks represent parallel
subject choices, while combination groups represent shared teaching arrangements; they are not
interchangeable.

## 7. Exams, questions, and learning

- `Exam`, `ExamSubject`, `ExamResult`, `ExamReleaseApprovalRequest`.
- `ScannedExamPaper`, `ExamMaterialRecord`, `PaperQuizFormativeBatch`.
- `QuestionBankEntry`, `QuestionBankAttempt`.
- `InterSchoolContest`, `ContestQuestion`, `ContestRegistration`, `ContestAttempt`.
- `Quiz`, `QuizQuestion`, `QuizAttempt`, `Homework`, `HomeworkSubmission`.
- `LearningVideo`, `LearningVideoSession`, `OnlineClassSession` and participant/signal/question
  models.
- `MarksPortal`, `TermAggregationRule`, `MasterReportCard`, `SubjectPaperConfig`, `PaperResult`.

Draft marks remain private until release. Scan-derived structures retain reviewable data. Question
attempts and contest attempts preserve outcomes without mutating the source question.

## 8. School finance and payments

- `FeeStructure`, `FeeItem`, `Invoice`.
- `PaymentCredential`, `Payment`, `TeacherCashPaymentRequest`.
- `PromiseToPay`, `FamilyPaymentSplitPlan`, `FamilyPaymentSplitItem`.
- `SchoolActivity`, `SchoolActivityClass`, `ActivityParticipant`.
- `TreasuryCheckAndBankSlip`, `MpesaSuspenseReceipt`.
- `ExpenseCategory`, `CostCenter`, `Expense`.

`Invoice` is the common student-charge ledger. `Payment` is provider/manual settlement evidence and
may link to an invoice. Promises are not payments. Suspense receipts are not allocated payments
until confirmed.

## 9. NEYO subscription and revenue

- `Subscription`, `SubscriptionPayment`, `UsageCounter`, `TenantPricingSnapshot`.
- `SchoolQuoteRequest`, `DiscountCampaign`, `ReferralCredit`, `InfluencerCode`,
  `InfluencerCommission`, `SmsMarginLedger`.
- `NeyoContract`, `NeyoCostSnapshot`, `TenantHealthSnapshot`.

These represent NEYO billing schools, distinct from school invoices to families. Pricing snapshots
preserve the basis at a point in time; usage counters support quotas; referrals/campaigns retain
commercial adjustments.

## 10. Communication and calendar

- `Conversation`, `ConversationParticipant`, `Message`, `MessageAcknowledgement`,
  `MessageDeliveryReport`.
- `IntercomCall`, `ClassVoiceRoom`, `ClassVoiceParticipant`, `ClassVoiceSignal`.
- `Notification`, `NotificationPreference`, `NotificationTemplate`, `WebPushSubscription`.
- `BulkMessage`, `TeacherCommsApprovalRequest`.
- `CalendarEvent`, `CalendarFeedToken`, `MasterSchoolDiaryEvent`.

Conversation membership controls message access. Notifications are delivery/inbox records, not a
substitute for the source business action. Feed tokens are secrets and require revocation handling.

## 11. Campus operations

### Library
`LibraryBook`, `LibraryBookCopy`, `BookIssue`, `CoursebookAllocation`, `TextbookFineRecovery`,
`LibraryImport`.

### Hostel
`Hostel`, `HostelRoom`, `HostelAllocation`, `HostelAttendance`, `BoardingExeatPass`,
`HostelBedAllocation`, `HostelVandalismInspection`.

### Transport/fleet
`TransportRoute`, `TransportShift`, `TransportAssignment`, `TransportRouteChangeRequest`, `Driver`,
`Vehicle`, `VehicleMaintenance`, `FuelLog`, `GpsBusLocation`, `FleetVehicleLog`, `FleetFuelEntry`.

### Stores/cafeteria/assets
`Store`, `StockItem`, `StockBatch`, `StockMovement`, `Asset`, `AssetMaintenance`, `MealPlanEntry`,
`MealCard`, `UniformOrder`, `UniformSize`, `CapitalAssetRegistry`, `LabReagentRegister`.

### Safety/health
`DisciplineIncident`, `Suspension`, `CounselingNote`, `StudentMedical`, `ClinicVisit`,
`MedicationPlan`, `MedicationDose`, `InfirmaryDosageLog`, `GatePass`, `PickupPerson`,
`AltPickupAuthorization`, `PanicAlert`, `VisitorLog`, `VisitorGateLog`, `LostAndFoundItem`.

Each domain retains its own operational state, but chargeable student outcomes post to the common
invoice system and family-safe views use row-scoped services.

## 12. Files, documents, APIs, and automation

- `StoredFile`, `StorageVaultBlob`, `StorageUsageSnapshot`, `StorageArchiveTier`,
  `StorageOptimizerRun`, `TenantStorageProvider`.
- `DocumentVerification`, `PrintJob`, `PrintApprovalRequest`.
- `ApiKey`, `ApiUsageLog`, `WebhookSubscription`, `WebhookDelivery`.
- `JobRun`, `BackgroundJob`.

`StoredFile` is metadata; bytes live in local dev storage or R2. Content-addressable blobs support
deduplication. Document verification provides public authenticity references without publishing
all underlying data. Webhook deliveries preserve retries/results. Job runs preserve execution
state.

## 13. Bundi data domain

- `BundiImportUnlockCode`, `BundiFieldTemplate`, `BundiImportSession`.
- `BundiLearnedCorrection`, `BundiDocumentTemplate`.
- `BundiOcrTelemetryAndQuota`, `BundiScanTopUpOrder`.

Import sessions separate extraction, review, and commit. Learned corrections/templates are scoped
operational aids and must never bypass current validation. Telemetry/top-ups enforce scan quota.

## 14. Company operations

`NeyoIntegrationSecret`, `NeyoCustomerThread`, `NeyoCustomerMessage`, `NeyoYoutubePost`, `NeyoIdea`,
`NeyoBuildLog`, `NeyoMetricSnapshot`, `NeyoFounderOpsEntry`, `NeyoCustomerInterview`,
`NeyoTeamMember`, `FounderAiQuery`, `ComplianceRequest`, `CustomFeatureRequest`,
`SupportImpersonationToken`, `SupportImpersonationLog`, `PlatformMaintenanceWindow`,
`TenantSmsTelemetry`, `FeatureReleaseControl`, `PlatformFlag`, `PlatformSetting`.

These are company control-plane records. Access is through company roles, not ordinary school
leadership. Some intentionally span tenants.

## 15. State and history design patterns

- **Status transitions:** admissions, subscriptions, exams, procurement, passes.
- **Append-only evidence:** audit, attempts, observations, deliveries, dose logs.
- **Idempotent upsert:** daily attendance, callbacks, repeatable seeds/config.
- **Soft delete:** selected recoverable records through the Recycle Bin.
- **Cancellation/reversal:** preserve original transaction and add a closing state.
- **Snapshot:** pricing, metrics, generation runs, frozen quote details.
- **JSON payload:** flexible frozen input/output where relational querying is not primary; validate
  before parsing and avoid storing secrets casually.

## 16. Schema-change protocol

1. Define ownership and retention.
2. Add relations/constraints/indexes.
3. Register tenant-owned model.
4. Generate additive migration.
5. Validate migration against populated Postgres.
6. Update service and Zod types.
7. Add tenant/role/idempotency tests.
8. Run migrate deploy/status and cache-free typecheck.
9. Never edit an already-applied production migration to change history.

## 17. Query rules

- Use `tenantDb()` for tenant-owned models.
- Use raw `db` only for deliberate company-wide work or inside already-explicit tenant checks.
- Avoid `findUnique` assumptions that bypass tenant verification.
- Select only fields needed by public/family APIs.
- Paginate high-volume histories.
- Use transactions for coupled writes.
- Avoid N+1 loops in school-wide dashboards/generation hot paths.

## 18. Maintenance rule

When schema changes, update the relevant domain paragraph rather than appending a migration diary.
The Prisma schema remains authoritative; this level remains a conceptual map for humans.
