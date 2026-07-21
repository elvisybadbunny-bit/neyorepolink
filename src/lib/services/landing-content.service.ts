import { z } from "zod";
import { db } from "@/lib/db";

export const LANDING_CONTENT_KEY = "neyo_landing_content";

const linkSchema = z.object({ label: z.string().trim().min(1).max(40), href: z.string().trim().min(1).max(240) });
const statSchema = z.object({ value: z.string().trim().min(1).max(24), label: z.string().trim().min(1).max(80), note: z.string().trim().max(160).optional().or(z.literal("")) });
const productSchema = z.object({
  key: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(80),
  status: z.enum(["LIVE", "WAITLIST", "COMING_SOON"]),
  description: z.string().trim().min(5).max(240),
  features: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
  mediaUrl: z.string().trim().max(500).optional().or(z.literal("")),
});
const mediaSchema = z.object({ label: z.string().trim().min(1).max(80), type: z.enum(["image", "video", "embed"]), url: z.string().trim().max(500).optional().or(z.literal("")), caption: z.string().trim().max(180).optional().or(z.literal("")) });

export const landingContentSchema = z.object({
  version: z.literal(1).default(1),
  nav: z.array(linkSchema).min(3).max(8),
  heroEyebrow: z.string().trim().min(2).max(80),
  heroHeadline: z.string().trim().min(8).max(140),
  heroSubheadline: z.string().trim().min(20).max(260),
  primaryCta: linkSchema,
  secondaryCta: linkSchema,
  launchBanner: z.string().trim().max(160).optional().or(z.literal("")),
  trustStats: z.array(statSchema).min(3).max(6),
  products: z.array(productSchema).min(4).max(12),
  industries: z.array(z.string().trim().min(2).max(40)).min(4).max(12),
  whyNeyo: z.array(z.string().trim().min(3).max(100)).min(4).max(12),
  mediaShowcase: z.array(mediaSchema).min(3).max(10),
  securityPoints: z.array(z.string().trim().min(3).max(100)).min(3).max(10),
  finalHeadline: z.string().trim().min(8).max(120),
  finalSubheadline: z.string().trim().min(8).max(220),
  footerLinks: z.array(linkSchema).min(4).max(16),
  socialLinks: z.array(linkSchema).max(8),
  seoTitle: z.string().trim().min(8).max(80),
  seoDescription: z.string().trim().min(20).max(180),
  ogImageUrl: z.string().trim().max(500).optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  const forbidden = /api key|secret|password|credential|database|prompt|token|private key|daraja consumer|passkey/i;
  const scan = JSON.stringify(value);
  if (forbidden.test(scan)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Landing content must describe features only. Do not expose secrets, credentials, prompts or internal provider details." });
  }
});

export type LandingContent = z.infer<typeof landingContentSchema>;

export function defaultLandingContent(): LandingContent {
  return landingContentSchema.parse({
    version: 1,
    nav: [
      { label: "Products", href: "#products" },
      { label: "Industries", href: "#industries" },
      { label: "Security", href: "#security" },
      { label: "Pricing", href: "#pricing" },
      { label: "Company", href: "#company" },
    ],
    heroEyebrow: "School management system for Kenya",
    heroHeadline: "One school. Every operation. Finally connected.",
    heroSubheadline: "Run admissions, fees, attendance, CBE, exams, timetables, parent communication and campus operations from one clear school operating system.",
    primaryCta: { label: "Request a guided demo", href: "#demo" },
    secondaryCta: { label: "Explore School OS", href: "#product" },
    launchBanner: "NEYO School OS is preparing carefully for approved pilot schools.",
    trustStats: [
      { value: "19", label: "Responsibility-based roles", note: "Clear permissions by responsibility" },
      { value: "CBE", label: "Curriculum to evidence", note: "Delivery, assessment and learner support" },
      { value: "KES", label: "Kenyan finance workflows", note: "Local billing and M-Pesa reconciliation workflows" },
    ],
    products: [
      { key: "school", name: "School OS", status: "WAITLIST", description: "A connected operating system for Kenyan school administration, learning and daily operations.", features: ["Admissions and learner records", "Fees and M-Pesa reconciliation", "Attendance", "CBE delivery and assessment", "Deterministic timetables", "Parent and learner access", "Library and campus services", "Role-controlled operations"], mediaUrl: "/screenshots/neyo-school-os-dashboard.png" },
      { key: "farm", name: "Farm OS", status: "WAITLIST", description: "Operations layer for farms, cooperatives, stock, teams and field records.", features: ["Stock", "Teams", "Payments", "Reports"], mediaUrl: "" },
      { key: "business", name: "Business OS", status: "WAITLIST", description: "Customer, inventory, billing and team workflows for small and growing businesses.", features: ["Customers", "Inventory", "Sales", "Team tasks"], mediaUrl: "" },
      { key: "creator", name: "Creator OS", status: "WAITLIST", description: "A clean operating base for creator businesses, content calendars, sales and community.", features: ["Content calendar", "Sales", "Audience", "Reports"], mediaUrl: "" },
    ],
    industries: ["Education", "Agriculture", "Retail", "SMEs", "NGOs", "Healthcare", "Enterprise"],
    whyNeyo: ["Modular architecture", "Unified reporting", "Local compliance", "Multi-device access", "Audit logs", "Role-based permissions"],
    mediaShowcase: [
      { label: "School OS timetable", type: "image", url: "/screenshots/neyo-school-os-dashboard.png", caption: "A real print-ready school timetable workspace." },
      { label: "NEYO Ops cockpit", type: "image", url: "/screenshots/neyo-ops-cockpit.png", caption: "NEYO runs NEYO inside NEYO." },
      { label: "Learning video casting", type: "image", url: "/screenshots/neyo-learning-videos.png", caption: "Teachers can search, watch and cast lessons." },
    ],
    securityPoints: ["Role-based access", "Audit logs", "Protected settings", "Data isolation", "Backups-ready architecture"],
    finalHeadline: "Ready to run your organization smarter?",
    finalSubheadline: "Start with School OS today, or join the next NEYO operating-system waitlist.",
    footerLinks: [
      { label: "School OS", href: "/os/school/login" },
      { label: "Business OS", href: "/os/business/login" },
      { label: "Farm OS", href: "/os/farm/login" },
      { label: "Creator OS", href: "/os/creator/login" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    socialLinks: [],
    seoTitle: "NEYO School Management System Kenya — CBE School OS",
    seoDescription: "NEYO is a Kenyan school management system for admissions, fees, M-Pesa reconciliation, attendance, CBE assessments, timetables, parents and daily operations.",
    ogImageUrl: "/screenshots/neyo-school-os-dashboard.png",
  });
}

function publicMediaUrl(value: string | undefined): string {
  if (!value) return "";
  const legacy: Record<string, string> = {
    "screenshots/i25-dashboard-sparklines.png": "/screenshots/neyo-school-os-dashboard.png",
    "screenshots/i48-neyo-business-os-cockpit.png": "/screenshots/neyo-ops-cockpit.png",
    "screenshots/i27-youtube-learning.png": "/screenshots/neyo-learning-videos.png",
  };
  if (legacy[value]) return legacy[value];
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

function normalizeLandingMedia(content: LandingContent): LandingContent {
  // The former multi-OS homepage made School OS look like one experiment among
  // four. Once the school-first public site launched, that exact stored legacy
  // payload stopped being authoritative so an old database row cannot restore
  // obsolete positioning or leak it into metadata/structured search data.
  if (content.heroHeadline === "All your organization on one platform.") {
    return normalizeLandingMedia(defaultLandingContent());
  }
  const legacySeo = content.seoTitle === "NEYO — Operating systems for modern organizations";
  const legacyLaunch = content.launchBanner === "School OS is live. Farm, Business and Creator OS are opening through waitlists.";
  return {
    ...content,
    launchBanner: legacyLaunch ? "School OS is preparing for pilot schools. Farm, Business and Creator OS remain on waitlists." : content.launchBanner,
    trustStats: content.trustStats.map((stat) => stat.label === "Role groups" && stat.value === "16" ? { ...stat, value: "19" } : stat),
    seoTitle: legacySeo ? "NEYO School Management System Kenya — CBE School OS" : content.seoTitle,
    seoDescription: legacySeo ? "NEYO is a Kenyan school management system for admissions, fees, M-Pesa reconciliation, attendance, CBE assessments, timetables, parents and daily operations." : content.seoDescription,
    products: content.products.map((product) => ({ ...product, status: legacyLaunch && product.key === "school" ? "WAITLIST" as const : product.status, mediaUrl: publicMediaUrl(product.mediaUrl) })),
    mediaShowcase: content.mediaShowcase.map((item) => ({ ...item, url: publicMediaUrl(item.url) })),
    ogImageUrl: publicMediaUrl(content.ogImageUrl),
  };
}

export async function getLandingContent(): Promise<LandingContent> {
  const row = await db.platformSetting.findUnique({ where: { key: LANDING_CONTENT_KEY } });
  if (!row?.value) return normalizeLandingMedia(defaultLandingContent());
  try { return normalizeLandingMedia(landingContentSchema.parse(JSON.parse(row.value))); } catch { return normalizeLandingMedia(defaultLandingContent()); }
}

export async function saveLandingContent(input: unknown, actor: { id: string; fullName: string; tenantId: string }) {
  const content = landingContentSchema.parse(input);
  const setting = await db.platformSetting.upsert({
    where: { key: LANDING_CONTENT_KEY },
    create: { key: LANDING_CONTENT_KEY, value: JSON.stringify(content), updatedBy: actor.fullName },
    update: { value: JSON.stringify(content), updatedBy: actor.fullName },
  });
  await db.auditLog.create({ data: { tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName, action: "platform.landing_content_updated", entityType: "PlatformSetting", entityId: setting.key, metadata: JSON.stringify({ nav: content.nav.length, products: content.products.length, media: content.mediaShowcase.length }) } });
  return content;
}
