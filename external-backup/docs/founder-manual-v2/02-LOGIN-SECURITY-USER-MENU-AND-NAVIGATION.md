# NEYO Founder Manual V2 — Module 02: Login, Security, User Menu & Navigation

**Main pages:** `/login`, `/settings/security`, the top bar and sidebar on every protected page  
**Last verified against code:** 2026-07-18  
**Purpose:** explain how every user enters NEYO safely, how their role changes what they can see,
and what every shell/security control does.

---

## 1. The four things NEYO checks

When someone signs in, NEYO must establish:

1. **Identity:** which `User` is this?
2. **School/company context:** which tenant or NEYO company area applies?
3. **Authentication strength:** password/OTP/passkey and, where enabled, second factor.
4. **Authorization:** role, secondary role, individual extra permissions, enabled school modules,
   platform pauses and owner-hidden navigation.

Signing in proves identity. It does not automatically grant every module.

---

## 2. Opening Login

Go to `/login` or the school's NEYO subdomain. Login first calls `/api/tenant/current`; when the host
resolves to a school, the heading says **Sign in to [School Name]**. If you are already signed in,
`/api/auth/me` sends you directly to `/dashboard` or `/founder` for Founder/legacy Super Admin.

The operating-system pills at the top link to the configured NEYO OS login surfaces. They change
branding/context; they do not let a school user become a company role.

---

## 3. Phone OTP login — default flow

### Step 1: Phone number

Field: **Phone number**  
Example: `0712 345 678`

Button: **Send code**

When pressed:

1. Browser POSTs the number to `/api/auth/otp/request`.
2. Server normalizes it to +254 format, checks account/rate limit and creates a hashed, expiring OTP.
3. Configured SMS transport sends six digits; development may show a dev code toast.
4. Screen changes to **Enter your code** and starts a 30-second resend countdown.

Button stays disabled until the number has a practical minimum length.

### Step 2: Six-digit code

Type/paste digits into six boxes. Completion can automatically call `/api/auth/otp/verify`.

Buttons:

- **Verify & sign in:** verifies code and creates session.
- **Change number:** returns to phone field and clears code.
- **Resend code:** available after countdown; requests a new code.

Expected result:

- ordinary school user → success screen → `/dashboard`;
- Founder/legacy Super Admin/company OS context → `/founder`;
- 2FA enabled → Two-factor verification step first;
- first login without initial password → Set Password activation modal.

Errors: invalid/expired/too many attempts, unknown/inactive account, rate limit or network problem.
Never ask support for the code; only the account owner should enter it.

---

## 4. Email and password login

From Phone screen press **Sign in with email & password**.

Fields:

- Email
- Password (show/hide control inside `PasswordInput`)

Button: **Sign in** → `/api/auth/password/login`.

Expected: success/2FA/first-login path as above. Errors use a general wrong-credentials message to
reduce account enumeration.

Other controls:

- **Forgot your password? Recover with 6-digit SMS OTP**
- **Use phone number instead**

Passwords are stored as Argon2id hashes. Nobody at NEYO can read the existing password.

---

## 5. Forgot Password

Open from email login.

### First screen

Field: **Account Phone or Email**  
Button: **Send SMS Recovery Code** → `/api/auth/password-reset/send-otp`  
Cancel closes modal.

The entered email must belong to an account with a registered recovery phone for SMS delivery.

### Second screen

Fields:

- six-digit SMS OTP;
- new password, minimum eight characters.

Buttons:

- **Verify Code & Reset Password** → `/api/auth/password-reset/verify-otp`;
- **Back** returns to account identifier.

On success, password changes, account unlocks/session is created according to service behavior, and
user is sent to the correct home. Treat any unexpected password-reset SMS as a security incident.

---

## 6. Magic-link login

Press **Email me a sign-in link**.

1. Enter email.
2. Press **Send sign-in link** → `/api/auth/magic/request`.
3. Screen says link expires in 15 minutes.
4. Open the link in the intended browser/device.
5. Callback consumes one-time token and creates session or requests 2FA.

Development may display **Open dev sign-in link**; production must send email and must not expose the
raw link in UI/logs.

Button **Back to sign in** returns to start.

Do not forward magic links. A consumed/expired link should fail safely.

---

## 7. Passkey login

Press **Sign in with a passkey**.

1. Enter email.
2. Press **Use passkey**.
3. `/api/auth/passkey/login/options` creates a WebAuthn challenge.
4. Browser asks for device fingerprint, Face ID, Windows Hello, security key or device PIN.
5. `/api/auth/passkey/login/verify` verifies signed assertion and counter.
6. 2FA may still apply according to account policy.

Requirements: secure HTTPS/localhost, supported browser/device, passkey already registered for that
account and correct WebAuthn RP/origin configuration.

Cancelling the browser prompt produces “Passkey sign-in was cancelled or not available.” Use OTP or
password fallback.

---

## 8. Two-factor verification

If TOTP is enabled, successful first-factor login does not create full access immediately. NEYO
returns a short-lived challenge and shows six boxes.

Enter:

- current six-digit authenticator code; or
- an unused recovery code where supported.

Button: **Verify & sign in** → `/api/auth/2fa/verify`.

Never send authenticator/recovery code to support. Each recovery code is single-use; store them
outside the same device where possible.

---

## 9. First-login Set Password

When `hasSetInitialPassword` is false, login opens **First Login Activation** instead of entering the
app immediately.

Field: new secure password, minimum eight characters.  
Button: **Activate Account & Enter School OS** → `/api/auth/set-initial-password`.

This closes the initial-password gap for accounts first entered by OTP/invitation. Use a unique
password rather than a school-wide shared one.

---

## 10. Demo school button

At Login press **Try NEYO with a demo school**.

Modal fields:

- valid Kenyan phone (required);
- work/school email (required);
- full name (optional).

Buttons:

- **Cancel**;
- **Verify & Launch Demo** → `/api/demo/start`.

Expected: isolated sample Kenyan school session, redirect Dashboard, 24-hour expiry/banner. This is
not production onboarding and sample records must not become a live school's records.

---

## 11. New school setup link

**Set up NEYO** opens `/get-started`. This is for authorized creation of a new school tenant/owner,
not for a teacher/parent who cannot find an existing account. Existing users ask their school
administrator to confirm phone/email/account status.

---

## 12. Security Settings page

Open sidebar **Security** or `/settings/security`. Every signed-in user can manage their own sign-in
protection. The page reads real TOTP/passkeys and shows cards:

1. Passkeys
2. Device App Unlock
3. Connected Accounts
4. Two-factor authentication
5. Finance biometric security (only tenant settings managers)
6. My NEYO Layout

### Passkeys card

Buttons guide Apple/Android/device registration through WebAuthn options and verification. Existing
passkeys show device label, created/last-used and remove control.

- Add only personal/trusted device.
- Remove lost/shared/unrecognized passkey.
- Keep another login/recovery method.

### Device App Unlock

Uses a registered passkey to protect reopening the app on this device. **Enable** is disabled until
a passkey exists. **Disable** turns local unlock preference off; it does not delete the passkey.

### Connected Accounts

Shows Google, Apple and Microsoft configured/connected status.

- **Connect:** starts signed OAuth flow and returns to Security.
- **Disconnect:** removes link; ensure another login method remains.
- Disabled Connect means provider credentials are not configured company-wide.

### Two-factor authentication

**Enable 2FA** starts setup, returns QR/secret, verifies current authenticator code, then presents
recovery codes. Save recovery codes before pressing **I've saved them**.

Disabling requires verification/confirmation. Leadership/company policy may require 2FA; do not
disable merely for convenience.

### Fingerprint / Face ID for money actions

Visible to users with `tenant.manage_settings`. This school setting requires biometric action
tickets for configured finance mutations. **Turn on/off** calls `/api/finance/security`. Device must
have usable passkey/biometric support for practical use.

### My NEYO Layout

Choices:

- Company default
- V1 Sidebar
- V2 Floating Bar

Saving calls `/api/me/shell-version`. This is personal presentation, not a permission change.

---

## 13. Top bar — desktop

From left to right:

1. School logo, or NEYO mark if no logo.
2. School name/module switch affordance. For Parents, this becomes real School Switcher.
3. Search bar “Search students, fees, staff…”; click or press Cmd/Ctrl+K.
4. Background Jobs badge.
5. Notifications bell.
6. Offline/Sync indicator.
7. Theme button.
8. User menu.

Print hides the top bar.

---

## 14. Top bar — mobile

- Hamburger opens sidebar drawer.
- Logo remains.
- Right side initially shows only notification bell.
- **Double tap the notification bell within about 450ms** to reveal Jobs, Offline, Theme and User
  Menu controls in a dropdown row.

This hidden-control gesture is current code behavior. If users regularly miss it, consider a future
visible “More” button for discoverability.

---

## 15. School switcher for Parents

Only Parent role receives the multi-school switcher. It loads linked parent accounts from
`/api/multi-school`.

- Press school name to list linked schools.
- Current school has a check.
- Press another school: session switches and redirects `/portal`.
- **Add another school:** enter the phone registered at the other school, send OTP, enter six digits,
  press **Verify & link**.

Linking requires proof via the other account's phone. It does not merge school databases; it links
parent identities for switching.

---

## 16. Global search / Command Palette

Open by clicking search, Cmd+K on Mac or Ctrl+K on Windows. It combines permission-filtered actions
and `/api/search?q=` results. Type at least the required query length, use arrows, Enter, or click.

Search results remain tenant/role scoped. A teacher/parent cannot discover unrelated learners by
searching a name or phone.

Press Escape or click backdrop to close.

---

## 17. Notification bell

The bell shows unread count and loads `/api/notifications`. It receives live updates and can show an
island-style notification.

Actions:

- click notification → mark/read and navigate to its `href` where available;
- mark one read;
- mark all read;
- enable native notifications → browser permission + push subscription;
- close drawer;
- dismiss current island.

Native permission must be granted by the user. Denied browser permission cannot be overridden by
NEYO. Notification is an alert/link; source module record remains authoritative.

---

## 18. Background Jobs badge

Shows relevant job activity/status when available. It does not grant permission to run company jobs.
If a job fails, open authorized Jobs/Founder tooling and inspect `JobRun`; do not repeatedly click or
refresh hoping it becomes successful.

---

## 19. Offline indicator

Shows online/offline and queued-sync state. Attendance and other explicitly offline-enabled actions
may enter an IndexedDB outbox and replay with idempotency. Not every page supports offline mutation.
Wait for successful sync before assuming server records changed.

---

## 20. Theme button

Each press cycles:

1. Liquid Glass
2. Liquid Glass dark
3. Plain light
4. Plain dark

Preference is saved in browser local storage. Company platform setting decides whether glass is
allowed and controls liquidity/colour intensity. A school user cannot override a company-wide glass
disable switch.

---

## 21. User menu

Press avatar/name.

### View as staff…

Only appears when authorized. Opens read-only same-school preview. Banner identifies View As.
Writes are blocked. Use to understand a staff view, not to perform their work.

### Language

Choose English or Kiswahili. Preference is provided through the language system/API. Only translated
strings change; data and permissions do not.

### Sign out

POST `/api/auth/logout`, clears current session, redirects Login. Use when leaving a device.

### Sign out all devices

Press once → confirmation. **Yes, all devices** calls `/api/auth/logout-everywhere` and invalidates
all sessions for this user. Use after loss/compromise/password concern. **Cancel** returns.

---

## 22. Sidebar and permission filtering

Sidebar uses one `NAVIGATION` registry and filters each item by:

1. enabled tenant module;
2. effective permission;
3. owner-configured hidden-nav roles;
4. NEYO platform-hidden/paused hrefs.

Dashboard, Settings and Security cannot be hidden through owner hidden-nav map. Active page is green.
Clicking in mobile drawer closes it.

A missing menu item may mean no permission, module disabled, role-hidden or platform paused. Typing
the URL should still encounter server-side protection; sidebar hiding alone is not security.

---

## 23. Shell V1 and V2

### V1 Sidebar

Desktop persistent left pane; mobile hamburger drawer; breadcrumbs; full-width content.

### V2 Floating Bar

Desktop left activity/intercom rail plus bottom floating module bar; mobile still uses sidebar
drawer; extra bottom padding avoids covering content.

Choice comes from My NEYO Layout or company default. Both consume the same real navigation and
permissions.

---

## 24. Breadcrumbs, help and banners

- Breadcrumbs show current route hierarchy; use sidebar for major navigation.
- Press `?` to open Help/keyboard shortcuts; it can open Cmd+K.
- Demo banner identifies expiring sample school.
- View As/Impersonation banners identify diagnostic identity mode.
- Maintenance banner may show scheduled/read-only state.
- Seasonal banner is visual/contextual.

Never ignore an impersonation, diagnostic or maintenance banner when making sensitive decisions.

---

## 25. Role home routes

| Role | Recommended home after sign-in |
|---|---|
| Founder / legacy Super Admin | `/founder` |
| NEYO Support | `/neyo-support-console` |
| NEYO Ops | authorized Founder/Ops tabs according to individual permissions |
| School Owner / Principal | `/dashboard` or `/owner` |
| Deputy / Dean / HOD | Dashboard, My Classes, Academics |
| Teacher / Class Teacher | `/teacher` |
| Bursar / Accountant | `/finance` |
| Receptionist | `/reception` |
| Librarian | `/library` |
| Hostel Master | `/hostel` |
| Support Staff | assigned Clinic/Cafeteria |
| Parent / Student | `/portal` |

Login currently redirects most non-founder roles to Dashboard; users then select their operational
home through permission-filtered navigation.

---

## 26. Troubleshooting

| Problem | Check |
|---|---|
| SMS code not received | normalized phone, active account, SMS config/quota, resend timer/network |
| Code rejected | newest code, expiry, attempts, correct phone |
| Password rejected | correct email/school, caps, reset flow; do not share password |
| Magic email absent | email/config/spam/expiry; use OTP fallback |
| Passkey unavailable | registered credential, HTTPS, RP/origin, device/browser |
| 2FA lost | recovery code or authorized recovery process; never bypass DB manually |
| Wrong school after login | host/subdomain/account; parent school switcher if linked |
| Missing sidebar module | permission, module toggle, owner hide, platform pause |
| Theme not glass | cycle preference and check company appearance switch |
| Mobile user menu missing | double-tap notification bell for extra controls |
| Push not working | browser permission, service worker, VAPID config, secure origin |
| View As cannot edit | expected read-only safety |
| Sign out all devices | expected to require login again everywhere |

---

## 27. Founder verification checklist

Test intended and denied accounts:

1. Phone OTP request/verify and rate limits.
2. Email/password success/failure.
3. Password reset OTP and new password.
4. Magic link one-time/expiry.
5. Passkey register/login/remove on supported secure device.
6. 2FA enable/login/recovery/disable policy.
7. First-login password activation.
8. Founder redirect versus school dashboard.
9. Parent multi-school OTP link/switch and no cross-school leakage.
10. User Menu current/all-device logout.
11. View As read-only mutation block.
12. Sidebar role/module/platform filtering and direct URL server guard.
13. Cmd+K scoped search.
14. Notification read/mark-all/native prompt.
15. Offline indicator and queued action sync.
16. Theme four-state cycle and company glass override.
17. V1/V2 personal shell choice.
18. Mobile hamburger and double-tap extra controls at 360px.

---

## 28. Edit points

- Login flow/UI: `src/app/(auth)/login/page.tsx`
- Auth APIs: `src/app/api/auth/`
- Session/cookies/permissions: `src/lib/core/session.ts`, `permissions.ts`, `roles.ts`
- Security page/cards: `src/app/(app)/settings/security/page.tsx`,
  `src/components/settings/*security*`, `passkeys-card.tsx`, `two-factor-card.tsx`,
  `connected-accounts-card.tsx`, `device-app-unlock-card.tsx`, `my-shell-card.tsx`
- Top bar/user menu/theme/school switch: `src/components/shell/`
- Sidebar registry/filter: `src/lib/core/navigation.ts`, `src/components/shell/sidebar.tsx`
- V1/V2 shells: `app-shell.tsx`, `app-shell-v2.tsx`
- Search/help/notifications: `command-palette.tsx`, `help-overlay.tsx`, `notification-bell.tsx`

Change both manual and tests when visible behavior changes.
