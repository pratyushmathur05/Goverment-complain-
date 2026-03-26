'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1.25rem',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '1.75rem',
        }}
      >
        ⚠
      </div>

      {/* Text */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Dashboard failed to load
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          {error.message || 'Something went wrong while loading your dashboard. This is usually temporary.'}
        </p>
        {error.digest && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.65rem 1.5rem',
            background: 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 2px 12px var(--glow-blue)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          Try Again
        </button>
        <Link
          href="/civilian/report"
          style={{
            padding: '0.65rem 1.5rem',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          File a Complaint
        </Link>
        <Link
          href="/auth"
          style={{
            padding: '0.65rem 1.5rem',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Sign Out
        </Link>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}