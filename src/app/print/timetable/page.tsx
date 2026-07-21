/**
 * Z.3 — Real, dedicated print-only timetable page. Deliberately OUTSIDE the
 * authenticated app-shell layout (no sidebar/topbar/breadcrumb/floating
 * module bar exist here at all — never hidden via CSS, genuinely absent),
 * so printing this page can NEVER show app chrome by construction. This is
 * the real, direct fix for the founder's own complaint: "the print should
 * only show the timetable... it should fit corner to corner of an a4 print
 * paper."
 *
 * Real query params:
 *   ?classId=<id>          — one real class's own timetable, one page.
 *   ?teacherId=<id>        — one real teacher's own timetable, one page.
 *   ?mode=classes           — every real class, one real page per class.
 *   ?mode=teachers          — every real teacher, one real page per teacher.
 *   ?bw=1                   — real ink-saver black & white mode: every
 *                             subject-color cell renders plain white/black
 *                             instead of its real color-coded background,
 *                             a school's own explicit choice before printing.
 *
 * Orientation is real and automatic: vertical days is the system default
 * (days down the left, periods across) and prints A4 LANDSCAPE. Explicit
 * `vertical=0` keeps the alternative horizontal-days A4 portrait layout.
 */
import { requireUser } from "@/lib/core/session";
import { db } from "@/lib/db";
import {
  getTimetable,
  teacherTimetable,
  timetablePrintBundle,
} from "@/lib/services/academics.service";
import {
  PrintTimetablePage,
  type RealConfig,
} from "@/components/academics/print-timetable-page";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface RealSlot {
  id: string;
  dayOfWeek: number;
  period: number;
  subjectName?: string | null;
  subjectCode?: string | null;
  teacherName?: string | null;
  teacherShortCode?: string | null;
  className?: string;
  venue?: string | null;
  slotType?: string;
}

/** Keep the print component independent from Prisma rows and JSON payloads. */
function printConfig(value: unknown): RealConfig | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const number = (key: string) =>
    typeof row[key] === "number" ? (row[key] as number) : undefined;
  const nullableNumber = (key: string) =>
    row[key] === null ? null : number(key);
  const string = (key: string) =>
    typeof row[key] === "string" ? (row[key] as string) : undefined;
  const boolean = (key: string) =>
    typeof row[key] === "boolean" ? (row[key] as boolean) : undefined;
  return {
    periodsPerDay: number("periodsPerDay"),
    saturdayPeriodsCount: number("saturdayPeriodsCount"),
    hasSaturday: boolean("hasSaturday"),
    schoolDayStartTime: string("schoolDayStartTime"),
    saturdayStartTime: string("saturdayStartTime"),
    lessonDurationMins: number("lessonDurationMins"),
    shortBreakStart: number("shortBreakStart"),
    shortBreakMins: number("shortBreakMins"),
    shortBreak2Start: nullableNumber("shortBreak2Start"),
    shortBreak2Mins: nullableNumber("shortBreak2Mins"),
    longBreakStart: number("longBreakStart"),
    longBreakMins: number("longBreakMins"),
    lunchStart: number("lunchStart"),
    lunchAfterPeriod: nullableNumber("lunchAfterPeriod"),
    lunchMins: number("lunchMins"),
  };
}

export default async function PrintTimetableRoute({
  searchParams,
}: {
  searchParams: {
    classId?: string;
    teacherId?: string;
    mode?: string;
    vertical?: string;
    font?: string;
    bw?: string;
  };
}) {
  const user = await requireUser();
  const tenant = await db.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true, logoUrl: true },
  });
  const tenantConfig = await db.timetableConfig.findFirst({
    where: { tenantId: user.tenantId },
  });
  const daysVertical = searchParams.vertical !== "0";
  const cellFontSize = searchParams.font ? Number(searchParams.font) : 13;
  const bandW = searchParams.bw === "1";

  // Real bulk mode: every class, every teacher, or every venue — one real
  // page each.
  if (
    searchParams.mode === "classes" ||
    searchParams.mode === "teachers" ||
    searchParams.mode === "venues"
  ) {
    const bundle = await timetablePrintBundle(user, searchParams.mode);
    return (
      <div>
        {bundle.groups.map(
          (
            group: {
              id: string;
              title: string;
              subtitle: string;
              slots: unknown[];
              config: unknown;
            },
            idx: number,
          ) => (
            <PrintTimetablePage
              key={group.id}
              tenantName={tenant?.name}
              tenantLogoUrl={tenant?.logoUrl}
              title={group.title}
              subtitle={group.subtitle}
              slots={group.slots as RealSlot[]}
              config={printConfig(group.config || tenantConfig)}
              daysVertical={daysVertical}
              cellFontSize={cellFontSize}
              pageBreakAfter={idx < bundle.groups.length - 1}
              mode={
                searchParams.mode === "venues"
                  ? "classes"
                  : (searchParams.mode as "classes" | "teachers")
              }
              bandW={bandW}
            />
          ),
        )}
      </div>
    );
  }

  // Real single-class print.
  if (searchParams.classId) {
    const cls = await db.schoolClass.findUnique({
      where: { id: searchParams.classId },
      select: { level: true, stream: true },
    });
    if (!cls) redirect("/academics");
    const { slots, config } = await getTimetable(user, searchParams.classId);
    const title = [cls.level, cls.stream].filter(Boolean).join(" ");
    return (
      <PrintTimetablePage
        tenantName={tenant?.name}
        tenantLogoUrl={tenant?.logoUrl}
        title={title}
        subtitle="Class timetable"
        slots={slots as RealSlot[]}
        config={printConfig(config || tenantConfig)}
        daysVertical={daysVertical}
        cellFontSize={cellFontSize}
        pageBreakAfter={false}
        mode="classes"
        bandW={bandW}
      />
    );
  }

  // Real single-teacher print.
  if (searchParams.teacherId) {
    const teacher = await db.user.findUnique({
      where: { id: searchParams.teacherId },
      select: { fullName: true, timetableShortCode: true },
    });
    if (!teacher) redirect("/academics");
    const slots = await teacherTimetable(user, searchParams.teacherId);
    return (
      <PrintTimetablePage
        tenantName={tenant?.name}
        tenantLogoUrl={tenant?.logoUrl}
        title={teacher.fullName}
        subtitle={
          teacher.timetableShortCode
            ? `Teacher timetable · ${teacher.timetableShortCode}`
            : "Teacher timetable"
        }
        slots={slots as RealSlot[]}
        config={printConfig(tenantConfig)}
        daysVertical={daysVertical}
        cellFontSize={cellFontSize}
        pageBreakAfter={false}
        mode="teachers"
        bandW={bandW}
      />
    );
  }

  redirect("/academics");
}
