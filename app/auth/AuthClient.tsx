'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/app/components/ui';
import { validateEmail, validatePhone, maskAadhaar, DEPARTMENTS } from '@/app/lib/data';
import type { AuthTab, Department } from '@/app/types';
import styles from './auth.module.css';

// ─── Shared input components ──────────────────────────────────────────────────
function InputField({
  id, label, type = 'text', placeholder, value, onChange,
  icon, error, disabled, maxLength, inputMode, orange,
  rightElement, prefix,
}: {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; icon?: React.ReactNode;
  error?: string; disabled?: boolean; maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  orange?: boolean; rightElement?: React.ReactNode; prefix?: React.ReactNode;
}) {
  const wrapCls = [
    styles.inputWrap,
    error ? styles.inputWrapError : '',
    orange ? styles.inputWrapOrange : '',
  ].join(' ');

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={wrapCls}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {prefix}
        <input id={id} type={type} className={styles.input}
          placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled} maxLength={maxLength}
          inputMode={inputMode} autoComplete="off" />
        {rightElement}
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options, icon, error, orange }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: string[];
  icon?: React.ReactNode; error?: string; orange?: boolean;
}) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={`${styles.inputWrap} ${error ? styles.inputWrapError : ''} ${orange ? styles.inputWrapOrange : ''}`}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <select id={id} className={styles.select} value={value}
          onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

// ─── Lock / eye icons ─────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IdIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/>
  </svg>
);

// ─── OTP boxes ────────────────────────────────────────────────────────────────
function OtpBoxes({ otp, onChange, onKeyDown, refs, loading, orange }: {
  otp: string[]; onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent) => void;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean; orange?: boolean;
}) {
  return (
    <div className={styles.otpRow}>
      {otp.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          className={`${styles.otpBox} ${d ? styles.otpBoxFilled : ''}`}
          style={orange && d ? { borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' } : {}}
          value={d}
          onChange={(e) => onChange(i, e.target.value.replace(/\D/, '').slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          disabled={loading} aria-label={`OTP digit ${i + 1}`} />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CIVILIAN PANEL
// ═════════════════════════════════════════════════════════════════════════════

type CivMethod = 'email' | 'aadhaar' | 'google';

function CivilianPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>('login');
  const [method, setMethod] = useState<CivMethod>('email');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPwd, setSignupPwd] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  // Aadhaar state
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState(Array(6).fill(''));
  const [aadhaarStep, setAadhaarStep] = useState<'input' | 'otp'>('input');
  const [aadhaarAgreed, setAadhaarAgreed] = useState(false);
  const aadhaarRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const simulate = useCallback(async (fn?: () => void) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setLoading(false);
    fn?.();
  }, []);

  const handleEmailLogin = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!validateEmail(loginEmail)) e.loginEmail = 'Enter a valid email';
    if (loginPwd.length < 6) e.loginPwd = 'Minimum 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => { setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200); });
  }, [loginEmail, loginPwd, simulate, router]);

  const handleEmailSignup = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!signupName.trim()) e.signupName = 'Name is required';
    if (!validateEmail(signupEmail)) e.signupEmail = 'Enter a valid email';
    if (!validatePhone(signupPhone)) e.signupPhone = 'Enter valid 10-digit number';
    if (signupPwd.length < 8) e.signupPwd = 'Minimum 8 characters';
    if (signupPwd !== signupConfirm) e.signupConfirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => { setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200); });
  }, [signupName, signupEmail, signupPhone, signupPwd, signupConfirm, simulate, router]);

  const handleAadhaarSend = useCallback(async () => {
    const raw = aadhaar.replace(/\s/g, '');
    if (raw.length !== 12) { setErrors({ aadhaar: 'Enter valid 12-digit Aadhaar' }); return; }
    if (!aadhaarAgreed) { setErrors({ aadhaar: 'Please accept the consent' }); return; }
    setErrors({});
    await simulate(() => { setAadhaarStep('otp'); setCountdown(30); setTimeout(() => aadhaarRefs.current[0]?.focus(), 100); });
  }, [aadhaar, aadhaarAgreed, simulate]);

  const handleAadhaarVerify = useCallback(async () => {
    if (aadhaarOtp.join('').length < 6) { setErrors({ aadhaarOtp: 'Enter all 6 digits' }); return; }
    setErrors({});
    await simulate(() => { setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200); });
  }, [aadhaarOtp, simulate, router]);

  const otpChange = (i: number, v: string) => {
    const n = [...aadhaarOtp]; n[i] = v; setAadhaarOtp(n);
    if (v && i < 5) aadhaarRefs.current[i + 1]?.focus();
  };
  const otpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !aadhaarOtp[i] && i > 0) aadhaarRefs.current[i - 1]?.focus();
  };

  if (success) return (
    <div className={styles.successBox}>
      <div className={styles.successIcon}>✓</div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
        Welcome to Civic Portal!
      </p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Redirecting to your dashboard…</p>
    </div>
  );

  return (
    <>
      {/* Role chip */}
      <div className={styles.panelHeader}>
        <div className={`${styles.roleChip} ${styles.chipCivilian}`}>
          🏙️ Civilian / Citizen
        </div>
        <h2 className={styles.panelTitle}>
          {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className={styles.panelSubtitle}>
          {tab === 'login'
            ? 'Report civic issues and track resolution'
            : 'Join thousands of citizens making their city better'}
        </p>
      </div>

      {/* Login / Signup tabs */}
      <div className={styles.tabRow}>
        <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
          onClick={() => { setTab('login'); setErrors({}); setSuccess(false); }}>
          Sign In
        </button>
        <button className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
          onClick={() => { setTab('signup'); setErrors({}); setSuccess(false); }}>
          Sign Up
        </button>
      </div>

      {/* ── LOGIN ── */}
      {tab === 'login' && (
        <>
          {/* Method selector */}
          <div className={styles.methodRow}>
            {(['email', 'aadhaar', 'google'] as CivMethod[]).map((m) => (
              <button key={m} className={`${styles.methodBtn} ${method === m ? styles.methodBtnActive : ''}`}
                onClick={() => { setMethod(m); setErrors({}); setAadhaarStep('input'); }}>
                <span>{m === 'email' ? '✉️' : m === 'aadhaar' ? '🪪' : '🔵'}</span>
                <span>{m === 'email' ? 'Email' : m === 'aadhaar' ? 'Aadhaar' : 'Google'}</span>
              </button>
            ))}
          </div>

          {method === 'email' && (
            <>
              <InputField id="civ-email" label="Email Address" type="email" placeholder="you@example.com"
                value={loginEmail} onChange={(v) => { setLoginEmail(v); setErrors({}); }}
                icon={<EmailIcon />} error={errors.loginEmail} disabled={loading} />
              <InputField id="civ-pwd" label="Password" type={showPwd ? 'text' : 'password'}
                placeholder="Enter password" value={loginPwd}
                onChange={(v) => { setLoginPwd(v); setErrors({}); }}
                icon={<LockIcon />} error={errors.loginPwd} disabled={loading}
                rightElement={
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowPwd((p) => !p)}>
                    <EyeIcon open={showPwd} />
                  </button>
                } />
              <div className={styles.row}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" className={styles.forgotBtn}>Forgot password?</button>
              </div>
              <button className={styles.submitBtnBlue} onClick={handleEmailLogin} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Sign In'}
              </button>
              <div className={styles.divider}>or continue with</div>
              <button className={styles.oauthBtn} onClick={() => simulate(() => {
                setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200);
              })}>
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" fill="#FBBB00"/>
                  <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176z" fill="#518EF8"/>
                  <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" fill="#28B446"/>
                  <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" fill="#F14336"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {method === 'aadhaar' && (
            <>
              <div className={styles.steps}>
                {['input','otp'].map((s, i) => (
                  <div key={s} className={`${styles.stepDot} ${aadhaarStep === s ? styles.stepActive : i < ['input','otp'].indexOf(aadhaarStep) ? styles.stepDone : ''}`} />
                ))}
                <span className={styles.stepLabel}>Step {aadhaarStep === 'input' ? 1 : 2} of 2</span>
              </div>
              {aadhaarStep === 'input' ? (
                <>
                  <div className={styles.noteBox}>🪪 Only used for OTP verification. Aadhaar data is not stored.</div>
                  <InputField id="aadhaar" label="Aadhaar Number" placeholder="XXXX XXXX XXXX"
                    value={aadhaar} onChange={(v) => { setAadhaar(maskAadhaar(v)); setErrors({}); }}
                    icon={<IdIcon />} error={errors.aadhaar} disabled={loading} maxLength={14}
                    inputMode="numeric"
                    rightElement={aadhaar.replace(/\s/g,'').length === 12
                      ? <span style={{ color:'var(--accent-green)', fontSize:'1rem' }}>✓</span>
                      : undefined} />
                  <label className={styles.checkLabel} style={{ alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.875rem' }}>
                    <input type="checkbox" checked={aadhaarAgreed}
                      onChange={(e) => { setAadhaarAgreed(e.target.checked); setErrors({}); }}
                      style={{ marginTop:2, flexShrink:0 }} />
                    <span style={{ fontSize:'0.74rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                      I consent to OTP-based verification via my Aadhaar-linked mobile as per UIDAI guidelines.
                    </span>
                  </label>
                  <button className={styles.submitBtnBlue} onClick={handleAadhaarSend}
                    disabled={loading || aadhaar.replace(/\s/g,'').length !== 12 || !aadhaarAgreed}>
                    {loading ? <span className={styles.spinner} /> : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:'0.875rem', textAlign:'center' }}>
                    OTP sent to Aadhaar-linked mobile
                  </p>
                  <OtpBoxes otp={aadhaarOtp} onChange={otpChange} onKeyDown={otpKeyDown}
                    refs={aadhaarRefs} loading={loading} />
                  {errors.aadhaarOtp && <p className={styles.errorMsg} style={{ justifyContent:'center' }}>{errors.aadhaarOtp}</p>}
                  <div className={styles.row} style={{ justifyContent:'center', margin:'0.5rem 0 0.875rem' }}>
                    <button className={styles.forgotBtn} onClick={() => {
                      if (countdown > 0) return;
                      simulate(() => { setCountdown(30); });
                    }} disabled={countdown > 0}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <button className={styles.submitBtnBlue} onClick={handleAadhaarVerify}
                    disabled={loading || aadhaarOtp.join('').length < 6}>
                    {loading ? <span className={styles.spinner} /> : 'Verify & Sign In'}
                  </button>
                  <button onClick={() => { setAadhaarStep('input'); setAadhaarOtp(Array(6).fill('')); }}
                    style={{ background:'none', border:'none', color:'var(--text-muted)',
                      fontSize:'0.75rem', cursor:'pointer', marginTop:'0.5rem',
                      fontFamily:'var(--font-body)', textDecoration:'underline' }}>
                    ← Change Aadhaar number
                  </button>
                </>
              )}
            </>
          )}

          {method === 'google' && (
            <>
              <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem', textAlign:'center' }}>
                You&apos;ll be redirected to Google for secure authentication.
              </p>
              <button className={styles.oauthBtn} style={{ height:52, fontSize:'0.9rem', fontWeight:600 }}
                onClick={() => simulate(() => { setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200); })}>
                <svg width="20" height="20" viewBox="0 0 512 512">
                  <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" fill="#FBBB00"/>
                  <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176z" fill="#518EF8"/>
                  <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" fill="#28B446"/>
                  <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" fill="#F14336"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </>
      )}

      {/* ── SIGNUP ── */}
      {tab === 'signup' && (
        <>
          <InputField id="su-name" label="Full Name" placeholder="Your full name"
            value={signupName} onChange={(v) => { setSignupName(v); setErrors({}); }}
            icon={<UserIcon />} error={errors.signupName} disabled={loading} />
          <InputField id="su-email" label="Email Address" type="email" placeholder="you@example.com"
            value={signupEmail} onChange={(v) => { setSignupEmail(v); setErrors({}); }}
            icon={<EmailIcon />} error={errors.signupEmail} disabled={loading} />
          <InputField id="su-phone" label="Mobile Number" placeholder="9876543210"
            value={signupPhone} onChange={(v) => { setSignupPhone(v.replace(/\D/,'').slice(0,10)); setErrors({}); }}
            icon={<PhoneIcon />} error={errors.signupPhone} disabled={loading}
            inputMode="numeric"
            prefix={<span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, marginRight:4, flexShrink:0 }}>+91</span>} />
          <InputField id="su-pwd" label="Password" type={showSignupPwd ? 'text' : 'password'}
            placeholder="Min 8 characters" value={signupPwd}
            onChange={(v) => { setSignupPwd(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.signupPwd} disabled={loading}
            rightElement={
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowSignupPwd((p) => !p)}>
                <EyeIcon open={showSignupPwd} />
              </button>
            } />
          <InputField id="su-confirm" label="Confirm Password" type="password"
            placeholder="Re-enter password" value={signupConfirm}
            onChange={(v) => { setSignupConfirm(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.signupConfirm} disabled={loading} />
          <button className={styles.submitBtnBlue} onClick={handleEmailSignup} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account'}
          </button>
          <div className={styles.divider}>or</div>
          <button className={styles.oauthBtn}
            onClick={() => simulate(() => { setSuccess(true); setTimeout(() => router.push('/civilian/dashboard'), 1200); })}>
            <svg width="16" height="16" viewBox="0 0 512 512">
              <path d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z" fill="#FBBB00"/>
              <path d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176z" fill="#518EF8"/>
              <path d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" fill="#28B446"/>
              <path d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z" fill="#F14336"/>
            </svg>
            Sign up with Google
          </button>
        </>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═════════════════════════════════════════════════════════════════════════════

type AdminMethod = 'email' | 'employeeId';

function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>('login');
  const [method, setMethod] = useState<AdminMethod>('employeeId');

  // Login
  const [identifier, setIdentifier] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [tfaOtp, setTfaOtp] = useState(Array(6).fill(''));
  const tfaRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signup
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suEmpId, setSuEmpId] = useState('');
  const [suDept, setSuDept] = useState<Department | ''>('');
  const [suPwd, setSuPwd] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suSecret, setSuSecret] = useState('');
  const [showSuPwd, setShowSuPwd] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const simulate = useCallback(async (fn?: () => void) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setLoading(false);
    fn?.();
  }, []);

  const handleLogin = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!identifier.trim()) e.identifier = method === 'email' ? 'Email required' : 'Employee ID required';
    else if (method === 'email' && !validateEmail(identifier)) e.identifier = 'Enter a valid email';
    if (pwd.length < 6) e.pwd = 'Minimum 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => { setTwoFactorStep(true); setTimeout(() => tfaRefs.current[0]?.focus(), 100); });
  }, [identifier, pwd, method, simulate]);

  const handleTfaVerify = useCallback(async () => {
    if (tfaOtp.join('').length < 6) { setErrors({ tfaOtp: 'Enter all 6 digits' }); return; }
    setErrors({});
    await simulate(() => { setSuccess(true); setTimeout(() => router.push('/admin/dashboard'), 1200); });
  }, [tfaOtp, simulate, router]);

  const handleSignup = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!suName.trim()) e.suName = 'Name required';
    if (!validateEmail(suEmail)) e.suEmail = 'Valid email required';
    if (suEmpId.length < 4) e.suEmpId = 'Valid Employee ID required';
    if (!suDept) e.suDept = 'Select department';
    if (suPwd.length < 8) e.suPwd = 'Minimum 8 characters';
    if (suPwd !== suConfirm) e.suConfirm = 'Passwords do not match';
    if (!suSecret.trim()) e.suSecret = 'Admin authorization code required';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => { setSuccess(true); setTimeout(() => router.push('/admin/dashboard'), 1200); });
  }, [suName, suEmail, suEmpId, suDept, suPwd, suConfirm, suSecret, simulate, router]);

  const tfaChange = (i: number, v: string) => {
    const n = [...tfaOtp]; n[i] = v; setTfaOtp(n);
    if (v && i < 5) tfaRefs.current[i + 1]?.focus();
  };
  const tfaKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !tfaOtp[i] && i > 0) tfaRefs.current[i - 1]?.focus();
  };

  if (success) return (
    <div className={styles.successBox}>
      <div className={styles.successIcon} style={{ background:'rgba(249,115,22,0.12)', color:'var(--accent-orange)' }}>✓</div>
      <p style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--text-primary)', fontSize:'1rem' }}>
        Authority Access Granted
      </p>
      <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>Redirecting to admin panel…</p>
    </div>
  );

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={`${styles.roleChip} ${styles.chipAdmin}`}>
          🛡️ Authority / Admin
        </div>
        <h2 className={styles.panelTitle}>
          {tab === 'login' ? 'Authority sign in' : 'Register as authority'}
        </h2>
        <p className={styles.panelSubtitle}>
          {tab === 'login'
            ? 'Access your department complaint management panel'
            : 'Register with your department credentials and authorization code'}
        </p>
      </div>

      <div className={styles.tabRow}>
        <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
          onClick={() => { setTab('login'); setErrors({}); setTwoFactorStep(false); }}>
          Sign In
        </button>
        <button className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
          onClick={() => { setTab('signup'); setErrors({}); }}>
          Sign Up
        </button>
      </div>

      {/* ── ADMIN LOGIN ── */}
      {tab === 'login' && !twoFactorStep && (
        <>
          <div className={styles.methodRow}>
            {(['employeeId', 'email'] as AdminMethod[]).map((m) => (
              <button key={m} className={`${styles.methodBtn} ${method === m ? styles.methodBtnActiveOrange : ''}`}
                onClick={() => { setMethod(m); setIdentifier(''); setErrors({}); }}>
                <span>{m === 'employeeId' ? '🪪' : '✉️'}</span>
                <span>{m === 'employeeId' ? 'Employee ID' : 'Email'}</span>
              </button>
            ))}
          </div>
          <InputField
            id="admin-id"
            label={method === 'employeeId' ? 'Employee ID' : 'Official Email'}
            type={method === 'email' ? 'email' : 'text'}
            placeholder={method === 'employeeId' ? 'EMP-XXXXXX' : 'official@dept.gov.in'}
            value={identifier}
            onChange={(v) => { setIdentifier(v); setErrors({}); }}
            icon={method === 'email' ? <EmailIcon /> : <IdIcon />}
            error={errors.identifier} disabled={loading} orange />
          <InputField id="admin-pwd" label="Password" type={showPwd ? 'text' : 'password'}
            placeholder="Enter password" value={pwd}
            onChange={(v) => { setPwd(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.pwd} disabled={loading} orange
            rightElement={
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowPwd((p) => !p)}>
                <EyeIcon open={showPwd} />
              </button>
            } />
          <div className={styles.row}>
            <div />
            <button type="button" className={styles.forgotBtn} style={{ color:'var(--accent-orange)' }}>
              Forgot password?
            </button>
          </div>
          <button className={styles.submitBtnOrange} onClick={handleLogin} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Continue to 2FA'}
          </button>
        </>
      )}

      {/* ── 2FA STEP ── */}
      {tab === 'login' && twoFactorStep && (
        <>
          <div className={styles.tfaBox}>
            <div className={styles.tfaTitle}>🔐 Two-Factor Authentication</div>
            <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>
              Enter the 6-digit code from your authenticator app or SMS.
            </p>
          </div>
          <div className={styles.steps}>
            <div className={`${styles.stepDot} ${styles.stepDone}`} />
            <div className={`${styles.stepDot} ${styles.stepActiveOrange}`} />
            <span className={styles.stepLabel}>Step 2 of 2 — 2FA</span>
          </div>
          <OtpBoxes otp={tfaOtp} onChange={tfaChange} onKeyDown={tfaKeyDown}
            refs={tfaRefs} loading={loading} orange />
          {errors.tfaOtp && <p className={styles.errorMsg} style={{ justifyContent:'center', marginBottom:'0.5rem' }}>{errors.tfaOtp}</p>}
          <button className={styles.submitBtnOrange} onClick={handleTfaVerify}
            disabled={loading || tfaOtp.join('').length < 6}>
            {loading ? <span className={styles.spinner} /> : 'Verify & Access Panel'}
          </button>
          <button onClick={() => { setTwoFactorStep(false); setTfaOtp(Array(6).fill('')); }}
            style={{ background:'none', border:'none', color:'var(--text-muted)',
              fontSize:'0.75rem', cursor:'pointer', marginTop:'0.5rem',
              fontFamily:'var(--font-body)', textDecoration:'underline' }}>
            ← Back
          </button>
        </>
      )}

      {/* ── ADMIN SIGNUP ── */}
      {tab === 'signup' && (
        <>
          <div className={styles.noteBox} style={{ background:'var(--glow-orange)', borderColor:'rgba(249,115,22,0.2)' }}>
            🛡️ Authority registration requires a valid Employee ID, department assignment, and an admin authorization code provided by your department.
          </div>
          <InputField id="as-name" label="Full Name" placeholder="Official name"
            value={suName} onChange={(v) => { setSuName(v); setErrors({}); }}
            icon={<UserIcon />} error={errors.suName} disabled={loading} orange />
          <InputField id="as-email" label="Official Email" type="email" placeholder="name@dept.gov.in"
            value={suEmail} onChange={(v) => { setSuEmail(v); setErrors({}); }}
            icon={<EmailIcon />} error={errors.suEmail} disabled={loading} orange />
          <InputField id="as-empid" label="Employee ID" placeholder="EMP-XXXXXX"
            value={suEmpId} onChange={(v) => { setSuEmpId(v.toUpperCase()); setErrors({}); }}
            icon={<IdIcon />} error={errors.suEmpId} disabled={loading} orange />
          <SelectField id="as-dept" label="Department" value={suDept}
            onChange={(v) => { setSuDept(v as Department); setErrors({}); }}
            options={DEPARTMENTS} error={errors.suDept} orange
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            } />
          <InputField id="as-pwd" label="Password" type={showSuPwd ? 'text' : 'password'}
            placeholder="Min 8 characters" value={suPwd}
            onChange={(v) => { setSuPwd(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.suPwd} disabled={loading} orange
            rightElement={
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowSuPwd((p) => !p)}>
                <EyeIcon open={showSuPwd} />
              </button>
            } />
          <InputField id="as-confirm" label="Confirm Password" type="password"
            placeholder="Re-enter password" value={suConfirm}
            onChange={(v) => { setSuConfirm(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.suConfirm} disabled={loading} orange />
          <InputField id="as-secret" label="Admin Authorization Code" type="password"
            placeholder="Provided by your department head"
            value={suSecret} onChange={(v) => { setSuSecret(v); setErrors({}); }}
            icon={<LockIcon />} error={errors.suSecret} disabled={loading} orange />
          <button className={styles.submitBtnOrange} onClick={handleSignup} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Register as Authority'}
          </button>
        </>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export default function AuthClient() {
  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>Civic Complaint Portal</div>
            <div className={styles.brandTagline}>Government of India Initiative</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Split panels */}
      <div className={styles.splitContainer}>
        {/* ── Left: Civilian ── */}
        <div className={`${styles.panel} ${styles.panelCivilian}`} style={{ animation:'slideInL 0.45s ease both' }}>
          <div className={`${styles.panelAccent} ${styles.accentCivilian}`} />
          {/* bg blob */}
          <div className={styles.panelBlob} style={{
            width:300, height:300, top:-100, right:-100,
            background:'radial-gradient(circle, var(--glow-blue) 0%, transparent 70%)',
          }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <CivilianPanel />
          </div>
        </div>

        {/* ── Right: Admin ── */}
        <div className={`${styles.panel} ${styles.panelAdmin}`} style={{ animation:'slideInR 0.45s ease both' }}>
          <div className={`${styles.panelAccent} ${styles.accentAdmin}`} />
          <div className={styles.panelBlob} style={{
            width:300, height:300, bottom:-100, left:-100,
            background:'radial-gradient(circle, var(--glow-orange) 0%, transparent 70%)',
          }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <AdminPanel />
          </div>
        </div>
      </div>
    </div>
  );
}