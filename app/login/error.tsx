"use client";

import { useEffect } from "react";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LoginError]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "3rem 2rem",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(255,94,108,0.3)",
        maxWidth: "460px",
        width: "100%",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(255,94,108,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
        }}
      >
        ✕
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
          fontSize: "1.1rem",
          fontWeight: 700,
        }}
      >
        Login failed to load
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        {error.message || "Something went wrong loading the login page."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.65rem 1.75rem",
          background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
          color: "white",
          border: "none",
          borderRadius: "999px",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          marginTop: "0.5rem",
        }}
      >
        Retry
      </button>
    </div>
  );
}