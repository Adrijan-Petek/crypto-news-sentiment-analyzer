function dedupeByTitle(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = String(item.title || '')
      .trim()
      .toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

module.exports = {
  dedupeByTitle,
};
