import type {
  Complaint, ComplaintStatus, ComplaintPriority,
  DashboardStats, AnalyticsData, Department, ComplaintCategory,
} from '../types';

// ─── Mock Complaints ──────────────────────────────────────────────────────────
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1', ticketId: 'CCP-2024-001',
    title: 'Pothole on MG Road near Signal 4',
    description: 'Large pothole causing accidents. Needs immediate repair.',
    category: 'Roads & Infrastructure', department: 'PWD',
    status: 'in_progress', priority: 'high',
    location: 'MG Road, Near Signal 4', pincode: '560001',
    submittedBy: '__current_user__', submittedAt: '2024-11-10T09:30:00Z',
    updatedAt: '2024-11-12T14:00:00Z', assignedTo: 'PWD Team B',
    timeline: [
      { id: 't1', action: 'Complaint Submitted', description: 'Complaint registered successfully.', by: '__current_user__', at: '2024-11-10T09:30:00Z', status: 'open' },
      { id: 't2', action: 'Assigned', description: 'Assigned to PWD Team B for inspection.', by: 'Admin Singh', at: '2024-11-11T10:00:00Z', status: 'in_progress' },
    ],
  },
  {
    id: '2', ticketId: 'CCP-2024-002',
    title: 'No water supply in Sector 14 for 3 days',
    description: 'Entire sector has no water. Pipeline may be broken.',
    category: 'Water Supply', department: 'Water',
    status: 'open', priority: 'urgent',
    location: 'Sector 14, Block C', pincode: '110001',
    submittedBy: '__current_user__', submittedAt: '2024-11-13T07:15:00Z',
    updatedAt: '2024-11-13T07:15:00Z',
    timeline: [
      { id: 't1', action: 'Complaint Submitted', description: 'Complaint registered.', by: '__current_user__', at: '2024-11-13T07:15:00Z', status: 'open' },
    ],
  },
  {
    id: '3', ticketId: 'CCP-2024-003',
    title: 'Street lights not working on Park Avenue',
    description: '6 consecutive street lights have been out for 2 weeks. Safety concern.',
    category: 'Electricity', department: 'Electricity',
    status: 'resolved', priority: 'medium',
    location: 'Park Avenue, Lane 3', pincode: '400001',
    submittedBy: '__current_user__', submittedAt: '2024-10-28T18:00:00Z',
    updatedAt: '2024-11-05T11:30:00Z',
    timeline: [
      { id: 't1', action: 'Complaint Submitted', description: 'Complaint registered.', by: '__current_user__', at: '2024-10-28T18:00:00Z', status: 'open' },
      { id: 't2', action: 'Work Completed', description: 'All 6 lights replaced and operational.', by: 'Electricity Dept', at: '2024-11-05T11:30:00Z', status: 'resolved' },
    ],
  },
  {
    id: '4', ticketId: 'CCP-2024-004',
    title: 'Garbage not collected for 5 days',
    description: 'Garbage bins overflowing. Health hazard created.',
    category: 'Sanitation & Waste', department: 'Sanitation',
    status: 'open', priority: 'high',
    location: 'Nehru Nagar, Block 7', pincode: '226001',
    submittedBy: '__current_user__', submittedAt: '2024-11-12T08:45:00Z',
    updatedAt: '2024-11-12T08:45:00Z',
    timeline: [
      { id: 't1', action: 'Complaint Submitted', description: 'Complaint registered.', by: '__current_user__', at: '2024-11-12T08:45:00Z', status: 'open' },
    ],
  },
  {
    id: '5', ticketId: 'CCP-2024-005',
    title: 'Illegal construction blocking road',
    description: 'Construction debris blocking 60% of road width.',
    category: 'Illegal Construction', department: 'Municipal',
    status: 'rejected', priority: 'medium',
    location: 'Gandhi Market Road', pincode: '302001',
    submittedBy: '__current_user__', submittedAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-08T09:00:00Z',
    remarks: 'Construction has valid permit. Road width complies with norms.',
    timeline: [
      { id: 't1', action: 'Complaint Submitted', description: 'Complaint registered.', by: '__current_user__', at: '2024-11-01T10:00:00Z', status: 'open' },
      { id: 't2', action: 'Rejected', description: 'Construction has valid municipal permit.', by: 'Municipal Admin', at: '2024-11-08T09:00:00Z', status: 'rejected' },
    ],
  },
];

export const MOCK_STATS: DashboardStats = {
  total: 1284,
  open: 342,
  inProgress: 198,
  resolved: 694,
  rejected: 50,
};

export const MOCK_ANALYTICS: AnalyticsData = {
  byCategory: [
    { category: 'Roads', count: 312 },
    { category: 'Water', count: 245 },
    { category: 'Sanitation', count: 198 },
    { category: 'Electricity', count: 167 },
    { category: 'Safety', count: 134 },
    { category: 'Other', count: 228 },
  ],
  byDepartment: [
    { department: 'PWD', count: 298 },
    { department: 'Municipal', count: 276 },
    { department: 'Water', count: 234 },
    { department: 'Electricity', count: 156 },
    { department: 'Sanitation', count: 187 },
    { department: 'Police', count: 133 },
  ],
  byStatus: [
    { status: 'Open', count: 342, color: '#f97316' },
    { status: 'In Progress', count: 198, color: '#2563eb' },
    { status: 'Resolved', count: 694, color: '#16a34a' },
    { status: 'Rejected', count: 50, color: '#dc2626' },
  ],
  monthly: [
    { month: 'Jun', submitted: 89, resolved: 72 },
    { month: 'Jul', submitted: 112, resolved: 95 },
    { month: 'Aug', submitted: 134, resolved: 118 },
    { month: 'Sep', submitted: 98, resolved: 89 },
    { month: 'Oct', submitted: 156, resolved: 134 },
    { month: 'Nov', submitted: 143, resolved: 121 },
  ],
  avgResolutionDays: 4.7,
};

// ─── Constants ────────────────────────────────────────────────────────────────
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Roads & Infrastructure', 'Water Supply', 'Electricity',
  'Sanitation & Waste', 'Public Safety', 'Health Services',
  'Education', 'Public Transport', 'Parks & Recreation',
  'Noise Pollution', 'Illegal Construction', 'Other',
];

export const DEPARTMENTS: Department[] = [
  'PWD', 'Municipal', 'Water', 'Electricity',
  'Sanitation', 'Police', 'Health', 'Education', 'Transport', 'Other',
];

export const CATEGORY_DEPARTMENT_MAP: Record<ComplaintCategory, Department> = {
  'Roads & Infrastructure': 'PWD',
  'Water Supply': 'Water',
  'Electricity': 'Electricity',
  'Sanitation & Waste': 'Sanitation',
  'Public Safety': 'Police',
  'Health Services': 'Health',
  'Education': 'Education',
  'Public Transport': 'Transport',
  'Parks & Recreation': 'Municipal',
  'Noise Pollution': 'Municipal',
  'Illegal Construction': 'Municipal',
  'Other': 'Other',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getStatusColor(status: ComplaintStatus): string {
  const map: Record<ComplaintStatus, string> = {
    open: 'var(--status-open)',
    in_progress: 'var(--status-progress)',
    resolved: 'var(--status-resolved)',
    rejected: 'var(--status-rejected)',
  };
  return map[status];
}

export function getStatusBg(status: ComplaintStatus): string {
  const map: Record<ComplaintStatus, string> = {
    open: 'var(--status-open-bg)',
    in_progress: 'var(--status-progress-bg)',
    resolved: 'var(--status-resolved-bg)',
    rejected: 'var(--status-rejected-bg)',
  };
  return map[status];
}

export function getPriorityColor(priority: ComplaintPriority): string {
  const map: Record<ComplaintPriority, string> = {
    low: '#22c55e',
    medium: '#f97316',
    high: '#ef4444',
    urgent: '#dc2626',
  };
  return map[priority];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `CCP-${year}-${num}`;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function maskAadhaar(val: string): string {
  return val.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Resolves '__current_user__' tokens in complaint data to the logged-in
 * user's real name. Call this in client components after reading session.
 */
export function resolveComplaints(
  complaints: Complaint[],
  userName: string,
): Complaint[] {
  return complaints.map((c) => ({
    ...c,
    submittedBy: c.submittedBy === '__current_user__' ? userName : c.submittedBy,
    timeline: c.timeline.map((t) => ({
      ...t,
      by: t.by === '__current_user__' ? userName : t.by,
    })),
  }));
}