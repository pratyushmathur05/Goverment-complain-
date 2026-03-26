'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/shared/Navbar';

export default function CivilianLayout({ children }: { children: ReactNode }) {
  const { session, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not logged in or role is not civilian, redirect to auth
    // (We might want to allow /civilian/report to be public if needed, 
    // but the current user flow pushes to /auth/civilian first)
    if (!isLoggedIn || session?.role !== 'civilian') {
      router.replace('/auth/civilian');
    }
  }, [isLoggedIn, session, router]);

  // Handle loading/unauthorized state gracefully
  if (!isLoggedIn || session?.role !== 'civilian') {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verifying Citizen Session...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar role="civilian" />
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '2rem 1.5rem',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </main>
    </>
  );
}