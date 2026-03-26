import type { Metadata } from 'next';
import LandingPage from './LandingPage';

export const metadata: Metadata = {
  title: 'Welcome — Choose Your Portal',
  description: 'Sign in as a Civilian or Authority on the Civic Complaint Portal.',
};

export const dynamic = 'force-static';

export default function AuthPage() {
  return <LandingPage />;
}