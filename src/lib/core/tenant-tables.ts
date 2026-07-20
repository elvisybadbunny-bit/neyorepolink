/**
 * Registry of which Prisma models are directly tenant-owned (carry `tenantId`).
 * `tenantDb()` uses this to auto-scope reads and stamp writes.
 *
 * As future features add tenant-owned models (Student, Invoice, AttendanceRecord,
 * ...), ADD THEM HERE so isolation is enforced automatically.
 *
 * NOT listed (intentionally):
 *  - Tenant: the root table itself.
 *  - Session/Credential/RecoveryCode/TotpChallenge: scoped via userId -> User.
 *  - OtpCode/MagicLink/WebAuthnChallenge: pre-authentication (no tenant yet).
 *  - CalendarFeedToken (M.3): the public webcal:// feed route looks this up
 *    with NO session at all (a phone's Calendar app polls it unauthenticated,
 *    like OtpCode/MagicLink) — queried directly via `db`, never `tenantDb()`.
 *  - BundiImportUnlockCode (M.5): minted by NEYO Ops (no tenant context at
 *    creation for company-wide codes) and redeemed by CODE lookup, not by
 *    tenant — queried directly via `db`, same reasoning as API keys/webhooks.
 */
//  - NeyoTeamMember (Y.2): a real NEYO company-level access-control record
//    (which extra permissions a NEYO_OPS/NEYO_SUPPORT account has), never
//    scoped to a school's tenant even though the underlying User row is
//    tenant-owned for storage — queried directly via `db`.
//  - PathwayGuideSession/PathwayGuidePayment (Y.1): a real public outsider
//    with NO NEYO account/tenant at all can run a genuine guidance session,
//    so tenantId is nullable and queried directly via `db`, same reasoning
//    as SchoolQuoteRequest above.
export const TENANT_OWNED_MODELS = [
  "user",
  "idSequence",
  "auditLog",
  "tenantModule",
  "subscription",
  "usageCounter",
  "paymentCredential",
  "payment",
  "notification",
  "webPushSubscription",
  "notificationTemplate",
  "conversation",
  "message",
  "messageAcknowledgement",
  "messageDeliveryReport",
  "intercomCall",
  "storedFile",
  "documentVerification",
  "qrScanEvent", // N.2 — QR hardware scan audit trail + duplicate-scan guard
  "idempotentRequest", // Z.1 — real offline-safe replay ledger for non-naturally-idempotent create actions (Gate Pass, Visitor sign-in)
  "venue", // Z.3 — real Venue/Lab pool for timetable venue assignment + conflict checking
  // BB.4 — a real, SERIOUS, PRE-EXISTING security gap found and fixed while
  // building BB.4: these 5 real CBE pathway/subject-selection models
  // (P.1/P.2/L.4, all pre-dating this session) were NEVER registered here
  // — silently un-scoped since the day they were created, the exact same
  // class of bug found and fixed for other models during AA.1/AA.2 and
  // (retroactively) BB.3's own build. Confirmed via a real end-to-end
  // BB.4 verification script that a genuinely cross-tenant write was
  // possible before this fix. Fixed by adding all 5 immediately.
  "pathway",
  "pathwaySubjectRequirement",
  "studentPathwayPreference",
  "subjectSelectionPortal",
  "studentSubjectSelection",
  "apiKey",
  "webhookSubscription",
  "webhookDelivery",
  // NOTE: "apiUsageLog" (Part X — Developer Center 2.0) is DELIBERATELY NOT
  // tenant-owned — a genuinely failed/unauthenticated real API request has
  // no resolved tenant at all (tenantId: null), same "no single active
  // tenant" reasoning as schoolQuoteRequest/storageOptimizerRun above —
  // queried directly via the raw `db` client, never tenantDb().
  "calendarEvent",
  "visitorLog",
  "admissionInquiry",
  "phoneMessage",
  "schoolClass",
  "student",
  "guardian",
  "studentGuardian",
  "studentDocument",
  "studentRequirement",
  "studentImport",
  "studentCustomField", // M.4 — school-defined extra import fields per student
  "bundiFieldTemplate", // M.5 — school-described register field mapping
  "bundiImportSession", // M.5 — Bundi handwritten import sessions (cost/usage tracked)
  "studentTransfer",
  "attendanceRecord",
  "principalDelegationTask",
  "promotionRun",
  "classYearHistory", // AA.3
  "teacherAllocationReviewRun", // AA.3
  "classGroupingRule",
  "teacherWorkloadRule",
  "teacherContinuityAssignment",
  "teacherTransferImpact",
  "admissionApplication",
  "staffAttendance",
  "department",
  "subject",
  "academicTerm",
  "curriculum",
  "educationLevel",
  "gradeBand",
  "learningArea",
  "timetableSlot",
  "dutyRosterEntry",
  "lessonPlan",
  "lessonObservation",
  "lessonResource",
  "homework",
  "classNote",
  "homeworkSubmission",
  "quiz",
  "quizQuestion",
  "quizAttempt",
  "forumThread",
  "forumPost",
  "bulkMessage",
  "teacherCommsApprovalRequest",
  "libraryBook",
  "libraryBookCopy",
  "bookIssue",
  "hostel",
  "hostelRoom",
  "hostelAllocation",
  "hostelAttendance",
  "transportRoute",
  "driver",
  "vehicle",
  "gpsBusLocation",
  "cctvCamera",
  "hardwareDeviceConnection",
  "vehicleMaintenance",
  "fuelLog",
  "transportAssignment",
  "transportShift", // T.8 — per-route real shifts (morning/afternoon, own vehicle/driver/capacity)
  "transportRouteChangeRequest", // T.8 — real parent-initiated route/shift change requests
  "substituteAssignment", // T.12 — real date-scoped substitute-teacher coverage overlays for approved leave
  "store",
  "stockItem",
  "stockBatch",
  "stockMovement",
  "asset",
  "mealPlanEntry",
  "mealCard",
  "cafeteriaFeePlan", // T.9 — real per-level default feeding cost
  "cafeteriaEnrollmentRequest", // T.9 — real parent-portal enroll/cancel requests
  "teacherCashPaymentRequest", // T.10 — real teacher-submitted pending cash entries
  "customFeatureRequest", // T.3 — real school-requested custom feature pipeline
  "backgroundJob", // T.5a — real generic long-task tracking (bulk imports, batch PDFs, timetable regen)
  "uniformOrder",
  "uniformSize", // B.25 per-size uniform stock
  "assetMaintenance", // B.25 asset service/repair log
  "supplier", // B.25 supplier records
  "supplierContract", // B.25 supply contracts w/ expiry
  "purchaseRequest", // B.25 procurement
  "purchaseQuote",
  "purchaseOrder",
  "expenseCategory", // B.25 expenses
  "costCenter",
  "expense",
  "disciplineIncident",
  "suspension",
  "counselingNote",
  "studentMedical",
  "clinicVisit",
  "medicationPlan",
  "medicationDose",
  "printJob",
  "printApprovalRequest",
  "cafeteriaTable",
  "cafeteriaQueueEntry",
  "gatePass",
  "pickupPerson",
  "altPickupAuthorization",
  "ownerApprovalRequest",
  "panicAlert",
  // NOTE: PlatformFlag is deliberately NOT here — it is NEYO-company global.
  "exam",
  "examResult",
  "examReleaseApprovalRequest",
  "assessmentType",
  "assessmentPlan",
  "assessmentRecord",
  "assessmentEvidence",
  "competencyGroup",
  "competency",
  "competencyEvidence",
  "rubric",
  "rubricLevel",
  "skillsPassportEntry",
  "portfolioItem",
  "learnerJourneyPin",
  "cbcStrand",
  "cbcAssessment",
  // EE.1/EE.2 — real CBC sub-strands and the rubric-driven comment bank.
  // Registered the MOMENT the models exist, before any service code uses
  // them, per the standing lesson from AA.1/AA.2/AA.6/BB.4's own prior
  // cross-tenant-leak findings in this project's history.
  "cbcSubstrand",
  "cbcCommentBankEntry",
  "cbeCurriculumDesign",
  "cbeDeliverySession",
  "cbeDeliveryEvidence",
  "cbeIntervention",
  "feeStructure",
  "invoice",
  "staffSalary",
  "payrollRun",
  "staffProfile",
  "leaveRequest",
  "jobPosting",
  "appraisal",
  "disciplinaryRecord",
  "trainingRecord",
  "termPulse", // G.15 Term Trends Pulse (weekly leadership digest)
  "savedView", // G.8 Saved filters / saved views per list
  "teacherSubject",
  "classSubjectNeed",
  "timetableConfig",
  "masterReportCard",
  "combinationGroup",
  "combinationGroupClass",
  // AA.1 — real Elective/Options Block engine models. A REAL, SERIOUS
  // cross-tenant data-leak bug was found live during this session's own
  // testing (a Karibu High principal could see Kilimo Day Secondary
  // School's real Options Block data via GET /api/academics/timetable/
  // elective-blocks) — these 4 models were never registered here when
  // AA.1 was built, so tenantDb() silently never scoped them by tenantId
  // at all. Fixed by registering them, exactly like every other real
  // tenant-owned model in this list.
  "electiveBlock",
  "electiveBlockClass",
  "electiveBlockSlot",
  "electiveBlockSlotSubject",
  "electiveBlockAutoBuildRun", // BB.2
  "classCapacityOverflowRun", // BB.3
  // AA.2 — real Teacher Allocation Import history.
  "teacherAllocationImport",
  "timetableConstraint",
  "teacherTimeOff",
  // AA.6 — Hard-blocked timetable slots. CRITICAL LESSON (re-learned live via
  // this feature's own regression test): forgetting to register a new
  // tenant-owned model here is a genuine cross-tenant data leak, not a
  // theoretical one — a debug script confirmed tenant B could read tenant
  // A's rows back through tenantDb() before this line was added. Same exact
  // bug class previously found for pathway/pathwaySubjectRequirement/
  // studentPathwayPreference/subjectSelectionPortal (BB.4) and AA.1/AA.2.
  "blockedTimetableSlot",
  "timetableGenerationJob",
  "seniorLearnerTimetableProof",
  "timetableGovernanceDecision",
  // AA.8 — lab reshuffle/rotation-memory history. Same lesson as AA.1/
  // AA.2's own cross-tenant-leak finding: never skip registering a new
  // tenant-owned model here, or its rows silently become visible/queryable
  // across tenant boundaries via the generic tenant-scoped data helpers.
  "venueSessionHistory",
  "onlineClassSession",
  "onlineClassParticipant",
  "onlineClassSignal",
  "onlineClassQuestion",
  "learningVideo",
  "learningVideoSession",
  "classVoiceRoom",
  "classVoiceParticipant",
  "classVoiceSignal",
  "syllabusTopic",
  "examTimetableGeneratorRun",
  "examTimetableSlot",
  "examMaterialRecord",
  "promiseToPay",
  "reportCardDayCheckIn",
  "publicSiteSettings",
  "publicSiteLeader",
  "publicSiteTestimonial",
  "publicSiteGalleryImage",
  "publicSiteActivity",
  "newsPost",
  "smsMarginLedger", // M.2 SMS margin revenue ledger
  "referralCredit", // M.1 referral engine credit ledger
  "influencerCommission", // T.6 — real per-school commission owed to an influencer
  "familyPaymentSplitPlan", // T.14 — real multi-child payment split plans
  "schoolActivity", // R.6 — School Activities/Trips ("Form 4 trip"-style optional fee tracker)
  "schoolActivityClass", // R.6 — which real classes an activity's roster is drawn from
  "activityParticipant", // R.6 — one real roster row per real student per activity
  "tenantPricingSnapshot", // Part V — Capacity-Based Pricing 2.0: real per-school price-calculation history
  "classCapacityOverflowRun", // BB.3 — real class-size cap + overflow decision audit trail (added retroactively — was missing from this registry; see BB.4 chunk 1 commit)
  "classAllocationRun", // BB.4 — real "Allocate Class" wizard run audit trail
  // Y.3 — a real, wider tenant-isolation security sweep (2026-07-12) found
  // these 29 real tenant-owned models were ALSO never registered here,
  // despite most of them being actively queried via tenantDb() in real
  // service code TODAY — meaning they were silently un-scoped and any
  // findMany/findUnique/create/update on them ran completely unfiltered
  // across every tenant, the exact same class of bug found and fixed for
  // BB.3's ClassCapacityOverflowRun and BB.4's 5 CBE pathway/subject-
  // selection models earlier this session. Fixed by adding all of them
  // here in one pass; verified genuinely active with real throwaway
  // cross-tenant proof scripts for a representative sample (see
  // scripts/y3-tenant-isolation-sweep-test.ts).
  "activityCategory",
  "tenantStorageProvider",
  "storageUsageSnapshot",
  "subscriptionPayment",
  "oAuthConnectedAccount",
  "oAuthState",
  "biometricActionTicket",
  "leavingCertificate",
  "entranceExamPaper",
  "studentNationalAssessment",
  "talentArea",
  "talentRecord",
  "studentGoal",
  "reportTemplate",
  "communityServiceActivity",
  "careerDiscoveryRecord",
  "marksPortal",
  "gradingScale",
  "termAggregationRule",
  "subjectPaperConfig",
  "paperResult",
  "studentApprovalRequest",
  "studentDutyArea",
  "studentDutyAssignment",
  "promotionRequest",
  "knecExportBatch",
  "bundiLearnedCorrection",
  "bundiDocumentTemplate",
  "staffImport",
  "libraryImport",
  "scannedExamPaper",
  "questionBankEntry",
  "questionBankAttempt",
  "paperQuizFormativeBatch",
  "interSchoolContest",
  "contestQuestion",
  "contestRegistration",
  "contestAttempt",
  "mpesaSuspenseReceipt",
  "tenantHealthSnapshot",
  "supportImpersonationLog",
  "tenantSmsTelemetry",
  "storageArchiveTier",
  "bundiOcrTelemetryAndQuota",
  "bundiScanTopUpOrder",
  "moeStatutoryReturn",
  "treasuryCheckAndBankSlip",
  "studentPocketWallet",
  "pocketWalletTransaction",
  "boardingExeatPass",
  "infirmaryDosageLog",
  "knecCandidateRegistration",
  "schoolTournamentTrip",
  "tournamentParticipant",
  "teacherRecordOfWork",
  "ptaConsultationSlot",
  "bomGovernanceDocument",
  "lostAndFoundItem",
  // Ideas 13 through 24 — The 12 Final School Management Pillars
  "bomStaffPayroll",
  "fleetVehicleLog",
  "fleetFuelEntry",
  "campusDisciplineEntry",
  "counselingRecord",
  "kitchenStoreRequisition",
  "supplierLpo",
  "hostelBedAllocation",
  "hostelVandalismInspection",
  "schoolFarmLedger",
  "staffLeaveSubstitution",
  "capitalAssetRegistry",
  "labReagentRegister",
  "alumniEndowmentCampaign",
  "alumniPledge",
  "visitorGateLog",
  "coursebookAllocation",
  "textbookFineRecovery",
  "masterSchoolDiaryEvent",
  // NOTE: "complianceRequest" is DELIBERATELY NOT tenant-owned — NEYO Ops's
  // own real compliance queue (`listComplianceRequests()` in
  // founder-dashboard.service.ts) genuinely lists EVERY tenant's requests
  // together for company-wide triage (gated by the real `assertMetricsAccess()`
  // founder/ops permission check, never exposed to an ordinary school
  // account) — a deliberate cross-tenant view, not a bug. `fileComplianceRequest()`
  // (a school filing its OWN request) still correctly stamps a real
  // `tenantId` on write; it is queried directly via the raw `db` client on
  // both sides, same reasoning as `schoolQuoteRequest`/`storageOptimizerRun` below.
  // NOTE: "calendarFeedToken" is DELIBERATELY NOT tenant-owned — see the
  // module-level comment at the top of this file (M.3, unauthenticated
  // webcal:// feed lookup).
  // NOTE: "bundiImportUnlockCode" is DELIBERATELY NOT tenant-owned — see
  // the module-level comment at the top of this file (M.5, company-wide
  // codes minted with no tenant context).
  // NOTE: "oAuthConnectedAccount"/"oAuthState"/"biometricActionTicket" ARE
  // now registered above for real defense-in-depth, but every real call
  // site already scopes them correctly by their own real `userId` (a user
  // only ever belongs to one real tenant, so this was transitively safe
  // even before being added here) — confirmed via direct code review
  // during the Y.3 sweep, not a live leak like the other 26.
  // NOTE: "neyoContract"/"neyoCustomerThread"/"pathwayGuideSession" are
  // DELIBERATELY NOT tenant-owned — all three have a real NULLABLE
  // `tenantId` (a prospective school with no account yet, or a genuine
  // public outsider with no NEYO account at all), so they are queried
  // directly via the raw `db` client, same reasoning as `schoolQuoteRequest`
  // below. (An earlier Y.3 audit pass incorrectly flagged these 3 as
  // missing due to a regex bug matching `String?` as `String` — corrected
  // before this fix was applied.)
  // NOTE: "schoolQuoteRequest" is DELIBERATELY NOT tenant-owned — a quote
  // request can exist for a genuinely prospective school with NO real
  // tenantId yet (before they've ever signed up), so it is queried directly
  // via the raw `db` client (same pattern as PlatformSetting/PlatformFlag),
  // never via tenantDb()/withTenant(), which requires an active tenant.
  // NOTE: "storageOptimizerRun" (W.1) is ALSO DELIBERATELY NOT tenant-owned
  // — a real nightly Storage Intelligence Engine sweep runs CROSS-TENANT
  // (tenantId: null for a company-wide run) as well as being triggerable
  // per-school by NEYO Ops (a real tenantId in that case) — queried
  // directly via the raw `db` client for the same "no single active tenant
  // context" reason as schoolQuoteRequest above.
] as const;

export type TenantOwnedModel = (typeof TENANT_OWNED_MODELS)[number];

export function isTenantOwnedModel(model: string): model is TenantOwnedModel {
  return (TENANT_OWNED_MODELS as readonly string[]).includes(model);
}

/**
 * Models that support soft-delete (G.6). For these, tenantDb() auto-excludes
 * rows where deletedAt != null on reads, and turns delete/deleteMany into a
 * soft-delete (sets deletedAt). Add B.1 "student" here when it lands.
 */
export const SOFT_DELETE_MODELS = ["payment", "student"] as const;

export function isSoftDeleteModel(model: string): boolean {
  return (SOFT_DELETE_MODELS as readonly string[]).includes(model);
}
