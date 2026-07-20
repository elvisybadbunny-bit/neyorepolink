# Library barcode, scan and due-date repair — 20 July 2026

## Delivered

- Every physical-copy label now prints both QR and Code 39 barcode forms of the same existing copy code.
- Code 39 is generated locally by NEYO; no barcode API, font subscription or paid service is used.
- Copy lookup accepts bare scanner text and full `/verify/CODE` QR URLs.
- Issue workflow checks exact copy codes first, then title ISBN/barcode.
- Successful scan instantly fills the barcode field, selected catalog book, availability and due date.
- Local Web Audio success/failure tones confirm scan results; no audio file hosting or paid service is used.
- School can set default loan period in days alongside its fine policy.
- Librarian can still override the exact due date for an individual issue.
- Central subscription build regression fixed by returning/storing a non-null synthetic checkout reference for campaign-funded free periods.

## Cost

QR generation, Code 39 generation and scan tones run locally using existing code/browser APIs. They add no per-scan running charge. Camera scanning also remains on-device. Normal hosting/database traffic still exists, as with any NEYO workflow.

## Testing required after deployment

- Apply migration `20260720234500_library_barcode_due_policy`.
- Generate copy labels and test printed Code 39 with USB/Bluetooth scanner.
- Test full QR URL and bare code.
- Test ISBN barcode.
- Confirm catalog search and due date fill immediately.
- Confirm unavailable copy gives failure tone/state.
- Confirm browser audio restrictions after user interaction.
