import type { Metadata } from 'next';
import { MOCK_COMPLAINTS, MOCK_STATS } from '@/app/lib/data';
import CivilianDashboardClient from './CivilianDashboardClient';

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Track your civic complaints and their resolution status.',
};

// SSR — re-render on every request
// Production: replace with real DB call
// const complaints = await db.complaints.findMany({ where: { userId: session.user.id } })
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const complaints = MOCK_COMPLAINTS.slice(0, 5);
  const stats      = MOCK_STATS;

  return (
    <CivilianDashboardClient
      complaints={complaints}
      stats={stats}
    />
  );
}