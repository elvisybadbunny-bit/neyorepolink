import { z } from "zod";

// Idea 13: BOM Staff Payroll Schema
export const bomPayrollInputSchema = z.object({
  staffName: z.string().min(1, "Staff name is required"),
  idNumber: z.string().min(1, "National ID number is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bankAccount: z.string().min(1, "Bank account is required"),
  basicPay: z.number().positive("Basic pay must be greater than 0"),
  payPeriod: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
});

// Idea 14: Fleet & Fuel Entry Schemas
export const fleetVehicleInputSchema = z.object({
  registrationNo: z.string().min(1, "Registration number is required"),
  makeModel: z.string().min(1, "Make and model is required"),
  capacity: z.number().int().positive().default(62),
  odometerKm: z.number().nonnegative(),
  ntsaExpiry: z.string(),
  insuranceExpiry: z.string(),
});

export const fleetFuelInputSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.number().positive(),
  costPerLiter: z.number().positive(),
  receiptPhotoUrl: z.string().optional(),
});

// Idea 15: Discipline & Counseling Schemas
export const campusDisciplineInputSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  severityLevel: z.number().int().min(1).max(4),
  category: z.string().min(1),
  demerits: z.number().int().nonnegative(),
  description: z.string().min(1),
});

export const counselingRecordInputSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  counselorName: z.string().min(1),
  notes: z.string().min(1),
  wellnessScore: z.number().int().min(1).max(10).default(5),
});

// Idea 16: Kitchen Store Requisition & LPO Schemas
export const kitchenStoreRequisitionSchema = z.object({
  itemName: z.string().min(1),
  unit: z.string().min(1),
  stockOnHand: z.number().nonnegative(),
  activeStudentCount: z.number().int().positive(),
  issuedQuantityKg: z.number().positive(),
});

export const supplierLpoSchema = z.object({
  supplierName: z.string().min(1),
  supplierPin: z.string().min(1),
  itemDescription: z.string().min(1),
  totalAmountKes: z.number().positive(),
});

// Idea 17: Hostel Bed Allocation & Vandalism Inspection Schemas
export const hostelBedAllocationSchema = z.object({
  dormitoryName: z.string().min(1),
  cubicleNumber: z.string().min(1),
  bunkType: z.enum(["UPPER", "LOWER"]),
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  mattressTag: z.string().min(1),
  lockerTag: z.string().min(1),
});

export const hostelVandalismInspectionSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  lockerTag: z.string().min(1),
  condition: z.enum(["INTACT", "VANDALIZED"]),
  recoveryFeeKes: z.number().nonnegative(),
});

// Idea 18: School Farm & Agricultural Enterprise Schemas
export const schoolFarmLedgerSchema = z.object({
  enterprise: z.enum(["DAIRY", "POULTRY", "CROPS"]),
  dailyYield: z.number().positive(),
  unit: z.string().min(1),
  kitchenTransferQuantity: z.number().nonnegative().default(0),
  mpesaStaffSalesKes: z.number().nonnegative().default(0),
  internalRateKes: z.number().nonnegative().default(60),
});

// Idea 19: Staff Leave & Substitution Schemas
export const staffLeaveSubstitutionSchema = z.object({
  teacherId: z.string().min(1),
  teacherName: z.string().min(1),
  leaveType: z.enum(["SICK", "MATERNITY", "COMPASSIONATE"]),
  startDate: z.string(),
  endDate: z.string(),
  medicalChitUrl: z.string().optional(),
  affectedLessonsCount: z.number().int().nonnegative(),
  substituteTeacherId: z.string().optional(),
  substituteTeacherName: z.string().optional(),
});

// Idea 20: Capital Asset & Lab Reagent Schemas
export const capitalAssetInputSchema = z.object({
  assetName: z.string().min(1),
  category: z.enum(["ICT", "GENERATOR", "BOREHOLE", "SOLAR"]),
  location: z.string().min(1),
  runningHours: z.number().nonnegative().default(0),
  nextServiceHours: z.number().positive().default(250),
});

export const labReagentInputSchema = z.object({
  reagentName: z.string().min(1),
  quantityLiters: z.number().positive(),
  molarity: z.string().min(1),
  hazardClass: z.enum(["CORROSIVE", "FLAMMABLE", "TOXIC"]),
  expiryDate: z.string(),
});

// Idea 21: Alumni Campaign & Pledge Schemas
export const alumniCampaignInputSchema = z.object({
  title: z.string().min(1),
  targetAmountKes: z.number().positive(),
});

export const alumniPledgeInputSchema = z.object({
  campaignId: z.string().min(1),
  alumniName: z.string().min(1),
  cohortYear: z.string().min(1),
  amountKes: z.number().positive(),
  mpesaReference: z.string().optional(),
});

// Idea 22: Visitor & Vendor Gate Security Schema
export const visitorGateLogSchema = z.object({
  visitorName: z.string().min(1),
  nationalId: z.string().min(1),
  phone: z.string().min(1),
  hostStaffId: z.string().optional(),
  hostStaffName: z.string().optional(),
  purpose: z.string().min(1),
});

// Idea 23: Textbook 1:1 Ratio & Fine Recovery Schemas
export const coursebookAllocationSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  bookTitle: z.string().min(1),
  copyBarcode: z.string().min(1),
  dueDate: z.string(),
});

export const textbookFineRecoverySchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  bookTitle: z.string().min(1),
  copyBarcode: z.string().min(1),
  replacementCostKes: z.number().positive(),
});

// Idea 24: Master School Diary Event Schema
export const masterSchoolDiaryEventSchema = z.object({
  eventTitle: z.string().min(1),
  category: z.enum(["EXAM", "VISITING", "BREAK", "SPORTS", "BOM"]),
  eventDate: z.string(),
  targetAudience: z.enum(["PARENTS", "ALL", "STAFF"]),
  expectedGuestHeadcount: z.number().int().nonnegative().default(0),
});
