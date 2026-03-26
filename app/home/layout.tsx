import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Home — AuthApp",
  description: "Your secure dashboard after login.",
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {children}
    </main>
  );
}