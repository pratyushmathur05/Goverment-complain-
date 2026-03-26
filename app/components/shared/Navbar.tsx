'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/app/components/ui';
import { useAuth } from '@/app/context/AuthContext';

interface NavbarProps {
  role?: 'civilian' | 'admin';
  userName?: string;
}

export default function Navbar({ role: propsRole, userName: propsName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Use props if provided, otherwise fallback to global session
  const role = propsRole || (session?.role === 'civilian' ? 'civilian' : undefined);
  const userName = propsName || session?.name;

  const handleSignOut = () => {
    clearSession();
    router.push('/auth');
  };

  const civilianLinks = [
    { href: '/civilian/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/civilian/submit', label: 'File Complaint', icon: '+' },
    { href: '/civilian/track', label: 'Track', icon: '◎' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/admin/analytics', label: 'Analytics', icon: '↗' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'civilian' ? civilianLinks : [];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 1.5rem',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link href={role ? `/${role}/dashboard` : '/auth'} style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-orange))',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 12px var(--glow-blue)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Civic Portal
            </div>
            {role && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {role === 'admin' ? 'Authority Panel' : 'Citizen Portal'}
              </div>
            )}
          </div>
        </Link>

        {/* Nav links — desktop */}
        {links.length > 0 && (
          <div style={{ display: 'flex', gap: '0.25rem' }} className="nav-links-desktop">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--glow-blue)' : 'transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle size="sm" />

          {userName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-orange))',
                display: 'grid', placeItems: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'white',
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)',
                display: 'none' }} className="username-desktop">
                {userName}
              </span>
            </div>
          )}

          {role && (
            <button
              onClick={handleSignOut}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .username-desktop { display: none !important; }
        }
        @media (min-width: 640px) {
          .username-desktop { display: inline !important; }
        }
      `}</style>
    </nav>
  );
}