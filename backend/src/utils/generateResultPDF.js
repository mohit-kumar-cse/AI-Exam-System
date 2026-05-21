// backend/src/utils/generateResultPDF.js
// Uses pdfkit — pure Node.js, no Python needed
// Install: npm install pdfkit

import PDFDocument from "pdfkit";

// ── colors ────────────────────────────────────────────────
const C = {
  darkBg:    "#0F172A",
  cardBg:    "#1E293B",
  border:    "#334155",
  accent:    "#6366F1",
  accent2:   "#8B5CF6",
  green:     "#22C55E",
  red:       "#EF4444",
  yellow:    "#EAB308",
  white:     "#F8FAFC",
  gray:      "#94A3B8",
  lightGray: "#CBD5E1",
  hashGray:  "#64748B",
  headerSub: "#C7D2FE",
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rrect(doc, x, y, w, h, r = 8, fillColor = null, strokeColor = null, lineWidth = 0.5) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (fillColor && strokeColor) {
    doc.fillAndStroke(fillColor, strokeColor);
    doc.lineWidth(lineWidth);
  } else if (fillColor) {
    doc.fill(fillColor);
  } else if (strokeColor) {
    doc.lineWidth(lineWidth).stroke(strokeColor);
  }
  doc.restore();
}

function drawPie(doc, cx, cy, radius, correct, wrong, skipped) {
  const total = correct + wrong + skipped;
  if (total === 0) return;

  const segments = [
    { count: correct, color: C.green },
    { count: wrong,   color: C.red },
    { count: skipped, color: C.yellow },
  ];

  let startAngle = -Math.PI / 2; // start from top

  segments.forEach(({ count, color }) => {
    if (count === 0) return;
    const angle = (count / total) * 2 * Math.PI;
    doc.save();
    doc.moveTo(cx, cy);
    doc.arc(cx, cy, radius, startAngle, startAngle + angle);
    doc.lineTo(cx, cy);
    doc.closePath();
    doc.fillAndStroke(color, C.darkBg);
    doc.lineWidth(2);
    doc.restore();
    startAngle += angle;
  });
}

function drawBar(doc, x, y, maxW, h, value, total, color) {
  // track
  doc.save();
  doc.roundedRect(x, y, maxW, h, 3).fill(C.border);
  // fill
  if (total > 0 && value > 0) {
    const fillW = (value / total) * maxW;
    if (fillW > 6) {
      doc.roundedRect(x, y, fillW, h, 3).fill(color);
    }
  }
  doc.restore();
}

/**
 * Generate exam result PDF and pipe it to a writable stream (res)
 *
 * @param {object} data  - result data
 * @param {object} res   - Express response object (writable stream)
 */
export function generateResultPDF(data, res) {
  const {
    examTitle    = "Exam",
    studentName  = "Student",
    studentId    = "",
    subject      = "",
    date         = new Date().toLocaleDateString("en-IN"),
    score        = 0,
    total        = 0,
    percentage   = 0,
    correct      = 0,
    wrong        = 0,
    skipped      = 0,
    verified     = false,
    hashVal      = "N/A",
    rank         = "N/A",
    timeSpent    = "N/A",
    questions    = [],   // array of [label, status] e.g. ["Q1","correct"]
  } = data;

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    info: { Title: `Result — ${examTitle}`, Author: "AI Exam System" },
  });

  // Pipe to response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="result_${examTitle.replace(/\s+/g, "_")}.pdf"`);
  doc.pipe(res);

  const W = 595.28;
  const H = 841.89;
  const PAD = 20;

  // ── PAGE BACKGROUND ───────────────────────────────────
  doc.rect(0, 0, W, H).fill(C.darkBg);

  // ── HEADER BAND ───────────────────────────────────────
  const hdrH = 120;
  doc.rect(0, 0, W, hdrH).fill(C.accent);

  // decorative circles
  doc.save();
  doc.circle(W - 40, 20, 80).fill("#7C3AED").opacity(0.15);
  doc.circle(W - 10, 90, 50).fill("#7C3AED").opacity(0.12);
  doc.restore();

  // EXAM RESULT title
  doc.save();
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(26);
  doc.text("EXAM RESULT", PAD, 28);
  doc.fillColor(C.headerSub).font("Helvetica").fontSize(12);
  doc.text(examTitle, PAD, 62);
  doc.restore();

  // student info (right side of header)
  doc.save();
  doc.fillColor(C.headerSub).font("Helvetica").fontSize(9);
  doc.text(studentName, 0, 32, { width: W - PAD, align: "right" });
  doc.text(studentId,   0, 48, { width: W - PAD, align: "right" });
  doc.text([subject, date].filter(Boolean).join("  •  "), 0, 64, { width: W - PAD, align: "right" });
  doc.restore();

  // ── STAT CARDS ROW ────────────────────────────────────
  const statY    = hdrH + 16;
  const statH    = 58;
  const statW    = (W - PAD * 2 - 9) / 4;
  const statData = [
    { label: "SCORE",      value: String(score),          color: C.accent },
    { label: "TOTAL",      value: String(total),           color: C.lightGray },
    { label: "PERCENTAGE", value: `${percentage}%`,        color: parseFloat(percentage) >= 50 ? C.green : C.red },
    { label: "RANK",       value: String(rank),            color: C.accent2 },
  ];

  statData.forEach((s, i) => {
    const sx = PAD + i * (statW + 3);
    rrect(doc, sx, statY, statW, statH, 8, C.cardBg, C.border, 0.5);
    doc.fillColor(C.gray).font("Helvetica").fontSize(7.5);
    doc.text(s.label, sx, statY + 10, { width: statW, align: "center" });
    doc.fillColor(s.color).font("Helvetica-Bold").fontSize(18);
    doc.text(s.value, sx, statY + 26, { width: statW, align: "center" });
  });

  // ── TWO COLUMN LAYOUT ─────────────────────────────────
  const colTopY  = statY + statH + 14;
  const leftX    = PAD;
  const leftW    = 230;
  const rightX   = PAD + leftW + 14;
  const rightW   = W - rightX - PAD;

  // ── LEFT: PIE CHART CARD ──────────────────────────────
  const pieCardH = 160;
  rrect(doc, leftX, colTopY, leftW, pieCardH, 8, C.cardBg, C.border, 0.5);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10);
  doc.text("Performance Breakdown", leftX + 10, colTopY + 12);

  const pieCX = leftX + 60;
  const pieCY = colTopY + pieCardH / 2 + 6;
  const pieR  = 44;
  drawPie(doc, pieCX, pieCY, pieR, correct, wrong, skipped);

  // legend
  const legendItems = [
    { color: C.green,  label: `Correct    ${correct}` },
    { color: C.red,    label: `Wrong      ${wrong}` },
    { color: C.yellow, label: `Skipped   ${skipped}` },
  ];
  legendItems.forEach((item, i) => {
    const ly = colTopY + 42 + i * 22;
    doc.roundedRect(leftX + 128, ly, 8, 8, 2).fill(item.color);
    doc.fillColor(C.lightGray).font("Helvetica").fontSize(9);
    doc.text(item.label, leftX + 142, ly - 1);
  });

  // ── LEFT: BAR CHART CARD ──────────────────────────────
  const barCardY = colTopY + pieCardH + 10;
  const barCardH = 100;
  rrect(doc, leftX, barCardY, leftW, barCardH, 8, C.cardBg, C.border, 0.5);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10);
  doc.text("Question Analysis", leftX + 10, barCardY + 12);

  const barMaxW  = leftW - 90;
  const totalQ   = correct + wrong + skipped || 1;
  const barItems = [
    { label: "Correct", value: correct, color: C.green },
    { label: "Wrong",   value: wrong,   color: C.red },
    { label: "Skipped", value: skipped, color: C.yellow },
  ];
  barItems.forEach((item, i) => {
    const by = barCardY + 38 + i * 20;
    doc.fillColor(C.gray).font("Helvetica").fontSize(8);
    doc.text(item.label, leftX + 10, by + 1);
    drawBar(doc, leftX + 60, by, barMaxW, 9, item.value, totalQ, item.color);
    doc.fillColor(item.color).font("Helvetica-Bold").fontSize(8);
    doc.text(String(item.value), leftX + 60 + barMaxW + 6, by + 1);
  });

  // ── LEFT: HASH CARD ───────────────────────────────────
  const hashCardY = barCardY + barCardH + 10;
  const hashCardH = 50;
  rrect(doc, leftX, hashCardY, leftW, hashCardH, 8, C.cardBg, C.border, 0.5);
  doc.fillColor(C.gray).font("Helvetica").fontSize(7.5);
  doc.text("CRYPTOGRAPHIC HASH", leftX + 10, hashCardY + 10);
  doc.fillColor(C.hashGray).font("Courier").fontSize(6.5);
  const half = Math.floor(hashVal.length / 2);
  doc.text(hashVal.slice(0, half), leftX + 10, hashCardY + 24);
  doc.text(hashVal.slice(half),    leftX + 10, hashCardY + 35);

  // ── RIGHT: QUESTION PALETTE CARD ─────────────────────
  const palH = pieCardH;
  rrect(doc, rightX, colTopY, rightW, palH, 8, C.cardBg, C.border, 0.5);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10);
  doc.text("Question Palette", rightX + 10, colTopY + 12);

  const qSize  = 28;
  const qGap   = 6;
  const qCols  = 4;
  const stColors = { correct: C.green, wrong: C.red, skipped: C.yellow };
  const stIcons  = { correct: "✓", wrong: "✗", skipped: "-" };

  questions.forEach(([label, status], idx) => {
    const ci = idx % qCols;
    const ri = Math.floor(idx / qCols);
    const qx = rightX + 10 + ci * (qSize + qGap);
    const qy = colTopY + 34 + ri * (qSize + qGap);
    const col = stColors[status] || C.border;
    doc.roundedRect(qx, qy, qSize, qSize, 4).fill(col);
    doc.fillColor(C.darkBg).font("Helvetica-Bold").fontSize(7);
    doc.text(label, qx, qy + 6, { width: qSize, align: "center" });
    doc.font("Helvetica").fontSize(6);
    doc.text(stIcons[status] || "", qx, qy + 16, { width: qSize, align: "center" });
  });

  // ── RIGHT: TIME CARD ──────────────────────────────────
  const tmY = barCardY;
  const tmH = 44;
  rrect(doc, rightX, tmY, rightW, tmH, 8, C.cardBg, C.border, 0.5);
  doc.fillColor(C.gray).font("Helvetica").fontSize(8);
  doc.text("TIME SPENT", rightX + 10, tmY + 10);
  doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(16);
  doc.text(String(timeSpent), rightX + 10, tmY + 22);

  // ── RIGHT: VERIFY CARD ────────────────────────────────
  const vfY = tmY + tmH + 10;
  const vfH = 44;
  const vcol = verified ? C.green : C.red;
  const vtxt = verified ? "✓  Result Verified — Tamper Proof" : "✗  Result Tampered!";
  rrect(doc, rightX, vfY, rightW, vfH, 8, C.cardBg, vcol, 1);
  doc.fillColor(C.gray).font("Helvetica").fontSize(8);
  doc.text("INTEGRITY CHECK", rightX + 10, vfY + 10);
  doc.fillColor(vcol).font("Helvetica-Bold").fontSize(10);
  doc.text(vtxt, rightX + 10, vfY + 24);

  // ── FOOTER ────────────────────────────────────────────
  doc.fillColor(C.gray).font("Helvetica").fontSize(7);
  doc.text(
    "AI Exam System  •  Auto-generated & cryptographically verified",
    PAD, H - 20
  );
  doc.text(`Generated on ${date}`, 0, H - 20, { width: W - PAD, align: "right" });

  doc.end();
}