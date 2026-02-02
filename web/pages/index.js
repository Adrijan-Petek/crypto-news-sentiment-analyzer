import sample from '../../sample_reports/report-sample.json';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/Home.module.css';

function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function sentimentClass(sentiment) {
  const s = String(sentiment || '').toLowerCase();
  if (s === 'positive') return styles.badgePos;
  if (s === 'negative') return styles.badgeNeg;
  return styles.badgeNeu;
}

export default function Home() {
  const [report, setReport] = useState(sample);
  const [isLive, setIsLive] = useState(false);
  const [statusText, setStatusText] = useState('Loading…');

  useEffect(() => {
    fetch('/reports/latest.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.stats || !data.date) return;
        setReport(data);
        setIsLive(true);
        setStatusText('Live');
      })
      .catch(() => {
        setStatusText('Sample');
      });
  }, []);

  const stats = report.stats || { positive: 0, negative: 0, neutral: 0 };
  const pieData = [
    { name: 'Positive', value: stats.positive || 0 },
    { name: 'Negative', value: stats.negative || 0 },
    { name: 'Neutral', value: stats.neutral || 0 },
  ];
  const timeline = useMemo(() => {
    return [
      {
        date: report.date,
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
      },
    ];
  }, [report.date, stats.negative, stats.neutral, stats.positive]);

  const COLORS = ['#3ddc97', '#ff5a5f', '#9aa4b2'];

  const overall = String(report.overall_sentiment || 'neutral').toLowerCase();
  const sourcesSucceeded = report.sources_succeeded || [];
  const total = report.total_headlines ?? (report.headlines || []).length;
  const avgScore = report.average_score ?? report.averageScore;
  const avgComparative = report.average_comparative ?? report.averageComparative;
  const topHeadlines = report.top_headlines || sample.top_headlines || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.nav}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true" />
            <div className={styles.titleWrap}>
              <div className={styles.title}>Crypto News Sentiment</div>
              <div className={styles.subtitle}>Headline sentiment signal & daily reports</div>
            </div>
          </div>
          <div className={styles.navRight}>
            <div className={styles.chip}>
              <span className={`${styles.dot} ${isLive ? styles.dotLive : ''}`} />
              <span>{isLive ? 'Live' : statusText}</span>
            </div>
            <div className={styles.chip}>
              <span className={styles.mono}>{report.date}</span>
            </div>
            <div className={`${styles.badge} ${sentimentClass(overall)}`}>
              {overall.toUpperCase()}
            </div>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <h1 className={styles.heroTitle}>Market mood at a glance</h1>
            <p className={styles.heroDesc}>
              Aggregates crypto news headlines and scores sentiment. Use it as a quick pulse check,
              not a trading system.
            </p>

            <div className={styles.kpiGrid}>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Headlines</div>
                <div className={styles.kpiValueRow}>
                  <div className={styles.kpiValue}>{formatNumber(total)}</div>
                  <div className={`${styles.badge} ${sentimentClass(overall)}`}>
                    {overall.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Avg score</div>
                <div className={styles.kpiValueRow}>
                  <div className={styles.kpiValue}>{formatNumber(avgScore)}</div>
                  <div className={styles.mono}>comp {formatNumber(avgComparative)}</div>
                </div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Positive / Negative / Neutral</div>
                <div className={styles.kpiValueRow}>
                  <div className={styles.kpiValue}>
                    {formatNumber(stats.positive)} / {formatNumber(stats.negative)} /{' '}
                    {formatNumber(stats.neutral)}
                  </div>
                </div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Sources</div>
                <div className={styles.kpiValueRow}>
                  <div className={styles.kpiValue}>
                    {sourcesSucceeded.length ? sourcesSucceeded.length : '—'}
                  </div>
                  <div className={styles.mono}>
                    {sourcesSucceeded.length ? sourcesSucceeded.join(', ') : 'not reported'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.heroCard} ${styles.sideCard}`}>
            <h2 className={styles.sideTitle}>Make this live</h2>
            <div className={styles.sideBlock}>
              <div className={styles.mono}>npm run analyze:web</div>
              <div className={styles.subtitle} style={{ marginTop: 8 }}>
                Writes <code>web/public/reports/latest.json</code> for the dashboard.
              </div>
            </div>
            <div className={styles.sideBlock}>
              <div className={styles.mono}>cd web && npm run dev</div>
              <div className={styles.subtitle} style={{ marginTop: 8 }}>
                Dashboard tries <code>/reports/latest.json</code>, then falls back to sample data.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Sentiment distribution</h3>
              <p className={styles.cardHint}>counts by label</p>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={105}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Timeline</h3>
              <p className={styles.cardHint}>single snapshot</p>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.66)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.66)', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="positive" stroke={COLORS[0]} strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke={COLORS[1]} strokeWidth={2} />
                  <Line type="monotone" dataKey="neutral" stroke={COLORS[2]} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className={styles.card} style={{ marginTop: 18 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top headlines</h3>
            <p className={styles.cardHint}>first 20 items</p>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Sentiment</th>
                <th className={styles.th}>Score</th>
                <th className={styles.th}>Headline</th>
              </tr>
            </thead>
            <tbody>
              {topHeadlines.slice(0, 20).map((h, i) => (
                <tr className={styles.row} key={`${h.title}-${i}`}>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${sentimentClass(h.sentiment)}`}>
                      {String(h.sentiment || 'neutral').toUpperCase()}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>{formatNumber(h.score)}</td>
                  <td className={styles.td}>
                    <div className={styles.headline}>
                      <div className={styles.headlineTitle}>{h.title}</div>
                      <div className={styles.headlineMeta}>
                        <span>{h.source || 'unknown'}</span>
                        {h.url ? (
                          <a className={styles.link} href={h.url} target="_blank" rel="noreferrer">
                            open
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.footer}>
            Tip: run <code>npm run analyze:web</code> to update the live report file.
          </div>
        </section>
      </div>
    </div>
  );
}
