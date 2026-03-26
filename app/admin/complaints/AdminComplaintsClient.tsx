'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/app/lib/data';
import { PageHeader, StatusBadge, PriorityBadge } from '@/app/components/ui';
import type { Complaint, ComplaintStatus } from '@/app/types';
import { useComplaints } from '@/app/hooks/useComplaints';

const STATUS_OPTIONS: ComplaintStatus[] = ['open', 'in_progress', 'resolved', 'archived'];

export default function AdminComplaintsClient() {
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<ComplaintStatus | 'all'>('all');
  const [updating, setUpdating]     = useState<string | null>(null);

  const { complaints: rawComplaints, updateComplaint: setComplaintDb } = useComplaints();

  const formattedComplaints = useMemo(() => {
    return rawComplaints.map(r => ({
      id: r.id,
      ticketId: r.id,
      title: r.description.length > 35 ? r.description.slice(0,35) + '...' : (r.categories[0] || 'Civic Issue'),
      category: r.categories.join(', ') || 'General',
      location: r.location ? `Lat: ${r.location.lat.toFixed(4)}, Lng: ${r.location.lng.toFixed(4)}` : r.region,
      status: r.status as ComplaintStatus,
      priority: r.severity.toLowerCase() as any, 
      submittedAt: r.timestamp,
      description: r.description,
      department: 'Civic Authority Portal',
      assignedTo: r.status === 'open' ? undefined : 'Field Operations Team',
      updatedAt: r.status !== 'open' ? new Date().toISOString() : r.timestamp,
    }));
  }, [rawComplaints]);

  const filtered = useMemo(() => formattedComplaints.filter((c) => {
    const matchStatus = filter === 'all' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.ticketId.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [formattedComplaints, filter, search]);

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    setUpdating(id);
    await new Promise((r) => setTimeout(r, 400));
    setComplaintDb(id, { status });
    setUpdating(null);
  };

  const updateSeverity = async (id: string, severity: 'High' | 'Medium' | 'Low') => {
    setUpdating(id);
    await new Promise((r) => setTimeout(r, 400));
    setComplaintDb(id, { severity });
    setUpdating(null);
  };

  const updateAssignment = async (id: string, team: string) => {
    setUpdating(id);
    await new Promise((r) => setTimeout(r, 400));
    // Implementation of assignment could be more complex, but for now we just track it
    setUpdating(null);
  };

  return (
    <>
      <PageHeader title="Manage Complaints"
        subtitle={`${formattedComplaints.length} total · ${formattedComplaints.filter((c) => c.status === 'open').length} open`}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input placeholder="Search…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px', height: 36,
              background: 'var(--bg-input)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: '0.82rem', fontFamily: 'var(--font-body)', outline: 'none', width: 180,
            }} />
          <select value={filter} onChange={(e) => setFilter(e.target.value as ComplaintStatus | 'all')}
            style={{
              padding: '6px 10px', height: 36,
              background: 'var(--bg-input)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: '0.82rem', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer',
            }}>
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((c) => (
          <div key={c.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: `3px solid ${
              c.status === 'open'        ? 'var(--accent-orange)'  :
              c.status === 'in_progress' ? 'var(--accent-primary)' :
              c.status === 'resolved'    ? 'var(--accent-green)'   : '#6b7280'
            }`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                    {c.title}
                  </span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)',
                  marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{c.ticketId}</span>
                  <span>·</span><span>{c.category}</span>
                  <span>·</span><span>{c.location}</span>
                  <span>·</span><span>Filed {formatDate(c.submittedAt)}</span>
                  <span>·</span>
                  <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{c.department}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)',
                  marginTop: 6, lineHeight: 1.5 }}>
                  {c.description.slice(0, 160)}{c.description.length > 160 ? '…' : ''}
                </p>
              </div>

              {/* Status update control */}
              <div style={{ display: 'flex', flexDirection: 'column',
                alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                <StatusBadge status={c.status} />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value as ComplaintStatus)}
                    disabled={updating === c.id}
                    style={{
                      padding: '5px 8px',
                      background: 'var(--bg-input)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer', outline: 'none',
                      opacity: updating === c.id ? 0.5 : 1,
                    }}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.priority.charAt(0).toUpperCase() + c.priority.slice(1)}
                    onChange={(e) => updateSeverity(c.id, e.target.value as any)}
                    disabled={updating === c.id}
                    style={{
                      padding: '5px 8px',
                      background: 'var(--bg-input)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer', outline: 'none',
                      opacity: updating === c.id ? 0.5 : 1,
                    }}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                {updating === c.id && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)' }}>
                    Updating…
                  </span>
                )}
              </div>
            </div>

            {/* Assigned to */}
            {c.assignedTo && (
              <div style={{ marginTop: 10, paddingTop: 10,
                borderTop: '1px solid var(--border)',
                fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                <span>Assigned: <strong style={{ color: 'var(--text-primary)' }}>{c.assignedTo}</strong></span>
                <span>Last update: {formatDate(c.updatedAt)}</span>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</p>
            <p>No complaints match your filter.</p>
          </div>
        )}
      </div>
    </>
  );
}