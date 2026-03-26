'use client';

import { useTheme } from '@/app/context/ThemeContext';
import type { ComplaintStatus, ComplaintPriority } from '@/app/types';
import { getStatusColor, getStatusBg, getPriorityColor } from '@/app/lib/data';

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { theme, toggleTheme } = useTheme();
  const s = size === 'sm' ? 34 : 40;

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        width: s, height: s,
        borderRadius: '50%',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        display: 'grid', placeItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0,
      }}
    >
      {theme === 'light' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size, height: size,
        border: `2px solid rgba(255,255,255,0.25)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const label: Record<ComplaintStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem', fontWeight: 600,
      color: getStatusColor(status),
      background: getStatusBg(status),
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(status) }} />
      {label[status]}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const color = getPriorityColor(priority);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: '0.7rem', fontWeight: 600,
      color, background: `${color}18`,
      textTransform: 'capitalize',
    }}>
      {priority}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label, value, icon, color, delta,
}: {
  label: string; value: number | string; icon: React.ReactNode;
  color: string; delta?: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        borderRadius: '0 0 0 80px', background: `${color}10`, pointerEvents: 'none' }} />
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: `${color}18`, display: 'grid', placeItems: 'center', color,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)', lineHeight: 1 }}>{value.toLocaleString()}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      </div>
      {delta && (
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>{delta}</div>
      )}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>{children}</div>}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700,
        color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 320 }}>{description}</p>
      {action}
    </div>
  );
}