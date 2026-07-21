# eBingwa search-image research, NEYO website and auth/governance audit

**Date:** 21 July 2026

## Public search finding

eBingwa’s indexed pages expose crawlable product images and structured metadata. Public search results show `SoftwareApplication`/`EducationalApplication` data with a `screenshot` URL such as `https://ebingwa.co.ke/images/og/home.png`, plus feature lists, descriptions, language/area and Open Graph-style content. Its site also publishes many keyword-specific pages about fees, CBC grading and school management, giving search engines topical pages and associated images.

This does not prove every eBingwa marketing claim. Ratings, school counts, compliance, security and performance statements remain vendor claims unless independently verified.

Sources:

- https://ebingwa.co.ke/
- https://ebingwa.com/
- https://ebingwa.co.ke/features/fees-management
- https://ebingwa.com/features

## NEYO website findings before repair

`www.neyo.co.ke` was reachable and indexed as “NEYO — Operating systems for modern organizations,” but public fetch exposed literal media paths such as `screenshots/i25-dashboard-sparklines.png` instead of images. Root cause:

- screenshots lived in repository `/screenshots`, not Next public assets;
- defaults omitted leading `/`;
- `MediaSlot` rendered only `/...` or `http...` image paths;
- ProductCard printed “Media ready: path” rather than an image;
- no robots/sitemap route;
- no SoftwareApplication screenshot structured data;
- generic multi-OS SEO title was weaker for Kenyan school-management searches.

## Website repairs

- copied three real product screenshots into `public/screenshots`;
- normalised old saved media paths at read time;
- ProductCard now renders image/alt text;
- showcase renders crawlable images;
- default OG image is a real School OS screenshot;
- metadataBase, canonical, 1200×630 OG metadata and Twitter large card;
- SoftwareApplication JSON-LD with screenshot array and feature list;
- robots and sitemap routes;
- default SEO title/description focus on “School Management System Kenya” and CBE School OS;
- old stored generic SEO defaults are upgraded at read time without overwriting founder-custom content.

Google/Bing decide whether and when to show images; markup improves eligibility but cannot guarantee a search-result image.

# Claim-by-claim audit

## 1. Demo Requests approval workflow

### Before: FAIL / contradictory

The model, Founder tab and approval endpoint existed, but `/api/demo/start` immediately called `createDemoSchool`, set a session cookie and logged the visitor into a sandbox. It never created `DemoRequest`. Therefore the stated pending approval workflow was not connected to the login button.

Approval also used hardcoded `Demo2026!`, stored it in notes, and claimed SMS/email despite only attempting SMS.

### After: full connected workflow

- `/api/demo/start` validates/rate-limits and upserts PENDING DemoRequest only;
- no tenant/session created before approval;
- login displays pending-review confirmation rather than redirect;
- Ops approves/rejects once;
- approval creates sandbox;
- cryptographically random temporary password;
- demo owner marked for first-login password replacement;
- password not stored in notes or audit metadata;
- SMS attempted;
- authorised Ops receives one-time access modal, especially if SMS fails;
- response to ordinary public requester never contains credentials.

Contact format is validated, but email/phone ownership is not pre-verified before queueing. Do not call it “verified contact” until an email/phone verification step is added.

## 2. OS login routing

### Before: PARTIAL / wrong boundary

Several client handlers routed to `/founder` whenever the user selected Company OS—even if the account was a school role. Magic-link callback always routed to `/dashboard`, including company roles.

### After

Routing is based on authenticated role, not the decorative OS selected:

- FOUNDER/SUPER_ADMIN/NEYO_OPS/NEYO_SUPPORT → `/founder`;
- school roles → `/dashboard`;
- magic link follows the same boundary;
- OS selector cannot grant Company access.

Server permissions remain authoritative.

## 3. Biometric and shared modal positioning

### Audit: MOSTLY PASS, wording inaccurate

- Biometric gate uses a body portal, z-200, 100dvh, grid centring, scroll handling and passkey/WebAuthn server verification.
- Shared Dialog uses portal, z-200, dynamic height, safe area and internal scrolling.
- Shared Dialog intentionally behaves as a mobile bottom sheet, not exact centre, due the approved mobile-adaptability work. Therefore “all security modals locked to exact centre on mobile” is not true for every shared dialog.
- WebAuthn support depends on a registered passkey/device and browser support. NEYO does not directly scan fingerprint hardware itself; the browser/OS authenticator does.

## 4. Curated login, first activation and SMS recovery

### Before

- schema fields and login modal/routes existed;
- generator existed but had zero call sites, so emails were not generated;
- new users defaulted `hasSetInitialPassword=true`, so activation normally never appeared;
- recovery used `Math.random`, stored plaintext OTP in User, swallowed SMS failure while saying dispatched, lacked verify rate limit, and left other sessions active after reset.

### After

- collision-checked `ensureCuratedNeyoEmail` assigns once and never rotates;
- new student/guardian/staff/teacher-import accounts are marked for initial activation and receive curated identity;
- existing users missing curated identity receive one on successful login;
- recovery uses `crypto.randomInt`;
- only an HMAC-SHA-256 OTP digest keyed by NEYO's master secret is stored;
- active account required;
- 15-minute expiry required;
- send and verify endpoints rate-limited;
- failed SMS clears unusable OTP;
- generic send response prevents account enumeration;
- successful reset revokes all old sessions before creating a new session;
- password remains Argon2-hashed.

Users created with no password can first authenticate through the supported phone OTP flow and then complete activation. Schools still need a clear credential-distribution/onboarding SOP.

## 5. Multi-role permissions

### Before: PARTIAL

`effectivePermissionsForUser` correctly unions primary and secondary roles and supports company-account grants, but many app page props still called `can(user.role, ...)` only. A dual-role user could pass backend navigation checks yet see a disabled/hidden action on the page.

### After current repair

High-use app pages now resolve effective permissions once and use that list for management props/guards, including Students, Classes, Academics, CBE, Finance, Activities, Library, Inventory, Hostel, Transport, Cafeteria, Clinic, Calendar, LMS, Payroll, Teacher portal, Alumni and Student Profile. Exams retains role-specific release governance while using effective permissions for feature actions.

Some specialised service methods intentionally perform role-specific checks, and several already check both roles directly. Future regression tests should continue auditing direct role checks.

## 6. Verification/build claim

The pasted “8/8” output is historical and internally inconsistent: it references 1,443, 1,670 and 654 in one report. Current NEYO Question Bank expected fully seeded total has subsequently changed to 3,170 after the additional 500 expansion. The pasted commit `c4f1a38` is not in this Arena branch’s reachable history.

Therefore that pasted output must not be used as current release evidence. Current builds/tests must run against this branch and current schema/dependencies.

## Search image next steps outside code

1. Deploy public screenshot paths and verify HTTP 200 without authentication.
2. Use Google Search Console and Bing Webmaster Tools.
3. Submit `/sitemap.xml`.
4. Inspect URL and request indexing.
5. Validate OG card with social debuggers.
6. Ensure screenshots are real/current and contain no private data.
7. Publish useful school-management/CBE pages with unique screenshots and descriptive alt/captions.
8. Monitor image indexing; do not guarantee rich-result display.
