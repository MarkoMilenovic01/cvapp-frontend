export type EmploymentType =
  | "INTERNSHIP"
  | "STUDENT_WORK"
  | "PART_TIME"
  | "FULL_TIME";

export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";

export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWED"
  | "SHORTLISTED"
  | "CONTACTED"
  | "REJECTED"
  | "ACCEPTED"
  | "WITHDRAWN";

export interface JobResponse {
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

export interface JobApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
  userId: number;
  cvId: number;
  cvFirstName: string;
  cvLastName: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface JobSearchFilter {
  keyword: string;
  location: string;
  employmentType: EmploymentType | "";
  workMode: WorkMode | "";
}

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

export interface JobRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: EmploymentType | "";
  workMode: WorkMode | "";
  deadline: string | null;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}