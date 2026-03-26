import type { Metadata } from 'next';
import { MOCK_COMPLAINTS } from '@/app/lib/data';
import AdminComplaintsClient from './AdminComplaintsClient';

export const metadata: Metadata = { title: 'Manage Complaints' };
export const dynamic = 'force-dynamic';

export default async function AdminComplaintsPage() {
  return <AdminComplaintsClient />;
}