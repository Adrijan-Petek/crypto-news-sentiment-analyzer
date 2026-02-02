const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  sources: ['cryptopanic', 'newsapi', 'coindesk-rss'],
  query: 'crypto OR bitcoin OR ethereum',
  max_headlines: 50,
  timeout_ms: 15000,
};

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function splitCommaList(value) {
  if (!value) return null;
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function loadConfig({ configPath } = {}) {
  const resolvedPath = configPath || path.join(__dirname, '..', 'config', 'news.config.json');
  const fileConfig = readJsonIfExists(resolvedPath) || {};

  const envSources = splitCommaList(process.env.SOURCES);
  const envMax = process.env.MAX_HEADLINES ? Number(process.env.MAX_HEADLINES) : null;
  const envTimeout = process.env.TIMEOUT_MS ? Number(process.env.TIMEOUT_MS) : null;
  const envQuery = process.env.NEWS_QUERY || null;

  const merged = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    sources: envSources || fileConfig.sources || DEFAULT_CONFIG.sources,
    query: envQuery || fileConfig.query || DEFAULT_CONFIG.query,
    max_headlines: Number.isFinite(envMax)
      ? envMax
      : (fileConfig.max_headlines ?? DEFAULT_CONFIG.max_headlines),
    timeout_ms: Number.isFinite(envTimeout)
      ? envTimeout
      : (fileConfig.timeout_ms ?? DEFAULT_CONFIG.timeout_ms),
  };

  const sources = Array.isArray(merged.sources) ? merged.sources : DEFAULT_CONFIG.sources;
  const maxHeadlines = Number.isFinite(Number(merged.max_headlines))
    ? Math.max(1, Number(merged.max_headlines))
    : DEFAULT_CONFIG.max_headlines;
  const timeoutMs = Number.isFinite(Number(merged.timeout_ms))
    ? Math.max(1000, Number(merged.timeout_ms))
    : DEFAULT_CONFIG.timeout_ms;

  return {
    configPath: resolvedPath,
    sources,
    query: String(merged.query || DEFAULT_CONFIG.query),
    maxHeadlines,
    timeoutMs,
  };
}

module.exports = {
  DEFAULT_CONFIG,
  loadConfig,
  splitCommaList,
};
