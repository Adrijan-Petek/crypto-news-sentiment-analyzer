# 🚀 Crypto News Sentiment Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg)](https://vercel.com)

> Real-time cryptocurrency news sentiment analysis with automated reporting and beautiful visualizations

![Crypto Sentiment Dashboard](https://via.placeholder.com/800x400/1a1a1a/00ff88?text=Crypto+Sentiment+Dashboard)

## 📊 Overview

This project provides comprehensive sentiment analysis of cryptocurrency news headlines from multiple sources including CryptoPanic, NewsAPI, and CoinDesk RSS feeds. The system automatically fetches the latest crypto news, analyzes sentiment using natural language processing, and generates detailed reports with visualizations.

### ✨ Key Features

- 🔍 **Multi-Source News Aggregation**: Fetches headlines from CryptoPanic, NewsAPI, and CoinDesk RSS
- 🧠 **Advanced Sentiment Analysis**: Uses the `sentiment` library for accurate emotion detection
- 📈 **Interactive Visualizations**: Beautiful charts powered by Recharts
- 🤖 **Automated Reporting**: Generates JSON and Markdown reports daily
- 🌐 **Web Dashboard**: Modern Next.js frontend for data visualization
- 🚀 **Easy Deployment**: One-click Vercel deployment for the frontend
- 🔗 **Webhook Integration**: Optional webhook notifications for new reports
- 📱 **Responsive Design**: Mobile-friendly dashboard interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   News Sources  │───▶│  Sentiment       │───▶│   Reports       │
│                 │    │  Analysis        │    │                 │
│ • CryptoPanic   │    │                  │    │ • JSON          │
│ • NewsAPI       │    │ • Natural Lang   │    │ • Markdown      │
│ • CoinDesk RSS  │    │ • Score Calc     │    │ • Webhook       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐             ▼
│   Web Dashboard │◀───│   Next.js App    │    ┌─────────────────┐
│                 │    │                  │    │   Vercel        │
│ • Pie Charts    │    │ • Recharts       │    │   Deployment    │
│ • Timeline      │    │ • Responsive     │    │                 │
│ • Headlines     │    │ • Sample Data    │    └─────────────────┘
└─────────────────┘    └──────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Axios** - HTTP client for API calls
- **Sentiment** - Natural language sentiment analysis
- **XML2JS** - RSS feed parsing
- **Dotenv** - Environment variable management

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **Recharts** - Data visualization
- **Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- API keys for news sources (optional, falls back to RSS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crypto-news-sentiment-analyzer.git
   cd crypto-news-sentiment-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys:
   ```env
   CRYPTOPANIC_KEY=your_cryptopanic_key
   NEWSAPI_KEY=your_newsapi_key
   WEBHOOK_URL=https://your-webhook-url.com
   ```

4. **Run the analyzer**
   ```bash
   npm run analyze
   ```

## 📊 Usage

### Backend Analysis

Run the sentiment analysis script:

```bash
npm run analyze
```

This will:
- Fetch latest crypto headlines
- Analyze sentiment for each headline
- Generate reports in `reports/` directory
- Post summary to webhook (if configured)

### Sample Output

```json
{
  "overall": "positive",
  "stats": {
    "positive": 25,
    "negative": 8,
    "neutral": 17
  }
}
```

### Frontend Dashboard

1. **Development**
   ```bash
   cd web
   npm run dev
   ```
   Visit `http://localhost:3000`

2. **Production Build**
   ```bash
   cd web
   npm run build
   npm start
   ```

## 📁 Project Structure

```
crypto-news-sentiment-analyzer/
├── src/
│   └── analyze.js          # Main analysis script
├── web/
│   ├── pages/
│   │   └── index.js        # Next.js dashboard
│   ├── package.json
│   └── vercel.json         # Vercel config
├── config/
│   └── news.config.json    # Configuration
├── sample_reports/
│   └── report-sample.json  # Sample data
├── reports/                # Generated reports (auto-created)
├── .env.example           # Environment template
├── package.json
└── README.md
```

## 🔧 Configuration

### API Keys

The system tries multiple news sources in order of preference:

1. **CryptoPanic** (requires API key)
2. **NewsAPI** (requires API key)
3. **CoinDesk RSS** (free, no key required)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CRYPTOPANIC_KEY` | CryptoPanic API key | No |
| `NEWSAPI_KEY` | NewsAPI key | No |
| `WEBHOOK_URL` | Webhook for notifications | No |

## 🚀 Deployment

### Backend (Automated)

Set up a cron job or GitHub Actions for daily analysis:

```yaml
# .github/workflows/daily-sentiment.yml
name: Daily Sentiment Analysis
on:
  schedule:
    - cron: '0 12 * * *'  # Daily at noon UTC
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run analyze
      - run: git add reports/ && git commit -m "Update reports" || true
      - run: git push
```

### Frontend (Vercel)

1. **Deploy to Vercel**
   ```bash
   cd web
   vercel --prod
   ```

2. **Automatic Deployments**
   Connect your GitHub repo to Vercel for automatic deployments on push.

## 📈 Dashboard Features

The web dashboard includes:

- **📊 Sentiment Distribution**: Pie chart showing positive/negative/neutral breakdown
- **📈 Timeline View**: Line chart for sentiment trends over time
- **📰 Top Headlines**: List of recent headlines with sentiment indicators
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sentiment](https://www.npmjs.com/package/sentiment) - Natural language sentiment analysis
- [Recharts](https://recharts.org/) - React charting library
- [CryptoPanic](https://cryptopanic.com/) - Crypto news API
- [NewsAPI](https://newsapi.org/) - News aggregation API
- [CoinDesk](https://www.coindesk.com/) - Cryptocurrency news

---

<div align="center">

**Made with ❤️ for the crypto community**

[⭐ Star this repo](https://github.com/yourusername/crypto-news-sentiment-analyzer) • [🐛 Report Issues](https://github.com/yourusername/crypto-news-sentiment-analyzer/issues) • [💬 Discussions](https://github.com/yourusername/crypto-news-sentiment-analyzer/discussions)

</div>
