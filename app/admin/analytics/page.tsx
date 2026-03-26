import type { Metadata } from 'next';
import { MOCK_ANALYTICS, MOCK_STATS } from '@/app/lib/data';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = { title: 'Analytics & Reports' };
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  return <AnalyticsClient analytics={MOCK_ANALYTICS} stats={MOCK_STATS} />;
}