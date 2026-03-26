'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { formatDate } from '@/app/lib/data';
import { PageHeader, StatusBadge, PriorityBadge, EmptyState } from '@/app/components/ui';
import type { ComplaintStatus } from '@/app/types';
import { useComplaints } from '@/app/hooks/useComplaints';

const STATUS_FILTERS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'archived',    label: 'Archived' },
];

const STATUS_DOT: Record<ComplaintStatus, string> = {
  open:        'var(--accent-orange)',
  in_progress: 'var(--accent-primary)',
  resolved:    'var(--accent-green)',
  archived:    '#64748b',
};

export default function TrackClient() {
  // Re-resolve tokens with the real logged-in user name on client
  const { session } = useAuth();
  const civilian    = session?.role === 'civilian' ? session : null;
  const userName    = civilian?.name ?? 'You';

  const { complaints: rawComplaints } = useComplaints();

  const userComplaints = useMemo(() => {
    return rawComplaints.filter(c => {
      const isMatch = (session?.email && c.civilianId === session?.email) ||
                      (session?.name && c.civilianName === session?.name);
      return isMatch;
    });
  }, [rawComplaints, session]);

  const resolved = useMemo(() => {
    return userComplaints.map(r => ({
      id: r.id,
      ticketId: r.id,
      title: r.description.length > 35 ? r.description.slice(0,35) + '...' : (r.categories[0] || 'Civic Issue'),
      category: r.categories.join(', ') || 'General',
      location: r.location ? `Lat: ${r.location.lat.toFixed(4)}, Lng: ${r.location.lng.toFixed(4)}` : r.region,
      status: r.status as ComplaintStatus,
      priority: r.severity.toLowerCase() as any, 
      submittedAt: r.timestamp,
      description: r.description,
      timeline: [
        { id: '1', action: 'Report Filed', description: 'System registered incoming report.', at: r.timestamp, by: r.civilianName || 'Civilian' },
        ...(r.status !== 'open' ? [{ id:'2', action: 'Status Update', description: `Report marked as ${r.status.replace('_', ' ')}`, at: new Date().toISOString(), by: 'Authority' }] : [])
      ],
      remarks: r.status === 'open' ? undefined : (r.status === 'resolved' ? 'Issue has been fully resolved.' : 'Task forces are evaluating the site.'),
      department: 'Civic Authority Portal',
      assignedTo: r.status === 'open' ? undefined : 'Field Operations Team',
      updatedAt: r.status !== 'open' ? new Date().toISOString() : r.timestamp,
      submittedBy: r.civilianName || 'Civilian'
    }));
  }, [rawComplaints, civilian]);

  const [filter,   setFilter]   = useState<ComplaintStatus | 'all'>('all');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return resolved.filter((c) => {
      const matchStatus = filter === 'all' || c.status === filter;
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.ticketId.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [resolved, filter, search]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: resolved.length };
    resolved.forEach((c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
    });
    return acc;
  }, [resolved]);

  return (
    <>
      <PageHeader
        title="My Complaints"
        subtitle={
          civilian?.name
            ? `Tracking all reports filed by ${civilian.name}`
            : 'Track all your filed civic complaints'
        }
      >
        <Link
          href="/civilian/report"
          style={{
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg,var(--accent-primary),#1d4ed8)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 12px var(--glow-blue)',
            whiteSpace: 'nowrap',
          }}
        >
          + New Report
        </Link>
      </PageHeader>

      {/* ── Filters bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        {/* Status pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`,
                  background: active ? 'var(--glow-blue)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: active ? 700 : 400,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
                {counts[f.value] !== undefined && (
                  <span style={{ marginLeft: 5, opacity: 0.65 }}>
                    ({counts[f.value]})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search complaints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: 30,
              paddingRight: 12,
              height: 36,
              background: 'var(--bg-input)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              width: 220,
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'; }}
            onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
          />
        </div>
      </div>

      {/* ── Complaints list ── */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No complaints found"
            description={
              search
                ? `No results for "${search}". Try a different search term.`
                : 'You have not filed any complaints yet.'
            }
            action={
              <Link
                href="/civilian/report"
                style={{
                  padding: '0.65rem 1.5rem',
                  background: 'linear-gradient(135deg,var(--accent-primary),#1d4ed8)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  textDecoration: 'none',
                }}
              >
                File Your First Report
              </Link>
            }
          />
        ) : (
          filtered.map((c, i) => (
            <div key={c.id}>
              {/* ── Row ── */}
              <div
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(expanded === c.id ? null : c.id)}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom:
                    i < filtered.length - 1 || expanded === c.id
                      ? '1px solid var(--border)'
                      : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  background: expanded === c.id ? 'var(--bg-subtle)' : 'transparent',
                  transition: 'background 0.15s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (expanded !== c.id)
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (expanded !== c.id)
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: STATUS_DOT[c.status],
                  }}
                />

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {c.ticketId}
                    </span>
                    <span>·</span>
                    <span>{c.category}</span>
                    <span>·</span>
                    <span>{formatDate(c.submittedAt)}</span>
                    <span>·</span>
                    <span>{c.location}</span>
                  </div>
                </div>

                {/* Badges + chevron */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0,
                  }}
                >
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      color: 'var(--text-muted)',
                      transition: 'transform 0.25s',
                      transform: expanded === c.id ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* ── Expanded detail ── */}
              {expanded === c.id && (
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: 'var(--bg-subtle)',
                    borderBottom:
                      i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    animation: 'fadeUp 0.2s ease both',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1.5rem',
                    }}
                  >
                    {/* Description + remarks */}
                    <div>
                      <p
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        Description
                      </p>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.65,
                        }}
                      >
                        {c.description}
                      </p>
                      {c.remarks && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '0.6rem 0.875rem',
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            color: '#ef4444',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>Authority Remarks:</strong> {c.remarks}
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div>
                      <p
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        Timeline
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {c.timeline.map((t, ti) => (
                          <div
                            key={t.id}
                            style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                flexShrink: 0,
                                marginTop: 4,
                                background:
                                  ti === c.timeline.length - 1
                                    ? 'var(--accent-primary)'
                                    : 'var(--border-strong)',
                              }}
                            />
                            <div>
                              <p
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {t.action}
                              </p>
                              <p
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--text-secondary)',
                                  lineHeight: 1.5,
                                }}
                              >
                                {t.description}
                              </p>
                              <p
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--text-muted)',
                                  marginTop: 2,
                                }}
                              >
                                {formatDate(t.at)} · by {t.by}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Meta footer */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {[
                      { label: 'Department', value: c.department, color: 'var(--accent-orange)' },
                      c.assignedTo
                        ? { label: 'Assigned to', value: c.assignedTo, color: 'var(--accent-primary)' }
                        : null,
                      { label: 'Last updated', value: formatDate(c.updatedAt), color: undefined },
                      { label: 'Filed by', value: c.submittedBy, color: 'var(--accent-primary)' },
                    ]
                      .filter(Boolean)
                      .map((m) => (
                        <div key={m!.label} style={{ fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{m!.label}: </span>
                          <span
                            style={{
                              color: m!.color ?? 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {m!.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}