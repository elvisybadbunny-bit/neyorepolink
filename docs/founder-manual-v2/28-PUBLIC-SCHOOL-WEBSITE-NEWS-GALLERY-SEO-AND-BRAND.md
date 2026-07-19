# NEYO Founder Manual V2 — Module 28: Public School Website & Marketing Surfaces

**Editor:** `/settings/public-site`  
**Public:** school subdomain/root tenant resolution, `/news/[slug]`  
**Last verified:** 2026-07-18

## 1. Access and tabs

Requires tenant.manage_settings. Tabs:

1. Story
2. News
3. Gallery
4. People
5. Activities
6. SEO

Public visitors need no login; never publish private learner/staff records.

## 2. Preview and Save

**Preview** opens current school's public site in new tab. Gap fixed: removed fallback to
`karibu-high`; button is disabled until real school slug exists, preventing previewing wrong tenant.
**Save Story** persists settings. Unsaved edits are not public.

## 3. Story

Hero headline/subheadline/CTA, About, Vision, Mission and school story fields. Hero image upload.
Proof points/stats and **Add** Why Choose Us rows; Remove. Use factual approved numbers and consented
images. School Profile supplies name/logo/motto/contacts/brand.

## 4. News

New Update fields include title, slug/date/summary/body/image/published state as current editor.
**Publish** creates NewsPost; existing **Edit**, **Update**, **Cancel**, **Remove**. Public detail at
`/news/[slug]`. Unique readable slug; removing deletes public post—archive policy should be considered.

## 5. Gallery

Add Image: image URL/upload, caption, alt text/order fields → **Save Image**. Existing Edit/Remove.
Use consent, no sensitive documents, meaningful alt text, optimized images.

## 6. People

Add/edit/remove Leaders and Testimonials through shared collection forms. Leader: name, title,
photo/bio/order. Testimonial: approved quote/name/role/order. Obtain written consent and do not invent
quotes or achievements.

## 7. Activities

Add Activity with title/category/description/image/order → **Save Activity**; Edit/Remove. This is
public marketing content, not operational SchoolActivity fee/roster record unless separately linked.

## 8. SEO and Map

Search & Sharing fields include title/description/keywords/social image according to editor. Map
coordinates/embed/location fields. **Save SEO & Map**.

SEO should identify school/county/curriculum factually. Do not publish private phone/location data
without approval. Social image must be accessible.

## 9. Public inquiry/enrollment

Public site enrollment CTA should lead to `/apply` for real Admissions. Contact/inquiry should feed
Reception/Admissions where implemented, not an unmonitored personal inbox.

## 10. Brand rules

Use official logo, navy/green/warm palette and readable contrast. No gradients/generic hype. Specific
copy such as “Applications for Grade 7 close 30 November.” Product/public claims require evidence.

## 11. Launch checklist

Profile/contact/levels; slug/domain; hero/mobile; Admissions form; News links; gallery consent/alt;
leaders/testimonials approvals; map; SEO/OG; privacy/terms/cookies; 360px; performance/3G; broken links;
Google/public indexing; support owner; rollback.

## 12. Errors

Preview disabled: missing real slug. Public wrong school: host/DNS/tenant resolution. Image broken:
storage/public URL. News 404: slug/published/tenant. Apply wrong school: domain. SEO stale: save/deploy/
cache. Private data visible: remove immediately and incident/privacy review.

## 13. Founder verification

Preview exact tenant (fixed); Story save/reload/public; News create/update/remove/detail; Gallery;
People/testimonials; Activities; SEO/OG/map; Admissions CTA; cross-tenant admin blocked; public only
published; consent/privacy; mobile/3G/accessibility.

## 14. Edit points

`public-site-editor.tsx`, `public-site.service.ts`, public-site APIs, root public page, news page,
School Profile/branding/storage/Admissions.
