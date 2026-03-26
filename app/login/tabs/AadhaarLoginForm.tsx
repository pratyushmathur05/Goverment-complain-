"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../login.module.css";

type Step = "aadhaar" | "otp" | "success";
const OTP_LENGTH = 6;

function maskAadhaar(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function AadhaarLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("aadhaar");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const rawAadhaar = aadhaar.replace(/\s/g, "");

  const handleSendOtp = useCallback(async () => {
    if (rawAadhaar.length !== 12) {
      setError("Enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!agreed) {
      setError("Please accept the consent to proceed");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // TODO: Call UIDAI/DigiLocker OTP API
      await new Promise((res) => setTimeout(res, 1300));
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [rawAadhaar, agreed]);

  const handleOtpChange = useCallback(
    (i: number, val: string) => {
      const digit = val.replace(/\D/g, "").slice(-1);
      const next = [...otp];
      next[i] = digit;
      setOtp(next);
      if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    },
    [otp]
  );

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setError("Enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await new Promise((res) => setTimeout(res, 1300));
      setStep("success");
      setTimeout(() => router.push("/home"), 1300);
    } catch {
      setError("Verification failed. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  if (step === "success") {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.successTitle}>Aadhaar Verified!</p>
        <p className={styles.successText}>Identity confirmed. Redirecting…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Step dots */}
      <div className={styles.stepIndicator}>
        {(["aadhaar", "otp"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`${styles.stepDot} ${
              step === s
                ? styles.stepDotActive
                : i < (["aadhaar", "otp"] as Step[]).indexOf(step)
                ? styles.stepDotDone
                : ""
            }`}
          />
        ))}
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>
          Step {step === "aadhaar" ? 1 : 2} of 2
        </span>
      </div>

      {step === "aadhaar" && (
        <>
          {/* Info note */}
          <div className={styles.aadhaarNote}>
            🪪 Your Aadhaar number is used only for OTP-based identity verification. We do not store your Aadhaar data.
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="aadhaar-input" className={styles.label}>Aadhaar Number</label>
            <div className={styles.inputWrap} style={error && rawAadhaar.length > 0 ? { borderColor: "var(--error)" } : {}}>
              <span className={styles.inputIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <circle cx="9" cy="10" r="2"/>
                  <path d="M15 8h2M15 12h2M7 16h10"/>
                </svg>
              </span>
              <input
                id="aadhaar-input"
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="XXXX XXXX XXXX"
                value={aadhaar}
                maxLength={14}
                onChange={(e) => {
                  setAadhaar(maskAadhaar(e.target.value));
                  setError("");
                }}
                autoComplete="off"
              />
              {rawAadhaar.length === 12 && (
                <span style={{ color: "var(--success)", fontSize: "1rem", flexShrink: 0 }}>✓</span>
              )}
            </div>
            {error && <span className={styles.errorMsg}>{error}</span>}
          </div>

          {/* Consent */}
          <label className={styles.checkLabel} style={{ alignItems: "flex-start", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setError(""); }}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              I consent to the use of my Aadhaar number for OTP-based authentication as per UIDAI guidelines.
            </span>
          </label>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSendOtp}
            disabled={loading || rawAadhaar.length !== 12 || !agreed}
          >
            {loading ? <span className={styles.spinner} /> : "Send OTP to Registered Mobile"}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              OTP sent to your Aadhaar-linked mobile ending in{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                ●●●● {rawAadhaar.slice(-4)}
              </strong>
            </p>
          </div>

          <div className={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`${styles.otpInput} ${digit ? styles.otpFilled : ""}`}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digit && i > 0) {
                    inputRefs.current[i - 1]?.focus();
                  }
                }}
                aria-label={`OTP digit ${i + 1}`}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <span className={styles.errorMsg} role="alert" style={{ justifyContent: "center" }}>
              {error}
            </span>
          )}

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleVerify}
            disabled={loading || otp.join("").length < OTP_LENGTH}
          >
            {loading ? <span className={styles.spinner} /> : "Verify & Sign In"}
          </button>

          <button
            type="button"
            onClick={() => { setStep("aadhaar"); setOtp(Array(OTP_LENGTH).fill("")); setError(""); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              textAlign: "center",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            ← Change Aadhaar number
          </button>
        </>
      )}
    </div>
  );
}