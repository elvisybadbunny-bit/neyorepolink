import {
  Wallet,
  TrendingUp,
  UserCheck,
  Users,
  CalendarDays,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";
import { effectivePermissionsForUser, getCurrentUser } from "@/lib/core/session";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { tenantDb } from "@/lib/core/tenant-db";
import { db } from "@/lib/db";
import { currentTerm } from "@/lib/services/academics.service";
import { withTenant } from "@/lib/core/tenant-context";
import { DashboardIntercomClient } from "@/components/dashboard/dashboard-intercom-client";
import { PwaDataSaverCard } from "@/components/dashboard/pwa-data-saver";
import { PrincipalDelegationCard } from "@/components/dashboard/principal-delegation-card";
import { createInApp } from "@/lib/services/notification.service";
import { scopeWhere } from "@/lib/services/student.service";

// Read fresh DB counts on every request (not at build time).
export const dynamic = "force-dynamic";

function getHolidayGreeting(): { greeting: string; icon: string } | null {
  const now = new Date();
  const month = now.getUTCMonth() + 1; // 1-indexed
  const day = now.getUTCDate();
  
  // Madaraka Day (June 1st)
  if (month === 6 && day === 1) {
    return { greeting: "Happy Madaraka Day!", icon: "🇰🇪" };
  }
  // Mashujaa Day (October 20th)
  if (month === 10 && day === 20) {
    return { greeting: "Happy Mashujaa Day!", icon: "🛡️" };
  }
  // Jamhuri Day (December 12th)
  if (month === 12 && day === 12) {
    return { greeting: "Happy Jamhuri Day!", icon: "🇰🇪" };
  }
  // Christmas Festive (December 15th to December 26th)
  if (month === 12 && day >= 15 && day <= 26) {
    return { greeting: "Merry Christmas & Happy Holidays!", icon: "🎄" };
  }
  
  return null;
}

function nairobiNow(): Date {
  return new Date(Date.now() + 3 * 3600_000);
}
function nairobiToday(): string {
  return nairobiNow().toISOString().slice(0, 10);
}

function getTimeOfDayGreeting(): string {
  const hour = (new Date().getUTCHours() + 3) % 24;
  if (hour >= 4 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

type MoneyPoint = { label: string; expected: number; actual: number };

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-KE", { month: "short" });
}

function chartPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

function moneyShort(n: number) {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `KES ${Math.round(n / 1000)}K`;
  return `KES ${n.toLocaleString("en-KE")}`;
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;
  if (currentUser.role === "FOUNDER" || currentUser.role === "SUPER_ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/founder");
  }

  const firstName = currentUser.fullName.split(" ")[0] ?? "there";
  const greeting = getTimeOfDayGreeting();
  const permissions = await effectivePermissionsForUser(currentUser);
  const has = (permission: string) => permissions.includes(permission as any);
  // I.5: school-wide money / My School metrics belong only to School Owner + Principal.
  // Bursar/accountant still use the Finance module, but dashboard money cards stay hidden.
  const canSeeFinanceCards = has("owner.dashboard");
  const canSeeAttendanceCard = has("attendance.view") || has("attendance.record");
  const canSeeStudentsCard = has("student.view");
  const canSeeStaffCard = has("staff.view") || has("staff.manage");
  const isMasterAttendanceUser = ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"].includes(currentUser.role) ||
    (!!currentUser.secondaryRole && ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"].includes(currentUser.secondaryRole));

  const stats = await withTenant(currentUser.tenantId, async () => {
    const tdb = tenantDb();
    const today = nairobiToday();
    const now = nairobiNow();
    const term = await currentTerm(currentUser.tenantId);
    const year = term?.year ?? now.getUTCFullYear();

    const tenant = await db.tenant.findUnique({
      where: { id: currentUser.tenantId },
      include: { subscription: true },
    });
    const targetPct = tenant?.collectionTargetPct ?? 85;
    const planEndsAt = tenant?.subscription?.currentPeriodEnd ?? null;
    const daysToPlanEnd = planEndsAt ? Math.ceil((planEndsAt.getTime() - now.getTime()) / (24 * 3600_000)) : null;
    if (tenant?.subscription && daysToPlanEnd !== null && daysToPlanEnd >= 0 && daysToPlanEnd <= 14) {
      const todayKey = `subscription-expiring:${tenant.id}:${today}`;
      const admins = await db.user.findMany({
        where: {
          tenantId: currentUser.tenantId,
          isActive: true,
          OR: [
            { role: { in: ["SCHOOL_OWNER", "PRINCIPAL"] } },
            { secondaryRole: { in: ["SCHOOL_OWNER", "PRINCIPAL"] } },
          ],
        },
        select: { id: true },
      });
      for (const admin of admins) {
        const existing = await db.notification.findFirst({ where: { tenantId: currentUser.tenantId, recipientId: admin.id, category: "billing", body: { contains: todayKey } } });
        if (!existing) {
          await createInApp({
            tenantId: currentUser.tenantId,
            recipientId: admin.id,
            title: "Subscription plan needs attention",
            body: `Your NEYO plan ends in ${daysToPlanEnd} day${daysToPlanEnd === 1 ? "" : "s"}. Open billing to review. ${todayKey}`,
            category: "billing",
            href: "/settings/billing",
          });
        }
      }
    }

    // ---- 1) Enrolled students & counts ----
    // Keep the headline inside the same student row-scope as the destination
    // module: teachers see learners in classes they genuinely teach, parents
    // see linked children, and leadership/office roles see the school total.
    const studentScope = await scopeWhere(currentUser);
    const activeStudentsCount = await tdb.student.count({
      where: { AND: [{ status: "ACTIVE" }, studentScope] },
    });
    const ownClassCount = await tdb.schoolClass.count({ where: { archived: false, classTeacherId: currentUser.id } });
    const totalStaffCount = await tdb.user.count({
      where: { isActive: true, role: { notIn: ["PARENT", "STUDENT", "SUPER_ADMIN"] } },
    });

    // ---- 2) Revenue today ----
    const todayStartUtc = new Date(`${today}T00:00:00.000Z`);
    const dayStart = new Date(todayStartUtc.getTime() - 3 * 3600_000);
    const paidToday = await tdb.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", paidAt: { gte: dayStart } },
    });
    const revenueToday = paidToday._sum.amount ?? 0;

    // ---- 3) Attendance today ----
    const attendanceRecords = await tdb.attendanceRecord.findMany({
      where: { date: today },
      select: { status: true },
    });
    const markedCount = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === "P" || r.status === "L").length;
    let attendancePct: number | null = null;
    if (markedCount > 0) {
      attendancePct = Math.round((presentCount / markedCount) * 100);
    }

    // ---- 4) Fees outstanding & collection rate ----
    const termInvoices = term
      ? await tdb.invoice.findMany({ where: { year: term.year, term: term.term } })
      : await tdb.invoice.findMany({ where: { year } });
    
    const billedTerm = termInvoices.reduce((s, i) => s + i.totalKes - i.discountKes, 0);
    const collectedTerm = termInvoices.reduce((s, i) => s + Math.min(i.paidKes, i.totalKes - i.discountKes), 0);
    const outstandingTerm = termInvoices.reduce((s, i) => s + (i.totalKes - i.discountKes - i.paidKes), 0);
    
    const collectionPct = billedTerm > 0 ? Math.round((collectedTerm / billedTerm) * 100) : 0;

    // ---- 5) Calendar events + reminders ----
    const in30Days = new Date(now.getTime() + 30 * 24 * 3600_000).toISOString().slice(0, 10);
    const upcomingEventsCount = await tdb.calendarEvent.count({
      where: { date: { gte: today, lte: in30Days } },
    });
    const remindersCount = await tdb.notification.count({
      where: { recipientId: currentUser.id, readAt: null },
    });

    // ---- 6) Real payments-vs-expected graph ----
    const termStart = term?.startDate ? new Date(`${term.startDate}T00:00:00.000Z`) : new Date(now.getTime() - 90 * 24 * 3600_000);
    const termEnd = term?.endDate ? new Date(`${term.endDate}T00:00:00.000Z`) : now;
    const totalDays = Math.max(1, Math.ceil((termEnd.getTime() - termStart.getTime()) / (24 * 3600_000)));
    const graphPoints: MoneyPoint[] = [];
    const paidPayments = await tdb.payment.findMany({
      where: { status: "PAID", paidAt: { gte: termStart, lte: now } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    });
    for (let i = 0; i < 4; i++) {
      const ratio = i / 3;
      const pointDate = new Date(termStart.getTime() + totalDays * ratio * 24 * 3600_000);
      const expected = Math.round(billedTerm * ratio);
      const actual = paidPayments
        .filter((p) => p.paidAt && p.paidAt <= pointDate)
        .reduce((sum, p) => sum + p.amount, 0);
      graphPoints.push({ label: monthLabel(pointDate), expected, actual });
    }
    if (graphPoints.length) {
      graphPoints[graphPoints.length - 1].actual = collectedTerm;
      graphPoints[graphPoints.length - 1].expected = billedTerm;
    }
    const maxGraphKes = Math.max(1, ...graphPoints.flatMap((p) => [p.expected, p.actual]));
    const toSvgPoint = (value: number, index: number) => ({
      x: graphPoints.length <= 1 ? 0 : (index / (graphPoints.length - 1)) * 500,
      y: 170 - (value / maxGraphKes) * 145,
    });
    const expectedPath = chartPath(graphPoints.map((p, i) => toSvgPoint(p.expected, i)));
    const actualPath = chartPath(graphPoints.map((p, i) => toSvgPoint(p.actual, i)));
    const actualDots = graphPoints.map((p, i) => ({ ...toSvgPoint(p.actual, i), label: p.label, actual: p.actual, expected: p.expected }));
    const graphLabels = [1, 0.75, 0.5, 0.25].map((r) => moneyShort(Math.round(maxGraphKes * r)));

    const termWeek = term
      ? Math.max(1, Math.floor((new Date(`${today}T00:00:00.000Z`).getTime() - new Date(`${term.startDate}T00:00:00.000Z`).getTime()) / (7 * 24 * 3600_000)) + 1)
      : null;
    const termDisplay = term ? `Term ${term.term} · Week ${termWeek}` : "No current term configured";

    return {
      activeStudentsCount,
      ownClassCount,
      totalStaffCount,
      revenueToday,
      markedCount,
      presentCount,
      attendancePct,
      collectionPct,
      targetPct,
      billedTerm,
      outstandingTerm,
      upcomingEventsCount,
      remindersCount,
      graphPoints,
      maxGraphKes,
      expectedPath,
      actualPath,
      actualDots,
      graphLabels,
      termDisplay,
      pricingMode: tenant?.subscription?.pricingMode ?? null,
      planStatus: tenant?.subscription?.status ?? null,
      daysToPlanEnd,
    };
  });

  const holiday = getHolidayGreeting();
  const studentCountLabel = ["TEACHER", "CLASS_TEACHER"].includes(currentUser.role)
    ? "My Learners"
    : currentUser.role === "PARENT"
      ? "My Children"
      : "Total Enrolled";
  const studentCountDescription = ["TEACHER", "CLASS_TEACHER"].includes(currentUser.role)
    ? "Active learners in my classes"
    : currentUser.role === "PARENT"
      ? "Linked active learners"
      : "Active learners";
  return (
    <div className="space-y-6 text-left">
      {holiday && (
        <div className="rounded-3xl border border-green-200 bg-green-500/10 p-5 text-left flex items-center justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-sm font-bold text-green-800 dark:text-green-300">{holiday.icon} {holiday.greeting}</h2>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1">NEYO is celebrating this special moment with your school, staff, and families!</p>
          </div>
          <span className="text-2xl animate-bounce">🎁</span>
        </div>
      )}

      {/* Dashboard cockpit — mobile-first, calm and action-led. */}
      <section className="overflow-hidden rounded-[2rem] border border-navy-100 bg-white shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)] dark:border-navy-800 dark:bg-navy-900">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-navy-600 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-300">{currentUser.role.replaceAll("_", " ")}</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300">{stats.termDisplay}</span>
            </div>
            <p className="text-sm font-semibold text-navy-500 dark:text-navy-400">{greeting}, {firstName}</p>
            <h1 className="mt-1 max-w-2xl text-3xl font-black tracking-[-0.035em] text-navy-950 dark:text-white sm:text-4xl">Your school, clearly in view.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-navy-500 dark:text-navy-300">See what is complete, what needs attention and where to continue—without rebuilding today&apos;s picture in a spreadsheet.</p>
          </div>
          <div className="rounded-3xl bg-navy-950 p-5 text-white shadow-lg dark:bg-white dark:text-navy-950">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55 dark:text-navy-500">Today · Nairobi</p>
            <p className="mt-2 text-lg font-black">{new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Nairobi" })}</p>
            <p className="mt-1 text-xs text-white/65 dark:text-navy-500">{stats.remindersCount} unread reminder{stats.remindersCount === 1 ? "" : "s"} · {stats.upcomingEventsCount} upcoming event{stats.upcomingEventsCount === 1 ? "" : "s"}</p>
            <div className="mt-4 flex gap-2">{canSeeAttendanceCard && <Link href="/attendance" className="flex-1"><Button className="w-full bg-white text-navy-950 hover:bg-white/90 dark:bg-navy-950 dark:text-white">{has("attendance.record") && (!isMasterAttendanceUser || stats.ownClassCount > 0) ? "Mark attendance" : "View attendance"}</Button></Link>}<Link href="/calendar"><Button variant="secondary" className="h-10 w-10 rounded-full p-0" aria-label="Open calendar"><CalendarDays className="h-4 w-4" /></Button></Link></div>
          </div>
        </div>
      </section>

      <section aria-label="School pulse" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {canSeeAttendanceCard && <Link href="/attendance" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">Attendance</span><span className="grid h-8 w-8 place-items-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40"><UserCheck className="h-4 w-4" /></span></div><p className="mt-4 text-2xl font-black text-navy-950 dark:text-white">{stats.attendancePct === null ? "—" : `${stats.attendancePct}%`}</p><p className="mt-1 text-[11px] text-navy-500">{stats.markedCount ? `${stats.presentCount} present · ${stats.markedCount} marked` : "Register not marked yet"}</p></Link>}
        {canSeeStudentsCard && <Link href="/students" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">{studentCountLabel}</span><span className="grid h-8 w-8 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40"><Users className="h-4 w-4" /></span></div><p className="mt-4 text-2xl font-black text-navy-950 dark:text-white">{stats.activeStudentsCount}</p><p className="mt-1 text-[11px] text-navy-500">{studentCountDescription}</p></Link>}
        {canSeeFinanceCards && <Link href="/finance" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">Collected today</span><span className="grid h-8 w-8 place-items-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40"><Wallet className="h-4 w-4" /></span></div><p className="mt-4 text-xl font-black text-navy-950 dark:text-white sm:text-2xl">{formatKES(stats.revenueToday)}</p><p className="mt-1 text-[11px] text-navy-500">Verified payment ledger</p></Link>}
        {canSeeFinanceCards ? <Link href="/finance" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">Collection rate</span><span className="grid h-8 w-8 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/40"><TrendingUp className="h-4 w-4" /></span></div><p className="mt-4 text-2xl font-black text-navy-950 dark:text-white">{stats.collectionPct}%</p><p className="mt-1 text-[11px] text-navy-500">Target {stats.targetPct}% · {formatKES(stats.outstandingTerm)} due</p></Link> : canSeeStaffCard ? <Link href="/staff" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">Active staff</span><span className="grid h-8 w-8 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/40"><Users className="h-4 w-4" /></span></div><p className="mt-4 text-2xl font-black text-navy-950 dark:text-white">{stats.totalStaffCount}</p><p className="mt-1 text-[11px] text-navy-500">School team</p></Link> : <Link href="/calendar" className="group rounded-3xl border border-navy-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-navy-800 dark:bg-navy-900"><div className="flex items-start justify-between"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-navy-400">Upcoming</span><CalendarDays className="h-4 w-4 text-amber-600" /></div><p className="mt-4 text-2xl font-black text-navy-950 dark:text-white">{stats.upcomingEventsCount}</p><p className="mt-1 text-[11px] text-navy-500">Calendar events</p></Link>}
      </section>

      <section className="rounded-[2rem] border border-navy-100 bg-white p-4 shadow-sm dark:border-navy-800 dark:bg-navy-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy-400">Continue working</p><h2 className="mt-1 text-lg font-black text-navy-950 dark:text-white">Open the next school task</h2></div><span className="hidden text-xs text-navy-400 sm:block">Only actions allowed for your role appear.</span></div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {canSeeAttendanceCard && <Link href="/attendance" className="flex items-center gap-3 rounded-2xl border border-navy-100 p-3 transition hover:border-green-200 hover:bg-green-50/50 dark:border-navy-800 dark:hover:border-green-900 dark:hover:bg-green-950/20"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40"><UserCheck className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-black text-navy-900 dark:text-white">Attendance</span><span className="block truncate text-[11px] text-navy-400">Register and completion</span></span></Link>}
          {has("exam.view") && <Link href="/exams" className="flex items-center gap-3 rounded-2xl border border-navy-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-navy-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/20"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40"><TrendingUp className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-black text-navy-900 dark:text-white">Exams & reports</span><span className="block truncate text-[11px] text-navy-400">Marks, grading and release</span></span></Link>}
          {has("academics.view") && <Link href="/syllabus" className="flex items-center gap-3 rounded-2xl border border-navy-100 p-3 transition hover:border-amber-200 hover:bg-amber-50/50 dark:border-navy-800 dark:hover:border-amber-900 dark:hover:bg-amber-950/20"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/40"><CalendarDays className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-black text-navy-900 dark:text-white">Syllabus</span><span className="block truncate text-[11px] text-navy-400">Plans, scope and record of work</span></span></Link>}
          <Link href="/messages" className="flex items-center gap-3 rounded-2xl border border-navy-100 p-3 transition hover:border-purple-200 hover:bg-purple-50/50 dark:border-navy-800 dark:hover:border-purple-900 dark:hover:bg-purple-950/20"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/40"><Bell className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-black text-navy-900 dark:text-white">Messages</span><span className="block truncate text-[11px] text-navy-400">Colleagues and families</span></span></Link>
        </div>
      </section>

      <div className={`grid grid-cols-1 gap-6 ${canSeeFinanceCards ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
        {/* Animated Custom Line Graph (Expected vs Paid Tuition Fees) */}
        {canSeeFinanceCards && <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden rounded-[2rem] border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy-400">Finance pulse</p><CardTitle className="mt-1 text-lg font-black text-navy-950 dark:text-white">Collections this term</CardTitle></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-950/40 dark:text-green-300">{stats.collectionPct}% collected</span></div>
              <div className="mt-4 flex items-end gap-3"><p className="text-3xl font-black tracking-tight text-navy-950 dark:text-white">{formatKES(Math.round((stats.collectionPct / 100) * stats.billedTerm))}</p><p className="pb-1 text-xs text-navy-400">of {formatKES(stats.billedTerm)} billed</p></div>
              <p className="text-xs text-navy-400">Actual paid is green; the dashed line is expected term billing.</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between p-6">
              {/* Responsive SVG Line Graph (0kb external library overhead, instant page loads!) */}
              <div className="w-full h-[220px] relative">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none" role="img" aria-label="Payments versus expected fees line graph">
                  {[20, 70, 120, 170].map((y, i) => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke={i === 3 ? "#cbd5e1" : "#f1f5f9"} strokeWidth={i === 3 ? "1.5" : "1"} />
                  ))}
                  <path d={stats.expectedPath} fill="none" stroke="#121a2e" strokeWidth="2" strokeDasharray="6 6" />
                  <path d={stats.actualPath} fill="none" stroke="#1f9d5f" strokeWidth="3.5" className="animate-[pulse_3s_infinite]" />
                  {stats.actualDots.map((dot, index) => (
                    <g key={`${dot.label}-${index}`}>
                      <circle cx={dot.x} cy={dot.y} r="5.5" fill="#1f9d5f" stroke="#ffffff" strokeWidth="1.5" />
                      <title>{dot.label}: paid {formatKES(dot.actual)} / expected {formatKES(dot.expected)}</title>
                    </g>
                  ))}
                </svg>

                <div className="absolute top-1 left-2 text-[8px] font-bold text-navy-400 font-mono">{stats.graphLabels[0]}</div>
                <div className="absolute top-14 left-2 text-[8px] font-bold text-navy-400 font-mono">{stats.graphLabels[1]}</div>
                <div className="absolute top-28 left-2 text-[8px] font-bold text-navy-400 font-mono">{stats.graphLabels[2]}</div>
                <div className="absolute top-40 left-2 text-[8px] font-bold text-navy-400 font-mono">{stats.graphLabels[3]}</div>
                <div className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-green-700 shadow-sm dark:bg-navy-900/80">
                  Paid {formatKES(stats.collectionPct ? Math.round((stats.collectionPct / 100) * stats.billedTerm) : 0)} of {formatKES(stats.billedTerm)}
                </div>
              </div>

              {/* Month Labels */}
              <div className="flex justify-between items-center text-[10px] font-bold text-navy-400 px-4 mt-2 border-t border-navy-50 pt-2">
                {stats.graphPoints.map((p) => (
                  <span key={p.label}>{p.label}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>}

        {/* 🧬 WebRTC Peer-to-Peer Intercom Voice Calling Module */}
        <div className="lg:col-span-1">
          <DashboardIntercomClient />
        </div>
      </div>

      <PrincipalDelegationCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 🧬 PWA Internet Bundle & Data Saver Card */}
        <div className="lg:col-span-1">
          <PwaDataSaverCard />
        </div>

        {/* Recent Activity Log - Compact Styling */}
        <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden rounded-[2rem] border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <CardHeader className="border-b border-navy-50 pb-3 dark:border-navy-800">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy-400">Latest</p><CardTitle className="mt-1 text-lg font-black text-navy-950 dark:text-white">Recent school activity</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[320px] flex-1 overflow-y-auto p-4">
              <ActivityFeed title="" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
