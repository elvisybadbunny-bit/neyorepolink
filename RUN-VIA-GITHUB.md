# Run NEYO on Your Laptop — the GitHub Way (no slow ZIP download)

**Written 2026-07-11.** This is the easier, faster way to get NEYO onto your laptop, since downloading the big ZIP file was taking too long / risked being wiped before you finished. Instead, the whole project has been pushed to a real GitHub repository that you own, and you'll pull it down ("clone" it) directly onto your laptop in seconds — this is the same tool professional software teams use every day, it just looks technical the first time.

Your repo: **`https://github.com/elvisybadbunny-bit/neyorepolink`**

> ⚠️ **Important security note first:** you pasted a GitHub access token (a temporary password-like key) into our chat earlier so I could push the code. That was fine for a one-time push, but **please revoke/delete that token now** that the push is done — go to GitHub → click your profile photo (top-right) → **Settings** → scroll down the left sidebar to **Developer settings** → **Personal access tokens** → find the one you created → **Delete**. Takes 10 seconds and closes that door completely. You do not need it again for anything in this guide below (cloning a repo to read/run it doesn't need a token if the repo is private and you're logged into GitHub in your browser/Git, or if you make the repo public).

---

## Step 1 — Make sure the repo is set to something you can access

Since this repo was just created, it's most likely **private** by default (only you can see it). That's good for your business. To clone it onto your laptop you have two options:

**Option A — Keep it private (recommended) and log in with GitHub Desktop (easiest for a non-coder)**
1. Go to `https://desktop.github.com` and download **GitHub Desktop** for your laptop (Windows or Mac).
2. Install it, open it, and click **Sign in to GitHub.com** — log in with your own GitHub account (the one that owns `elvisybadbunny-bit`, or whichever account has access).
3. Once signed in, click **File → Clone Repository**, find `elvisybadbunny-bit/neyorepolink` in the list, choose a folder on your laptop (e.g. Desktop), and click **Clone**.
4. Done — the whole NEYO project is now a real folder on your laptop, and GitHub Desktop remembers your login so you never need a token again.

**Option B — Use the plain Terminal/PowerShell `git clone` command**
This needs Git installed (see Step 2 below) and, since the repo is private, Git will pop up a browser window asking you to log into GitHub the first time — just click Authorize, no token typing needed.
```bash
git clone https://github.com/elvisybadbunny-bit/neyorepolink.git
```

---

## Step 2 — Install the 2 required programs (one-time, if not already installed)

### 2.1 Node.js
Go to **`https://nodejs.org`**, download the **LTS** version, install it with all default settings (Next → Next → Install → Finish).

Confirm it worked — open Terminal (Mac) or PowerShell (Windows) and type:
```bash
node -v
npm -v
```
You should see version numbers like `v20.x.x` and `10.x.x`.

### 2.2 Git
Go to **`https://git-scm.com/downloads`**, download for your system, install with default settings.

Confirm:
```bash
git --version
```

(If you used GitHub Desktop in Step 1 Option A, Git is often already bundled — you can skip installing it separately.)

---

## Step 3 — Open the project folder in your Terminal

If you cloned via GitHub Desktop: in the GitHub Desktop app, click **Repository → Open in Terminal** (or "Show in Explorer/Finder" and manually open a terminal there).

If you cloned via the command line: you're already inside it after `git clone` — just move into the `neyo` folder:
```bash
cd neyorepolink
```

Everything from here on is IDENTICAL to the ZIP-based instructions in `RUN-ON-YOUR-LAPTOP.md` — you're just starting from a `git clone` instead of unzipping a file. Continue with:

---

## Step 4 — Install packages, set up the database, and start NEYO

```bash
npm install
```
Wait for it to finish (a few minutes). It's normal to see warnings — only stop if you see the word `ERROR`.

```bash
npx prisma generate
```

The real database (`prisma/dev.db`) with all 3 test schools' data is already included in the repo, so you do NOT need to re-seed it — it should just work. If you ever want a completely fresh empty database instead, you can run `npm run migrate:deploy` then `npm run db:seed`, but that's optional.

```bash
npm run dev
```

You should see something like:
```
Local: http://localhost:3000
```

Leave that terminal window open (closing it stops NEYO), then open your browser to:
```
http://localhost:3000
```

---

## Step 5 — Log in and start testing

Use the real accounts:

| School | Email | Password |
|---|---|---|
| Karibu High School | `principal@karibuhigh.ac.ke` | `Karibu2026!` |
| Uwezo Primary & Junior School | `principal@uwezoschool.ac.ke` | `Uwezo2026!` |
| Kilimo Day Secondary School | `principal@kilimoday.ac.ke` | `Dual2026!` |
| NEYO Founder (your company account) | `founder@neyo.co.ke` | `Karibu2026!` |

For a full walkthrough of WHAT to test and what a "pass" looks like (Timetable Generator, Exam Timetables, Constraints, Teacher Transfers, Transport, and everything else), open **`docs/TESTING-GUIDE-FOR-FOUNDER.md`** in the same project folder — that's your testing checklist/constitution.

---

## Step 6 — Getting future updates from me onto your laptop

Whenever I make more fixes/features in the sandbox and push them to the same GitHub repo, you just need to pull the latest changes down — you do NOT need to re-clone the whole thing again.

**With GitHub Desktop:** open the app, select the `neyorepolink` repo, click **Fetch origin** then **Pull origin** (or it may just say "Pull" if there are new changes waiting).

**With Terminal:**
```bash
cd neyorepolink
git pull
```

Then just restart NEYO:
```bash
npm run dev
```
(If a fresh feature added new database fields, you may also need to run `npx prisma generate` again — I'll tell you explicitly whenever that's needed.)

---

## Why this fixes the "scary wiping" problem for good

The sandbox we've been working in (this AI workspace) is temporary and gets cleared periodically — that's a limitation of THIS sandbox environment, not of NEYO itself or of your laptop. Once code is pushed to your own GitHub repository, it lives permanently on GitHub's servers (owned by you, backed up by GitHub, completely outside this sandbox) — nothing here can ever delete it. And once you clone it to your own laptop and run it there, your laptop is a completely separate computer from this sandbox: nothing that happens here — wipes, resets, anything — can reach or affect your laptop copy. You now have TWO safe permanent copies of your work: the GitHub repo, and whatever's on your laptop's hard drive.
