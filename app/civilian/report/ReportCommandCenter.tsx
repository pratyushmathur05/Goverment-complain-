'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getInitials } from '@/app/context/AuthContext';
import { generateTicketId } from '@/app/lib/data';
import styles from './report.module.css';
import exifr from 'exifr';
import { useComplaints, ComplaintRecord } from '@/app/hooks/useComplaints';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | 'Potholes'
  | 'Garbage'
  | 'Water Issue'
  | 'Animal Control'
  | 'Authority Misconduct'
  | 'Electricity'
  | 'Sanitation'
  | 'Noise'
  | 'Other';

type NavKey = 'home' | 'reports' | 'notifications';

interface ActiveReport {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: string; color: string }[] = [
  { label: 'Potholes',             icon: '🕳️', color: '#f97316' },
  { label: 'Garbage',              icon: '🗑️', color: '#22c55e' },
  { label: 'Water Issue',          icon: '💧', color: '#3b82f6' },
  { label: 'Animal Control',       icon: '🐾', color: '#a78bfa' },
  { label: 'Authority Misconduct', icon: '⚖️', color: '#ef4444' },
  { label: 'Electricity',          icon: '⚡', color: '#eab308' },
  { label: 'Sanitation',           icon: '🚿', color: '#06b6d4' },
  { label: 'Noise',                icon: '🔊', color: '#f43f5e' },
  { label: 'Other',                icon: '📌', color: '#6b7280' },
];

const MOCK_ACTIVE: ActiveReport[] = [
  { id: 'CCP-2024-091', title: 'Pothole on MG Road',           status: 'in_progress', date: '2 days ago' },
  { id: 'CCP-2024-088', title: 'Garbage overflow Sector 14',   status: 'open',        date: '5 days ago' },
  { id: 'CCP-2024-071', title: 'No water supply Block C',      status: 'resolved',    date: '1 week ago' },
];

const STATUS_COLOR: Record<string, string> = {
  open:        '#f97316',
  in_progress: '#3b82f6',
  resolved:    '#22c55e',
  archived:    '#6b7280',
};

const STATUS_LABEL: Record<string, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  archived:    'Archived',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const ReportsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/>
    <line x1="14" y1="20" x2="5" y2="20"/>
    <line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
);

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6"  x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6"  x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ─── AI Legitimacy Radar ──────────────────────────────────────────────────────

function AIRadar({ score }: { score: number }) {
  const cx = 75; const cy = 75; const maxR = 55;
  const axes = 6;

  const scoreColor =
    score >= 70 ? '#22c55e' :
    score >= 40 ? '#f97316' : '#ef4444';

  const scoreLabel =
    score >= 70 ? 'actionable' :
    score >= 40 ? 'needs detail' : 'too vague';

  // Radar polygon points
  const polygonPoints = Array.from({ length: axes }, (_, i) => {
    const angle = (i * 2 * Math.PI) / axes - Math.PI / 2;
    const r = (score / 100) * maxR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  // Gauge arc
  const R = 30;
  const circ = 2 * Math.PI * R;
  const filled = (score / 100) * circ * 0.75;

  return (
    <div className={styles.radarCard}>
      {/* Header */}
      <div className={styles.radarHeader}>
        <span className={styles.radarTitle}>AI Legitimacy Radar</span>
        <span className={styles.radarBadge} style={{ color: scoreColor, borderColor: `${scoreColor}40` }}>
          Live Feedback
        </span>
      </div>

      {/* Visuals row */}
      <div className={styles.radarVisuals}>
        {/* Radar chart */}
        <svg width="150" height="150" viewBox="0 0 150 150">
          {/* Background rings */}
          {[20, 35, 50, 65, 80].map((r) => (
            <circle key={r} cx={cx} cy={cy}
              r={(r / 100) * maxR}
              fill="none" stroke="var(--border)" strokeWidth="0.5" />
          ))}
          {/* Axis spokes */}
          {Array.from({ length: axes }, (_, i) => {
            const angle = (i * 2 * Math.PI) / axes - Math.PI / 2;
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + maxR * Math.cos(angle)}
                y2={cy + maxR * Math.sin(angle)}
                stroke="var(--border)" strokeWidth="0.5" />
            );
          })}
          {/* Score fill polygon */}
          <polygon
            points={polygonPoints}
            fill={scoreColor} fillOpacity="0.15"
            stroke={scoreColor} strokeWidth="1.5"
            style={{ transition: 'all 0.5s ease' }}
          />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill={scoreColor} />
        </svg>

        {/* Gauge */}
        <div className={styles.gauge}>
          <svg width="86" height="86" viewBox="0 0 86 86">
            {/* Track */}
            <circle cx="43" cy="43" r={R}
              fill="none" stroke="var(--border)" strokeWidth="5"
              strokeDasharray={`${circ * 0.75} ${circ}`}
              strokeLinecap="round"
              transform="rotate(135 43 43)" />
            {/* Fill */}
            <circle cx="43" cy="43" r={R}
              fill="none" stroke={scoreColor} strokeWidth="5"
              strokeDasharray={`${filled} ${circ}`}
              strokeLinecap="round"
              transform="rotate(135 43 43)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <div className={styles.gaugeInner}>
            <span className={styles.gaugeScore} style={{ color: scoreColor }}>
              {score}%
            </span>
            <span className={styles.gaugeLabel}>{scoreLabel}</span>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className={styles.radarTip}
        style={{
          background:
            score < 40  ? 'rgba(239,68,68,0.07)'  :
            score < 70  ? 'rgba(249,115,22,0.07)'  :
                          'rgba(34,197,94,0.07)',
          borderColor:
            score < 40  ? 'rgba(239,68,68,0.2)'   :
            score < 70  ? 'rgba(249,115,22,0.2)'   :
                          'rgba(34,197,94,0.2)',
          color: scoreColor,
        }}
      >
        {score < 40  && '⚠ Add location, date, and specific details.'}
        {score >= 40 && score < 70 && 'ℹ Attach evidence photos to strengthen your report.'}
        {score >= 70 && '✓ Report looks actionable and ready to submit.'}
      </div>
    </div>
  );
}

// ─── Active Reports Widget ────────────────────────────────────────────────────

function ActiveReports({ userName, complaints }: { userName: string | null, complaints: ComplaintRecord[] }) {
  const userComplaints = userName 
    ? complaints.filter(c => c.civilianName === userName).slice(0, 4)
    : complaints.slice(0, 4);

  return (
    <div className={styles.activeCard}>
      <h3 className={styles.widgetTitle}>Your Active Reports</h3>
      {userComplaints.length === 0 ? (
        <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem'}}>No active reports found.</p>
      ) : userComplaints.map((r) => (
        <div key={r.id} className={styles.activeRow}>
          <div
            className={styles.activeDot}
            style={{ background: STATUS_COLOR[r.status] }}
          />
          <div className={styles.activeInfo}>
            <span className={styles.activeId}>{r.id}</span>
            <span className={styles.activeTitle}>
              {r.categories.length > 0 ? r.categories[0] : 'Issue'}
            </span>
            <span className={styles.activeDate}>
              {new Date(r.timestamp).toLocaleDateString()}
            </span>
          </div>
          <span
            className={styles.activeBadge}
            style={{
              color:      STATUS_COLOR[r.status],
              background: `${STATUS_COLOR[r.status]}18`,
            }}
          >
            {STATUS_LABEL[r.status]}
          </span>
        </div>
      ))}
      <Link href="/civilian/track" className={styles.activeViewAll}>
        View all reports →
      </Link>
    </div>
  );
}

// ─── Rich Text Toolbar ────────────────────────────────────────────────────────

function Toolbar({ onFormat }: { onFormat: (tag: string) => void }) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.toolBtn} title="Bold" onClick={() => onFormat('bold')}>
        <BoldIcon />
      </button>
      <button className={styles.toolBtn} title="Italic" onClick={() => onFormat('italic')}>
        <ItalicIcon />
      </button>
      <button className={styles.toolBtn} title="Bullet list" onClick={() => onFormat('list')}>
        <ListIcon />
      </button>
      <div className={styles.toolDivider} />
      <span className={styles.toolLabel}>Rich Text Editor</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportCommandCenter() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const { addComplaint, complaints } = useComplaints();

  const civilian    = session?.role === 'civilian' ? session : null;
  const displayName = civilian?.name ?? null;
  const initials    = displayName ? getInitials(displayName) : null;

  // Form state
  const [selectedCats,  setSelectedCats]  = useState<Set<Category>>(new Set());
  const [description,   setDescription]   = useState('');
  const [files,         setFiles]         = useState<File[]>([]);
  const [dragging,      setDragging]      = useState(false);
  const [activeNav,     setActiveNav]     = useState<NavKey>('home');
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [ticket,        setTicket]        = useState('');
  const [detectedLocation, setDetectedLocation] = useState<{lat: number, lng: number} | 'not_found' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI score derived from form completeness
  const aiScore = Math.min(100, Math.max(0, Math.floor(
    (description.length >  10 ? 20 : description.length * 2) +
    (description.length >  30 ? 10 : 0) +
    (description.length >  80 ? 10 : 0) +
    (description.length > 150 ? 5 : 0) +
    (selectedCats.size  >   0 ? 10 : 0) +
    (files.length       >   0 ? 15 : 0) +
    (detectedLocation && detectedLocation !== 'not_found' ? 30 : 0)
  )));

  const toggleCat = useCallback((cat: Category) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const extractExif = async (filesArray: File[]) => {
    let found = false;
    for (const f of filesArray) {
      if (f.type.startsWith('image/')) {
        try {
          const gps = await exifr.gps(f);
          if (gps && gps.latitude && gps.longitude) {
            setDetectedLocation({ lat: gps.latitude, lng: gps.longitude });
            found = true;
            return; // Only need one location
          }
        } catch(e) {
          console.error("EXIF parsing error:", e);
        }
      }
    }
    if (!found) setDetectedLocation('not_found');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    const appended = [...files, ...dropped].slice(0, 5);
    setFiles(appended);
    extractExif(dropped);
  }, [files]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files || []);
    const appended = [...files, ...added].slice(0, 5);
    setFiles(appended);
    extractExif(added);
  }, [files]);

  const removeFile = useCallback((idx: number) => {
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    if (newFiles.length === 0) setDetectedLocation(null);
  }, [files]);

  const handleFormat = useCallback((tag: string) => {
    setDescription((d) =>
      tag === 'bold'   ? d + '**bold text**'   :
      tag === 'italic' ? d + '_italic text_'   :
      tag === 'list'   ? d + '\n• '            : d
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!description.trim() && selectedCats.size === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    
    const newId = generateTicketId();
    
    addComplaint({
      id: newId,
      civilianId: civilian?.email,
      civilianName: displayName || 'Anonymous Citizen',
      categories: Array.from(selectedCats),
      description: description,
      location: detectedLocation !== 'not_found' ? detectedLocation : null,
      aiScore
    });

    setTicket(newId);
    setSubmitted(true);
  }, [description, selectedCats, addComplaint, session, displayName, detectedLocation, aiScore]);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setDescription('');
    setSelectedCats(new Set());
    setFiles([]);
    setTicket('');
  }, []);

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Report Submitted!</h2>
          <p className={styles.successText}>
            {displayName ? `${displayName.split(' ')[0]}, your` : 'Your'} report has been
            registered and forwarded to the relevant authority.
          </p>
          <div className={styles.successTicket}>{ticket}</div>
          <p className={styles.successHint}>
            Use this ticket ID to track your complaint status
          </p>
          <div className={styles.successActions}>
            <button className={styles.btnPrimary}
              onClick={() => router.push('/civilian/track')}>
              Track Report
            </button>
            <button className={styles.btnSecondary} 
              onClick={() => router.push('/civilian/dashboard')}>
              Dashboard
            </button>
            <button className={styles.btnSecondary} onClick={resetForm}>
              New Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className={styles.shell}>

      {/* ═══════════════════════════════════════════
          LEFT SIDEBAR
      ═══════════════════════════════════════════ */}
      <aside className={styles.sidebar}>

        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>CITIZEN PORTAL</div>
            <div className={styles.brandSub}>Command Center</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className={styles.sidebarNav}>
          {([
            { key: 'home'          as NavKey, label: 'Home',           href: '/civilian/dashboard', Icon: HomeIcon,    badge: null },
            { key: 'reports'       as NavKey, label: 'My Reports',     href: '/civilian/track',     Icon: ReportsIcon, badge: null },
            { key: 'notifications' as NavKey, label: 'Notifications',  href: '#',                   Icon: BellIcon,    badge: 2 },
          ]).map(({ key, label, href, Icon, badge }) => (
            <Link
              key={key}
              href={href}
              className={`${styles.navItem} ${activeNav === key ? styles.navItemActive : ''}`}
              onClick={() => setActiveNav(key)}
            >
              <span className={styles.navIcon}><Icon /></span>
              <span className={styles.navLabel}>{label}</span>
              {badge !== null && (
                <span className={styles.navBadge}>{badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}
            style={{
              background: displayName
                ? 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)'
                : 'var(--bg-subtle)',
              border: displayName ? 'none' : '1.5px dashed var(--border-strong)',
            }}
          >
            {initials ?? <UserIcon />}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {displayName ?? 'Not signed in'}
            </span>
            {civilian?.email && (
              <span className={styles.userEmail}>{civilian.email}</span>
            )}
            {displayName && (
              <button
                className={styles.signOutBtn}
                onClick={() => { clearSession(); router.push('/auth'); }}
              >
                <SignOutIcon /> Sign out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          CENTER WORKSPACE
      ═══════════════════════════════════════════ */}
      <main className={styles.workspace}>
        <div className={styles.workspaceInner}>

          {/* Page heading */}
          <div className={styles.pageHeading}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleDim}>NEW REPORT:</span>{' '}
              <span className={styles.titleAccent}>COMMAND CENTER</span>
            </h1>
            <p className={styles.pageSub}>
              {displayName
                ? `Filing as ${displayName} · Document your civic issue clearly for fast resolution`
                : 'Document your civic issue clearly for fast resolution'}
            </p>
          </div>

          {/* ── 01 Upload Evidence ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>01</span>
              <span className={styles.sectionTitle}>Upload Evidence</span>
            </div>

            <div
              className={`${styles.dropZone}
                ${dragging    ? styles.dropZoneActive    : ''}
                ${files.length > 0 ? styles.dropZoneFilled : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {files.length === 0 ? (
                <div className={styles.dropEmpty}>
                  <div className={styles.uploadIconRing}>
                    <UploadIcon />
                  </div>
                  <p className={styles.dropCta}>
                    Drag &amp; Drop or Tap to Upload Images/Video
                  </p>
                  <p className={styles.dropHint}>
                    JPG · PNG · MP4 · PDF &nbsp;·&nbsp; Max 5 files
                  </p>
                </div>
              ) : (
                <div className={styles.fileGrid} onClick={(e) => e.stopPropagation()}>
                  <div style={{ width: '100%', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                    {detectedLocation === 'not_found' && (
                      <div style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <span style={{ fontSize: '1rem' }}>📍</span>
                        <strong>No GPS Found:</strong> Image lacks EXIF metadata
                      </div>
                    )}

                    {detectedLocation && detectedLocation !== 'not_found' && (
                      <div style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #22c55e', background: 'rgba(34,197,94,0.05)', color: '#22c55e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <span style={{ fontSize: '1rem' }}>📍</span>
                        <strong>GPS Attached:</strong> {detectedLocation.lat.toFixed(4)}, {detectedLocation.lng.toFixed(4)}
                      </div>
                    )}
                  </div>

                  {files.map((f, i) => (
                    <div key={i} className={styles.fileChip}>
                      <span>{f.type.startsWith('video/') ? '🎬' : '🖼️'}</span>
                      <span className={styles.fileName}>
                        {f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name}
                      </span>
                      <button
                        className={styles.fileRemove}
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        aria-label={`Remove ${f.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {files.length < 5 && (
                    <button
                      className={styles.addMore}
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    >
                      + Add more
                    </button>
                  )}
                </div>
              )}
              <span className={styles.zoneTag}>Evidence Zone</span>
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </section>

          {/* ── 02 Category Chips ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02</span>
              <span className={styles.sectionTitle}>Select Category</span>
              {selectedCats.size > 0 && (
                <span className={styles.sectionCount}>
                  {selectedCats.size} selected
                </span>
              )}
            </div>

            <div className={styles.chips}>
              {CATEGORIES.map((cat) => {
                const active = selectedCats.has(cat.label);
                return (
                  <button
                    key={cat.label}
                    className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                    style={active ? {
                      background:   `${cat.color}15`,
                      borderColor:   cat.color,
                      color:         cat.color,
                    } : {}}
                    onClick={() => toggleCat(cat.label)}
                  >
                    <span className={styles.chipIcon}>{cat.icon}</span>
                    {cat.label}
                    {active && <span className={styles.chipTick}>✓</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 03 Describe the Issue ── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>03</span>
              <span className={styles.sectionTitle}>Describe the Issue</span>
              <span className={styles.charCount}>{description.length} chars</span>
            </div>

            <div className={styles.editorCard}>
              <Toolbar onFormat={handleFormat} />
              <textarea
                className={styles.editor}
                placeholder="Provide detailed description here… Include the date, time, exact location, and specific observations. The more detail, the faster the resolution."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
              />
            </div>
          </section>

          {/* ── Mobile-only widgets ── */}
          <div className={styles.mobileOnly}>
            <AIRadar score={aiScore} />
            <button
              className={`${styles.submitBtn} ${submitting ? styles.submitting : ''}`}
              onClick={handleSubmit}
              disabled={submitting || (description.trim().length === 0 && selectedCats.size === 0)}
            >
              {submitting
                ? <><span className={styles.spinner} /> Submitting…</>
                : <>Submit Report <span className={styles.arrow}>→</span></>}
            </button>
          </div>

        </div>
      </main>

      {/* ═══════════════════════════════════════════
          RIGHT WIDGET PANEL
      ═══════════════════════════════════════════ */}
      <aside className={styles.widgetPanel}>

        {/* W1: AI Radar */}
        <AIRadar score={aiScore} />

        {/* W2: Active reports */}
        <ActiveReports userName={displayName} complaints={complaints} />

        {/* W3: Submit button */}
        <div className={styles.submitWrap}>
          <button
            className={`${styles.submitBtn} ${submitting ? styles.submitting : ''}`}
            onClick={handleSubmit}
            disabled={submitting || (description.trim().length === 0 && selectedCats.size === 0)}
          >
            {submitting
              ? <><span className={styles.spinner} /> Submitting…</>
              : <>Submit Report <span className={styles.arrow}>→</span></>}
          </button>
          {description.trim().length === 0 && selectedCats.size === 0 && (
            <p className={styles.submitHint}>
              Add a description or pick a category to submit
            </p>
          )}
        </div>
      </aside>

    </div>
  );
}