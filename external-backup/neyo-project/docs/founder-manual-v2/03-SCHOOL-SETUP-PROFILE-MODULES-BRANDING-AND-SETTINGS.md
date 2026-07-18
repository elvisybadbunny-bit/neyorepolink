# NEYO Founder Manual V2 — Module 03: School Setup, Profile, Modules, Branding & Settings

**Main pages:** `/settings`, `/settings/school`, `/settings/modules`, `/settings/curriculum`,
`/settings/visibility`, `/settings/owners`  
**Last verified against code:** 2026-07-18  
**Purpose:** configure the school correctly before users, students, finance, academics or timetable.

---

## 1. Why setup order matters

NEYO connects records. A timetable cannot be reliable before levels, classes, subjects and teachers
exist. A boarding workflow should not appear for a day school. A report cannot carry correct
branding before the school profile is saved.

Recommended order:

1. School Profile: identity, levels, school type, contacts and branding.
2. Modules: enable only services the school uses.
3. Curriculum Engine: map curricula/levels/grade bands/learning areas.
4. Terms/classes/subjects (later Academics chapter).
5. Users/roles and staff.
6. Students/guardians.
7. Payments, finance and operational modules.
8. Visibility/joint approvals after roles are understood.

---

## 2. Who can configure what

- **School Owner / Principal:** full school settings through leadership permissions.
- **Deputy Principal:** selected settings, modules and profile according to current matrix.
- **Dean/HOD/academic roles:** may read Curriculum where `academics.view` allows, but not save school
  profile unless `tenant.manage_settings` is granted.
- **Teachers, Class Teachers, Librarians, Hostel Masters, Support Staff, Parents, Students:** Settings
  hub deliberately shows only personal Security.
- **Founder/legacy Super Admin:** company controls, but should not casually edit a school's profile
  outside authorized support/diagnostic process.

Direct URLs are server-guarded. A missing card normally means the role lacks permission.

---

## 3. Settings hub tour

Open **Settings**. Each card opens a separate responsibility:

| Card | Purpose | Main permission |
|---|---|---|
| School profile | name, levels, type, logo, contacts, joining list, GPS | `tenant.manage_settings` |
| Curriculum | curriculum versions, levels, grade bands, learning areas | academics view/settings |
| Public website | hero, story, news, gallery, SEO and map | `tenant.manage_settings` |
| Modules | switch optional school modules | `tenant.manage_modules` |
| Custom features | request bespoke work from NEYO | `tenant.manage_settings` |
| Billing | NEYO subscription/pricing | `owner.dashboard` |
| Payments | school's Daraja fee credentials | `tenant.manage_settings` |
| Data | tenant export | `tenant.export_data` |
| Printing limits | daily print limits and approvals | signed-in; service rules apply |
| Menu & access visibility | hide menus from selected staff roles | `tenant.manage_settings` |
| Owners & joint approvals | owner list and dual control | `tenant.manage_settings` |
| BOM Governance Vault | board documents/voting | `tenant.manage_settings` |
| Recycle Bin | restore/purge supported deleted records | `tenant.manage_settings` |
| Developer | API keys/webhooks | `api.manage` |
| Security | personal sign-in/security/layout | every signed-in user |

Other direct settings routes include Hardware, Storage, Rubrics and Jobs; visibility depends on page
permissions and intended company/school role.

---

## 4. School Profile loading and saving

Open **School profile**. The page GETs `/api/school-profile` and school-level activation summary.
While loading, skeleton cards appear. On failure, press **Retry**.

Edits remain in the browser until the bottom **Save changes** button is pressed. Upload operations
may create a file earlier, but profile linking/other fields still need Save.

On Save:

- browser PUTs validated fields to `/api/school-profile`;
- service updates the current Tenant;
- audit records the profile change;
- updated profile replaces form state;
- toast says **School profile saved**.

If validation fails, the first useful field error appears. Do not navigate away before saving.

---

## 5. Identity & Branding card

### School badge/logo

Press **Upload logo**, select image. Square PNG works best; accepted image processing/storage rules
apply. Preview appears after upload callback.

Used by top bar, reports, receipts, letters, public site and other branded documents. Avoid tiny text,
transparent low-contrast marks or another organization's logo.

### School name

Official display name. Changing it affects screens/documents, not tenant slug/domain automatically.
Legal/domain changes require separate review.

### Motto

Short phrase used in branding/documents. Keep under validation length and factual.

### Primary and accent colours

Use colour picker or six-digit hex fields such as `#1c2740` and `#1f9d5f`. Save changes. Choose
readable contrast; print output remains plain/high contrast.

---

## 6. School Structure & Services card

This real control was restored during this manual chapter because the backend fields existed but the
Profile UI previously loaded them without rendering or saving them.

### Education levels offered

Toggle every level the school genuinely operates:

- ECDE / Pre-Primary
- Primary
- Junior School
- Senior School

Selected buttons turn green. Press again to remove. Select at least one before Curriculum, classes or
timetable.

These values drive level-aware behavior throughout Curriculum, Academics, reports, pathway tools,
subject selection and timetable screens. Selecting Senior School reveals pathway complexity where
implemented; it does not automatically create Grade 10–12 classes or subjects.

### School attendance type

Dropdown:

- Day school
- Boarding school
- Day and boarding

When saved as **Day school**, the service automatically turns the Hostel module off. Choosing a
boarding type does not create dorms, rooms, beds or fees; configure Hostel later.

### Uniform supplier/tailor

Fields:

- supplier/tailor name;
- Kenyan phone.

Used by uniform ordering workflow when enabled. Saving supplier details does not create stock,
sizes, prices or purchase orders.

### Save behavior

These structure fields now travel in the same School Profile PUT as branding/contacts. After Save,
open Curriculum and confirm Active levels displays the chosen values.

---

## 7. Platform Liquid Glass controls

The School Profile page also currently contains company appearance controls. This is unusual but
intentional in current code; school users see the controls disabled/restricted.

### Company Liquid Glass Master Toggle

Only Founder/legacy Super Admin. Turns platform glass engine on/off for all schools. A school owner
cannot change it.

### Transparency level

Company-only choices:

1. Subtle Matte
2. Standard Frosted
3. Deep Translucent

Changes blur/frost depth platform-wide.

### Company colour intensity

Company-only Standard/Enhanced/Maximum, separate from blur.

### My Colour Intensity Override

Personal choices: School default, Standard, Enhanced, Maximum. Saved to user's account and applies
only to that person.

### My Liquid Glass Intensity slider

Per-device 0–100 browser preference adjusting blur/shine boost. It does not change company setting.

### My Popup Style

Personal Liquid Glass or Solid modal appearance, saved to account.

### Enable Custom Theme Styles

Controls local school brand-color editing behavior. Turning off resets current form colours to NEYO
defaults; press bottom Save changes to persist the reset. Turning it on permits custom Primary and
Accent inputs.

---

## 8. NEYO Shell Version card

Company-only default:

- Shell V1 — classic sidebar
- Shell V2 — floating bottom module bar and left activity/intercom rail

Changing company default affects schools on next page load and deletes no data. Individual users can
choose personal override under Security → My NEYO Layout as explained in Module 02.

School users should not confuse disabled company buttons with a broken school setting.

---

## 9. Vision, Mission & About

Fields are used in school identity/public content/documents where wired:

- Vision: future aspiration.
- Mission: what school does and for whom.
- About: concise factual description.

Avoid unsupported rankings/results. Save at bottom.

---

## 10. Contacts and Social Links

Fields:

- phone;
- email;
- county;
- postal/physical address;
- website, Facebook, Instagram, TikTok, YouTube URLs.

Social fields require valid URLs or blank. These may appear on public site/documents. Use official
accounts and current office contact, not a staff member's private number without approval.

---

## 11. Staff Clock-In GPS

Optional geofence fields:

- Latitude (-90 to 90)
- Longitude (-180 to 180)
- Allowed radius 50–5,000 metres

### Use my current location

Stand at school gate, press button, permit browser location. NEYO fills coordinates and default 300m
radius, but **does not save yet**. Press Save changes.

When both coordinates are set, staff clock-in requires device GPS within radius. Empty both to turn
off. HTTPS and location permission are required. Choose realistic radius after testing gate/building
accuracy; too small rejects legitimate staff.

---

## 12. Joining Requirements

Master list copied to each newly created/admitted student for tick-off.

### Add item

Creates row with:

- label (e.g. “2 school shirts”);
- category: uniform/books/supplies/fees/documents/other;
- quantity text;
- Required/Optional badge toggle;
- Remove trash button.

Blank labels are excluded on Save. Removing master item does not necessarily erase already-created
student requirement history. Joining fee requirement is not automatically an invoice unless the
finance/admission workflow creates one.

---

## 13. Modules page

Open Settings → Modules. Rows come from `src/lib/core/modules.ts` and real tenant state.

### Core locked modules

- Students
- Finance

They show lock/Core and cannot be toggled.

### Optional/current registry

- Attendance (default on)
- Academics (default on)
- Staff (default on)
- Hostel (default off)
- Transport (default off)
- Library (default off)
- Learning LMS (default off)
- Inventory/Stores (default off)
- Cafeteria (default off)
- Bundi (default-on tenant setting but still hidden while platform-paused)

### Toggle behavior

Press switch:

1. UI changes optimistically and spinner appears.
2. PATCH `/api/modules/[key]`.
3. Success returns complete module state and toast enabled/disabled.
4. Error/network reverts old value and shows error.

Disabled module is hidden from sidebar for everyone. Data is not deleted. Enabling only makes module
available; complete that module's own setup.

Platform pause overrides school toggle. Dependencies may block inappropriate activation. Day school
save automatically turns Hostel off.

---

## 14. Curriculum Engine setup

Open Curriculum. Banner shows Active levels from School Profile. If it says None, return Profile and
select/save levels.

The Curriculum Engine manages versions, education levels, grade bands and learning areas while
mapping existing subjects/classes/terms instead of duplicating them. Senior pathway tools stay hidden
unless Senior School active.

Use curriculum configuration before adding many classes/subjects. Detailed buttons will be covered
in Academics/CBE chapter because `CurriculumEngineClient` is a full separate workflow.

---

## 15. Menu & Access Visibility

Open Settings → Menu & access visibility.

The manager groups navigation entries and role toggles. Press role against an href to hide/show via
`/api/settings/visibility`.

Rules:

- visibility hides navigation for selected role;
- it does not grant permissions;
- Dashboard, Settings and Security remain protected from owner hiding;
- platform pauses still win;
- direct page APIs retain permission checks.

Use it to reduce clutter, not replace correct roles.

---

## 16. Owners & Joint Approvals

Shows registered School Owners and policy.

- Toggle **Joint approval** to require second owner for configured critical actions.
- Pending request: second authorized owner presses **Approve** or **Reject**.
- One person should not impersonate both owners.

This adds operational dual control; formal legal ownership still requires corporate/school evidence.

---

## 17. Public Website

Open editor to configure story/hero, images/proof points, news, gallery, leaders, testimonials,
activities, SEO and map.

Main actions include Preview, Save story, Publish/Update news, Save image/activity, Edit/Remove and
Save SEO & map. Public content uses school branding; never publish learner personal data without
lawful consent. Detailed public-site chapter comes later.

---

## 18. Payments Settings

School's own Daraja credentials for collecting student fees—not NEYO subscription billing. Save
through encrypted credential service. Never place keys in manual/chat/screenshots. Detailed setup and
safe live test belong Finance chapter.

---

## 19. Data, Printing, Recycle and Developer

- **Data → Export your data:** downloads tenant-scoped export and audits action.
- **Printing limits:** set daily limit, approve/reject staff requests.
- **Recycle Bin:** Restore recoverable record or permanently Purge. Purge is irreversible; verify
  entity/reference and retention first.
- **Developer:** create/revoke API keys, webhooks, tests/usage. Only qualified authorized users.

---

## 20. Setup example — Karibu Junior & Senior Boarding School

1. Open School Profile.
2. Upload official badge.
3. Name: Karibu High School; motto and contacts.
4. Select Junior School + Senior School.
5. School type: Day and boarding.
6. Add tailor name/phone if uniforms ordered.
7. Save; toast confirms.
8. Open Curriculum; Active levels should list both.
9. Open Modules; enable Attendance, Academics, Staff, Hostel, Library; leave unused services off.
10. Add joining requirements and save.
11. Configure GPS only after standing at gate and testing radius.
12. Configure terms/classes/subjects/users in next chapters.

Do not press timetable generation yet.

---

## 21. What changes affect timetable later

- Education levels decide level-aware/pathway controls.
- Curriculum/grade bands/learning areas determine academic structure.
- Modules determine whether Academics is visible.
- School type affects boarding tools, not lesson solver directly.
- Branding affects printed timetable header/documents.
- GPS, joining requirements, social links and supplier do not control timetable.

Before timetable: current term, class list, subjects, teachers, teacher-subject eligibility,
class-subject weekly needs, venues, bell periods/break/lunch rules, constraints and electives.

---

## 22. Troubleshooting

| Problem | Check/action |
|---|---|
| School Profile forbidden | need `tenant.manage_settings` |
| Level-aware tools say None | select levels and Save Profile |
| Hostel disappeared | school type saved DAY or module disabled/platform paused |
| Module toggle reverts | API permission/dependency/release/network error shown in toast |
| Core module cannot switch | expected lock |
| Logo uploaded but not on header | save profile, refresh, file access/URL |
| Social link rejected | full valid URL or blank |
| GPS rejects staff | coordinates/radius, HTTPS/location accuracy; test at gate |
| Colours reset | Custom Theme toggled off or unsaved form |
| Liquid controls disabled | company-only, expected |
| User still sees hidden menu | role/secondary role, saved visibility, refresh; permission remains separate |
| Deleted record missing | Recycle supports only selected soft-delete models |

---

## 23. Founder verification checklist

1. Principal can open profile/modules; teacher sees only Security in hub.
2. Select levels/type/supplier, Save, reload; values persist.
3. Curriculum Active levels matches profile.
4. Save DAY; Hostel module becomes off.
5. Toggle optional module and confirm sidebar change; data remains.
6. Core Students/Finance toggles disabled.
7. Platform-paused module cannot be forced visible.
8. Upload logo and verify header/document/public preview.
9. Save contacts/social validation.
10. Add/remove/required joining item; new student gets master copy later.
11. GPS capture/save and in/out-of-range staff test.
12. Company appearance controls reject ordinary school role.
13. Personal contrast/popup/shell preferences affect only user/device as described.
14. Visibility hides target role menu but direct server guard still works.
15. Joint approval request needs second owner.
16. Cross-tenant profile/module reads/writes blocked.
17. 360px and glass light/dark usable.

---

## 24. Product repair made during this chapter

The Profile data/service/validation already supported `educationLevelsOffered`, `schoolType`,
`uniformSupplierName` and `uniformSupplierPhone`, but the UI only loaded those fields and never
rendered or included them in Save. This made “select levels in School Profile” impossible through
the actual product.

This chapter restored a real **School structure & services** card and wired all four fields into the
existing profile PUT. This is essential before the upcoming Academics/Timetable manual.

---

## 25. Edit points

- Settings hub: `src/app/(app)/settings/page.tsx`
- School Profile page/editor: `src/app/(app)/settings/school/page.tsx`,
  `src/components/settings/school-profile-editor.tsx`
- Profile validation/service/API: `src/lib/validations/school-profile.ts`,
  `src/lib/services/school-profile.service.ts`, `src/app/api/school-profile/route.ts`
- Modules registry/UI/service: `src/lib/core/modules.ts`, `modules-manager.tsx`,
  `src/lib/services/module.service.ts`
- Curriculum: `settings/curriculum/page.tsx`, `curriculum-engine-client.tsx`
- Visibility: `visibility-manager.tsx`, `/api/settings/visibility`
- Owners: `owners-manager.tsx`, `/api/owner-approvals`
- Public website/payments/data/printing/recycle/developer: their Settings components/routes.
