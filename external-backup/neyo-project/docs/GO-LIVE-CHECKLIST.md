# NEYO — Go Live on Your Real Domain (Founder Checklist)

**Written 2026-07-13.** This is written for you specifically — zero coding
experience assumed. It walks you through everything needed to put NEYO on
your own real domain (not `localhost`) so you can test it as the real,
official NEYO website. Follow it top to bottom, in order. Don't skip a
numbered step even if it looks optional — the numbers matter.

> **The short version**: your code lives on GitHub already. To make it a real
> website, you need 3 things — (1) a place to RUN the code (Vercel), (2) a
> real DATABASE it can talk to (Neon, a hosted Postgres), and (3) your DOMAIN
> pointed at that Vercel project. Everything below is just the concrete steps
> to set those 3 things up, safely, once.

---

## 0. What you already have (no action needed)

- ✅ Your code is on GitHub: `https://github.com/elvisybadbunny-bit/neyorepolink`
- ✅ A GitHub Actions pipeline (`.github/workflows/`) that automatically
  checks your code is healthy on every push (typecheck, tests, build).
- ✅ A `vercel.json` file already configured to build and deploy NEYO
  correctly, including a real background "cron" job NEYO needs every minute.
- ✅ Real, working multi-tenant subdomain logic already built — once your
  domain is live, every school automatically gets its own real address like
  `karibu-high.yourdomain.com` with ZERO extra setup per school.

Everything below is about connecting your REAL domain + a REAL production
database to that code — nothing in the app itself needs to change.

---

## 1. Buy/confirm your domain (if you haven't already)

If you already own a domain (e.g. from Truehost, Safaricom, GoDaddy,
Namecheap, or Google Domains), skip to Step 2.

If not: buy one now. For a Kenyan school SaaS, a `.co.ke` or `.com` both work
fine — whichever you already planned to use. Write it down exactly as you'll
type it everywhere below, for example:

```
neyo.co.ke
```

---

## 2. Create a Vercel account and connect your GitHub repo

Vercel is where your actual website will run (it's built specifically for
Next.js apps like NEYO, and has a genuinely free tier that's enough to test
with).

1. Go to **`https://vercel.com`** → **Sign Up** → choose **Continue with
   GitHub** (use the same GitHub account that owns `neyorepolink`).
2. Once logged in, click **Add New… → Project**.
3. Find `elvisybadbunny-bit/neyorepolink` in the list and click **Import**.
4. On the import screen:
   - **Framework Preset**: should auto-detect as `Next.js` — leave it.
   - **Root Directory**: leave as `./` (the repo root IS the neyo app).
   - **Build Command / Output**: leave the defaults — `vercel.json` already
     tells Vercel exactly how to build NEYO correctly (including running
     database migrations automatically before each deploy).
5. **Do NOT click Deploy yet** — first you need a real production database
   (Step 3) and some environment variables (Step 4), otherwise the first
   build will fail (a database-shaped hole, not a real bug).

---

## 3. Create your real production database (Postgres)

Your local testing so far has used a small file-based database (SQLite) —
that only works on one laptop and can't run on a real website. For the real
site you need a real hosted database. **Neon** is the easiest free option and
what NEYO's own config already expects.

1. Go to **`https://neon.tech`** → **Sign Up** (GitHub login works here too).
2. Click **Create a project**. Name it something like `neyo-production`.
   Choose a region close to Kenya if offered (e.g. Frankfurt/`eu-central`).
3. Once created, Neon shows you a **connection string** that looks like:
   ```
   postgresql://neondb_owner:AbCdEf123@ep-something-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   **Copy this entire string** — you'll paste it in twice below (Step 4 and
   Step 6). Treat it like a password; never post it publicly or paste it into
   chat with anyone you don't fully trust.

> **Real, important technical note**: NEYO's database schema file
> (`prisma/schema.prisma`) is currently set to `provider = "sqlite"` for
> your local laptop/sandbox testing (your choice, so all your existing test
> schools keep working exactly as before). The real Postgres version of the
> schema has ALREADY been built and fully tested against a genuine
> PostgreSQL database — real login, real dashboard, the full automated test
> suite, all confirmed working — but is kept as its OWN separate,
> ready-to-push branch of work rather than merged into your everyday
> sandbox code. **Tell me "push the Postgres switch now"** once you have
> your real Neon connection string ready, and I'll push it to GitHub as its
> own dedicated commit — your local SQLite testing setup is never affected.

---

## 4. Set your environment variables in Vercel

Back in Vercel, on your (not-yet-deployed) project: go to **Settings →
Environment Variables** and add each of these one at a time (Name on the
left, Value on the right), all scoped to **Production**:

| Name | Value | Where it comes from |
|---|---|---|
| `DATABASE_URL` | your real Neon connection string | Step 3 above |
| `NEYO_MASTER_KEK` | a real random secret — see below | generate fresh, see note |
| `APP_BASE_URL` | `https://neyo.co.ke` (your real domain, with `https://`) | your domain |
| `ROOT_DOMAIN` | `neyo.co.ke` (your real domain, NO `https://`, NO `www`) | your domain |
| `CRON_SECRET` | a real random secret — see below | generate fresh |
| `DARAJA_WEBHOOK_TOKEN` | a real random secret — see below | generate fresh |
| `WEBAUTHN_RP_ID` | `neyo.co.ke` (your real domain, NO `https://`) | your domain |
| `WEBAUTHN_ORIGIN` | `https://neyo.co.ke` (your real domain, with `https://`) | your domain |

**How to generate a real random secret** (for `NEYO_MASTER_KEK`,
`CRON_SECRET`, `DARAJA_WEBHOOK_TOKEN`): these need to be long, random, and
different from each other — never reuse the dev placeholder values from your
laptop's `.env` file. Easiest way: ask me directly in this chat, "generate me
3 fresh random secrets for production" and I'll generate real cryptographically
random values for you to paste in — I don't need your domain or anything else
to do that part.

> Replace `neyo.co.ke` above with YOUR actual domain everywhere — every row
> that mentions it needs your exact real domain, not this example.

> **Real, important note on the deploy failing with a cron error**: if your
> very first deploy fails with a message like *"Hobby accounts are limited
> to daily cron jobs"*, that's NOT about hosting your site — it's Vercel's
> free ("Hobby") plan only allowing a scheduled background task to run once
> a day, and NEYO's config originally asked for one every minute. This has
> already been fixed in the code (pushed to GitHub) — the schedule now runs
> once a day instead, which is completely fine for testing. If you already
> pulled the code before this fix, just re-pull the latest `main` branch (or
> click **Redeploy** in Vercel once you've re-imported/re-pulled) and the
> error will be gone. You do **not** need to pay for Vercel Pro just to
> deploy and test your site.

---

## 5. Point your domain at Vercel

> **You will only see the "Domains" tab once your project exists in Vercel
> AND has completed at least one deploy.** If Vercel Import screen has a
> visible **Domains** entry in the left-hand menu once you're inside the
> project (even before deploying), use that. If you don't see it yet, finish
> Step 7 (Deploy) first — once the first deploy succeeds, go to your
> project's page → click the **Settings** tab along the top → **Domains**
> will be one of the items in the left sidebar there.

1. Inside your Vercel project: click the **Settings** tab (top of the page)
   → **Domains** (left sidebar).
2. Type your domain (e.g. `neyo.co.ke`) and click **Add**.
3. Vercel will show you 1-2 DNS records to add — usually something like:
   - Type `A`, Name `@`, Value `76.76.21.21` (Vercel's real IP — Vercel shows
     you the exact current value, use theirs, not this example)
   - Type `CNAME`, Name `www`, Value `cname.vercel-dns.com`
4. Go to wherever you bought your domain (Truehost/Safaricom/GoDaddy/etc.) →
   find **DNS Management** or **DNS Settings** for that domain → add exactly
   the records Vercel showed you.
5. **Also add a wildcard record** so every school automatically gets its own
   subdomain (`karibu-high.neyo.co.ke`, etc.) with zero extra work per school:
   - Type `CNAME`, Name `*` (a literal asterisk), Value `cname.vercel-dns.com`
   - In Vercel, also click **Add** again under Domains and type `*.neyo.co.ke`
     (with YOUR real domain) so Vercel accepts traffic for any subdomain.
6. DNS changes can take anywhere from 5 minutes to a few hours to fully
   spread across the internet ("propagate") — this is normal, just wait and
   refresh.

---

## 6. Apply your database structure to the new production database

Once `DATABASE_URL` (Step 4) points at your real Neon database, the very
first deploy needs to create all of NEYO's real tables in it. This is
already automated: `vercel.json`'s `buildCommand` runs
`prisma migrate deploy` automatically before every build. You don't need to
run anything by hand — as long as `DATABASE_URL` is set correctly in Step 4,
the first deploy takes care of this.

If you ever want to double check it worked, or need to seed some real demo
data into production, tell me and I'll walk you through the exact safe
command — never run `prisma migrate reset` against a real production
database (that would wipe everything).

---

## 7. Deploy

1. Back on the Vercel import screen (or **Deployments** tab if you already
   clicked Deploy earlier), click **Deploy**.
2. Watch the build logs. It should show: install dependencies → generate
   Prisma client → apply migrations → build → deploy. Takes 2-5 minutes.
3. If it fails, copy the exact error text and paste it to me — I'll fix it
   directly in the code and push the fix to GitHub; Vercel will then
   automatically redeploy on the next push to `main` (or you click **Redeploy**
   in Vercel once the fix is pushed).

---

## 8. First real login

Once deployed and your domain's DNS has propagated:

1. Visit `https://neyo.co.ke` (your real domain) in a browser.
2. You should see NEYO's real marketing/landing page (not a login screen —
   the root domain is the public site, per how subdomain routing already
   works).
3. To log into a specific school, use that school's real subdomain, e.g.
   `https://karibu-high.neyo.co.ke/login` — **but note**: your Neon
   production database starts completely EMPTY (no demo schools yet). You
   have two real choices here, tell me which and I'll help:
   - **Fresh start**: create your own first real school through the real
     onboarding/signup flow, exactly as a genuine new customer would.
   - **Import your test data**: I can help you copy the demo schools
     (Karibu High, Kilimo Day, etc.) from your local `dev.db` into the new
     production Postgres database, if you want the exact same test data
     available on the real site too.

---

## 9. Recommended before real customers use it (not required just to test)

These aren't needed for YOU to test the real domain, but matter before real
schools sign up and pay:

- [ ] **Revoke the GitHub Personal Access Token** you shared earlier in this
      chat (Settings → Developer settings → Personal access tokens → Delete)
      — the code is already fully pushed, you don't need it anymore.
- [ ] **M-Pesa Daraja credentials** (for real fee payments) — see
      `docs/DEPLOY.md` and ask me when ready; until set, M-Pesa runs in a
      safe "dev mock" mode that never charges real money.
- [ ] **Real transactional email** (Resend) and **SMS** (Africa's Talking)
      API keys — until set, those features safely no-op instead of sending.
- [ ] **Background worker** (Fly.io) — only needed once you have real
      volume; NEYO runs background jobs in-process safely without it at
      small scale.
- [ ] **Branch protection on GitHub** (`docs/DEPLOY.md` §2) — a one-time
      GitHub settings change so future code changes always pass tests before
      going live.
- [ ] **Set `NODE_ENV=production`** — Vercel does this automatically, no
      action needed from you.

---

## Quick reference — what to tell me at each stage

- "I've bought my domain, it's `___`" → I'll help you fill in the exact
  environment variable values for Step 4.
- "Generate me 3 fresh random secrets for production" → I'll generate real
  values for `NEYO_MASTER_KEK`/`CRON_SECRET`/`DARAJA_WEBHOOK_TOKEN`.
- "I'm ready to switch the database to Postgres" → I'll make the real
  `schema.prisma` + migration changes and push them, fully tested first.
- "The Vercel build failed, here's the error: ___" → paste the exact error
  and I'll fix the code directly.
- "Copy my demo/test data into production" → I'll walk you through a safe,
  real one-time data copy from `dev.db` into your new Postgres database.
