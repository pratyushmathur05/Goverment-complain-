import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: '404 — Not Found' };

export default function AdminNotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '1.25rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
        color: 'var(--text-primary)' }}>Page not found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 320 }}>
        The admin page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/admin/dashboard" style={{
        padding: '0.65rem 1.5rem',
        background: 'linear-gradient(135deg,var(--accent-orange),#ea580c)',
        color: 'white', borderRadius: 'var(--radius-md)',
        fontWeight: 600, fontSize: '0.875rem',
        fontFamily: 'var(--font-display)', textDecoration: 'none',
      }}>
        Back to Dashboard
      </Link>
    </div>
  );
}