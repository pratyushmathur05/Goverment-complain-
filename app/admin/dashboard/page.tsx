import type { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = { title: 'Admin Command Center' };

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}