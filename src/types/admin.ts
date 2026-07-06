import type { Role } from "./auth";
import type { EmploymentType, WorkMode } from "./job";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalCompanies: number;
  totalCVs: number;
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalApplications: number;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  role: Role;
  enabled: boolean;
  provider: string;
  createdAt: string;
}

export interface ChangeRoleRequest {
  role: Role;
}

export interface AdminCompanyResponse {
  id: number;
  userId: number;
  email: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface AdminJobResponse {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  deadline: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteRequest {
  email: string;
  companyName: string;
}