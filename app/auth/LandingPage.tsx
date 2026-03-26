'use client';

import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/app/components/ui';
import styles from './landing.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>Civic Complaint Portal</div>
            <div className={styles.brandTagline}>Government of India Initiative</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className={styles.main}>
        {/* Background blobs */}
        <div className={styles.blobBlue} aria-hidden />
        <div className={styles.blobOrange} aria-hidden />

        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Portal Live — Report. Track. Resolve.
          </div>
          <h1 className={styles.heroTitle}>
            Your voice,<br />
            <span className={styles.heroAccent}>their action.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Report civic issues directly to the right authorities.
            Track resolution in real time. Make your city better.
          </p>
        </div>

        {/* Role cards */}
        <div className={styles.cardsRow}>

          {/* Civilian Card */}
          <button
            className={`${styles.card} ${styles.cardCivilian}`}
            onClick={() => router.push('/auth/civilian')}
            aria-label="Continue as Civilian"
          >
            <div className={styles.cardGlow} />

            <div className={styles.cardIconWrap} style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
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

            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>Civilian</h2>
              <p className={styles.cardDesc}>
                Report potholes, water issues, power outages, sanitation problems
                and more. Track your complaints from submission to resolution.
              </p>
            </div>

            <ul className={styles.cardFeatures}>
              {['File civic complaints', 'Real-time status tracking', 'Aadhaar & Google login'].map((f) => (
                <li key={f} className={styles.cardFeatureItem}>
                  <span className={styles.featureCheck} style={{ background: 'rgba(37,99,235,0.12)', color: '#2563eb' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className={`${styles.cardCta} ${styles.ctaBlue}`}>
              Continue as Civilian
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <div className={styles.cardAccentBlue} />
          </button>

          {/* Divider */}
          <div className={styles.orDivider}>
            <div className={styles.orLine} />
            <span className={styles.orText}>or</span>
            <div className={styles.orLine} />
          </div>

          {/* Admin Card */}
          <button
            className={`${styles.card} ${styles.cardAdmin}`}
            onClick={() => router.push('/auth/admin')}
            aria-label="Continue as Authority"
          >
            <div className={styles.cardGlow} style={{ background: 'radial-gradient(circle at 50% 0%, var(--glow-orange), transparent 70%)' }} />

            <div className={styles.cardIconWrap} style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>Authority / Admin</h2>
              <p className={styles.cardDesc}>
                Manage incoming complaints for your department. Assign, update
                status, resolve issues and generate reports for your jurisdiction.
              </p>
            </div>

            <ul className={styles.cardFeatures}>
              {['Manage department complaints', 'Analytics & reports', 'Secure 2FA login'].map((f) => (
                <li key={f} className={styles.cardFeatureItem}>
                  <span className={styles.featureCheck} style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className={`${styles.cardCta} ${styles.ctaOrange}`}>
              Continue as Authority
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <div className={styles.cardAccentOrange} />
          </button>

        </div>

        {/* Footer note */}
        <p className={styles.footerNote}>
          🔒 Secured with end-to-end encryption · Government of India Initiative
        </p>
      </main>
    </div>
  );
}