# NEYO public operations, WWDC design, guided help and CBC App audit

Date: 21 July 2026

## Clarification

The design research request said “WWDC 2036”. That event has not happened. This audit uses Apple’s WWDC 2025 introduction of Liquid Glass and reported WWDC 2026 refinements available as of 21 July 2026.

## Immediate decisions implemented

- A device dark preference no longer makes a first-time NEYO visitor dark automatically. With no saved NEYO preference, the app starts in light mode. A user’s explicit saved theme choice still wins.
- The “Built for Kenyan school operations” hero pill was removed.
- The public demo dialog is forced to a solid white, high-contrast panel rather than becoming an invisible glass layer.
- Real NEYO screenshots are presented in a responsive CSS laptop frame; the product screen remains the authentic image.
- Founder Credentials Vault now requests the settings payload that actually contains credential statuses. It previously requested the default dashboard payload and therefore rendered no credentials.
- Landing social links already exist in the versioned landing-content model and are now rendered in the public footer after the founder adds them.

## Apple design findings relevant to NEYO

Apple’s official WWDC 2025 design guidance says Liquid Glass should be used sparingly for important controls, as a functional layer above content. Navigation and toolbars float, group related actions, and give way to content. Apple also stresses continuity: define shared component anatomy once, then adapt it to narrow phone, intermediate tablet and wide desktop contexts.

Reported WWDC 2026 refinements respond to readability criticism with stronger diffusion/separation and user-adjustable transparency. NEYO’s correct direction is therefore not “put glass on every card”. It is:

1. Keep content surfaces solid and readable.
2. Reserve glass for navigation, contextual controls, the Dynamic Island and selected modal surfaces.
3. Never stack glass on glass.
4. Use a tinted/solid fallback for low contrast, reduced transparency, printing and slow devices.
5. Keep 44px minimum touch targets.
6. Preserve the same action meaning and icon across phone, tablet and desktop.
7. Let users adjust the material only after the safe light default.

The public website deliberately uses a fixed light editorial direction. The signed-in School OS may retain explicit user appearance controls later.

## Guided YouTube help idea

This is relevant and should be built as a governed product system, not a random video popup.

### Proposed model

A `GuidedHelpVideo` record should contain:

- title;
- verified YouTube video ID;
- route pattern;
- optional feature/action key;
- role audience;
- language;
- duration;
- publication status;
- reviewed-by and reviewed-at;
- replacement/version information.

### User flow

1. User opens a workflow or presses Help.
2. NEYO checks for a published video mapped to that route and role.
3. The Dynamic Island offers “Watch 1-minute guide”. It must not interrupt work automatically.
4. User opens a movable, dismissible picture-in-picture guide.
5. The video stays available while the user completes the form.
6. The guide never blocks the manual workflow and never exposes a video before human review.

### Required controls

- captions and transcript;
- pause, mute, close and reopen;
- no autoplay with sound;
- remember dismissal only for the current guide version;
- slow-network option to open transcript instead;
- role-aware mapping;
- founder publication and removal controls;
- no candidate YouTube video automatically becomes public.

NEYO already has learning-video search/playback and a Dynamic Island/toast foundation. It does not yet have this complete route/action-to-approved-guide mapping and movable PIP workflow. Build it as a separate phase with schema, migrations and browser testing.

## Onboarding fee idea

A separate onboarding fee can cover real setup work such as data mapping, imports, configuration and training. It should not be silently inserted into a demo request.

Before implementation the founder must define:

- fixed fee versus school-size calculation;
- refundable or non-refundable status;
- what work it includes;
- whether it is waived for pilots/campaigns;
- tax/invoice treatment;
- when it becomes due;
- what happens if onboarding is cancelled;
- whether activation requires payment.

Recommended safe workflow:

1. Demo and school review.
2. Written onboarding scope.
3. Founder creates an onboarding invoice in NEYO Ops.
4. School sees amount and inclusions.
5. Authorised person initiates M-Pesa payment.
6. Verified callback marks invoice paid.
7. Onboarding checklist opens.

Do not reuse a subscription payment row without a distinct payment purpose and audit trail.

## CBC App public feature audit

Public CBC App material emphasises:

- calendar-aligned schemes of work;
- customisable lesson plans;
- formative and summative records;
- end-term report preparation;
- phone-first teacher entry;
- attendance trends;
- syllabus coverage oversight;
- school-wide learner/class/learning-area analytics;
- evidence-based teacher appraisal;
- central report completion, approval and sending;
- incident records and follow-up;
- secure report sharing;
- real school stories and guided video support.

### NEYO already has connected equivalents

Code/schema inspection confirms NEYO already has substantial foundations for:

- lesson plans;
- syllabus/record-of-work coverage;
- attendance;
- CBE assessment and curriculum delivery evidence;
- learner/class analytics;
- staff appraisals;
- clinic incidents and follow-up;
- parent access;
- report and exam workflows;
- learning videos;
- role permissions and audit records.

Therefore, copying CBC App features as duplicate modules would damage NEYO. The correct gaps to test are workflow quality and connection:

1. Is there one leadership view of teacher attendance entry, syllabus coverage, assessment completeness and report readiness?
2. Can a Head review/return/approve a report batch before family publication?
3. Can evidence from delivery and assessment inform an appraisal without automatically judging a teacher?
4. Can every priority teacher action be completed comfortably on a 360px phone?
5. Can a parent receive a secure report link with a complete access audit?
6. Can verified guides open contextually while the user works?

These require direct code and browser audits before adding schema. No competitor marketing claim is evidence that NEYO lacks a feature or that the competitor’s claimed outcome is independently proven.

## Public content and social governance

Landing content, screenshot URLs, SEO values and social links are stored in the landing content setting and editable from Founder Operations. The public footer now renders configured social links. Only official account URLs should be added.

The current company-logo control accepts a public logo URL and the homepage reads it automatically. A true binary logo upload is not yet evidenced. It needs a dedicated public-asset upload path because normal NEYO file uploads are encrypted and cannot be served as a public logo. Building an unsafe direct upload or pretending an encrypted file is public is not acceptable.

The correct upload phase must include:

- Founder-only permission;
- SVG sanitisation or safe PNG/WebP handling;
- file-size and dimension limits;
- public object storage;
- immutable/versioned URL;
- preview before activation;
- rollback to prior logo;
- audit log;
- automatic favicon/wordmark handling where appropriate.

## External facts and actions

- A real founder logo upload still needs the public-asset pipeline above.
- Social accounts must first be created and ownership secured externally; NEYO should only store their public URLs, never social passwords.
- Onboarding price and legal terms require a founder business decision before code.
- Contextual guided help requires an approved video catalogue and route/action mapping.
- Real CBC App customer claims belong to CBC App and must not be reused by NEYO.
