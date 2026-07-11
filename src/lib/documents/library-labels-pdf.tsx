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

const s = StyleSheet.create({
  page: { padding: 16, fontFamily: "Helvetica" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  label: {
    width: `${100 / COLUMNS}%`,
    height: `${100 / ROWS}%`,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  qr: { width: 46, height: 46, marginBottom: 3 },
  title: { fontSize: 6.5, textAlign: "center", color: "#1c2740", fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 6, textAlign: "center", color: "#677fab", marginTop: 1 },
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
                <Image style={s.qr} src={l.qrDataUrl} />
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
