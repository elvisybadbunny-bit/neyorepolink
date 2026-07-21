"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bus,
  Check,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Download,
  HeartPulse,
  Library,
  Loader2,
  LockKeyhole,
  Menu,
  QrCode,
  Receipt,
  School,
  ShieldCheck,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LinkItem = { label: string; href: string };
type ProductItem = {
  key: string;
  name: string;
  status: "LIVE" | "WAITLIST" | "COMING_SOON";
  description: string;
  features: string[];
  mediaUrl?: string;
};
type LandingContent = {
  nav: LinkItem[];
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
  launchBanner?: string;
  trustStats: { value: string; label: string; note?: string }[];
  products: ProductItem[];
  industries: string[];
  whyNeyo: string[];
  mediaShowcase: {
    label: string;
    type: string;
    url?: string;
    caption?: string;
  }[];
  securityPoints: string[];
  finalHeadline: string;
  finalSubheadline: string;
  footerLinks: LinkItem[];
  socialLinks: LinkItem[];
};

interface LandingClientProps {
  customLogoUrl?: string | null;
  brandPrimary?: string;
  brandAccent?: string;
  landingContent: LandingContent;
}

const NAV = [
  ["Product", "#product"],
  ["CBE & academics", "#academics"],
  ["Operations", "#operations"],
  ["Security", "#security"],
  ["Pricing", "#pricing"],
  ["About", "#founder"],
  ["FAQ", "#faq"],
] as const;

const FAQS = [
  [
    "What kind of schools is NEYO designed for?",
    "NEYO School OS is being prepared for Kenyan primary, junior and senior schools. Each approved school is configured around its real classes, terms, curriculum and staff responsibilities.",
  ],
  [
    "Does NEYO support CBE and 8-4-4 workflows?",
    "Yes. NEYO includes CBE curriculum, delivery, evidence, assessment and intervention workflows alongside conventional marks, exams and school reporting. The exact setup depends on the levels a school operates.",
  ],
  [
    "Can our existing records be moved into NEYO?",
    "NEYO includes controlled import workflows for learners, guardians, staff, teachers and academic structures. Migration should be mapped, reviewed and verified before records are committed.",
  ],
  [
    "Does NEYO work on a phone?",
    "NEYO is a web platform designed for phones, tablets and computers. The team continues to test priority workflows at 360px so school staff and families can use smaller devices.",
  ],
  [
    "How does a demonstration work?",
    "Submit the request form with a valid Kenyan contact. It enters a pending review queue. NEYO does not automatically create a school or expose a shared public account before approval.",
  ],
  [
    "How much does NEYO cost?",
    "A demo request is free and creates no charge. Pilot pricing and rollout scope are explained after NEYO understands the school's size, operating model, data preparation and support needs. The school should receive the agreed KES price before activation.",
  ],
  [
    "Does timetable generation use Bundi?",
    "No. NEYO timetable generation uses deterministic constraints, stable ordering, graph methods and backtracking. Generation is separate from review, approval and publication.",
  ],
  [
    "Is Bundi required to operate NEYO?",
    "No. Every core school workflow must remain usable without Bundi. Bundi is an optional future assistance layer, not a requirement for running a school.",
  ],
  [
    "Can NEYO connect to existing systems or devices?",
    "A school's authorised administrator can manage restricted API keys and webhooks from Settings → Developer. Integrations remain permission-controlled and should never receive direct database access.",
  ],
];

function scrollToId(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("#"))
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  else router.push(href);
}

export function NeyoLandingClient({
  customLogoUrl,
  brandPrimary = "#111c32",
  brandAccent = "#15945f",
  landingContent,
}: LandingClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [demoOpen, setDemoOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [pwaPrompt, setPwaPrompt] = React.useState<any>(null);
  const [form, setForm] = React.useState({
    name: "",
    schoolName: "",
    email: "",
    phone: "",
  });

  React.useEffect(() => {
    const receive = (event: any) => {
      event.preventDefault();
      setPwaPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", receive);
    return () => window.removeEventListener("beforeinstallprompt", receive);
  }, []);

  async function install() {
    if (!pwaPrompt)
      return toast({
        title: "Install option not available",
        description:
          "Use your browser's Add to Home Screen option, or NEYO may already be installed.",
        tone: "info",
      });
    pwaPrompt.prompt();
    await pwaPrompt.userChoice;
    setPwaPrompt(null);
  }

  async function submitDemo(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok || !json.ok)
        throw new Error(json.error?.message || "Could not submit the request.");
      setSubmitted(true);
      toast({
        title: "Demo request received",
        description: "Your request is awaiting review by the NEYO team.",
        tone: "success",
      });
    } catch (error: any) {
      toast({
        title: error?.message || "Could not submit the request.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const schoolMedia =
    landingContent.products.find((product) => product.key === "school")
      ?.mediaUrl || "/screenshots/neyo-school-os-dashboard.png";

  return (
    <div className="neyo-public-site min-h-screen overflow-x-hidden bg-white text-[#111c32] selection:bg-emerald-200">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => scrollToId("#top", router)}
            className="flex items-center gap-2.5"
            aria-label="NEYO home"
          >
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="NEYO"
                className="h-9 w-auto max-w-[130px] object-contain"
              />
            ) : (
              <>
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-white"
                  style={{ background: brandPrimary }}
                >
                  N
                </span>
                <span className="text-lg font-black tracking-[-0.04em]">
                  NEYO
                </span>
              </>
            )}
          </button>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Main navigation"
          >
            {NAV.map(([label, href]) => (
              <button
                key={href}
                onClick={() => scrollToId(href, router)}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="hidden px-3 py-2 text-sm font-bold text-slate-700 sm:block"
            >
              Sign in
            </button>
            <button
              onClick={() => setDemoOpen(true)}
              className="hidden rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-sm sm:block"
              style={{ background: brandPrimary }}
            >
              Request a demo
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <div className="mx-auto grid max-w-[1240px] gap-1">
              {NAV.map(([label, href]) => (
                <button
                  key={href}
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToId(href, router);
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-bold hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl px-4 py-3 text-left text-sm font-bold"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setDemoOpen(true);
                }}
                className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-bold text-white"
                style={{ background: brandPrimary }}
              >
                Request a demo
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_80%_10%,rgba(21,148,95,0.10),transparent_36%),radial-gradient(circle_at_10%_30%,rgba(59,130,246,0.08),transparent_30%)]" />
          <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Built for Kenyan school operations
              </div>
              <h1 className="max-w-3xl text-[44px] font-black leading-[0.98] tracking-[-0.055em] text-[#101a2e] sm:text-6xl lg:text-[72px]">
                Run your entire school from one{" "}
                <span style={{ color: brandAccent }}>operating system.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
                Run admissions, fees, attendance, CBE, exams, timetables, parent
                communication and campus operations from one clear school
                operating system.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10"
                  style={{ background: brandPrimary }}
                >
                  Request a guided demo <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToId("#product", router)}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-7 text-sm font-extrabold"
                >
                  Explore School OS
                </button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Requests are reviewed before a school workspace is created.
              </p>
            </div>
            <ProductFrame
              src={schoolMedia}
              alt="NEYO School OS timetable workspace"
              label="Real NEYO School OS interface"
            />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50/80 px-4 py-7 sm:px-6">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5">
            {[
              ["19", "responsibility-based roles"],
              ["CBE", "delivery to evidence"],
              ["KES", "Kenyan finance workflows"],
              ["360px", "small-phone attention"],
              ["A4", "clear printable outputs"],
            ].map(([value, text], index) => (
              <div
                key={value}
                className={
                  index === 4
                    ? "col-span-2 text-center md:col-span-1"
                    : "text-center"
                }
              >
                <p className="text-xl font-black tracking-tight">{value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="The whole school in view"
              title="Know what needs attention before it becomes a problem."
              text="NEYO connects the learner record, the school day and the work behind it. Leaders see the full picture while every team member receives the tools appropriate to their responsibility."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <Outcome
                icon={Users}
                title="Follow every learner"
                text="Move from enquiry and admission through classes, attendance, fees, assessment, promotion and alumni records without losing the learner's story."
                color="bg-blue-50 text-blue-700"
              />
              <Outcome
                icon={BarChart3}
                title="Make informed decisions"
                text="Bring operational signals, approvals and reports into one place instead of waiting for disconnected files and verbal updates."
                color="bg-emerald-50 text-emerald-700"
              />
              <Outcome
                icon={ClipboardCheck}
                title="Keep responsibility clear"
                text="Use role-aware actions, protected settings and audit trails so the right people can act without opening every record to everyone."
                color="bg-amber-50 text-amber-700"
              />
            </div>
          </div>
        </section>

        <FeatureBand
          id="finance"
          eyebrow="Fees and finance"
          title="See what was billed, paid, allocated and still outstanding."
          text="Build fee structures, follow learner balances, issue receipts and reconcile payment records with an accountable trail. NEYO is designed around Kenyan money workflows and school responsibilities—not a foreign accounting template."
          bullets={[
            "Student ledgers and fee structures",
            "Receipts, balances and payment allocation",
            "M-Pesa reconciliation workflows",
            "Finance reporting and controlled approvals",
          ]}
        />

        <section
          id="academics"
          className="bg-[#101a2e] px-4 py-20 text-white sm:px-6 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="CBE and academic delivery"
              title="CBE is more than a report card."
              text="Connect curriculum design, actual teaching, classroom evidence, assessment and learner support. Keep manual and rule-based paths available throughout."
              light
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <DarkStep
                number="01"
                title="Plan"
                text="Organise curriculum designs, learning areas, strands and outcomes for the school context."
              />
              <DarkStep
                number="02"
                title="Deliver & capture"
                text="Record delivery sessions and attach evidence instead of waiting until reporting week."
              />
              <DarkStep
                number="03"
                title="Support"
                text="Connect assessment signals to interventions and follow-up for the individual learner."
              />
            </div>
            <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white p-2 shadow-2xl sm:p-3">
              <img
                src="/screenshots/neyo-learning-videos.png"
                alt="A real NEYO teacher learning workspace"
                className="aspect-[16/8.5] w-full rounded-[20px] object-cover object-top"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-2 lg:items-center">
            <ProductFrame
              src="/screenshots/neyo-school-os-dashboard.png"
              alt="Print-ready class timetable produced in NEYO"
              label="Deterministic, reviewable timetable output"
            />
            <FeatureCopy
              eyebrow="Senior School and timetabling"
              title="Plan learner choices without losing the individual learner."
              text="NEYO's deterministic timetable engine checks the real constraints before publication. It never silently changes learner choices and never hides unplaced lessons."
              bullets={[
                "Confirmed elective choices and Option A/B/C blocks",
                "Qualified teacher, venue and capacity checks",
                "Same-subject teaching groups and personal learner proof",
                "Committee review, Head approval and controlled publication",
              ]}
            />
          </div>
        </section>

        <section
          id="operations"
          className="bg-[#f4f6f8] px-4 py-20 sm:px-6 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="Beyond the classroom"
              title="The rest of the school belongs in the picture too."
              text="Bring daily services and resources closer to the learner record while preserving clear ownership for each department."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Module
                icon={Library}
                title="Library"
                text="Catalogue, copy-level loans, QR and barcode labels, returns and due-date policy."
              />
              <Module
                icon={Bus}
                title="Transport"
                text="Routes, vehicles, stops, assigned learners and operational transport records."
              />
              <Module
                icon={HeartPulse}
                title="Clinic & welfare"
                text="Restricted medical records, visits, allergies, medication and learner support."
              />
              <Module
                icon={CreditCard}
                title="Campus services"
                text="Cafeteria, hostel, inventory, uniforms, activities and resource workflows."
              />
            </div>
            <div className="mt-5 rounded-[28px] bg-gradient-to-r from-emerald-500 to-lime-400 p-6 sm:p-9">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <QrCode className="mb-4 h-8 w-8" />
                  <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                    From screen to the physical school day.
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-emerald-950/75">
                    Print scannable library labels, school documents and clear
                    A4 timetables. NEYO is designed to support the work people
                    actually carry out—not only dashboards.
                  </p>
                </div>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="rounded-full bg-[#101a2e] px-6 py-3 text-sm font-extrabold text-white"
                >
                  See the workflows
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="One system, different responsibilities"
              title="Everyone sees the school from the role they hold."
              text="A Headteacher, bursar, teacher, librarian, parent and learner should not receive the same controls. NEYO brings them into one system without pretending they have the same job."
            />
            <div className="mt-12 flex flex-wrap justify-center gap-2.5">
              {[
                "School director",
                "Headteacher",
                "Administrator",
                "Bursar",
                "Teacher",
                "Class teacher",
                "Librarian",
                "Nurse",
                "Transport team",
                "Parent",
                "Learner",
              ].map((role, index) => (
                <span
                  key={role}
                  className={`rounded-full border px-4 py-2.5 text-sm font-bold ${index < 3 ? "border-[#101a2e] bg-[#101a2e] text-white" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#f7f9fb] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="A connected school day"
              title="Useful to the office, the classroom and the family."
              text="NEYO is designed around the moments each person needs to act—not around one oversized dashboard handed to everyone."
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <PersonaCard
                icon={BarChart3}
                audience="For school leadership"
                title="See the decisions waiting for you."
                text="Follow admissions, collections, attendance, academic delivery and operational approvals without asking five departments for five different files."
                points={[
                  "Leadership overview",
                  "Approvals and accountability",
                  "Reports across school operations",
                ]}
              />
              <PersonaCard
                icon={ClipboardCheck}
                audience="For teachers and staff"
                title="Get to the work for today."
                text="Move quickly between classes, attendance, lesson delivery, assessment, communication and assigned responsibilities from the tools your role permits."
                points={[
                  "Class and learner context",
                  "Academic delivery evidence",
                  "Clear role-specific actions",
                ]}
              />
              <PersonaCard
                icon={Smartphone}
                audience="For parents and learners"
                title="Stay informed from a smaller screen."
                text="Give families an authorised view of the records the school chooses to share, without making routine questions another queue at the school office."
                points={[
                  "Balances and receipts",
                  "Attendance and academic records",
                  "Notices and school information",
                ]}
              />
            </div>
          </div>
        </section>

        <section id="security" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-[1240px] gap-10 overflow-hidden rounded-[32px] bg-[#101a2e] p-7 text-white sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-[#101a2e]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Security without theatre
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Protect access. Keep actions accountable.
              </h2>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
                NEYO should earn trust through verifiable controls, careful
                onboarding and honest policies—not badges or certifications it
                has not earned.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "School-specific data boundaries",
                "Role and permission controls",
                "Audit trails for sensitive actions",
                "Protected settings and sessions",
                "Restricted integration credentials",
                "Versioned Terms and Privacy Policy",
              ].map((point) => (
                <div
                  key={point}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold"
                >
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="founder"
          className="border-y border-slate-200 bg-[#f7f4ed] px-4 py-20 sm:px-6 sm:py-28"
        >
          <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[32px] bg-[#101a2e] p-8 text-white shadow-xl">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20" />
              <div className="relative">
                <div className="grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-white/10 text-3xl font-black">
                  EM
                </div>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Founder of NEYO
                </p>
                <p className="mt-2 text-2xl font-black">Elvis Malimbe</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  University of Nairobi
                  <br />
                  Project Planning & Management
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Built in Nairobi
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
                Close to the schools it is designed to serve.
              </h2>
              <div className="mt-6 space-y-4 text-base font-medium leading-8 text-slate-600">
                <p>
                  NEYO was founded by Elvis Malimbe, a 19-year-old Kenyan
                  founder and University of Nairobi student studying Project
                  Planning and Management.
                </p>
                <p>
                  He began building around a simple observation: important
                  school work is often divided across paper files, spreadsheets,
                  disconnected applications and knowledge held by individual
                  staff members. The result is repeated work, delayed decisions
                  and a learner story that is difficult to follow from admission
                  to graduation.
                </p>
                <p>
                  NEYO School OS is being built to connect those operations
                  around the realities of Kenyan schools—from CBE delivery and
                  Senior School choices to fees, timetables, parent access and
                  the everyday campus.
                </p>
              </div>
              <div className="mt-6 border-l-4 border-emerald-500 pl-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                  The building principle
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                  Build with schools, test real workflows and improve from
                  evidence—not appearances.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[1240px]">
            <SectionIntro
              eyebrow="A responsible rollout"
              title="Move carefully. Verify every important record."
              text="A school operating system should not be switched on like a disposable app. NEYO's rollout path is designed around understanding, verification and role-by-role readiness."
            />
            <div className="mt-12 grid gap-3 md:grid-cols-4">
              {[
                [
                  "01",
                  "Understand",
                  "Map the school's levels, terms, responsibilities and current problems.",
                ],
                [
                  "02",
                  "Prepare",
                  "Configure structures and review data before committing records.",
                ],
                [
                  "03",
                  "Pilot",
                  "Train by role and test selected workflows with accountable owners.",
                ],
                [
                  "04",
                  "Approve",
                  "Confirm readiness, move deliberately and support the school after go-live.",
                ],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="rounded-3xl border border-slate-200 p-6"
                >
                  <span className="text-xs font-black text-emerald-700">
                    {number}
                  </span>
                  <h3 className="mt-8 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="bg-[#101a2e] px-4 py-20 text-white sm:px-6 sm:py-28"
        >
          <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Pilot access and pricing
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">
                Understand the school before prescribing the package.
              </h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                NEYO is preparing for approved pilot schools. A demo request is
                free and creates no charge. Pricing and rollout scope are
                discussed after understanding the school's size, selected
                operating model, data preparation and support needs.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "No payment during a demo request",
                  "No workspace created without review",
                  "KES pricing explained before activation",
                  "Scope and onboarding agreed with the school",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-200"
                  >
                    <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-7 text-[#101a2e] shadow-2xl sm:p-9">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Receipt className="h-6 w-6" />
              </span>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                The next step
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-tight">
                Request a guided school review.
              </h3>
              <ol className="mt-6 grid gap-4 text-sm font-semibold text-slate-600">
                <li className="flex gap-3">
                  <b className="text-emerald-700">1.</b> Tell NEYO who you are
                  and which school you represent.
                </li>
                <li className="flex gap-3">
                  <b className="text-emerald-700">2.</b> The request enters
                  review instead of opening an uncontrolled account.
                </li>
                <li className="flex gap-3">
                  <b className="text-emerald-700">3.</b> NEYO follows up with
                  the suitable demonstration and rollout discussion.
                </li>
              </ol>
              <button
                onClick={() => setDemoOpen(true)}
                className="mt-8 w-full rounded-full bg-[#101a2e] px-6 py-3.5 text-sm font-black text-white"
              >
                Request a guided demo
              </button>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <SectionIntro
              eyebrow="Questions school leaders ask"
              title="Clear answers before a demonstration."
            />
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map(([question, answer]) => (
                <details key={question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-extrabold">
                    <span>{question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
                  </summary>
                  <p className="max-w-2xl pb-6 text-sm font-medium leading-7 text-slate-600">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[34px] bg-[#101a2e] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              School OS is the focus
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              See how one connected system could change your school day.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              Tell us about your school. NEYO will review the request and
              arrange the most appropriate demonstration or follow-up.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setDemoOpen(true)}
                className="rounded-full bg-emerald-400 px-7 py-3.5 text-sm font-black text-[#101a2e]"
              >
                Request a guided demo
              </button>
              <a
                href="mailto:hello@neyo.co.ke"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-black"
              >
                Email NEYO
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 px-4 py-12 sm:px-6">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                What NEYO may build next
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Farm OS, Business OS and Creator OS remain future product
                directions. School OS is the current focus.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Farm OS", "Business OS", "Creator OS"].map((os) => (
                <span
                  key={os}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"
                >
                  {os} · Future
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b1324] px-4 pb-8 pt-14 text-white sm:px-6">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-xl font-black">NEYO</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                A connected operating system for Kenyan school administration,
                learning and daily operations.
              </p>
              <button
                onClick={install}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-300"
              >
                <Download className="h-4 w-4" />
                Install NEYO
              </button>
            </div>
            <FooterGroup
              title="Product"
              links={[
                ["School OS", "#product"],
                ["CBE & academics", "#academics"],
                ["Operations", "#operations"],
                ["Security", "#security"],
                ["Pricing", "#pricing"],
              ]}
              onGo={(href) => scrollToId(href, router)}
            />
            <FooterGroup
              title="Company"
              links={[
                ["Founder", "#founder"],
                ["Developers", "/developers"],
                ["Contact", "mailto:hello@neyo.co.ke"],
                ["Sign in", "/login"],
              ]}
              onGo={(href) => scrollToId(href, router)}
            />
            <FooterGroup
              title="Legal"
              links={[
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
                ["Request a demo", "#demo"],
              ]}
              onGo={(href) =>
                href === "#demo" ? setDemoOpen(true) : scrollToId(href, router)
              }
            />
          </div>
          <div className="flex flex-col gap-3 pt-7 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} NEYO. Built in Nairobi, Kenya.</p>
            <p>School OS first. Evidence before claims.</p>
          </div>
        </div>
      </footer>

      {demoOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#08101f]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDemoOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-title"
            className="my-6 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                  Guided school demonstration
                </p>
                <h2
                  id="demo-title"
                  className="mt-2 text-2xl font-black tracking-tight"
                >
                  Tell us about your school
                </h2>
              </div>
              <button
                onClick={() => setDemoOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-xl font-black">Request received</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
                  Your request is pending review. No school workspace or login
                  was created automatically.
                </p>
                <Button className="mt-7" onClick={() => setDemoOpen(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={submitDemo} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your full name">
                    <Input
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="School name">
                    <Input
                      value={form.schoolName}
                      onChange={(e) =>
                        setForm({ ...form, schoolName: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Work email">
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>
                <Field label="Kenyan phone number">
                  <Input
                    required
                    inputMode="tel"
                    placeholder="0712 345 678"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </Field>
                <p className="rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-5 text-slate-500">
                  Submitting creates a pending request for review by the NEYO
                  team. It does not create a tenant, session or automatic public
                  demo account.
                </p>
                <Button className="h-12 w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <School className="h-4 w-4" />
                  )}
                  Submit demo request
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p
        className={`text-xs font-black uppercase tracking-[0.2em] ${light ? "text-emerald-300" : "text-emerald-700"}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-3xl font-black tracking-[-0.045em] sm:text-5xl ${light ? "text-white" : "text-[#101a2e]"}`}
      >
        {title}
      </h2>
      {text && (
        <p
          className={`mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 sm:text-base ${light ? "text-slate-300" : "text-slate-600"}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
function ProductFrame({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div>
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_28px_80px_rgba(15,23,42,0.15)]">
        <div className="flex h-8 items-center gap-1.5 px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <img
          src={src}
          alt={alt}
          className="aspect-[16/10] w-full rounded-[16px] bg-slate-50 object-cover object-top"
        />
      </div>
      <p className="mt-3 text-center text-[11px] font-bold text-slate-400">
        {label}
      </p>
    </div>
  );
}
function Outcome({
  icon: Icon,
  title,
  text,
  color,
}: {
  icon: any;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <article className="rounded-[26px] border border-slate-200 p-6 sm:p-8">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-8 text-xl font-black tracking-tight">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
        {text}
      </p>
    </article>
  );
}
function FeatureCopy({
  eyebrow,
  title,
  text,
  bullets,
}: {
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-sm font-medium leading-7 text-slate-600 sm:text-base">
        {text}
      </p>
      <ul className="mt-7 grid gap-3">
        {bullets.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm font-bold text-slate-700"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3 w-3" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
function FeatureBand({
  id,
  eyebrow,
  title,
  text,
  bullets,
}: {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
}) {
  return (
    <section id={id} className="bg-[#f4f6f8] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-2 lg:items-center">
        <FeatureCopy
          eyebrow={eyebrow}
          title={title}
          text={text}
          bullets={bullets}
        />
        <FinancePreview />
      </div>
    </section>
  );
}

function FinancePreview() {
  const summary = [
    ["Billed", "KES 4.82M"],
    ["Allocated", "KES 3.67M"],
    ["Outstanding", "KES 1.15M"],
  ];
  const steps = [
    "Payment received and matched to learner",
    "Receipt available to authorised users",
    "Balance and audit trail updated",
  ];
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.13)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Illustrative school workflow
          </p>
          <p className="mt-1 text-sm font-black">Fees overview</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
          Current term
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {summary.map(([label, value], index) => (
          <div
            key={label}
            className={`rounded-2xl p-4 ${index === 1 ? "bg-emerald-500 text-white" : "bg-slate-50"}`}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${index === 1 ? "text-emerald-50" : "text-slate-400"}`}
            >
              {label}
            </p>
            <p className="mt-2 text-lg font-black tracking-tight">{value}</p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-5 sm:px-5">
        <div className="rounded-2xl border border-slate-100 p-4">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-black">Collection movement</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">
                Example presentation—not live school data
              </p>
            </div>
            <span className="text-xs font-black text-emerald-700">76%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[76%] rounded-full bg-emerald-500" />
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          {steps.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] text-emerald-700 shadow-sm">
                {index + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function DarkStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-black text-emerald-300">{number}</p>
      <h3 className="mt-8 text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}
function Module({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm">
      <Icon className="h-6 w-6 text-emerald-700" />
      <h3 className="mt-8 text-lg font-black">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}
function PersonaCard({
  icon: Icon,
  audience,
  title,
  text,
  points,
}: {
  icon: any;
  audience: string;
  title: string;
  text: string;
  points: string[];
}) {
  return (
    <article className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
          {audience}
        </p>
      </div>
      <h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-[#101a2e]">
        {title}
      </h3>
      <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
        {text}
      </p>
      <ul className="mt-7 grid gap-3 border-t border-slate-100 pt-6">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-center gap-3 text-xs font-bold text-slate-600"
          >
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

function FooterGroup({
  title,
  links,
  onGo,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
  onGo: (href: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="mt-5 grid gap-3">
        {links.map(([label, href]) =>
          href.startsWith("mailto:") ? (
            <a
              key={href}
              href={href}
              className="text-sm font-semibold text-slate-300 hover:text-white"
            >
              {label}
            </a>
          ) : (
            <button
              key={href}
              onClick={() => onGo(href)}
              className="text-left text-sm font-semibold text-slate-300 hover:text-white"
            >
              {label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
