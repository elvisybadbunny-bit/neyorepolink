# NEYO school-first public website

**Completed:** 21 July 2026  
**Primary route:** `/`

## Public position

The corporate homepage now presents **NEYO School OS** as the current focus:

> Run your entire school from one operating system.

Farm OS, Business OS and Creator OS are mentioned once as future directions. They are not marketed as available products.

## Homepage journey

1. School-first navigation and guided-demo action.
2. Real School OS timetable image.
3. Verifiable product characteristics without invented customers or ratings.
4. Whole-school visibility outcomes.
5. Connected learner journey from enquiry to alumni.
6. Fees and Kenyan finance workflows with clearly labelled illustrative values.
7. CBE delivery from curriculum planning to evidence and learner support.
8. Deterministic Senior School options and timetable governance.
9. Library, transport, clinic, cafeteria, hostel, inventory and physical outputs.
10. Role-specific value for leaders, staff, families and learners.
11. Factual security controls without unsupported certifications.
12. Controlled API and webhook integration path.
13. Founder story for Elvis Malimbe.
14. Responsible implementation path.
15. Honest pilot access and pricing explanation.
16. FAQ, final conversion action, future-product note and complete footer.

## Demo governance

The public form calls `/api/demo/start`. A successful submission creates a pending request only. It does not create a tenant, session, cookie or automatic public login. The page states this before and after submission.

## Evidence rules

The website intentionally does not publish:

- invented school logos, testimonials, ratings or adoption counts;
- unsupported uptime, certification, government approval, ODPC or DPO claims;
- an automatic free trial promise;
- outdated Msingi/Pro pricing promises;
- claims that Bundi generates timetables;
- internal credentials, provider names or database details.

Illustrative finance numbers are visibly labelled as examples and not live school data.

## Founder story

The page identifies Elvis Malimbe as NEYO's founder, a 19-year-old Kenyan University of Nairobi student studying Project Planning and Management. It uses an initials card until an approved real founder photograph is provided. The building principle is labelled as a principle, not fabricated as a direct quotation.

## Appearance boundary

`src/app/public-landing.css` isolates the public editorial website from the signed-in user's Liquid Glass/dark preference. This prevents app-wide `.bg-white` material rules from creating dark cards with dark text. Deliberately dark homepage sections retain their own explicit colours.

## Search and sharing

The site includes:

- canonical metadata;
- Open Graph and Twitter image metadata;
- `SoftwareApplication` structured data;
- visible-answer-matched `FAQPage` structured data;
- Kenyan area and educational audience information;
- crawlable real screenshots;
- `/robots.txt`;
- `/sitemap.xml`, including home, Developer Center, Privacy and Terms.

Search engines decide whether and when images or rich results appear. Deployment and indexing do not guarantee presentation.

## Founder verification after deployment

1. Open `/` in a private window using light device appearance.
2. Repeat using dark device appearance; public sections must remain readable.
3. Test at 360px, 768px and desktop widths.
4. Submit one fictional demo request and confirm it enters the pending Founder queue without creating a school.
5. Open every navigation and footer link.
6. Verify all three `/screenshots/...` image URLs return HTTP 200.
7. Verify `/robots.txt` and `/sitemap.xml`.
8. Inspect source for SoftwareApplication and FAQPage JSON-LD.
9. Test keyboard navigation, Skip to main content and demo-dialog focus order.
10. Test the social preview after deployment.

## Current external dependency

Verified customer evidence can only be added after real pilot use and written publication approval. A real founder photograph and founder video also require Elvis's selected, approved media.
