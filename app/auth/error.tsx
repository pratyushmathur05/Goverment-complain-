'use client';
import { useEffect } from 'react';
export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', padding:'2rem', textAlign:'center', flexDirection:'column', gap:'1rem' }}>
      <h2 style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>Failed to load login</h2>
      <button onClick={reset} style={{ padding:'0.65rem 1.5rem',
        background:'var(--accent-primary)', color:'white', border:'none',
        borderRadius:'999px', cursor:'pointer', fontWeight:600 }}>Retry</button>
    </div>
  );
}