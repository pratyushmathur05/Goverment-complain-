import { Suspense } from "react";
import type { Metadata } from "next";
import LoginContainer from "./LoginContainer";

export const metadata: Metadata = {
  title: "Login",
};

// Static generation — login page has no dynamic server data
export const dynamic = "force-static";

function LoginSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "460px",
        padding: "2.5rem",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
      }}
    >
      {[80, 50, 50, 50].map((h, i) => (
        <div
          key={i}
          style={{
            height: `${h}px`,
            borderRadius: "var(--radius-md)",
            background:
              "linear-gradient(90deg, #1a1a26 0%, #22223a 50%, #1a1a26 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContainer />
    </Suspense>
  );
}