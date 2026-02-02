function summarize(items) {
  const stats = { positive: 0, negative: 0, neutral: 0 };
  let totalScore = 0;
  let totalComparative = 0;

  for (const item of items) {
    stats[item.sentiment] = (stats[item.sentiment] || 0) + 1;
    totalScore += item.score || 0;
    totalComparative += item.comparative || 0;
  }

  const averageScore = items.length ? totalScore / items.length : 0;
  const averageComparative = items.length ? totalComparative / items.length : 0;
  const overall = averageScore > 0 ? 'positive' : averageScore < 0 ? 'negative' : 'neutral';

  return { stats, overall, averageScore, averageComparative };
}

function makeMarkdownReport(date, summary, items) {
  const lines = [];
  lines.push(`# Crypto News Sentiment Report — ${date}`);
  lines.push('');
  lines.push(`**Overall sentiment:** **${summary.overall.toUpperCase()}**`);
  lines.push('');
  lines.push(
    `**Stats:** Positive: ${summary.stats.positive} — Negative: ${summary.stats.negative} — Neutral: ${summary.stats.neutral}`,
  );
  lines.push('');
  lines.push(
    `**Average score:** ${summary.averageScore.toFixed(2)} (comparative: ${summary.averageComparative.toFixed(3)})`,
  );
  lines.push('');

  const topPositive = [...items].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  const topNegative = [...items].sort((a, b) => (a.score || 0) - (b.score || 0)).slice(0, 10);

  lines.push('## Top positive');
  lines.push('');
  topPositive.forEach((it) => {
    lines.push(`- **+${it.score}** — ${it.title} (${it.source})`);
  });
  lines.push('');

  lines.push('## Top negative');
  lines.push('');
  topNegative.forEach((it) => {
    lines.push(`- **${it.score}** — ${it.title} (${it.source})`);
  });
  lines.push('');

  lines.push('## Latest headlines');
  lines.push('');
  items.slice(0, 30).forEach((it) => {
    const badge = it.sentiment === 'positive' ? 'POS' : it.sentiment === 'negative' ? 'NEG' : 'NEU';
    const link = it.url ? ` — ${it.url}` : '';
    lines.push(`- **${badge}** (${it.score}) — ${it.title} (${it.source})${link}`);
  });

  return lines.join('\n');
}

module.exports = {
  makeMarkdownReport,
  summarize,
};
