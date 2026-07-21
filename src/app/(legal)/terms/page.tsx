import { NEYO_TERMS_EFFECTIVE_DATE, NEYO_TERMS_SECTIONS, NEYO_TERMS_VERSION } from "@/lib/legal/terms-of-service";

export const metadata = {
  title: "Terms of Service — NEYO",
  description: "Terms governing use of NEYO School OS, demos, pilots, subscriptions, data, security and connected services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-7">
      <header className="border-b border-navy-200 pb-5 dark:border-navy-700">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700 dark:text-green-300">Legal</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-navy-950 dark:text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">Effective: {NEYO_TERMS_EFFECTIVE_DATE} · Version {NEYO_TERMS_VERSION}</p>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">These public Terms are a product-operating document and should be reviewed by qualified Kenyan legal counsel before broad commercial launch. A signed customer agreement may contain additional commercial terms.</p>
      </header>

      {NEYO_TERMS_SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-lg font-black text-navy-950 dark:text-white">{section.title}</h2>
          {"paragraphs" in section && section.paragraphs?.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-navy-700 dark:text-navy-200">{paragraph}</p>)}
          {"bullets" in section && section.bullets ? <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-navy-700 dark:text-navy-200">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
        </section>
      ))}
    </article>
  );
}
