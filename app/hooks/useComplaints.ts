'use client';

import { useState, useEffect, useCallback } from 'react';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'archived';
export type ComplaintSeverity = 'High' | 'Medium' | 'Low';

export interface ComplaintRecord {
  id: string;
  civilianId?: string;
  civilianName?: string;
  categories: string[];
  description: string;
  location: { lat: number; lng: number } | null;
  status: ComplaintStatus;
  severity: ComplaintSeverity;
  region: string;
  timestamp: string; // ISO date string
  aiScore: number;
}

const STORAGE_KEY = 'ccp_complaints_db';
export const REGIONS = ['North Region', 'South District', 'East Zone', 'West District', 'Central Hub'];

export function useComplaints() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  const loadComplaints = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setComplaints(JSON.parse(stored));
      } else {
        // Pre-populate with mock data if empty
        const initialMap: ComplaintRecord[] = [
          {
            id: 'CCP-2024-091',
            civilianName: 'John Doe',
            categories: ['Potholes'],
            description: 'Massive pothole causing traffic slowdowns and vehicle damage.',
            location: { lat: 28.6139, lng: 77.2090 },
            status: 'in_progress',
            severity: 'High',
            region: 'Central Hub',
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
            aiScore: 85
          },
          {
            id: 'CCP-2024-088',
            civilianName: 'Alice Smith',
            categories: ['Garbage'],
            description: 'Garbage overflow in Sector 14 near the public park.',
            location: { lat: 28.5355, lng: 77.1520 },
            status: 'open',
            severity: 'Low',
            region: 'South District',
            timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
            aiScore: 60
          },
          {
            id: 'CCP-2024-071',
            civilianName: 'Vikram Patel',
            categories: ['Water Issue'],
            description: 'No water supply in Block C since morning.',
            location: { lat: 28.7041, lng: 77.1025 },
            status: 'resolved',
            severity: 'High',
            region: 'North Region',
            timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
            aiScore: 92
          }
        ];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMap));
        setComplaints(initialMap);
      }
    } catch (e) {
      console.error('Failed to load storage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadComplaints();
    
    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadComplaints();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadComplaints]);

  // Listen for local-storage-sync within same tab
  useEffect(() => {
    const handleLocal = () => loadComplaints();
    window.addEventListener('local-storage-sync', handleLocal);
    return () => window.removeEventListener('local-storage-sync', handleLocal);
  }, [loadComplaints]);

  // Actions
  const addComplaint = useCallback((newRecord: Omit<ComplaintRecord, 'status' | 'timestamp' | 'severity' | 'region'>) => {
    let severity: ComplaintSeverity = 'Low';
    if (newRecord.aiScore >= 70 || newRecord.categories.includes('Authority Misconduct')) severity = 'High';
    else if (newRecord.aiScore >= 40) severity = 'Medium';

    const calcRegion = REGIONS[Math.floor(Math.random() * REGIONS.length)];

    const fullRecord: ComplaintRecord = {
      ...newRecord,
      status: 'open',
      timestamp: new Date().toISOString(),
      severity,
      region: calcRegion
    };

    setComplaints(prev => {
      const next = [fullRecord, ...prev];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('local-storage-sync'));
      return next;
    });
  }, []);

  const updateComplaint = useCallback((id: string, updates: Partial<ComplaintRecord>) => {
    setComplaints(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('local-storage-sync'));
      return next;
    });
  }, []);

  return {
    complaints,
    isLoaded,
    addComplaint,
    updateComplaint
  };
}
