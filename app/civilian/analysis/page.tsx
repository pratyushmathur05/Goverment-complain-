import type { Metadata } from 'next';
import AnalysisClient from './AnalysisClient';

export const metadata: Metadata = {
  title: 'Intelligent Verification — Active Analysis',
  description: 'AI verification in progress for your civic complaint.',
};

export default function AnalysisPage() {
  return <AnalysisClient />;
}
