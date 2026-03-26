import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', background:'var(--bg)',
      fontFamily:'var(--font-body)', textAlign:'center', padding:'2rem', gap:'1.5rem' }}>

      <div style={{ width:80, height:80, borderRadius:'50%',
        background:'linear-gradient(135deg,var(--accent-primary),var(--accent-orange))',
        display:'grid', placeItems:'center', fontSize:'2rem',
        boxShadow:'0 0 40px var(--glow-blue)' }}>🏛️</div>

      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'5rem', fontWeight:800,
          background:'linear-gradient(135deg,var(--accent-primary),var(--accent-orange))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', lineHeight:1, letterSpacing:'-3px' }}>404</h1>
        <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem', fontSize:'0.95rem' }}>
          This page doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link href="/auth" style={{ padding:'0.75rem 2rem',
        background:'linear-gradient(135deg,var(--accent-primary),var(--accent-orange))',
        color:'white', borderRadius:'999px', fontWeight:600, fontSize:'0.9rem',
        fontFamily:'var(--font-display)' }}>
        Back to Portal
      </Link>
    </div>
  );
}