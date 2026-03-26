import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Navbar from '@/app/components/shared/Navbar';

export const metadata: Metadata = {
  title: {
    default: 'Citizen Portal',
    template: '%s | Citizen Portal',
  },
};

export default function CivilianLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Navbar reads session from AuthContext — no hardcoded name */}
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