/**
 * Crypto News Sentiment Analyzer (CLI + library exports)
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Sentiment = require('sentiment');

const { loadConfig, splitCommaList } = require('./config');
const { makeMarkdownReport, summarize } = require('./report');
const { SOURCES, normalizeSourceName } = require('./sources');
const { dedupeByTitle } = require('./utils');

const sentiment = new Sentiment();

function parseArgs(argv) {
  const out = {};
  const args = argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (!token.startsWith('--')) continue;

    const eq = token.indexOf('=');
    if (eq !== -1) {
      const key = token.slice(2, eq);
      const value = token.slice(eq + 1);
      out[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith('-')) {
      out[key] = true;
      continue;
    }

    out[key] = next;
    i++;
  }

  return out;
}

function printHelp() {
  console.log(`
Crypto News Sentiment Analyzer

Usage:
  npm run analyze -- [options]

Options:
  --config <path>         Path to config JSON (default: config/news.config.json)
  --output-dir <path>     Output directory (default: reports/)
  --date <YYYY-MM-DD>     Report date override (default: today UTC)
  --sources <a,b,c>       Sources: cryptopanic, newsapi, coindesk-rss
  --query <string>        Query (applies to NewsAPI)
  --max <number>          Max headlines (default from config)
  --timeout-ms <number>   HTTP timeout (default from config)
  --format <both|json|md> Output format (default: both)
  --stdout <none|json|md|summary> Print to stdout (default: summary)
  --latest                Also write latest.json/latest.md
  --webhook <url>         Override WEBHOOK_URL
  --verbose               Log source errors
  --help                  Show this help
`);
}

async function fetchHeadlines({ sources, query, maxHeadlines, timeoutMs, verbose }) {
  const requested = sources.map(normalizeSourceName).filter(Boolean);
  const enabled = requested.filter((s) => Boolean(SOURCES[s]));
  if (!enabled.length) throw new Error(`No valid sources requested: ${sources.join(', ')}`);

  const tasks = enabled.map(async (sourceName) => {
    try {
      if (sourceName === 'cryptopanic') {
        return {
          sourceName,
          items: await SOURCES[sourceName]({
            apiKey: process.env.CRYPTOPANIC_KEY,
            timeoutMs,
            maxHeadlines,
          }),
        };
      }
      if (sourceName === 'newsapi') {
        return {
          sourceName,
          items: await SOURCES[sourceName]({
            apiKey: process.env.NEWSAPI_KEY,
            query,
            timeoutMs,
            maxHeadlines,
          }),
        };
      }

      return {
        sourceName,
        items: await SOURCES[sourceName]({ timeoutMs, maxHeadlines }),
      };
    } catch (err) {
      if (verbose) {
        console.warn(`[${sourceName}] fetch failed:`, err && err.message ? err.message : err);
      }
      return { sourceName, items: [], error: err };
    }
  });

  const results = await Promise.all(tasks);
  const succeeded = results.filter((r) => r.items && r.items.length).map((r) => r.sourceName);
  const merged = results.flatMap((r) => r.items || []);
  const deduped = dedupeByTitle(merged).slice(0, maxHeadlines);

  if (!deduped.length) {
    const failures = results
      .filter((r) => r.error)
      .map((r) => `${r.sourceName}: ${r.error && r.error.message ? r.error.message : 'failed'}`)
      .join(' | ');
    throw new Error(`No headlines fetched. ${failures}`);
  }

  return { headlines: deduped, sourcesSucceeded: succeeded };
}

function analyzeHeadlines(headlines) {
  return headlines.map((h) => {
    const title = h.title || '';
    const r = sentiment.analyze(title);
    const label = r.score > 0 ? 'positive' : r.score < 0 ? 'negative' : 'neutral';

    return {
      title,
      source: h.source || 'unknown',
      url: h.url || null,
      published_at: h.publishedAt || null,
      score: r.score,
      comparative: r.comparative,
      sentiment: label,
    };
  });
}

function writeFileAtomic(filePath, contents) {
  const dir = path.dirname(filePath);
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, contents);
  fs.renameSync(tmp, filePath);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const baseConfig = loadConfig({ configPath: args.config });
  const date = String(args.date || new Date().toISOString().slice(0, 10));
  const outputDir = path.resolve(process.cwd(), String(args['output-dir'] || 'reports'));

  const sources =
    splitCommaList(args.sources) || baseConfig.sources.map(normalizeSourceName).filter(Boolean);
  const query = args.query ? String(args.query) : baseConfig.query;
  const maxHeadlines = args.max ? Number(args.max) : baseConfig.maxHeadlines;
  const timeoutMs = args['timeout-ms'] ? Number(args['timeout-ms']) : baseConfig.timeoutMs;
  const verbose = Boolean(args.verbose);

  const format = String(args.format || 'both').toLowerCase();
  const writeJson = format === 'both' || format === 'json';
  const writeMd = format === 'both' || format === 'md';
  const writeLatest = Boolean(args.latest);

  const stdoutMode = String(args.stdout || 'summary').toLowerCase();
  const webhookUrl = String(args.webhook || process.env.WEBHOOK_URL || '');

  fs.mkdirSync(outputDir, { recursive: true });

  const { headlines, sourcesSucceeded } = await fetchHeadlines({
    sources,
    query,
    maxHeadlines,
    timeoutMs,
    verbose,
  });

  const analyzed = analyzeHeadlines(headlines);
  const summary = summarize(analyzed);

  const report = {
    date,
    query,
    overall_sentiment: summary.overall,
    stats: summary.stats,
    average_score: summary.averageScore,
    average_comparative: summary.averageComparative,
    sources_requested: sources,
    sources_succeeded: sourcesSucceeded,
    total_headlines: analyzed.length,
    top_headlines: analyzed.slice(0, 20),
    top_positive: [...analyzed].sort((a, b) => b.score - a.score).slice(0, 10),
    top_negative: [...analyzed].sort((a, b) => a.score - b.score).slice(0, 10),
    headlines: analyzed,
    timestamp: new Date().toISOString(),
  };

  const outputs = [];

  if (writeJson) {
    const jsonPath = path.join(outputDir, `report-${date}.json`);
    writeFileAtomic(jsonPath, JSON.stringify(report, null, 2));
    outputs.push(jsonPath);

    if (writeLatest) {
      const latestPath = path.join(outputDir, 'latest.json');
      writeFileAtomic(latestPath, JSON.stringify(report, null, 2));
      outputs.push(latestPath);
    }
  }

  if (writeMd) {
    const md = makeMarkdownReport(date, summary, analyzed);
    const mdPath = path.join(outputDir, `report-${date}.md`);
    writeFileAtomic(mdPath, md);
    outputs.push(mdPath);

    if (writeLatest) {
      const latestMdPath = path.join(outputDir, 'latest.md');
      writeFileAtomic(latestMdPath, md);
      outputs.push(latestMdPath);
    }
  }

  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, report, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
    } catch (err) {
      console.warn('Webhook post failed:', err && err.message ? err.message : err);
    }
  }

  if (stdoutMode === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else if (stdoutMode === 'md') {
    console.log(makeMarkdownReport(date, summary, analyzed));
  } else if (stdoutMode === 'summary') {
    console.log(
      JSON.stringify(
        {
          date,
          overall: summary.overall,
          stats: summary.stats,
          sources_succeeded: sourcesSucceeded,
          outputs,
        },
        null,
        2,
      ),
    );
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  });
}

module.exports = {
  analyzeHeadlines,
  fetchHeadlines,
  makeMarkdownReport,
  summarize,
};
