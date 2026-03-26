import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sign In — Civic Portal' };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}