const assert = require('node:assert/strict');
const test = require('node:test');

const { analyzeHeadlines, makeMarkdownReport, summarize } = require('../src/analyze');

test('summarize() counts sentiments and overall', () => {
  const items = [
    { sentiment: 'positive', score: 2, comparative: 0.2 },
    { sentiment: 'positive', score: 1, comparative: 0.1 },
    { sentiment: 'negative', score: -1, comparative: -0.1 },
    { sentiment: 'neutral', score: 0, comparative: 0 },
  ];

  const summary = summarize(items);
  assert.deepEqual(summary.stats, { positive: 2, negative: 1, neutral: 1 });
  assert.equal(summary.overall, 'positive');
});

test('analyzeHeadlines() assigns labels based on score', () => {
  const analyzed = analyzeHeadlines([
    { title: 'Great rally ahead', source: 'x' },
    { title: 'Terrible crash', source: 'y' },
    { title: '', source: 'z' },
  ]);

  assert.equal(analyzed.length, 3);
  assert.ok(['positive', 'negative', 'neutral'].includes(analyzed[0].sentiment));
  assert.ok(['positive', 'negative', 'neutral'].includes(analyzed[1].sentiment));
  assert.equal(analyzed[2].sentiment, 'neutral');
});

test('makeMarkdownReport() renders a readable report', () => {
  const date = '2026-02-01';
  const items = [
    {
      title: 'Bitcoin rises',
      source: 'CoinDesk',
      sentiment: 'positive',
      score: 2,
      comparative: 0.2,
    },
    {
      title: 'Exchange hacked',
      source: 'Example',
      sentiment: 'negative',
      score: -3,
      comparative: -0.3,
    },
  ];
  const summary = summarize(items);
  const md = makeMarkdownReport(date, summary, items);

  assert.match(md, /Crypto News Sentiment Report/);
  assert.match(md, new RegExp(date));
  assert.match(md, /Overall sentiment/);
  assert.match(md, /Latest headlines/);
});
