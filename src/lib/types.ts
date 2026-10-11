// Domain types. Field names mirror the PostgreSQL schema in /database/schema.sql
// (camelCase here, snake_case in the database) so a REST backend can be plugged in later.

export type Role = "citizen" | "admin";

export type CategoryKey =
  | "pothole"
  | "garbage"
  | "streetlight"
  | "water"
  | "drain"
  | "safety"
  | "other";

export type Priority = "critical" | "high" | "medium" | "low";

export type Status =
  | "reported"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "reopened";

export type DeptKey =
  | "roads"
  | "sanitation"
  | "electricity"
  | "water"
  | "drainage"
  | "emergency"
  | "general";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  ward: string;
  designation?: string;
}

/** complaint_updates table */
export interface ComplaintUpdate {
  id: string;
  status: Status | "confirmed";
  message: string;
  timestamp: string;
}

/** resolution_evidence table */
export interface ResolutionEvidence {
  beforeImage: string;
  afterImage: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  note?: string;
}

/** complaints table */
export interface Complaint {
  id: string;
  complaintNumber: string;
  userId: string;
  category: CategoryKey;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  priority: Priority;
  status: Status;
  department: DeptKey;
  createdAt: string;
  updatedAt: string;
  // Extras used by the prototype
  reportCount: number; // how many citizens reported the same civic case
  followers: string[]; // user ids that confirmed an existing issue
  updates: ComplaintUpdate[];
  evidence?: ResolutionEvidence;
  confirmed?: boolean;
  aiConfidence?: number;
  autoAdvance?: boolean; // prototype: simulate AI verification + routing after submit
}

export type NotificationType =
  | "submitted"
  | "verified"
  | "assigned"
  | "started"
  | "resolved"
  | "reopened"
  | "confirmed"
  | "new_report";

export interface AppNotification {
  id: string;
  type: NotificationType;
  complaintNumber?: string;
  complaintId?: string;
  timestamp: string;
  read: boolean;
  audience: Role;
  userId?: string;
  extra?: string;
}

export type ToastKind = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

export interface NewComplaintInput {
  category: CategoryKey;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  priority: Priority;
  department: DeptKey;
  aiConfidence: number;
}

export interface Analysis {
  detected: CategoryKey;
  confidence: number;
  priority: Priority;
  severity: Priority;
  department: DeptKey;
  ruleEn: string;
  ruleHi: string;
  duplicate?: { complaint: Complaint; distance: number };
  area: string;
}
