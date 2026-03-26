'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html><body style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', background:'#0b1120',
      fontFamily:'Plus Jakarta Sans, sans-serif', textAlign:'center', padding:'2rem', gap:'1.5rem' }}>
      <div style={{ fontSize:'3rem' }}>⚠️</div>
      <h1 style={{ color:'#f0f6ff', fontSize:'1.5rem', fontWeight:700 }}>Something went wrong</h1>
      <p style={{ color:'#8ba3c0', fontSize:'0.9rem', maxWidth:340 }}>{error.message}</p>
      <button onClick={reset} style={{ padding:'0.75rem 2rem',
        background:'linear-gradient(135deg,#2563eb,#f97316)',
        color:'white', border:'none', borderRadius:'999px',
        fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}>Try Again</button>
    </body></html>
  );
}