"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import styles from "../login.module.css";

type OtpMethod = "phone" | "email";
type Step = "input" | "otp" | "success";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OTPLoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<OtpMethod>("phone");
  const [step, setStep] = useState<Step>("input");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const validateInput = (): boolean => {
    if (method === "phone") {
      if (!/^[6-9]\d{9}$/.test(value)) {
        setError("Enter a valid 10-digit Indian mobile number");
        return false;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError("Enter a valid email address");
        return false;
      }
    }
    return true;
  };

  const handleSendOtp = useCallback(async () => {
    setError("");
    if (!validateInput()) return;
    setLoading(true);
    try {
      // TODO: Call your OTP send API here
      await new Promise((res) => setTimeout(res, 1200));
      setStep("otp");
      setCountdown(RESEND_SECONDS);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [value, method]);

  const handleOtpChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(-1);
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (val && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      const newOtp = [...Array(OTP_LENGTH).fill("")];
      pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
      setOtp(newOtp);
      const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
      inputRefs.current[nextEmpty]?.focus();
    },
    []
  );

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // TODO: Call your OTP verify API here
      await new Promise((res) => setTimeout(res, 1200));
      setStep("success");
      setTimeout(() => router.push("/home"), 1300);
    } catch {
      setError("Incorrect OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    try {
      await new Promise((res) => setTimeout(res, 800));
      setCountdown(RESEND_SECONDS);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setError("Could not resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }, [countdown]);

  if (step === "success") {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.successTitle}>Verified!</p>
        <p className={styles.successText}>Redirecting you now…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        {["input", "otp"].map((s, i) => (
          <div
            key={s}
            className={`${styles.stepDot} ${
              step === s
                ? styles.stepDotActive
                : i < ["input", "otp"].indexOf(step)
                ? styles.stepDotDone
                : ""
            }`}
          />
        ))}
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>
          Step {step === "input" ? 1 : 2} of 2
        </span>
      </div>

      {step === "input" && (
        <>
          {/* Method toggle */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "var(--bg)",
              borderRadius: "var(--radius-md)",
              padding: "3px",
              border: "1px solid var(--border)",
            }}
          >
            {(["phone", "email"] as OtpMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMethod(m); setValue(""); setError(""); }}
                style={{
                  padding: "0.55rem",
                  border: "none",
                  borderRadius: "10px",
                  background: method === m ? "var(--bg-card)" : "transparent",
                  color: method === m ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "0.82rem",
                  fontWeight: method === m ? 600 : 400,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: method === m ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {m === "phone" ? "📱 Phone" : "✉️ Email"}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className={styles.formGroup}>
            <label htmlFor="otp-input" className={styles.label}>
              {method === "phone" ? "Mobile Number" : "Email Address"}
            </label>
            <div className={styles.inputWrap} style={error ? { borderColor: "var(--error)" } : {}}>
              {method === "phone" ? (
                <>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>+91</span>
                  <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 4px" }} />
                </>
              ) : (
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
              )}
              <input
                id="otp-input"
                type={method === "phone" ? "tel" : "email"}
                className={styles.input}
                placeholder={method === "phone" ? "9876543210" : "you@example.com"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                maxLength={method === "phone" ? 10 : undefined}
                autoComplete={method === "phone" ? "tel" : "email"}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
            </div>
            {error && <span className={styles.errorMsg}>{error}</span>}
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSendOtp}
            disabled={loading || !value}
          >
            {loading ? <span className={styles.spinner} /> : "Send OTP"}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              OTP sent to{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {method === "phone" ? `+91 ${value}` : value}
              </strong>
            </p>
          </div>

          {/* OTP boxes */}
          <div className={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                className={`${styles.otpInput} ${digit ? styles.otpFilled : ""}`}
                value={digit}
                onChange={(e) => handleOtpChange(i, e)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
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

          {/* Resend */}
          <div className={styles.resendRow}>
            <span>Didn&apos;t receive it?</span>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={countdown > 0 || loading}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>

          {/* Verify */}
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleVerify}
            disabled={loading || otp.join("").length < OTP_LENGTH}
          >
            {loading ? <span className={styles.spinner} /> : "Verify OTP"}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => { setStep("input"); setOtp(Array(OTP_LENGTH).fill("")); setError(""); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              textAlign: "center",
              marginTop: "-0.25rem",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            ← Change number
          </button>
        </>
      )}
    </div>
  );
}