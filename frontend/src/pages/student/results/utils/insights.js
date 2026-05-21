// src/pages/student/results/utils/insights.js

export function generateAIInsights(detailed) {
  if (!detailed || !detailed.evaluated) return [];

  const insights = [];
  const pct     = detailed.percentage ?? 0;
  const stats   = detailed.statistics ?? {};
  const correct = stats.correctAnswers ?? 0;
  const wrong   = stats.wrongAnswers ?? 0;
  const skipped = stats.skippedQuestions ?? 0;
  const total   = correct + wrong + skipped;
  const timeMin = detailed.totalTimeSpent
    ? parseFloat((detailed.totalTimeSpent / 60).toFixed(1))
    : null;

  // Performance level
  if (pct >= 80)
    insights.push({ icon: "🏆", text: "Excellent performance — top tier result.", color: "text-green-400" });
  else if (pct >= 60)
    insights.push({ icon: "📈", text: "Good result. Focused revision can push you above 80%.", color: "text-blue-400" });
  else if (pct >= 40)
    insights.push({ icon: "⚠️", text: "Borderline pass. Review all wrong answers carefully.", color: "text-yellow-400" });
  else
    insights.push({ icon: "🔁", text: "Below passing threshold. A full re-study is recommended.", color: "text-red-400" });

  // Wrong > correct
  if (total > 0 && wrong > correct)
    insights.push({ icon: "🎯", text: `${wrong} wrong answers — negative marking could be impacting your score.`, color: "text-red-300" });

  // Too many skipped
  if (total > 0 && skipped > total * 0.3)
    insights.push({ icon: "⏭️", text: `${skipped} questions skipped — attempt all questions next time.`, color: "text-yellow-300" });

  // Submitted too fast
  if (timeMin !== null && timeMin < 10)
    insights.push({ icon: "⚡", text: "Very fast submission — review questions more carefully next time.", color: "text-orange-400" });

  // Perfect accuracy
  if (correct > 0 && wrong === 0)
    insights.push({ icon: "✨", text: "Zero wrong answers — perfect accuracy on attempted questions.", color: "text-green-300" });

  // Top rank
  if (detailed.rank && detailed.rank <= 3)
    insights.push({ icon: "🥇", text: `Rank #${detailed.rank} — you are among the top performers.`, color: "text-amber-400" });

  return insights;
}