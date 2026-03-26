'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  COMPLAINT_CATEGORIES,
  CATEGORY_DEPARTMENT_MAP,
  generateTicketId,
} from '@/app/lib/data';
import { PageHeader } from '@/app/components/ui';
import type { ComplaintCategory, ComplaintPriority } from '@/app/types';
import exifr from 'exifr';
import { useComplaints } from '@/app/hooks/useComplaints';

// ─── Metadata exported separately (server-compatible) ────────────────────────
// Add this to a server page.tsx wrapper if needed.
// export const metadata: Metadata = { title: 'Submit Complaint' };

const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] =
  [
    { value: 'low',    label: 'Low',    color: '#22c55e' },
    { value: 'medium', label: 'Medium', color: '#f97316' },
    { value: 'high',   label: 'High',   color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' },
  ];

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg-input)',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '0.02em',
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{msg}</p>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const { session } = useAuth();
  const civilian = session?.role === 'civilian' ? session : null;
  const fileRef  = useRef<HTMLInputElement>(null);

  // Form state
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState<ComplaintCategory | ''>('');
  const [location,    setLocation]    = useState('');
  const [pincode,     setPincode]     = useState('');
  const [priority,    setPriority]    = useState<ComplaintPriority>('medium');
  const [files,       setFiles]       = useState<File[]>([]);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(false);
  const [ticket,      setTicket]      = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{lat: number, lng: number} | 'not_found' | null>(null);

  const { addComplaint } = useComplaints();

  const dept = category ? CATEGORY_DEPARTMENT_MAP[category as ComplaintCategory] : null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim() || title.length < 10)
      e.title = 'Title must be at least 10 characters';
    if (!description.trim() || description.length < 30)
      e.description = 'Description must be at least 30 characters';
    if (!category)
      e.category = 'Please select a category';
    if (!location.trim())
      e.location = 'Location is required';
    if (!/^\d{6}$/.test(pincode))
      e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    // TODO: Replace with real API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    
    const newId = generateTicketId();
    addComplaint({
      id: newId,
      civilianId: civilian?.email,
      civilianName: civilian?.name || 'Anonymous Citizen',
      categories: [category],
      description: description,
      location: detectedLocation !== 'not_found' ? detectedLocation : null,
      aiScore: 65
    });
    setTicket(newId);
  }, [title, description, category, location, pincode, addComplaint, civilian, detectedLocation]);

  const extractExif = async (filesArray: File[]) => {
    let found = false;
    for (const f of filesArray) {
      if (f.type.startsWith('image/')) {
        try {
          const gps = await exifr.gps(f);
          if (gps && gps.latitude && gps.longitude) {
            setDetectedLocation({ lat: gps.latitude, lng: gps.longitude });
            found = true;
            return; 
          }
        } catch(e) {
          console.error("EXIF parsing error:", e);
        }
      }
    }
    if (!found) setDetectedLocation('not_found');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dropped = Array.from(e.target.files || []).slice(0, 5);
    setFiles(dropped);
    if (dropped.length > 0) {
      extractExif(dropped);
    } else {
      setDetectedLocation(null);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (ticket) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '4rem auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'fadeUp 0.4s ease both',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(22,163,74,0.12)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '2rem',
          }}
        >
          ✓
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          Complaint Submitted!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {civilian?.name
            ? `${civilian.name}, your`
            : 'Your'}{' '}
          complaint has been registered and forwarded to the{' '}
          <strong>{dept}</strong> department.
        </p>
        <div
          style={{
            padding: '0.875rem 2.5rem',
            background: 'var(--glow-blue)',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--accent-primary)',
            letterSpacing: '0.05em',
          }}
        >
          {ticket}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Use this ticket ID to track your complaint status
        </p>
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/civilian/track')}
            style={{
              padding: '0.7rem 1.75rem',
              background: 'linear-gradient(135deg,var(--accent-primary),#1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              boxShadow: '0 3px 14px var(--glow-blue)',
            }}
          >
            Track My Complaint
          </button>
          <button
            onClick={() => {
              setTicket(null);
              setTitle(''); setDescription(''); setCategory('');
              setLocation(''); setPincode(''); setFiles([]);
            }}
            style={{
              padding: '0.7rem 1.75rem',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Submit Another
          </button>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="File a Complaint"
        subtitle={
          civilian?.name
            ? `Filing as ${civilian.name} — describe your civic issue clearly`
            : 'Describe your civic issue clearly for fast resolution'
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── Main form card ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Title */}
          <div>
            <FieldLabel>Complaint Title *</FieldLabel>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Brief title describing the issue (min 10 chars)"
              style={inputStyle(!!errors.title)}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--glow-blue)'; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.title ? '#ef4444' : 'var(--border)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
            />
            <ErrorMsg msg={errors.title} />
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category *</FieldLabel>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as ComplaintCategory); setErrors((p) => ({ ...p, category: '' })); }}
              style={{ ...inputStyle(!!errors.category), cursor: 'pointer', appearance: 'none' }}
              onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = 'var(--border-focus)'; (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px var(--glow-blue)'; }}
              onBlur={(e)  => { (e.target as HTMLSelectElement).style.borderColor = errors.category ? '#ef4444' : 'var(--border)'; (e.target as HTMLSelectElement).style.boxShadow = 'none'; }}
            >
              <option value="">Select issue category…</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {dept && (
              <p style={{ fontSize: '0.73rem', color: 'var(--accent-primary)', marginTop: 4 }}>
                → Will be routed to: <strong>{dept} Department</strong>
              </p>
            )}
            <ErrorMsg msg={errors.category} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>
              Description *{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                ({description.length}/500)
              </span>
            </FieldLabel>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value.slice(0, 500)); setErrors((p) => ({ ...p, description: '' })); }}
              placeholder="Describe the issue in detail — include date, time, observations, and impact on the public."
              rows={5}
              style={{ ...inputStyle(!!errors.description), resize: 'vertical' }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-focus)'; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px var(--glow-blue)'; }}
              onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = errors.description ? '#ef4444' : 'var(--border)'; (e.target as HTMLTextAreaElement).style.boxShadow = 'none'; }}
            />
            <ErrorMsg msg={errors.description} />
          </div>

          {/* Location + Pincode row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
            <div>
              <FieldLabel>Location / Address *</FieldLabel>
              <input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: '' })); }}
                placeholder="Street, Area, Landmark"
                style={inputStyle(!!errors.location)}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--glow-blue)'; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.location ? '#ef4444' : 'var(--border)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
              <ErrorMsg msg={errors.location} />
            </div>
            <div>
              <FieldLabel>Pincode *</FieldLabel>
              <input
                value={pincode}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => { setPincode(e.target.value.replace(/\D/, '')); setErrors((p) => ({ ...p, pincode: '' })); }}
                placeholder="110001"
                style={inputStyle(!!errors.pincode)}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--glow-blue)'; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = errors.pincode ? '#ef4444' : 'var(--border)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
              <ErrorMsg msg={errors.pincode} />
            </div>
          </div>

          {/* File upload */}
          <div>
            <FieldLabel>Evidence Attachments (optional)</FieldLabel>
            <label
              htmlFor="evidence-files"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100,
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'var(--bg-subtle)',
                gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--accent-primary)';
                (e.currentTarget as HTMLLabelElement).style.background = 'var(--glow-blue)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--border-strong)';
                (e.currentTarget as HTMLLabelElement).style.background = 'var(--bg-subtle)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📎</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {files.length > 0
                  ? files.map((f) => f.name).join(', ')
                  : 'Click to upload photos or documents (max 5 files)'}
              </span>
            </label>
            {detectedLocation === 'not_found' && (
              <div style={{ padding: '8px 12px', border: '1px dashed #ef4444', background: 'rgba(239,68,68,0.05)', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem', display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontWeight: 600 }}>📍 No GPS Found</span>
                 <span style={{ fontSize: '0.75rem' }}>Image lacks EXIF data</span>
              </div>
            )}
            {detectedLocation && detectedLocation !== 'not_found' && (
              <div style={{ padding: '8px 12px', border: '1px dashed #22c55e', background: 'rgba(34,197,94,0.05)', borderRadius: '6px', color: '#22c55e', fontSize: '0.8rem', display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontWeight: 600 }}>📍 GPS Attached</span>
                 <span style={{ fontSize: '0.75rem' }}>Lat: {detectedLocation.lat.toFixed(4)}, Lng: {detectedLocation.lng.toFixed(4)}</span>
              </div>
            )}
            <input
              id="evidence-files"
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              height: 52,
              background: loading
                ? 'var(--bg-subtle)'
                : 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)',
              color: loading ? 'var(--text-muted)' : 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: loading ? 'none' : '0 4px 18px var(--glow-blue)',
              transition: 'all 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid var(--border)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Submitting…
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Priority selector */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.875rem',
              }}
            >
              Priority Level
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  style={{
                    padding: '0.6rem 0.875rem',
                    background: priority === p.value ? `${p.color}14` : 'transparent',
                    border: `1.5px solid ${priority === p.value ? p.color : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: priority === p.value ? p.color : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: priority === p.value ? 700 : 400,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips card */}
          <div
            style={{
              background: 'rgba(37,99,235,0.05)',
              border: '1px solid rgba(37,99,235,0.12)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                marginBottom: '0.75rem',
              }}
            >
              💡 Filing Tips
            </h3>
            {[
              'Be specific about the exact location',
              'Attach photos for faster resolution',
              'Set the correct priority level',
              'Keep your description factual',
              'Mention how many people are affected',
            ].map((tip) => (
              <div
                key={tip}
                style={{
                  display: 'flex',
                  gap: 8,
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: 1 }}>
                  ✓
                </span>
                {tip}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}
            >
              Quick Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/civilian/report', label: '🎯 Command Center (with AI)' },
                { href: '/civilian/track',  label: '📍 Track My Complaints' },
                { href: '/civilian/dashboard', label: '🏠 Dashboard' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    padding: '4px 0',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input:focus, select:focus, textarea:focus {
          border-color: var(--border-focus) !important;
          box-shadow: 0 0 0 3px var(--glow-blue) !important;
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 140px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}