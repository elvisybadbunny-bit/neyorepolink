/**
 * T.1 — A4 sheet of many small per-copy library QR labels laid out in a
 * plain grid (cut with scissors — no special adhesive label-sheet paper
 * required, per founder preference). Each label shows the QR code plus the
 * book title + copy number as text underneath, so a copy stays identifiable
 * even if the printed code fades or gets scuffed on a well-used shelf book.
 * Printing is ALWAYS plain (never glass) — same rule as every other NEYO
 * printed document.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export interface LibraryLabel {
  bookTitle: string;
  copyNo: number;
  code: string;
  qrDataUrl: string;
}

// Plain grid, 3 columns x 6 rows = 18 labels per A4 page (page is scaled to
// fit any label size the school prints/cuts at, no fixed sticker dimensions).
const COLUMNS = 3;
const ROWS = 6;
const PER_PAGE = COLUMNS * ROWS;

// A4 = 595.28 x 841.89 pt. With 20pt padding, height = 801.89pt.
// Fixed row height = Math.floor(801.89 / 6) = 133pt per label cell.
const s = StyleSheet.create({
  page: { padding: 20, fontFamily: "Helvetica", flexDirection: "column" },
  grid: { flexDirection: "row", flexWrap: "wrap", width: "100%", height: 133 * ROWS },
  label: {
    width: "33.33%",
    height: 133,
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    boxSizing: "border-box",
  },
  qrWrapper: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  qr: {
    width: 54,
    height: 54,
    objectFit: "contain", // guarantees aspect ratio 1:1 square is never deformed or stretched
  },
  title: { fontSize: 7, textAlign: "center", color: "#1c2740", fontFamily: "Helvetica-Bold", maxHeight: 20, overflow: "hidden" },
  meta: { fontSize: 6.5, textAlign: "center", color: "#677fab", marginTop: 2 },
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function renderLibraryLabelsPdf(labels: LibraryLabel[]): Promise<Buffer> {
  const pages = chunk(labels, PER_PAGE);
  const doc = (
    <Document>
      {pages.map((pageLabels, pi) => (
        <Page key={pi} size="A4" style={s.page}>
          <View style={s.grid}>
            {pageLabels.map((l, i) => (
              <View key={i} style={s.label}>
                <View style={s.qrWrapper}>
                  <Image style={s.qr} src={l.qrDataUrl} />
                </View>
                <Text style={s.title}>{l.bookTitle.length > 28 ? `${l.bookTitle.slice(0, 26)}…` : l.bookTitle}</Text>
                <Text style={s.meta}>Copy {l.copyNo} · {l.code}</Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
  return renderToBuffer(doc);
}
