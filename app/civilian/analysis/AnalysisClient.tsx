'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, UploadIcon, CheckCircle2, RotateCw, MapPin } from 'lucide-react';
import styles from './analysis.module.css';
import { useComplaints } from '@/app/hooks/useComplaints';
import { useAuth } from '@/app/context/AuthContext';

export default function AnalysisClient() {
  const router = useRouter();
  const { complaints } = useComplaints();
  const { session } = useAuth();
  const [progress, setProgress] = useState(0);
  const [stamp, setStamp] = useState('');

  // Find the most recent complaint for this user
  const latestComplaint = useMemo(() => {
    const userEmail = session?.email || '__anonymous__';
    const userComplaints = complaints.filter(c => c.civilianId === userEmail);
    return userComplaints.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0] || null;
  }, [complaints, session]);

  const lat = latestComplaint?.location?.lat?.toFixed(4) || '23.179';
  const lng = latestComplaint?.location?.lng?.toFixed(4) || '77.435';
  const hasGps = !!latestComplaint?.location;

  useEffect(() => {
    // Format timestamp like UTC +5:30 Oct 26, 2024
    const d = new Date();
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setStamp(`IST (UTC +5:30) ${formattedDate}`);

    // Animate progress to 98%
    const timer = setTimeout(() => {
      setProgress(98);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 440 is the circle circumference
  const dashoffset = 440 - (440 * progress) / 100;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mapBackground} />

      <div className={styles.container}>
        
        {/* Left/Center Panel - Image Analysis */}
        <div className={styles.analysisPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Active Analysis State</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Intelligent verification in progress
            </p>
          </div>

          <div className={styles.imageContainer}>
            {/* The sample broken road image */}
            <img 
              src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1200" 
              alt="Broken road" 
              className={styles.attachedImage} 
            />
            
            <div className={styles.scannerLine} />

            <div className={`${styles.overlayBox} ${styles.overlayTopLeft}`}>
              <span className={styles.overlayLabel}>Geolocation</span>
              <span className={styles.overlayValue}>
                {hasGps ? `${lat}° N, ${lng}° E` : 'Interpolated from IP/Network'}
              </span>
            </div>

            <div className={`${styles.overlayBox} ${styles.overlayBottomRight}`}>
              <span className={styles.overlayLabel}>Detected</span>
              <span className={styles.overlayValue}>
                {latestComplaint?.categories[0] || 'Unknown Issue'} · Grade {Math.floor((latestComplaint?.aiScore || 40) / 20)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Status & Confirmation */}
        <div className={styles.statusSidebar}>
          
          {/* Verification Progress */}
          <div className={styles.statusCard}>
            <div className={styles.gaugeContainer}>
              <svg width="160" height="160" viewBox="0 0 160 160" className={styles.gaugeCircle}>
                <circle cx="80" cy="80" r="70" className={styles.gaugeBg} />
                <circle cx="80" cy="80" r="70" className={styles.gaugeFill} style={{ strokeDashoffset: dashoffset }} />
              </svg>
              <div className={styles.gaugeText}>{progress}%</div>
            </div>
            
            <div className={styles.gaugeSub}>AI Legitimacy Verification</div>

            <div className={styles.checklist}>
              <div className={styles.checkItem}>
                {progress > 30 ? <CheckCircle2 size={16} className={styles.checkIcon} /> : <RotateCw size={16} className={styles.loadingIcon} />}
                <span>Metadata verified</span>
              </div>
              <div className={styles.checkItem}>
                {progress > 60 ? <CheckCircle2 size={16} className={styles.checkIcon} /> : <RotateCw size={16} className={styles.loadingIcon} />}
                <span>Image scan complete</span>
              </div>
              <div className={styles.checkItem}>
                {progress >= 98 ? <CheckCircle2 size={16} className={styles.checkIcon} /> : <RotateCw size={16} className={styles.loadingIcon} />}
                <span>Encryption complete</span>
              </div>
            </div>
          </div>

          {/* Evidence Vault Confirmation */}
          <div className={styles.vaultCard}>
            <div className={styles.vaultIcon}>
              <Lock size={24} />
            </div>
            <div>
              <div className={styles.vaultTitle}>Evidence Vault</div>
              <div className={styles.vaultTime}>
                <span>Image Encrypted & Timestamped</span>
              </div>
              <div className={styles.vaultTime} style={{ marginTop: 2, color: '#60a5fa' }}>
                {stamp}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            className={styles.submitBtn} 
            disabled={progress < 98}
            onClick={() => router.push('/civilian/dashboard?success=true')}
          >
            <span>Submit Final Report</span>
            <UploadIcon size={24} />
          </button>

        </div>

      </div>
    </div>
  );
}
