const axios = require('axios');
const xml2js = require('xml2js');

async function fetchCoinDeskRss({ timeoutMs, maxHeadlines }) {
  const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
  const res = await axios.get(url, { timeout: timeoutMs });
  const parsed = await xml2js.parseStringPromise(res.data);
  const items = (parsed.rss && parsed.rss.channel && parsed.rss.channel[0].item) || [];

  return items.slice(0, maxHeadlines).map((i) => ({
    title: i.title && i.title[0],
    source: 'CoinDesk',
    url: i.link && i.link[0],
    publishedAt: i.pubDate && i.pubDate[0],
  }));
}

module.exports = { fetchCoinDeskRss };
