const { fetchCoinDeskRss } = require('./coindesk-rss');
const { fetchCryptoPanic } = require('./cryptopanic');
const { fetchNewsApi } = require('./newsapi');

const SOURCES = {
  cryptopanic: fetchCryptoPanic,
  newsapi: fetchNewsApi,
  'coindesk-rss': fetchCoinDeskRss,
};

function normalizeSourceName(name) {
  if (!name) return null;
  const normalized = String(name).trim().toLowerCase();
  if (normalized === 'coindesk' || normalized === 'rss') return 'coindesk-rss';
  return normalized;
}

module.exports = {
  SOURCES,
  normalizeSourceName,
};
