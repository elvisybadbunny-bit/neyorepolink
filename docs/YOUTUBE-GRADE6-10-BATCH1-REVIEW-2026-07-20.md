# YouTube learning library — Grade 6–10 Batch 1 review

Batch 1 has started with exactly 50 researched candidates: Grade 6 (10), Grade 7 (6), Grade 8 (11), Grade 9 (11), Grade 10 (12). They cover Mathematics, English, Integrated Science, Science, Geography, Physics, Chemistry, Biology and Business Studies. Every candidate has an 11-character ID and was checked against the 162 existing static seed IDs for duplication.

All rows deliberately remain `CANDIDATE`. They are not imported into `LearningVideo` and are not visible to schools until a human completes availability, title/channel, age suitability, curriculum mapping and content-quality checks. Search-result discovery is evidence for candidacy, not enough for national approval. The planned 500 distribution remains Grade 6: 60, Grade 7: 80, Grade 8: 100, Grade 9: 120, Grade 10: 140.

Run `npm run test:youtube-batch1` after dependencies are installed to verify exact count, unique IDs, ID format, no overlap with existing static seeds and no premature approvals.

## Live availability verification step

Run `npm run verify:youtube-batch1` in an environment with outbound YouTube access. The verifier checks only five links concurrently, applies a 12-second timeout, reads YouTube's oEmbed response, captures the current live title/channel, and writes `/tmp/neyo-youtube-batch1-live-report.json`. It exits with code 2 if any candidate is unavailable so an incomplete batch cannot be mistaken for approved. A live oEmbed response proves availability/metadata only; it does not complete CBE content and safeguarding review.

## Founder review page

Batch 1 is now operable from **Platform Operations → Video Review**. **Verify all 50** checks links in groups of five and persists live title, channel, check time and availability in the global `PlatformSetting` key `youtube_grade6_10_batch1_reviews`. Individual links can be rechecked, rejected or marked **Approved for Mapping** only after a successful live check. Approved for Mapping is deliberately not school-visible approval: curriculum grade/subject/strand/sub-strand mapping remains a separate gate.

## Curriculum mapping and final publication

A candidate marked **Approved for Mapping** now exposes subject, strand and sub-strand selectors sourced from the founder account's real tenant catalog. The API rejects mismatched relationships. **Save mapping** moves the candidate to `MAPPED`; **Final publish** then idempotently upserts a real tenant-scoped `LearningVideo` with national scope, approved status, live title/channel, thumbnail, grade and complete curriculum links. Only `PUBLISHED` entries become available through the existing national library query. This preserves the sequence live check → human content decision → curriculum mapping → final publication.

## Mandatory human-review checklist

A live-verified candidate cannot move to mapping until the founder records all five checks: watched fully, grade suitable, content safe, CBE-topic relevance, and clear language. The checklist is persisted with the reviewer. Both UI and API enforce it; modifying the browser cannot bypass the gate. A failed check should lead to rejection or a clear note, not approval.
