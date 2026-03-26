'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/app/components/ui';
import { useAuth, getInitials } from '@/app/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/complaints',
    label: 'Complaints',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    badge: 12,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

const BOTTOM_ITEMS = [
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // ── Real session — zero hardcoded strings ─────────────────────────────────
  const { session, clearSession } = useAuth();
  const adminSession   = session?.role === 'admin' ? session : null;
  const displayName    = adminSession?.name       ?? null;
  const displayEmpId   = adminSession?.employeeId ?? null;
  const displayDept    = adminSession?.department ?? null;
  const avatarInitials = displayName ? getInitials(displayName) : null;

  const handleSignOut = () => {
    clearSession();
    router.push('/auth');
  };

  const width = collapsed ? 72 : 260;

  return (
    <>
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}>

        {/* ── Brand / Logo ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          minHeight: 65,
          gap: '0.5rem',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent-orange), #ea580c)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 12px var(--glow-orange)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.9rem', color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                Civic Portal
              </div>
              <div style={{
                fontSize: '0.62rem', color: 'var(--accent-orange)',
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Admin Panel
              </div>
            </div>
          )}

          {/* Collapse / expand toggle */}
          {!collapsed ? (
            <button onClick={() => setCollapsed(true)} title="Collapse sidebar" style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', display: 'grid', placeItems: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <button onClick={() => setCollapsed(false)} title="Expand sidebar" style={{
              position: 'absolute', top: '1.25rem', right: -14,
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-muted)', display: 'grid', placeItems: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)', zIndex: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Department badge ── */}
        {!collapsed && (
          <div style={{
            margin: '0.875rem 1rem 0',
            padding: '0.6rem 0.875rem',
            background: adminSession ? 'var(--glow-orange)' : 'var(--bg-subtle)',
            border: `1px solid ${adminSession ? 'rgba(249,115,22,0.2)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            minHeight: 52,
          }}>
            <span style={{ fontSize: '1rem' }}>{adminSession ? '🏛️' : '🔒'}</span>
            <div>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: adminSession ? 'var(--accent-orange)' : 'var(--text-muted)',
                letterSpacing: '0.04em',
              }}>
                {displayDept
                  ? `${displayDept.toUpperCase()} DEPT`
                  : 'NOT SIGNED IN'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {displayEmpId ? `ID: ${displayEmpId}` : 'Authority Portal'}
              </div>
            </div>
          </div>
        )}

        {/* ── Nav links ── */}
        <nav style={{
          flex: 1, padding: '0.875rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto',
        }}>
          {!collapsed && (
            <p style={{
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '0 0.5rem', marginBottom: '0.375rem',
            }}>
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : '0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.7rem' : '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  background: active
                    ? 'linear-gradient(90deg,rgba(249,115,22,0.12),rgba(249,115,22,0.06))'
                    : 'transparent',
                  borderLeft: active ? '3px solid var(--accent-orange)' : '3px solid transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem', textDecoration: 'none',
                  transition: 'all 0.15s', position: 'relative', whiteSpace: 'nowrap',
                }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge !== undefined && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    background: active ? 'var(--accent-orange)' : 'var(--border-strong)',
                    color: active ? 'white' : 'var(--text-secondary)',
                    padding: '1px 7px', borderRadius: '999px', minWidth: 22, textAlign: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent-orange)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom: settings + theme ── */}
        <div style={{
          padding: '0.75rem', borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : '0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.7rem' : '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  background: active ? 'var(--glow-orange)' : 'transparent',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0.5rem 0' : '0.5rem 0.75rem',
            marginTop: '0.25rem',
          }}>
            {!collapsed && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Appearance
              </span>
            )}
            <ThemeToggle size="sm" />
          </div>
        </div>

        {/* ── User profile — 100% from AuthContext ── */}
        <div style={{
          padding: '0.875rem 0.75rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : '0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: adminSession
              ? 'linear-gradient(135deg, var(--accent-orange), #ea580c)'
              : 'var(--bg-subtle)',
            border: adminSession ? 'none' : '1.5px dashed var(--border-strong)',
            display: 'grid', placeItems: 'center',
            fontSize: '0.8rem', fontWeight: 700,
            color: adminSession ? 'white' : 'var(--text-muted)',
            transition: 'all 0.3s',
          }}>
            {adminSession && avatarInitials ? avatarInitials : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: adminSession ? 600 : 400,
                  color: adminSession ? 'var(--text-primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {/* Only show name AFTER login — never a placeholder */}
                  {adminSession ? displayName : 'Not signed in'}
                </div>
                <div style={{
                  fontSize: '0.68rem', color: 'var(--text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: 1,
                }}>
                  {adminSession
                    ? [displayEmpId, displayDept].filter(Boolean).join(' · ')
                    : 'Sign in to access panel'}
                </div>
              </div>

              {/* Sign out — only when logged in */}
              {adminSession ? (
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  style={{
                    width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', display: 'grid', placeItems: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              ) : (
                /* Sign in shortcut — only when NOT logged in */
                <Link href="/auth/admin" title="Sign in" style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent-orange)',
                  background: 'var(--glow-orange)',
                  color: 'var(--accent-orange)',
                  display: 'grid', placeItems: 'center',
                  flexShrink: 0, textDecoration: 'none', transition: 'all 0.15s',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </Link>
              )}
            </>
          )}
        </div>
      </aside>

      <style>{`
        :root { --sidebar-width: ${width}px; }
        @media (max-width: 900px) {
          aside { transform: translateX(-100%); }
          :root { --sidebar-width: 0px; }
        }
      `}</style>
    </>
  );
}