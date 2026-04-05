'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { ThemeToggle } from '@/app/components/ui';
import { validateEmail, validatePhone, maskAadhaar } from '@/app/lib/data';
import { useAuth, nameFromEmail } from '@/app/context/AuthContext';
import type { AuthTab } from '@/app/types';
import styles from './civilian.module.css';

type CivMethod = 'email' | 'aadhaar' | 'google';

export default function CivilianAuthClient() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { data: googleSession, status: googleStatus } = useSession();
  const [tab, setTab]       = useState<AuthTab>('login');
  const [method, setMethod] = useState<CivMethod>('email');
  const [googlePending, setGooglePending] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd,   setLoginPwd]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [remember,   setRemember]   = useState(false);

  // Signup
  const [suName,    setSuName]    = useState('');
  const [suEmail,   setSuEmail]   = useState('');
  const [suPhone,   setSuPhone]   = useState('');
  const [suPwd,     setSuPwd]     = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [showSuPwd, setShowSuPwd] = useState(false);

  // Aadhaar
  const [aadhaar,      setAadhaar]      = useState('');
  const [aadhaarOtp,   setAadhaarOtp]   = useState(Array(6).fill(''));
  const [aadhaarStep,  setAadhaarStep]  = useState<'input' | 'otp'>('input');
  const [aadhaarAgreed,setAadhaarAgreed]= useState(false);
  const aadhaarRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [countdown,setCountdown]= useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── Core: set session then navigate IMMEDIATELY (no setTimeout delay)
  const loginAs = useCallback((name: string, email: string, phone?: string) => {
    setSession({ role: 'civilian', name, email, phone });
    setSuccess(true);
    // Use replace so back-button doesn't return to login
    router.replace('/civilian/dashboard');
  }, [setSession, router]);

  const simulate = useCallback(async (fn: () => void) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    fn();
  }, []);

  // ── Sync NextAuth Google session into our AuthContext after OAuth redirect ──
  useEffect(() => {
    if (!googlePending) return;
    if (googleStatus === 'loading') return;
    if (googleStatus === 'authenticated' && googleSession?.user) {
      const { name, email } = googleSession.user;
      loginAs(
        name  ?? nameFromEmail(email ?? ''),
        email ?? 'google-user@civic.gov',
      );
      setGooglePending(false);
    }
  }, [googleStatus, googleSession, googlePending, loginAs]);

  const handleEmailLogin = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!validateEmail(loginEmail)) e.loginEmail = 'Enter a valid email address';
    if (loginPwd.length < 6)        e.loginPwd   = 'Minimum 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => loginAs(nameFromEmail(loginEmail), loginEmail));
  }, [loginEmail, loginPwd, simulate, loginAs]);

  const handleEmailSignup = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!suName.trim())            e.suName    = 'Full name is required';
    if (!validateEmail(suEmail))   e.suEmail   = 'Enter a valid email address';
    if (!validatePhone(suPhone))   e.suPhone   = 'Enter valid 10-digit mobile number';
    if (suPwd.length < 8)          e.suPwd     = 'Minimum 8 characters';
    if (suPwd !== suConfirm)       e.suConfirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => loginAs(suName.trim(), suEmail, suPhone));
  }, [suName, suEmail, suPhone, suPwd, suConfirm, simulate, loginAs]);

  // Kick off real Google OAuth — NextAuth handles the redirect/callback
  const handleGoogleLogin = useCallback(() => {
    setGooglePending(true);
    signIn('google', { callbackUrl: '/auth/civilian' });
  }, []);

  const handleAadhaarSend = useCallback(async () => {
    const raw = aadhaar.replace(/\s/g, '');
    if (raw.length !== 12)  { setErrors({ aadhaar: 'Enter valid 12-digit Aadhaar number' }); return; }
    if (!aadhaarAgreed)     { setErrors({ aadhaar: 'Please accept consent to proceed' }); return; }
    setErrors({});
    await simulate(() => {
      setAadhaarStep('otp');
      setCountdown(30);
      setTimeout(() => aadhaarRefs.current[0]?.focus(), 100);
    });
  }, [aadhaar, aadhaarAgreed, simulate]);

  const handleAadhaarVerify = useCallback(async () => {
    if (aadhaarOtp.join('').length < 6) { setErrors({ aadhaarOtp: 'Enter all 6 digits' }); return; }
    setErrors({});
    await simulate(() => loginAs('Aadhaar Verified User', 'aadhaar-user@civic.gov'));
  }, [aadhaarOtp, simulate, loginAs]);

  const otpChange = (i: number, v: string) => {
    const n = [...aadhaarOtp]; n[i] = v; setAadhaarOtp(n);
    if (v && i < 5) aadhaarRefs.current[i + 1]?.focus();
  };
  const otpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !aadhaarOtp[i] && i > 0)
      aadhaarRefs.current[i - 1]?.focus();
  };

  const resetState = (newTab: AuthTab) => {
    setTab(newTab);
    setErrors({});
    setMethod('email');
    setAadhaarStep('input');
    setAadhaarOtp(Array(6).fill(''));
  };

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <header className={styles.topbar}>
        <Link href="/auth" className={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>

        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandName}>Civilian Portal</span>
        </div>

        <ThemeToggle size="sm" />
      </header>

      <main className={styles.main}>
        <div className={styles.blobBlue} aria-hidden />

        {/* ── Success screen ── */}
        {success ? (
          <div className={styles.card}>
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Welcome to Civic Portal!</h2>
              <p className={styles.successText}>Redirecting to your dashboard…</p>
            </div>
          </div>
        ) : (
          <div className={styles.card}>

            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.roleChip}>🏙️ Civilian / Citizen</div>
              <h1 className={styles.cardTitle}>
                {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p className={styles.cardSubtitle}>
                {tab === 'login'
                  ? 'Report civic issues and track their resolution'
                  : 'Join thousands of citizens making their city better'}
              </p>
            </div>

            {/* Login / Signup tabs */}
            <div className={styles.tabRow}>
              <button
                className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
                onClick={() => resetState('login')}
              >
                Sign In
              </button>
              <button
                className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
                onClick={() => resetState('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* ══════════ LOGIN ══════════ */}
            {tab === 'login' && (
              <>
                {/* Method selector */}
                <div className={styles.methodRow}>
                  {(['email', 'aadhaar', 'google'] as CivMethod[]).map((m) => (
                    <button
                      key={m}
                      className={`${styles.methodBtn} ${method === m ? styles.methodBtnActive : ''}`}
                      onClick={() => {
                        setMethod(m);
                        setErrors({});
                        setAadhaarStep('input');
                        setAadhaarOtp(Array(6).fill(''));
                      }}
                    >
                      <span>{m === 'email' ? '✉️' : m === 'aadhaar' ? '🪪' : '🔵'}</span>
                      <span>{m === 'email' ? 'Email' : m === 'aadhaar' ? 'Aadhaar' : 'Google'}</span>
                    </button>
                  ))}
                </div>

                {/* ── Email ── */}
                {method === 'email' && (
                  <div className={styles.form}>
                    <div className={styles.field}>
                      <label className={styles.label}>Email Address</label>
                      <div className={`${styles.inputWrap} ${errors.loginEmail ? styles.inputError : ''}`}>
                        <EmailIcon />
                        <input
                          className={styles.input}
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => { setLoginEmail(e.target.value); setErrors({}); }}
                          disabled={loading}
                          autoComplete="email"
                        />
                      </div>
                      {errors.loginEmail && <span className={styles.errMsg}>{errors.loginEmail}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Password</label>
                      <div className={`${styles.inputWrap} ${errors.loginPwd ? styles.inputError : ''}`}>
                        <LockIcon />
                        <input
                          className={styles.input}
                          type={showPwd ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPwd}
                          onChange={(e) => { setLoginPwd(e.target.value); setErrors({}); }}
                          disabled={loading}
                          autoComplete="current-password"
                        />
                        <button type="button" className={styles.eyeBtn}
                          onClick={() => setShowPwd((p) => !p)}>
                          <EyeIcon open={showPwd} />
                        </button>
                      </div>
                      {errors.loginPwd && <span className={styles.errMsg}>{errors.loginPwd}</span>}
                    </div>

                    <div className={styles.rowBetween}>
                      <label className={styles.checkLabel}>
                        <input type="checkbox" checked={remember}
                          onChange={(e) => setRemember(e.target.checked)} />
                        Remember me
                      </label>
                      <button type="button" className={styles.forgotBtn}>
                        Forgot password?
                      </button>
                    </div>

                    <button
                      className={styles.submitBtn}
                      onClick={handleEmailLogin}
                      disabled={loading}
                    >
                      {loading ? <Spinner /> : 'Sign In'}
                    </button>

                    <div className={styles.divider}>or continue with</div>

                    <button className={styles.oauthBtn} onClick={handleGoogleLogin} disabled={loading}>
                      <GoogleIcon /> Continue with Google
                    </button>
                  </div>
                )}

                {/* ── Aadhaar ── */}
                {method === 'aadhaar' && (
                  <div className={styles.form}>
                    <div className={styles.steps}>
                      {['input', 'otp'].map((s, i) => (
                        <div key={s} className={`${styles.stepDot} ${
                          aadhaarStep === s
                            ? styles.stepActive
                            : i < ['input', 'otp'].indexOf(aadhaarStep)
                            ? styles.stepDone
                            : ''
                        }`} />
                      ))}
                      <span className={styles.stepLabel}>
                        Step {aadhaarStep === 'input' ? 1 : 2} of 2
                      </span>
                    </div>

                    {aadhaarStep === 'input' ? (
                      <>
                        <div className={styles.noteBox}>
                          🪪 Your Aadhaar number is used only for OTP verification. We do not store it.
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Aadhaar Number</label>
                          <div className={`${styles.inputWrap} ${errors.aadhaar ? styles.inputError : ''}`}>
                            <IdIcon />
                            <input
                              className={styles.input}
                              placeholder="XXXX XXXX XXXX"
                              value={aadhaar}
                              inputMode="numeric"
                              maxLength={14}
                              onChange={(e) => { setAadhaar(maskAadhaar(e.target.value)); setErrors({}); }}
                              disabled={loading}
                            />
                            {aadhaar.replace(/\s/g, '').length === 12 && (
                              <span style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>✓</span>
                            )}
                          </div>
                          {errors.aadhaar && <span className={styles.errMsg}>{errors.aadhaar}</span>}
                        </div>

                        <label className={styles.consentLabel}>
                          <input
                            type="checkbox"
                            checked={aadhaarAgreed}
                            onChange={(e) => { setAadhaarAgreed(e.target.checked); setErrors({}); }}
                          />
                          I consent to OTP-based verification via my Aadhaar-linked mobile as per UIDAI guidelines.
                        </label>

                        <button
                          className={styles.submitBtn}
                          onClick={handleAadhaarSend}
                          disabled={loading || aadhaar.replace(/\s/g, '').length !== 12 || !aadhaarAgreed}
                        >
                          {loading ? <Spinner /> : 'Send OTP'}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.otpHint}>OTP sent to your Aadhaar-linked mobile number</p>

                        <div className={styles.otpRow}>
                          {aadhaarOtp.map((d, i) => (
                            <input
                              key={i}
                              ref={(el) => { aadhaarRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              className={`${styles.otpBox} ${d ? styles.otpFilled : ''}`}
                              value={d}
                              onChange={(e) => otpChange(i, e.target.value.replace(/\D/, '').slice(-1))}
                              onKeyDown={(e) => otpKeyDown(i, e)}
                              disabled={loading}
                              aria-label={`OTP digit ${i + 1}`}
                            />
                          ))}
                        </div>

                        {errors.aadhaarOtp && (
                          <span className={styles.errMsg} style={{ textAlign: 'center' }}>
                            {errors.aadhaarOtp}
                          </span>
                        )}

                        <div className={styles.resendRow}>
                          <span>Didn&apos;t receive it?</span>
                          <button
                            className={styles.resendBtn}
                            onClick={() => simulate(() => setCountdown(30))}
                            disabled={countdown > 0 || loading}
                          >
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                          </button>
                        </div>

                        <button
                          className={styles.submitBtn}
                          onClick={handleAadhaarVerify}
                          disabled={loading || aadhaarOtp.join('').length < 6}
                        >
                          {loading ? <Spinner /> : 'Verify & Sign In'}
                        </button>

                        <button
                          className={styles.backLink}
                          onClick={() => { setAadhaarStep('input'); setAadhaarOtp(Array(6).fill('')); }}
                        >
                          ← Change Aadhaar number
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* ── Google ── */}
                {method === 'google' && (
                  <div className={styles.form}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
                      You&apos;ll be redirected to Google for secure sign-in.
                    </p>
                    <button
                      className={styles.oauthBtn}
                      style={{ height: 52, fontSize: '0.95rem', fontWeight: 700 }}
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      {loading ? <Spinner /> : <><GoogleIcon /> Continue with Google</>}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ══════════ SIGNUP ══════════ */}
            {tab === 'signup' && (
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <div className={`${styles.inputWrap} ${errors.suName ? styles.inputError : ''}`}>
                    <UserIcon />
                    <input
                      className={styles.input}
                      placeholder="Your full name"
                      value={suName}
                      onChange={(e) => { setSuName(e.target.value); setErrors({}); }}
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                  {errors.suName && <span className={styles.errMsg}>{errors.suName}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <div className={`${styles.inputWrap} ${errors.suEmail ? styles.inputError : ''}`}>
                    <EmailIcon />
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="you@example.com"
                      value={suEmail}
                      onChange={(e) => { setSuEmail(e.target.value); setErrors({}); }}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.suEmail && <span className={styles.errMsg}>{errors.suEmail}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number</label>
                  <div className={`${styles.inputWrap} ${errors.suPhone ? styles.inputError : ''}`}>
                    <span className={styles.prefix}>+91</span>
                    <span className={styles.prefixDivider} />
                    <input
                      className={styles.input}
                      placeholder="9876543210"
                      inputMode="numeric"
                      value={suPhone}
                      maxLength={10}
                      onChange={(e) => { setSuPhone(e.target.value.replace(/\D/, '')); setErrors({}); }}
                      disabled={loading}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.suPhone && <span className={styles.errMsg}>{errors.suPhone}</span>}
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <div className={`${styles.inputWrap} ${errors.suPwd ? styles.inputError : ''}`}>
                      <LockIcon />
                      <input
                        className={styles.input}
                        type={showSuPwd ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={suPwd}
                        onChange={(e) => { setSuPwd(e.target.value); setErrors({}); }}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowSuPwd((p) => !p)}>
                        <EyeIcon open={showSuPwd} />
                      </button>
                    </div>
                    {errors.suPwd && <span className={styles.errMsg}>{errors.suPwd}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Confirm Password</label>
                    <div className={`${styles.inputWrap} ${errors.suConfirm ? styles.inputError : ''}`}>
                      <LockIcon />
                      <input
                        className={styles.input}
                        type="password"
                        placeholder="Re-enter password"
                        value={suConfirm}
                        onChange={(e) => { setSuConfirm(e.target.value); setErrors({}); }}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>
                    {errors.suConfirm && <span className={styles.errMsg}>{errors.suConfirm}</span>}
                  </div>
                </div>

                <button
                  className={styles.submitBtn}
                  onClick={handleEmailSignup}
                  disabled={loading}
                >
                  {loading ? <Spinner /> : 'Create Account'}
                </button>

                <div className={styles.divider}>or</div>

                <button className={styles.oauthBtn} onClick={handleGoogleLogin} disabled={loading}>
                  {loading ? <Spinner /> : <><GoogleIcon /> Sign up with Google</>}
                </button>
              </div>
            )}

            {/* Switch tab prompt */}
            <p className={styles.switchPrompt}>
              {tab === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                className={styles.switchLink}
                onClick={() => resetState(tab === 'login' ? 'signup' : 'login')}
              >
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ic: React.CSSProperties = { flexShrink: 0, color: 'var(--text-muted)' };

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IdIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={ic}>
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <circle cx="9" cy="10" r="2"/>
    <path d="M15 8h2M15 12h2M7 16h10"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 512 512">
    <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" fill="#FBBB00"/>
    <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176z" fill="#518EF8"/>
    <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" fill="#28B446"/>
    <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" fill="#F14336"/>
  </svg>
);

const Spinner = () => (
  <span style={{
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }} />
);