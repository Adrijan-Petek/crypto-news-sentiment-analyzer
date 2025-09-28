import React from 'react';
import sample from '../../sample_reports/report-sample.json';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Home() {
  const stats = sample.stats || { positive:0, negative:0, neutral:0 };
  const pieData = [
    { name: 'Positive', value: stats.positive || 0 },
    { name: 'Negative', value: stats.negative || 0 },
    { name: 'Neutral', value: stats.neutral || 0 }
  ];
  const timeline = [{ date: sample.date, positive: stats.positive, negative: stats.negative, neutral: stats.neutral }];
  const COLORS = ['#2ca02c', '#d62728', '#999999'];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h1>Crypto News Sentiment — Sample Report</h1>
      <p><strong>Date:</strong> {sample.date} — <strong>Overall:</strong> {sample.overall_sentiment}</p>
      <div style={{ display:'flex', gap:40, alignItems:'center' }}>
        <div>
          <h3>Sentiment Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div>
          <h3>Timeline (last snapshot)</h3>
          <LineChart width={500} height={300} data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="positive" stroke="#2ca02c" />
            <Line type="monotone" dataKey="negative" stroke="#d62728" />
            <Line type="monotone" dataKey="neutral" stroke="#999999" />
          </LineChart>
        </div>
      </div>
      <h3>Top headlines</h3>
      <ul>
        {sample.top_headlines.map((h, i) => (
          <li key={i}><strong>{h.sentiment.toUpperCase()}</strong> — {h.title} <em>({h.source})</em></li>
        ))}
      </ul>
      <p style={{ marginTop:40, color:'#666' }}>Deploy `/web` to Vercel for a live dashboard. The frontend reads `sample_reports/report-sample.json` — update with real reports produced by the backend.</p>
    </div>
  );
}
