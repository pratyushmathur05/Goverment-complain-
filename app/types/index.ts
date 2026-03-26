// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = 'civilian' | 'admin';

export type AuthTab = 'login' | 'signup';

export type LoginMethod = 'email' | 'aadhaar' | 'google' | 'employeeId';

export interface CivilianUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  aadhaarLinked: boolean;
  createdAt: string;
  role: 'civilian';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: Department;
  role: 'admin';
  permissions: AdminPermission[];
  createdAt: string;
}

export type User = CivilianUser | AdminUser;

export type AdminPermission =
  | 'view_complaints'
  | 'update_status'
  | 'assign_complaints'
  | 'view_analytics'
  | 'manage_users';

// ─── Complaint Types ──────────────────────────────────────────────────────────

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'archived';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Department =
  | 'PWD'
  | 'Municipal'
  | 'Water'
  | 'Electricity'
  | 'Sanitation'
  | 'Police'
  | 'Health'
  | 'Education'
  | 'Transport'
  | 'Other';

export type ComplaintCategory =
  | 'Roads & Infrastructure'
  | 'Water Supply'
  | 'Electricity'
  | 'Sanitation & Waste'
  | 'Public Safety'
  | 'Health Services'
  | 'Education'
  | 'Public Transport'
  | 'Parks & Recreation'
  | 'Noise Pollution'
  | 'Illegal Construction'
  | 'Other';

export interface Complaint {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department: Department;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location: string;
  pincode: string;
  attachments?: string[];
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
  assignedTo?: string;
  remarks?: string;
  timeline: ComplaintEvent[];
}

export interface ComplaintEvent {
  id: string;
  action: string;
  description: string;
  by: string;
  at: string;
  status?: ComplaintStatus;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface AnalyticsData {
  byCategory: { category: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  byStatus: { status: string; count: number; color: string }[];
  monthly: { month: string; submitted: number; resolved: number }[];
  avgResolutionDays: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CivilianLoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export interface CivilianSignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AdminLoginForm {
  identifier: string; // email or employee ID
  password: string;
  twoFactorCode?: string;
}

export interface AdminSignupForm {
  name: string;
  email: string;
  employeeId: string;
  department: Department;
  password: string;
  confirmPassword: string;
  adminSecret: string;
}

export interface ComplaintSubmitForm {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  pincode: string;
  priority: ComplaintPriority;
  attachments?: File[];
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';