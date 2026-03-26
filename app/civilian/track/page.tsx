import type { Metadata } from 'next';
import TrackClient from './TrackClient';

export const metadata: Metadata = { title: 'Track Complaints' };
export const dynamic = 'force-dynamic';

export default function TrackPage() {
  return <TrackClient />;
}