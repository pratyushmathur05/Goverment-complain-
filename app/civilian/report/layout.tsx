import type { ReactNode } from 'react';

// ReportCommandCenter has its own full-page sidebar built in
// so we intentionally skip the shared Navbar/CivilianLayout wrapper here
export default function ReportLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}