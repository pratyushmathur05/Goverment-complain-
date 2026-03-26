'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { formatDate } from '@/app/lib/data';
import { StatCard, PageHeader, StatusBadge, PriorityBadge } from '@/app/components/ui';
import { useComplaints } from '@/app/hooks/useComplaints';

const STATUS_DOT: Record<string, string> = {
  open:        'var(--accent-orange)',
  in_progress: 'var(--accent-primary)',
  resolved:    'var(--accent-green)',
  archived:    '#64748b',
};

export default function CivilianDashboardClient() {
  const { session, isLoggedIn } = useAuth();
  const { complaints, isLoaded } = useComplaints();

  const civilian   = session?.role === 'civilian' ? session : null;
  const firstName  = civilian?.name?.split(' ')[0] ?? null;
  const userEmail  = civilian?.email ?? null;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Filter complaints for the logged-in user
  const userComplaints = useMemo(() => {
    return complaints
      .filter(c => {
        const isMatch = (session?.email && c.civilianId === session?.email) || 
                        (session?.name && c.civilianName === session?.name);
        return isMatch;
      })
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }, [complaints, session]);

  const stats = useMemo(() => {
    return {
      total: userComplaints.length,
      open: userComplaints.filter(c => c.status === 'open').length,
      inProgress: userComplaints.filter(c => c.status === 'in_progress').length,
      resolved: userComplaints.filter(c => c.status === 'resolved').length,
    };
  }, [userComplaints]);

  // If auth is loading or data is loading, show a brief spinner (AFTER hooks)
  if (!isLoaded || (isLoggedIn && !session)) {
    return (
      <div style={{ height: '60vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Synchronizing Portal...</div>
      </div>
    );
  }

  return (
    <>
      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(249,115,22,0.05) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
      }}>
        {/* Decorative blob */}
        <div aria-hidden style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '0.07em', textTransform: 'uppercase',
            marginBottom: '0.3rem',
          }}>
            {greeting}
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            margin: '0 0 0.3rem',
          }}>
            {firstName ? (
              <>
                {greeting},{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-orange))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {firstName}
                </span>
                {' '}👋
              </>
            ) : (
              'Welcome to Civic Portal'
            )}
          </h1>

          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontWeight: 300,
            margin: 0,
          }}>
            {userEmail
              ? <>Signed in as <strong style={{ fontWeight: 500 }}>{userEmail}</strong></>
              : 'Track all your civic complaints and resolutions'}
          </p>
        </div>

        <Link href="/civilian/report" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 16px var(--glow-blue)',
          position: 'relative',
          zIndex: 1,
        }}>
          + New Report
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="My Dashboard"
        subtitle="All your filed complaints in one place"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <StatCard
          label="Total Filed"
          value={stats.total}
          icon={<span style={{ fontSize: '1.1rem' }}>📋</span>}
          color="var(--accent-primary)"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={<span style={{ fontSize: '1.1rem' }}>🔴</span>}
          color="var(--accent-orange)"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<span style={{ fontSize: '1.1rem' }}>🔵</span>}
          color="var(--accent-primary)"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<span style={{ fontSize: '1.1rem' }}>✅</span>}
          color="var(--accent-green)"
        />
      </div>

      {/* ── Recent complaints ───────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        animation: 'fadeUp 0.45s 0.06s ease both',
      }}>
        {/* Card header */}
        <div style={{
          padding: '1.125rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Recent Complaints
            </h2>
            {civilian?.name && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Filed by you
              </p>
            )}
          </div>
          <Link href="/civilian/track" style={{
            fontSize: '0.8rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            View all →
          </Link>
        </div>

        {/* Empty state */}
        {userComplaints.length === 0 && (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📭</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No complaints yet.{' '}
              <Link href="/civilian/report" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                File your first report →
              </Link>
            </p>
          </div>
        )}

        {/* Complaint rows */}
        {userComplaints.slice(0, 5).map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: '0.9rem 1.5rem',
              borderBottom: i < Math.min(userComplaints.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
          >
            {/* Status dot */}
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              background: STATUS_DOT[c.status] ?? 'var(--border)',
            }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {c.description.slice(0, 50)}{c.description.length > 50 ? '...' : ''}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: 2,
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {c.id}
                </span>
                <span>·</span>
                <span>{c.categories.join(', ') || 'General'}</span>
                <span>·</span>
                <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                {Date.now() - Date.parse(c.timestamp) < 60000 && (
                  <span style={{ 
                    padding: '2px 6px', background: 'var(--accent-orange)', color: 'white', 
                    borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, animation: 'pulse 1.5s infinite' 
                  }}>
                    JUST NOW
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <PriorityBadge priority={c.severity.toLowerCase() as any} />
              <StatusBadge status={c.status as any} />
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA banner ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(249,115,22,0.05))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        animation: 'fadeUp 0.45s 0.12s ease both',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            margin: '0 0 4px',
          }}>
            Have a civic issue to report?
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Use the Command Center — file, categorise, and attach evidence in one place.
          </p>
        </div>
        <Link href="/civilian/report" style={{
          padding: '0.7rem 1.5rem',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-orange))',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          whiteSpace: 'nowrap',
          textDecoration: 'none',
        }}>
          Open Command Center →
        </Link>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 600px) {
          div[style*="padding: 1.75rem 2rem"],
          div[style*="padding: 1.5rem 2rem"] {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}