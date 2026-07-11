#!/usr/bin/env python3
"""
Z.3 print redesign — real fix for the founder's live feedback ("landscape
not printing landscape", "many lunch/break rows not one", subject text too
small, "A4 Landscape Schedule" label still visible in some flows): the
in-app Timetable tab's Print/Print-all-classes/Print-all-teachers buttons
were still calling the OLD `window.print()` flow on the live app page,
which never received ANY of the print-redesign work (new dedicated
/print/timetable route, real automatic orientation, merged lunch/break
rows, real teacher/venue short codes). This patch rewires those buttons
to open the NEW route in a new tab instead, and removes the now-fully-dead
"A4 Landscape Schedule" label from the old print-only header.

Idempotent — safe to re-run (each patch checks for its own target text
before applying, no-ops if already patched).
"""
import re
import sys

PATH = "src/components/academics/academics-client.tsx"

with open(PATH, "r", encoding="utf-8") as f:
    src = f.read()

applied = []

# PATCH 1 — replace the old printBulk() (fetch + setPrintBundle + window.print)
# with real navigation to the new dedicated print route, and add a real
# printSingleClass() helper for the single "Print Timetable" button.
old_print_bulk = '''  async function printBulk(mode: "classes" | "teachers" | "venues") {
    setPrintBusy(mode);
    try {
      const res = await fetch(`/api/academics/timetable?print=${mode}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Could not prepare print pack.");
      setPrintBundle(json.data);
      setTimeout(() => window.print(), 250);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Could not prepare print pack.", tone: "error" });
    } finally {
      setPrintBusy(null);
    }
  }'''

new_print_bulk = '''  // Z.3 print redesign — every real print action now opens the dedicated,
  // chrome-free `/print/timetable` route (real automatic A4 orientation,
  // real teacher/venue short codes, real merged one-row lunch/break bars,
  // real subject color-coding with a real B&W ink-saver override) in a new
  // tab instead of the old in-app `window.print()` flow, which never
  // picked up any of those fixes since it printed the live app page
  // itself. `vertical=1`/`bw=1` mirror the on-screen "Vertical days"/
  // "Ink-Saver B&W Mode" toggles so what the user sees on screen is
  // exactly what prints.
  function printSingleClass() {
    if (!classId) return;
    const params = new URLSearchParams({ classId, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    if (isBandW) params.set("bw", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }

  function printBulk(mode: "classes" | "teachers" | "venues") {
    const params = new URLSearchParams({ mode, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    if (isBandW) params.set("bw", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }'''

old_print_bulk_no_bw = '''  // Z.3 print redesign — every real print action now opens the dedicated,
  // chrome-free `/print/timetable` route (real automatic A4 orientation,
  // real teacher/venue short codes, real merged one-row lunch/break bars)
  // in a new tab instead of the old in-app `window.print()` flow, which
  // never picked up any of those fixes since it printed the live app page
  // itself. `vertical=1` mirrors the on-screen "Vertical days" toggle so
  // what the user sees on screen is exactly what prints.
  function printSingleClass() {
    if (!classId) return;
    const params = new URLSearchParams({ classId, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }

  function printBulk(mode: "classes" | "teachers" | "venues") {
    const params = new URLSearchParams({ mode, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }'''

if old_print_bulk in src:
    src = src.replace(old_print_bulk, new_print_bulk)
    applied.append("printBulk rewired to open /print/timetable (with bw support)")
elif old_print_bulk_no_bw in src:
    # A prior, bw-less version of this patch was already applied — real
    # upgrade to add the B&W ink-saver param without duplicating anything.
    src = src.replace(old_print_bulk_no_bw, new_print_bulk)
    applied.append("printBulk upgraded to add real bw=1 ink-saver param")
elif "if (isBandW) params.set(\"bw\", \"1\");" in src:
    pass  # already fully patched
else:
    print("WARNING: PATCH 1 target not found and not already applied — manual check needed.")

# PATCH 2 — the single "Print Timetable" button's onClick.
old_single_btn = '''<Button variant="secondary" onClick={() => { setPrintBundle(null); setTimeout(() => window.print(), 100); }}>
              <Printer className="h-4 w-4 text-green-600" /> Print Timetable'''
new_single_btn = '''<Button variant="secondary" onClick={printSingleClass}>
              <Printer className="h-4 w-4 text-green-600" /> Print Timetable'''

if old_single_btn in src:
    src = src.replace(old_single_btn, new_single_btn)
    applied.append("single Print Timetable button rewired")
elif "onClick={printSingleClass}" in src:
    pass  # already patched
else:
    print("WARNING: PATCH 2 target not found and not already applied — manual check needed.")

# PATCH 3 — remove the now-fully-dead "A4 Landscape Schedule" label.
old_label_block = '''        <div className="text-right text-[10px] text-navy-400">
          <p className="font-bold text-navy-700">A4 Landscape Schedule</p>
          <p>Generated: {new Date().toLocaleDateString("en-KE")}</p>
        </div>'''
new_label_block = '''        <div className="text-right text-[10px] text-navy-400">
          <p>Generated: {new Date().toLocaleDateString("en-KE")}</p>
        </div>'''

if old_label_block in src:
    src = src.replace(old_label_block, new_label_block)
    applied.append('removed "A4 Landscape Schedule" label')
elif 'A4 Landscape Schedule' not in src:
    pass  # already patched
else:
    print("WARNING: PATCH 3 target not found and not already applied — manual check needed.")

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print(f"Applied {len(applied)} patch(es): {', '.join(applied) if applied else '(none — already up to date)'}")
