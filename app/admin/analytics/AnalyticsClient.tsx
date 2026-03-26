'use client';

import { PageHeader, StatCard } from '@/app/components/ui';
import type { AnalyticsData, DashboardStats } from '@/app/types';

// ── Simple bar chart ──────────────────────────────────────────────────────────
function BarChart({
  data, color, label,
}: {
  data: { label: string; count: number }[];
  color: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{label}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)',
              width: 90, flexShrink: 0, textAlign: 'right' }}>
              {d.label}
            </span>
            <div style={{ flex: 1, background: 'var(--bg-subtle)',
              borderRadius: 4, height: 20, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(d.count / max) * 100}%`,
                background: color,
                borderRadius: 4,
                transition: 'width 0.6s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 6,
              }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>
                  {d.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Monthly trend chart ───────────────────────────────────────────────────────
function TrendChart({ data }: { data: AnalyticsData['monthly'] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.submitted, d.resolved]), 1);
  const h = 120;
  const w = 500;
  const pad = 40;
  const barW = (w - pad * 2) / data.length;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
          color: 'var(--text-primary)' }}>Monthly Trend</h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-primary)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Submitted</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-green)', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Resolved</span>
          </span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const x = pad + i * barW;
          const subH = (d.submitted / maxVal) * h;
          const resH = (d.resolved / maxVal) * h;
          const bw = barW * 0.35;
          return (
            <g key={d.month}>
              {/* Submitted bar */}
              <rect x={x + barW * 0.05} y={h - subH} width={bw} height={subH}
                rx="2" fill="var(--accent-primary)" opacity="0.8" />
              {/* Resolved bar */}
              <rect x={x + barW * 0.05 + bw + 2} y={h - resH} width={bw} height={resH}
                rx="2" fill="var(--accent-green)" opacity="0.8" />
              {/* Month label */}
              <text x={x + barW / 2} y={h + 18}
                textAnchor="middle"
                style={{ fontSize: '0.65rem', fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                {d.month}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1={pad} y1={h} x2={w - pad} y2={h}
          stroke="var(--border)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ── Status donut ──────────────────────────────────────────────────────────────
function StatusDonut({ data }: { data: AnalyticsData['byStatus'] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 50; const cx = 70; const cy = 70;
  let offset = 0;

  const slices = data.map((d) => {
    const pct = d.count / total;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + r * Math.sin(offset);
    const y1 = cy - r * Math.cos(offset);
    offset += angle;
    const x2 = cx + r * Math.sin(offset);
    const y2 = cy - r * Math.cos(offset);
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, pct, x1, y1, x2, y2, large };
  });

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Status Distribution</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {slices.map((s, i) => (
            <path key={i}
              d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`}
              fill={s.color} opacity="0.85" />
          ))}
          {/* Inner circle */}
          <circle cx={cx} cy={cy} r="30" fill="var(--bg-card)" />
          <text x={cx} y={cy - 5} textAnchor="middle"
            style={{ fontSize: '1.1rem', fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle"
            style={{ fontSize: '0.55rem', fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            TOTAL
          </text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {data.map((d) => (
            <div key={d.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2,
                background: d.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>
                {d.status}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {d.count}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                {Math.round((d.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsClient({
  analytics, stats,
}: { analytics: AnalyticsData; stats: DashboardStats }) {
  return (
    <>
      <PageHeader title="Analytics & Reports"
        subtitle="Performance metrics and complaint resolution insights" />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Complaints" value={stats.total}
          icon={<span style={{ fontSize: '1.1rem' }}>📋</span>} color="var(--accent-primary)" />
        <StatCard label="Resolved" value={stats.resolved}
          icon={<span style={{ fontSize: '1.1rem' }}>✅</span>} color="var(--accent-green)"
          delta={`${Math.round((stats.resolved / stats.total) * 100)}% resolution rate`} />
        <StatCard label="Avg Resolution" value={`${analytics.avgResolutionDays}d`}
          icon={<span style={{ fontSize: '1.1rem' }}>⏱</span>} color="var(--accent-orange)" />
        <StatCard label="Open / Pending" value={stats.open + stats.inProgress}
          icon={<span style={{ fontSize: '1.1rem' }}>🔴</span>} color="#ef4444" />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: '1.25rem', marginBottom: '1.25rem' }}>
        <BarChart
          data={analytics.byCategory.map((d) => ({ label: d.category, count: d.count }))}
          color="var(--accent-primary)"
          label="Complaints by Category"
        />
        <StatusDonut data={analytics.byStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: '1.25rem' }}>
        <TrendChart data={analytics.monthly} />
        <BarChart
          data={analytics.byDepartment.map((d) => ({ label: d.department, count: d.count }))}
          color="var(--accent-orange)"
          label="Complaints by Department"
        />
      </div>
    </>
  );
}