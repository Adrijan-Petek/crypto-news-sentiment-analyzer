const axios = require('axios');

async function fetchCryptoPanic({ apiKey, timeoutMs, maxHeadlines }) {
  if (!apiKey) throw new Error('Missing CRYPTOPANIC_KEY');

  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true`;
  const res = await axios.get(url, { timeout: timeoutMs });
  if (!res.data || !res.data.results) throw new Error('Invalid CryptoPanic response');

  return res.data.results.slice(0, maxHeadlines).map((r) => ({
    title: r.title,
    source: r.domain || 'CryptoPanic',
    url: r.url || r.news_url || null,
    publishedAt: r.published_at || null,
  }));
}

module.exports = { fetchCryptoPanic };
