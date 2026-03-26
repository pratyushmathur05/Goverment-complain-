'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ui';
import { validateEmail, DEPARTMENTS } from '@/app/lib/data';
import { useAuth } from '@/app/context/AuthContext';
import type { AuthTab, Department } from '@/app/types';
import styles from './admin.module.css';

type AdminMethod = 'employeeId' | 'email';

export default function AdminAuthClient() {
  const router = useRouter();
  const { setSession } = useAuth();
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
    if (!identifier.trim()) e.identifier = method === 'email' ? 'Email is required' : 'Employee ID is required';
    else if (method === 'email' && !validateEmail(identifier)) e.identifier = 'Enter a valid email address';
    if (pwd.length < 6) e.pwd = 'Minimum 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => {
      setTwoFactorStep(true);
      setTimeout(() => tfaRefs.current[0]?.focus(), 100);
    });
  }, [identifier, pwd, method, simulate]);

  const handleTfaVerify = useCallback(async () => {
    if (tfaOtp.join('').length < 6) { setErrors({ tfaOtp: 'Enter all 6 digits' }); return; }
    setErrors({});
    await simulate(() => {
      setSession({
        role: 'admin',
        name: 'Admin User',
        email: identifier.includes('@') ? identifier : 'admin@dept.gov.in',
        employeeId: method === 'employeeId' ? identifier : 'EMP-000000',
        department: 'General'
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/dashboard'), 1200);
    });
  }, [tfaOtp, simulate, router, setSession, identifier, method]);

  const handleSignup = useCallback(async () => {
    const e: Record<string, string> = {};
    if (!suName.trim()) e.suName = 'Full name is required';
    if (!validateEmail(suEmail)) e.suEmail = 'Enter a valid official email';
    if (suEmpId.trim().length < 4) e.suEmpId = 'Enter valid Employee ID';
    if (!suDept) e.suDept = 'Select your department';
    if (suPwd.length < 8) e.suPwd = 'Minimum 8 characters';
    if (suPwd !== suConfirm) e.suConfirm = 'Passwords do not match';
    if (!suSecret.trim()) e.suSecret = 'Authorization code is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    await simulate(() => {
      setSession({
        role: 'admin',
        name: suName,
        email: suEmail,
        employeeId: suEmpId,
        department: suDept as any
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/dashboard'), 1200);
    });
  }, [suName, suEmail, suEmpId, suDept, suPwd, suConfirm, suSecret, simulate, router, setSession]);

  const tfaChange = (i: number, v: string) => {
    const n = [...tfaOtp]; n[i] = v; setTfaOtp(n);
    if (v && i < 5) tfaRefs.current[i + 1]?.focus();
  };
  const tfaKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !tfaOtp[i] && i > 0) tfaRefs.current[i - 1]?.focus();
  };

  const resetState = (newTab: AuthTab) => {
    setTab(newTab); setErrors({});
    setTwoFactorStep(false); setTfaOtp(Array(6).fill(''));
  };

  return (
    <div className={styles.page}>
      {/* Top bar */}
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandName}>Authority Portal</span>
        </div>
        <ThemeToggle size="sm" />
      </header>

      <main className={styles.main}>
        <div className={styles.blobOrange} aria-hidden />

        {success ? (
          <div className={styles.card}>
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Authority Access Granted</h2>
              <p className={styles.successText}>Redirecting to admin panel…</p>
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.roleChip}>🛡️ Authority / Admin</div>
              <h1 className={styles.cardTitle}>
                {tab === 'login'
                  ? twoFactorStep ? 'Two-Factor Authentication' : 'Authority sign in'
                  : 'Register as Authority'}
              </h1>
              <p className={styles.cardSubtitle}>
                {tab === 'login'
                  ? twoFactorStep
                    ? 'Enter the 6-digit code from your authenticator app or SMS'
                    : 'Access your department complaint management panel'
                  : 'Requires valid Employee ID, department, and authorization code'}
              </p>
            </div>

            {/* Tab row — hidden during 2FA step */}
            {!twoFactorStep && (
              <div className={styles.tabRow}>
                <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
                  onClick={() => resetState('login')}>Sign In</button>
                <button className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
                  onClick={() => resetState('signup')}>Sign Up</button>
              </div>
            )}

            {/* ── LOGIN ── */}
            {tab === 'login' && !twoFactorStep && (
              <div className={styles.form}>
                <div className={styles.methodRow}>
                  {(['employeeId', 'email'] as AdminMethod[]).map((m) => (
                    <button key={m}
                      className={`${styles.methodBtn} ${method === m ? styles.methodBtnActive : ''}`}
                      onClick={() => { setMethod(m); setIdentifier(''); setErrors({}); }}>
                      <span>{m === 'employeeId' ? '🪪' : '✉️'}</span>
                      <span>{m === 'employeeId' ? 'Employee ID' : 'Email'}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    {method === 'employeeId' ? 'Employee ID' : 'Official Email'}
                  </label>
                  <div className={`${styles.inputWrap} ${errors.identifier ? styles.inputError : ''}`}>
                    {method === 'email' ? <EmailIcon /> : <IdIcon />}
                    <input className={styles.input}
                      type={method === 'email' ? 'email' : 'text'}
                      placeholder={method === 'employeeId' ? 'EMP-XXXXXX' : 'official@dept.gov.in'}
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setErrors({}); }}
                      disabled={loading} />
                  </div>
                  {errors.identifier && <span className={styles.errMsg}>{errors.identifier}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <div className={`${styles.inputWrap} ${errors.pwd ? styles.inputError : ''}`}>
                    <LockIcon />
                    <input className={styles.input}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Enter your password" value={pwd}
                      onChange={(e) => { setPwd(e.target.value); setErrors({}); }}
                      disabled={loading} />
                    <button type="button" className={styles.eyeBtn}
                      onClick={() => setShowPwd((p) => !p)}>
                      <EyeIcon open={showPwd} />
                    </button>
                  </div>
                  {errors.pwd && <span className={styles.errMsg}>{errors.pwd}</span>}
                </div>

                <div className={styles.rowEnd}>
                  <button type="button" className={styles.forgotBtn}>Forgot password?</button>
                </div>

                <button className={styles.submitBtn} onClick={handleLogin} disabled={loading}>
                  {loading ? <Spinner /> : 'Continue to 2FA →'}
                </button>
              </div>
            )}

            {/* ── 2FA ── */}
            {tab === 'login' && twoFactorStep && (
              <div className={styles.form}>
                <div className={styles.tfaBox}>
                  <div className={styles.tfaIcon}>🔐</div>
                  <p className={styles.tfaHint}>
                    Enter the 6-digit code sent to your registered mobile or authenticator app.
                  </p>
                </div>

                <div className={styles.steps}>
                  <div className={`${styles.stepDot} ${styles.stepDone}`} />
                  <div className={styles.stepLine} />
                  <div className={`${styles.stepDot} ${styles.stepActive}`} />
                  <span className={styles.stepLabel}>Step 2 of 2 — Verification</span>
                </div>

                <div className={styles.otpRow}>
                  {tfaOtp.map((d, i) => (
                    <input key={i} ref={(el) => { tfaRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      className={`${styles.otpBox} ${d ? styles.otpFilled : ''}`}
                      value={d}
                      onChange={(e) => tfaChange(i, e.target.value.replace(/\D/,'').slice(-1))}
                      onKeyDown={(e) => tfaKeyDown(i, e)}
                      disabled={loading} aria-label={`2FA digit ${i + 1}`} />
                  ))}
                </div>
                {errors.tfaOtp && <span className={styles.errMsg} style={{ textAlign:'center' }}>{errors.tfaOtp}</span>}

                <button className={styles.submitBtn} onClick={handleTfaVerify}
                  disabled={loading || tfaOtp.join('').length < 6}>
                  {loading ? <Spinner /> : 'Verify & Access Panel'}
                </button>

                <button className={styles.backLink}
                  onClick={() => { setTwoFactorStep(false); setTfaOtp(Array(6).fill('')); setErrors({}); }}>
                  ← Back to login
                </button>
              </div>
            )}

            {/* ── SIGNUP ── */}
            {tab === 'signup' && (
              <div className={styles.form}>
                <div className={styles.noteBox}>
                  🛡️ Authority registration requires an Employee ID, department assignment, and an admin authorization code issued by your department head.
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <div className={`${styles.inputWrap} ${errors.suName ? styles.inputError : ''}`}>
                    <UserIcon /><input className={styles.input} placeholder="Official full name"
                      value={suName} onChange={(e) => { setSuName(e.target.value); setErrors({}); }}
                      disabled={loading} />
                  </div>
                  {errors.suName && <span className={styles.errMsg}>{errors.suName}</span>}
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Official Email</label>
                    <div className={`${styles.inputWrap} ${errors.suEmail ? styles.inputError : ''}`}>
                      <EmailIcon /><input className={styles.input} type="email"
                        placeholder="name@dept.gov.in" value={suEmail}
                        onChange={(e) => { setSuEmail(e.target.value); setErrors({}); }}
                        disabled={loading} />
                    </div>
                    {errors.suEmail && <span className={styles.errMsg}>{errors.suEmail}</span>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Employee ID</label>
                    <div className={`${styles.inputWrap} ${errors.suEmpId ? styles.inputError : ''}`}>
                      <IdIcon /><input className={styles.input} placeholder="EMP-XXXXXX"
                        value={suEmpId}
                        onChange={(e) => { setSuEmpId(e.target.value.toUpperCase()); setErrors({}); }}
                        disabled={loading} />
                    </div>
                    {errors.suEmpId && <span className={styles.errMsg}>{errors.suEmpId}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Department</label>
                  <div className={`${styles.inputWrap} ${errors.suDept ? styles.inputError : ''}`}>
                    <DeptIcon />
                    <select className={styles.select} value={suDept}
                      onChange={(e) => { setSuDept(e.target.value as Department); setErrors({}); }}>
                      <option value="">Select department…</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {errors.suDept && <span className={styles.errMsg}>{errors.suDept}</span>}
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <div className={`${styles.inputWrap} ${errors.suPwd ? styles.inputError : ''}`}>
                      <LockIcon />
                      <input className={styles.input} type={showSuPwd ? 'text' : 'password'}
                        placeholder="Min 8 characters" value={suPwd}
                        onChange={(e) => { setSuPwd(e.target.value); setErrors({}); }}
                        disabled={loading} />
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
                      <LockIcon /><input className={styles.input} type="password"
                        placeholder="Re-enter password" value={suConfirm}
                        onChange={(e) => { setSuConfirm(e.target.value); setErrors({}); }}
                        disabled={loading} />
                    </div>
                    {errors.suConfirm && <span className={styles.errMsg}>{errors.suConfirm}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Admin Authorization Code</label>
                  <div className={`${styles.inputWrap} ${errors.suSecret ? styles.inputError : ''}`}>
                    <KeyIcon /><input className={styles.input} type="password"
                      placeholder="Code provided by department head"
                      value={suSecret}
                      onChange={(e) => { setSuSecret(e.target.value); setErrors({}); }}
                      disabled={loading} />
                  </div>
                  {errors.suSecret && <span className={styles.errMsg}>{errors.suSecret}</span>}
                </div>

                <button className={styles.submitBtn} onClick={handleSignup} disabled={loading}>
                  {loading ? <Spinner /> : 'Register as Authority'}
                </button>
              </div>
            )}

            <p className={styles.switchPrompt}>
              {tab === 'login' ? "Need an authority account?" : 'Already registered?'}
              <button className={styles.switchLink}
                onClick={() => resetState(tab === 'login' ? 'signup' : 'login')}>
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
const s = { flexShrink: 0 as const, color: 'var(--text-muted)' };
const EmailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UserIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IdIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/></svg>;
const DeptIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const KeyIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const EyeIcon = ({ open }: { open: boolean }) => open
  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const Spinner = () => <span style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />;