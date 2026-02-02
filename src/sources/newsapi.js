const axios = require('axios');

async function fetchNewsApi({ apiKey, query, timeoutMs, maxHeadlines }) {
  if (!apiKey) throw new Error('Missing NEWSAPI_KEY');

  const q = query || 'crypto OR bitcoin OR ethereum';
  const pageSize = Math.min(Math.max(1, maxHeadlines), 100);
  const url =
    'https://newsapi.org/v2/everything' +
    `?q=${encodeURIComponent(q)}` +
    '&language=en' +
    `&pageSize=${pageSize}` +
    '&sortBy=publishedAt' +
    `&apiKey=${apiKey}`;

  const res = await axios.get(url, { timeout: timeoutMs });
  if (!res.data || !res.data.articles) throw new Error('Invalid NewsAPI response');

  return res.data.articles.slice(0, maxHeadlines).map((a) => ({
    title: a.title || a.description || 'no title',
    source: (a.source && a.source.name) || 'NewsAPI',
    url: a.url || null,
    publishedAt: a.publishedAt || null,
  }));
}

module.exports = { fetchNewsApi };
