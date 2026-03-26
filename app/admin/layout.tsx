'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { session, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not logged in or role is not admin, redirect to admin auth
    if (!isLoggedIn || session?.role !== 'admin') {
      router.replace('/auth/admin');
    }
  }, [isLoggedIn, session, router]);

  // Don't render sidebar/content if not authorized
  if (!isLoggedIn || session?.role !== 'admin') {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authenticating Authority...</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>
      <AdminSidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: 'var(--sidebar-width, 260px)',
        transition: 'margin-left 0.3s ease',
      }}>
        <main style={{
          flex: 1,
          padding: '2rem 2rem',
          maxWidth: 1300,
          width: '100%',
        }}>
          {children}
        </main>
      </div>

      {/* Responsive styles */}
      <style>{`
        :root { --sidebar-width: 260px; }
        @media (max-width: 900px) {
          :root { --sidebar-width: 0px; }
        }
      `}</style>
    </div>
  );
}