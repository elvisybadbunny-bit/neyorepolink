import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export interface ConsolidatedReportPdfData {
  schoolName: string;
  learnerName: string;
  admissionNo: string;
  className: string;
  termLabel: string;
  subjects: Array<{
    name: string;
    finalMark: number;
    classMean: number;
    deviation: number;
    grade: string;
    rank: string;
    teacher: string;
    comment: string;
    components: Array<{ label: string; mark: number; weightPct: number }>;
  }>;
  mean: number;
  overallGrade: string;
  position: string;
  rankingPolicy: string;
  dates: { schoolClosedDate: string; nextTermBeginsDate: string | null };
  fees: { balanceKes: number; nextTermFeeKes: number | null } | null;
  trend: Array<{ label: string; mean: number }>;
  classTeacherRemark: string;
  principalRemark: string;
  formulaVersion: string;
  calculationHash?: string | null;
  blackAndWhite: boolean;
}

export async function renderConsolidatedReportPdf(
  d: ConsolidatedReportPdfData,
) {
  const accent = d.blackAndWhite ? "#111827" : "#2563eb";
  const green = d.blackAndWhite ? "#111827" : "#15945d";
  const s = StyleSheet.create({
    page: {
      padding: 25,
      fontFamily: "Helvetica",
      fontSize: 7.5,
      color: "#17233b",
    },
    header: {
      borderRadius: 10,
      backgroundColor: d.blackAndWhite ? "#f3f4f6" : "#eef5ff",
      padding: 10,
      marginBottom: 7,
    },
    school: { fontSize: 15, fontFamily: "Helvetica-Bold", color: accent },
    title: { fontSize: 9, marginTop: 2 },
    row: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#d8e0eb",
      minHeight: 21,
      alignItems: "center",
    },
    th: {
      backgroundColor: d.blackAndWhite ? "#e5e7eb" : "#e8f0ff",
      fontFamily: "Helvetica-Bold",
    },
    subject: { width: "20%", padding: 3 },
    assessment: { width: "30%", padding: 3 },
    cell: { width: "10%", padding: 3, textAlign: "center" },
    teacher: { width: "20%", padding: 3 },
    cards: { flexDirection: "row", gap: 5, marginVertical: 7 },
    card: {
      flex: 1,
      borderRadius: 7,
      borderWidth: 0.7,
      borderColor: "#d8e0eb",
      padding: 5,
    },
    label: { fontSize: 5.8, color: "#667792" },
    value: { fontSize: 10, fontFamily: "Helvetica-Bold", color: accent },
    section: {
      borderRadius: 7,
      borderWidth: 0.7,
      borderColor: "#d8e0eb",
      padding: 6,
      marginBottom: 5,
    },
    sectionTitle: { fontSize: 6, color: "#667792", marginBottom: 2 },
    chart: { flexDirection: "row", height: 50, alignItems: "flex-end", gap: 4 },
    bar: { flex: 1, backgroundColor: green, minHeight: 2 },
    footer: {
      position: "absolute",
      bottom: 17,
      left: 25,
      right: 25,
      borderTopWidth: 0.6,
      borderTopColor: "#d8e0eb",
      paddingTop: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 5.5,
      color: "#667792",
    },
  });
  return renderToBuffer(
    <Document title={`${d.learnerName} consolidated report`}>
      <Page size="A4" style={s.page} wrap={false}>
        <View style={s.header}>
          <Text style={s.school}>{d.schoolName}</Text>
          <Text style={s.title}>
            CONSOLIDATED LEARNER REPORT · {d.termLabel}
          </Text>
          <Text>
            {d.learnerName} · {d.admissionNo} · {d.className}
          </Text>
        </View>
        <View style={s.cards}>
          <View style={s.card}>
            <Text style={s.label}>MEAN</Text>
            <Text style={s.value}>{d.mean.toFixed(1)}%</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>GRADE / CBE LEVEL</Text>
            <Text style={s.value}>{d.overallGrade}</Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>POSITION</Text>
            <Text style={s.value}>
              {d.rankingPolicy === "SHOW_RANKINGS"
                ? d.position
                : "Not displayed"}
            </Text>
          </View>
          <View style={s.card}>
            <Text style={s.label}>FORMULA</Text>
            <Text style={[s.value, { fontSize: 7 }]}>{d.formulaVersion}</Text>
          </View>
        </View>
        <View>
          <View style={[s.row, s.th]}>
            <Text style={s.subject}>SUBJECT</Text>
            <Text style={s.assessment}>AVAILABLE ASSESSMENTS</Text>
            <Text style={s.cell}>FINAL</Text>
            <Text style={s.cell}>DEV</Text>
            <Text style={s.cell}>GRADE</Text>
            <Text style={s.cell}>RANK</Text>
            <Text style={s.teacher}>TEACHER</Text>
          </View>
          {d.subjects.map((subject) => (
            <View key={subject.name} wrap={false}>
              <View style={s.row}>
                <Text style={s.subject}>{subject.name}</Text>
                <Text style={s.assessment}>
                  {subject.components
                    .map(
                      (c) => `${c.label} ${c.mark.toFixed(0)}%×${c.weightPct}%`,
                    )
                    .join(" · ")}
                </Text>
                <Text style={s.cell}>{subject.finalMark.toFixed(1)}</Text>
                <Text style={s.cell}>
                  {subject.deviation >= 0 ? "+" : ""}
                  {subject.deviation.toFixed(1)}
                </Text>
                <Text style={s.cell}>{subject.grade}</Text>
                <Text style={s.cell}>
                  {d.rankingPolicy === "SHOW_RANKINGS" ? subject.rank : "—"}
                </Text>
                <Text style={s.teacher}>
                  {subject.teacher || "Not resolved"}
                </Text>
              </View>
              <Text style={{ padding: 3, color: "#52647f", fontSize: 6.5 }}>
                {subject.comment}
              </Text>
            </View>
          ))}
        </View>
        <View style={s.cards}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>CLASS TEACHER REMARK</Text>
            <Text>{d.classTeacherRemark || "Not entered"}</Text>
          </View>
          <View style={s.section}>
            <Text style={s.sectionTitle}>PRINCIPAL REMARK</Text>
            <Text>{d.principalRemark || "Not entered"}</Text>
          </View>
        </View>
        <View style={s.cards}>
          <View style={[s.section, { flex: 1 }]}>
            <Text style={s.sectionTitle}>ACADEMIC DATES</Text>
            <Text>School closed: {d.dates.schoolClosedDate}</Text>
            <Text>
              Next term begins: {d.dates.nextTermBeginsDate || "Not configured"}
            </Text>
            {d.fees && (
              <>
                <Text>
                  Fee balance: KES {d.fees.balanceKes.toLocaleString()}
                </Text>
                <Text>
                  Next term fees:{" "}
                  {d.fees.nextTermFeeKes == null
                    ? "Not configured"
                    : `KES ${d.fees.nextTermFeeKes.toLocaleString()}`}
                </Text>
              </>
            )}
          </View>
          <View style={[s.section, { flex: 1 }]}>
            <Text style={s.sectionTitle}>PERFORMANCE OVER TIME</Text>
            <View style={s.chart}>
              {d.trend.map((point) => (
                <View
                  key={point.label}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>{point.mean.toFixed(0)}</Text>
                  <View
                    style={[
                      s.bar,
                      { height: `${Math.max(4, point.mean)}%`, width: "70%" },
                    ]}
                  />
                  <Text style={{ fontSize: 5 }}>{point.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={s.footer}>
          <Text>
            Rounded NEYO A4 · {d.blackAndWhite ? "Black and white" : "Colour"}
          </Text>
          <Text>
            {d.calculationHash
              ? `Calculation ${d.calculationHash.slice(0, 16)}…`
              : "Live computed preview"}
          </Text>
        </View>
      </Page>
    </Document>,
  );
}
