import type { Metadata } from 'next';
import AdminAuthClient from './AdminAuthClient';

export const metadata: Metadata = {
  title: 'Authority Sign In',
  description: 'Login or register as an Authority/Admin on the Civic Complaint Portal.',
};

export const dynamic = 'force-static';

export default function AdminAuthPage() {
  return <AdminAuthClient />;
}