# Founder Operations, promotions, storage and Dynamic Island fixes

## Credentials & Secrets Vault

- Removed mandatory search entirely.
- All defined integration credentials now render immediately.
- Credentials are grouped by provider with a visible required-field count.
- Removed the duplicate Integration Credential Vault panel from the overloaded Business Operations tab; the dedicated Credentials & Secrets Vault is the single editing surface.
- Moved Google Workspace storage controls out of Business Operations and beside the Storage Intelligence Engine in its relevant dedicated tab.
- Secret values remain masked and are never returned in plaintext.

## Exam Sharing Approval

Replaced white-only text with light/dark adaptive navy/white colours for headings, explanatory text, request metadata, empty state and paper details.

## Discount campaigns and promo codes

Added:

- optional unique promo code;
- optional maximum number of schools;
- redemption count;
- one-month-free option (100% off the first subscription billing cycle);
- capacity-aware campaign selection;
- transactional redemption increment when a paid first subscription is confirmed;
- zero-charge activation for a genuinely free first billing period, without attempting an invalid KES 0 STK request;
- referral credit is deferred when a campaign or influencer benefit applies, so benefits never stack on one payment.

Existing protections remain:

- only one overlapping active campaign;
- a school claims a signup discount once;
- campaign and influencer codes do not stack;
- separate later payments can use later eligible renewal rules, but two signup benefits cannot affect the same payment.

## Storage Intelligence

Fixed the generic load failure caused by native Prisma `BigInt` byte counters in historical cleanup runs. The service now serializes byte counters to strings at the API boundary.

## Dynamic Island responses

- Reused the existing toast island and existing sound/glow.
- Changed its visual surface to a black Dynamic Island.
- Width/height adapt to message content.
- Added mobile safe-area positioning and viewport width limits.
- Responses no longer disappear automatically; user dismisses them or opens the linked destination.
- Running background tasks use the same Siri-style animated glow on a black surface.

## Boundaries

The screenshots supplied in chat were used as visual direction. No claim is made that the result is an Apple-owned implementation or exact WWDC design. NEYO uses its own CSS animation and browser-generated sound.
