import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

export const metadata: Metadata = {
  title: { default: 'Admin Panel', template: '%s | Admin — Civic Portal' },
  description: 'Authority admin panel for managing civic complaints.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
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