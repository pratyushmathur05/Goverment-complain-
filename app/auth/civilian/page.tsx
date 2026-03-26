import type { Metadata } from 'next';
import CivilianAuthClient from './CivilianAuthClient';

export const metadata: Metadata = {
  title: 'Civilian Sign In',
  description: 'Login or register as a Civilian on the Civic Complaint Portal.',
};

export const dynamic = 'force-static';

export default function CivilianAuthPage() {
  return <CivilianAuthClient />;
}