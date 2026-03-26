import type { Metadata } from 'next';
import ReportCommandCenter from './ReportCommandCenter';

export const metadata: Metadata = {
  title: 'New Report — Command Center',
  description: 'File a civic complaint with evidence, category tags, and a detailed description.',
};

// Static — no server data needed; all state is client-side
export const dynamic = 'force-static';

export default function ReportPage() {
  return <ReportCommandCenter />;
}