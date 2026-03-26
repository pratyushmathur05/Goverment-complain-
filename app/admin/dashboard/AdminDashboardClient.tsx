'use client';

import { useState, useMemo } from 'react';
import { Search, Bell, Settings, LogOut, ShieldAlert, ChevronDown, MapPin, Download } from 'lucide-react';
import styles from './admin-dashboard.module.css';
import { useRouter } from 'next/navigation';
import { useComplaints, REGIONS } from '@/app/hooks/useComplaints';
import { useAuth } from '@/app/context/AuthContext'; 

export default function AdminDashboardClient() {
  const router = useRouter();
  const { session, isLoggedIn } = useAuth();
  const { complaints, updateComplaint, isLoaded } = useComplaints();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const filteredComplaints = useMemo(() => {
    let list = complaints;
    if (regionFilter !== 'All') {
      list = list.filter(c => c.region === regionFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }, [complaints, regionFilter, search]);

  // If loading or unauthorized, show a simple transition (AFTER hooks)
  if (!isLoaded || (isLoggedIn && !session)) {
    return (
      <div style={{ height: '70vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Synchronizing Authority Feed...</div>
      </div>
    );
  }

  const handleGenerateReport = () => {
    const csvContext = [
      ['ID', 'Status', 'Severity', 'Region', 'Category', 'Date', 'Description'],
      ...filteredComplaints.map(c => [
        c.id, c.status, c.severity, c.region, c.categories.join(';'), new Date(c.timestamp).toLocaleString(), `"${c.description.replace(/"/g, '""')}"`
      ])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContext], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Complaint_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRegionPos = (region: string, i: number) => {
    // Basic hash to jitter overlapping pins
    const jitterX = (i * 7 % 20) - 10;
    const jitterY = (i * 11 % 20) - 10;
    switch(region) {
      case 'North Region': return { top: `${25 + jitterY}%`, left: `${50 + jitterX}%` };
      case 'South District': return { top: `${75 + jitterY}%`, left: `${50 + jitterX}%` };
      case 'East Zone': return { top: `${50 + jitterY}%`, left: `${75 + jitterX}%` };
      case 'West District': return { top: `${50 + jitterY}%`, left: `${25 + jitterX}%` };
      case 'Central Hub':
      default: return { top: `${50 + jitterY}%`, left: `${50 + jitterX}%` };
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* ─── Global Nav Bar ─── */}
      <header className={styles.navBar}>
        <div className={styles.navLeft}>
          <div className={styles.brand}>
            <ShieldAlert size={20} color="#3b82f6" />
            <span>Admin Command Center</span>
          </div>
          
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
               type="text" 
               placeholder="Search Incidents" 
               className={styles.searchInput}
               value={search}
               onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div style={{ position: 'relative' }}>
             <select 
               value={regionFilter} 
               onChange={e => setRegionFilter(e.target.value)}
               className={styles.navLink}
               style={{ background: 'transparent', border: '1px solid var(--border)', outline: 'none', appearance: 'none', paddingRight: '20px', borderRadius: '4px' }}
             >
                <option value="All" style={{color: 'black'}}>All Regions</option>
                {REGIONS.map(r => <option key={r} value={r} style={{color: 'black'}}>{r}</option>)}
             </select>
          </div>
          
          <button className={styles.navLink} onClick={handleGenerateReport} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Generate Report
          </button>
        </div>

        <div className={styles.navRight}>
          <button className={styles.iconBtn}>
            <Bell size={18} />
            <span className={styles.navLink}>System Alerts</span>
            <div className={styles.notificationPing} />
            <div className={styles.pingAnim} />
          </button>
          
          <button className={styles.iconBtn}>
            <Settings size={18} />
            <span className={styles.navLink}>User Settings</span>
          </button>

          <button className={styles.iconBtn} onClick={() => router.push('/auth')}>
            <LogOut size={18} />
            <span className={styles.navLink}>Logout</span>
          </button>
        </div>
      </header>

      <main className={styles.mainLayout}>
        
        {/* ─── Severity Heat Map Canvas ─── */}
        <div className={styles.mapCanvas}>
          <div className={styles.mapOverlay} />
          
          <div className={styles.mapHeader}>
            <h2 className={styles.mapTitle}>Severity Heat Map</h2>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Indore Region Active Events</div>
          </div>

          {/* Map Nodes (Dynamic) */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, pointerEvents: 'none' }}>
            Indore
          </div>

          {filteredComplaints.filter(c => c.status !== 'resolved' && c.status !== 'archived').map((incident, i) => {
            const isCrit = incident.severity === 'High';
            const isMed = incident.severity === 'Medium';
            const accentColor = isCrit ? '#FF3131' : isMed ? '#FF8C00' : '#00E5FF';
            let { top, left } = getRegionPos(incident.region, i);
            
            // Override with actual GPS if available
            if (incident.location) {
               // Pseudo projection mapping for Indore (approx bounding box mapping to 10-90% coords)
               const baseLat = 28.6; // Assuming generic base offset for demo
               const baseLng = 77.2;
               const jitterY = (incident.location.lat - baseLat) * 1000;
               const jitterX = (incident.location.lng - baseLng) * 1000;
               top = `${Math.min(90, Math.max(10, 50 - jitterY))}%`;
               left = `${Math.min(90, Math.max(10, 50 + jitterX))}%`;
            }

            return (
               <div key={`pin-${incident.id}`}>
                 {isCrit && <div className={styles.heatCluster} style={{ top, left, width: '150px', height: '150px', background: `radial-gradient(circle, ${accentColor}aa 0%, rgba(255,49,49,0) 70%)` }} />}
                 <div className={styles.mapPin} style={{ top, left }}>
                   <MapPin size={isCrit ? 28 : 24} color={accentColor} fill={isCrit ? 'rgba(255,49,49,0.2)' : 'none'} />
                   <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold', marginTop: 4, textShadow: '0 2px 4px #000' }}>{incident.region.split(' ')[0]}</div>
                 </div>
               </div>
            );
          })}
        </div>

        {/* ─── Incident Queue Sidebar ─── */}
        <aside className={styles.queueSidebar}>
          <div className={styles.queueHeader}>
            <div className={styles.queueTitle}>Incident Queue</div>
            <select className={styles.queueFilter}>
              <option>Filter by Severity: High {'>'} Low</option>
              <option>Filter by Time: Newest First</option>
            </select>
          </div>

          <div className={styles.queueList}>
            {filteredComplaints.length === 0 && <div style={{padding: '2rem', color: '#94a3b8', textAlign: 'center'}}>No incidents found.</div>}
            {filteredComplaints.map((incident) => {
              const isCrit = incident.severity === 'High';
              const isMed = incident.severity === 'Medium';
              
              const tagClass = isCrit ? styles.tagCritical : isMed ? styles.tagMedium : styles.tagLow;
              const accentColor = isCrit ? '#FF3131' : isMed ? '#FF8C00' : '#00E5FF';

              return (
                <div key={incident.id} className={styles.incidentCard} style={{ opacity: incident.status === 'resolved' || incident.status === 'archived' ? 0.6 : 1 }}>
                  <div className={styles.cardAccent} style={{ background: accentColor }} />
                  
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.incidentId}>{incident.id}</div>
                      <div className={styles.incidentName}>{incident.categories[0] || 'Civic Issue'}</div>
                    </div>
                    <div className={`${styles.severityTag} ${tagClass}`}>
                      {incident.severity}
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <span>{incident.region}</span>
                    <span>{new Date(incident.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                   <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {incident.description}
                   </div>

                   {Date.now() - Date.parse(incident.timestamp) < 300000 && (
                     <div style={{ padding: '4px 8px', background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', borderRadius: '4px', color: '#3b82f6', fontSize: '0.65rem', fontWeight: 800, marginBottom: '10px', display: 'inline-block', animation: 'adminPulse 2s infinite' }}>
                       NEW INCIDENT
                     </div>
                   )}

                  <div className={styles.actionEngine}>
                    <button className={styles.btnPrimary} style={{ background: incident.status === 'in_progress' ? '#eab308' : incident.status === 'resolved' ? '#22c55e' : '' }}>
                      {incident.status === 'open' ? 'Manual Review' : incident.status.replace('_', ' ').toUpperCase()}
                    </button>
                    
                    <div className={styles.dropdownWrap}>
                      <button className={styles.dropdownBtn} onClick={() => toggleDropdown(incident.id)}>
                        Action <ChevronDown size={14} />
                      </button>
                      
                      {openDropdown === incident.id && (
                        <div className={styles.dropdownMenu}>
                          {incident.status !== 'in_progress' && <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { status: 'in_progress' }); setOpenDropdown(null); }}>Mark In-Progress</button>}
                          {incident.status !== 'resolved' && <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { status: 'resolved' }); setOpenDropdown(null); }} style={{ color: '#4ade80' }}>Mark as Resolved</button>}
                          <div className={styles.dropdownDivider} />
                          <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { severity: 'High' }); setOpenDropdown(null); }}>Set Priority: High</button>
                          <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { severity: 'Medium' }); setOpenDropdown(null); }}>Set Priority: Medium</button>
                          <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { severity: 'Low' }); setOpenDropdown(null); }}>Set Priority: Low</button>
                          <div className={styles.dropdownDivider} />
                          <button className={styles.dropdownItem} onClick={() => { updateComplaint(incident.id, { status: 'archived' }); setOpenDropdown(null); }}>Archive Report</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </main>
      <style>{`
        @keyframes adminPulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}