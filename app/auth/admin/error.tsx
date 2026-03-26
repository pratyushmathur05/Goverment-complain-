'use client';
import { useEffect } from 'react';
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontSize:'2.5rem' }}>⚠️</div>
      <h2 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.15rem', fontWeight:700 }}>
        Something went wrong
      </h2>
      <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', maxWidth:320 }}>
        {error.message || 'An unexpected error occurred in the admin panel.'}
      </p>
      <button onClick={reset} style={{
        padding:'0.65rem 1.5rem',
        background:'linear-gradient(135deg,var(--accent-orange),#ea580c)',
        color:'white', border:'none', borderRadius:'var(--radius-md)',
        fontWeight:600, fontSize:'0.875rem', cursor:'pointer',
      }}>
        Try Again
      </button>
    </div>
  );
}