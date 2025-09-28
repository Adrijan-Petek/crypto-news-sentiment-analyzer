/**
 * Crypto News Sentiment Analyzer
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');
const Sentiment = require('sentiment');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const sentiment = new Sentiment();

async function fetchFromCryptoPanic() {
  const key = process.env.CRYPTOPANIC_KEY;
  if (!key) throw new Error('No CryptoPanic key');
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true`;
  const res = await axios.get(url, { timeout: 15000 });
  if (!res.data || !res.data.results) throw new Error('Invalid CryptoPanic response');
  return res.data.results.map(r => ({ title: r.title, source: r.domain }));
}

async function fetchFromNewsAPI() {
  const key = process.env.NEWSAPI_KEY;
  if (!key) throw new Error('No NewsAPI key');
  const url = `https://newsapi.org/v2/everything?q=crypto OR bitcoin OR ethereum&language=en&pageSize=50&apiKey=${key}`;
  const res = await axios.get(url, { timeout: 15000 });
  if (!res.data || !res.data.articles) throw new Error('Invalid NewsAPI response');
  return res.data.articles.map(a => ({ title: a.title || a.description || 'no title', source: a.source && a.source.name }));
}

async function fetchFromCoinDeskRSS() {
  const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
  const res = await axios.get(url, { timeout: 15000 });
  const parsed = await xml2js.parseStringPromise(res.data);
  const items = (parsed.rss && parsed.rss.channel && parsed.rss.channel[0].item) || [];
  return items.slice(0,50).map(i => ({ title: i.title && i.title[0], source: 'CoinDesk' }));
}

async function fetchHeadlines() {
  try {
    return await fetchFromCryptoPanic();
  } catch (e) {}
  try {
    return await fetchFromNewsAPI();
  } catch (e) {}
  return await fetchFromCoinDeskRSS();
}

function analyzeHeadlines(headlines) {
  return headlines.map(h => {
    const r = sentiment.analyze(h.title || '');
    let label = 'neutral';
    if (r.score > 0) label = 'positive';
    if (r.score < 0) label = 'negative';
    return {
      title: h.title,
      source: h.source || 'unknown',
      score: r.score,
      comparative: r.comparative,
      sentiment: label
    };
  });
}

function summarize(items) {
  const stats = { positive:0, negative:0, neutral:0 };
  items.forEach(i => { stats[i.sentiment] = (stats[i.sentiment]||0)+1; });
  const overall = (stats.positive > stats.negative) ? 'positive' : (stats.negative > stats.positive) ? 'negative' : 'neutral';
  return { stats, overall };
}

function makeMarkdownReport(date, summary, items) {
  const lines = [];
  lines.push(`# Crypto News Sentiment Report — ${date}`);
  lines.push('');
  lines.push(`**Overall sentiment:** **${summary.overall.toUpperCase()}**`);
  lines.push('');
  lines.push(`**Stats:** Positive: ${summary.stats.positive} — Negative: ${summary.stats.negative} — Neutral: ${summary.stats.neutral}`);
  lines.push('');
  lines.push('## Top headlines');
  lines.push('');
  items.slice(0,30).forEach(it => {
    const emoji = it.sentiment === 'positive' ? '👍' : it.sentiment === 'negative' ? '👎' : '😐';
    lines.push(`- ${emoji} **${it.sentiment.toUpperCase()}** — ${it.title} (${it.source})`);
  });
  return lines.join('\n');
}

async function main() {
  const date = new Date().toISOString().slice(0,10);
  let raw;
  try {
    raw = await fetchHeadlines();
  } catch (e) {
    console.error('Failed to fetch headlines:', e.message);
    process.exit(1);
  }
  const analyzed = analyzeHeadlines(raw);
  const summary = summarize(analyzed);

  const report = {
    date,
    overall_sentiment: summary.overall,
    stats: summary.stats,
    total_headlines: analyzed.length,
    top_headlines: analyzed.slice(0,20),
    timestamp: new Date().toISOString()
  };

  const jsonPath = path.join(REPORTS_DIR, `report-${date}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log('Wrote', jsonPath);

  const md = makeMarkdownReport(date, summary, analyzed);
  const mdPath = path.join(REPORTS_DIR, `report-${date}.md`);
  fs.writeFileSync(mdPath, md);
  console.log('Wrote', mdPath);

  const webhook = process.env.WEBHOOK_URL;
  if (webhook) {
    try {
      await axios.post(webhook, report, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
      console.log('Posted summary to webhook');
    } catch (e) {
      console.warn('Webhook post failed:', e.message || e);
    }
  }

  console.log(JSON.stringify({ overall: summary.overall, stats: summary.stats }, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
