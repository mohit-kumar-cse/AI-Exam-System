// src/pages/student/results/utils/chartHelpers.js

export function getPassFail(pct) {
  if (pct === null || pct === undefined) return null;
  return pct >= 40
    ? { label: "PASS", cls: "bg-green-500/20 border-green-500 text-green-400" }
    : { label: "FAIL", cls: "bg-red-500/20 border-red-500 text-red-400" };
}

export function getPieData(stats = {}) {
  return [
    { name: "Correct", value: stats.correctAnswers || 0 },
    { name: "Wrong",   value: stats.wrongAnswers || 0 },
    { name: "Skipped", value: stats.skippedQuestions || 0 },
  ];
}

export function getTimeData(questions = []) {
  return questions.map((q, i) => ({
    q:    `Q${q.questionNumber || i + 1}`,
    time: q.timeTaken || 0,
  }));
}

export function calcAccuracy(stats = {}) {
  const c = stats.correctAnswers ?? 0;
  const w = stats.wrongAnswers ?? 0;
  const attempted = c + w;
  return attempted > 0 ? `${Math.round((c / attempted) * 100)}%` : "—";
}