# Crypto News Sentiment Analyzer

Fetches cryptocurrency news headlines from multiple sources, scores sentiment, and produces daily JSON/Markdown reports. A Next.js dashboard in `web/` can display a live `latest.json` report (with a sample fallback).

## Features

- Multi-source headline collection: CryptoPanic, NewsAPI, CoinDesk RSS
- Sentiment scoring + summary stats (positive/negative/neutral + averages)
- Report outputs: `report-YYYY-MM-DD.json`, `report-YYYY-MM-DD.md`, optional `latest.json` / `latest.md`
- Optional webhook delivery (`WEBHOOK_URL`)
- GitHub Actions automation: daily scheduled run + CI on PRs

## Requirements

- Node.js `>=18`
- Optional API keys:
  - `CRYPTOPANIC_KEY`
  - `NEWSAPI_KEY`

## Quick start

```bash
npm install
cp .env.example .env
npm run analyze
```

Reports are written to `reports/` by default.

## Configuration

### Config file

Default config lives in `config/news.config.json`:

- `sources`: `["cryptopanic","newsapi","coindesk-rss"]`
- `query`: query string used for NewsAPI
- `max_headlines`: max number of headlines to keep
- `timeout_ms`: HTTP timeout

### Environment variables

Copy `./.env.example` to `./.env`:

```env
CRYPTOPANIC_KEY=
NEWSAPI_KEY=
WEBHOOK_URL=
```

Optional overrides:

```env
SOURCES=cryptopanic,newsapi,coindesk-rss
NEWS_QUERY=crypto OR bitcoin OR ethereum
MAX_HEADLINES=50
TIMEOUT_MS=15000
```

## CLI usage

```bash
npm run analyze -- --help
```

Common examples:

```bash
# Write report + latest.{json,md} to reports/
npm run analyze -- --latest

# Write a "live" dashboard payload
npm run analyze:web

# Only JSON to a custom folder
npm run analyze -- --format json --output-dir /tmp/reports
```

## Web dashboard

The dashboard (`web/pages/index.js`) attempts to fetch `/reports/latest.json`. If it can’t, it falls back to `sample_reports/report-sample.json`.

To generate the file the dashboard expects:

```bash
npm run analyze:web
cd web && npm install && npm run dev
```

Then visit `http://localhost:3000`.

## GitHub Actions

- `./.github/workflows/ci.yml`: runs tests + lint for backend, and builds the Next.js app
- `./.github/workflows/daily-sentiment.yml`: runs on a daily cron and uploads `reports/` as an artifact

Add repository secrets if you want paid sources + webhooks:

- `CRYPTOPANIC_KEY`
- `NEWSAPI_KEY`
- `WEBHOOK_URL`

## Notes / disclaimer

- Headline sentiment is a rough signal; it is not financial advice.
- Respect API provider ToS and rate limits.

## License

MIT — see `LICENSE`.
