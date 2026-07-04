import { apiRequest } from "./apiClient";
import type {
  JobApplicationResponse,
  JobResponse,
  JobSearchFilter,
  PageResponse,
  JobRequest,
  UpdateApplicationStatusRequest
} from "../types/job";

function getToken() {
  return localStorage.getItem("accessToken");
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export function getAllActiveJobs(
  page = 0,
  size = 10
): Promise<PageResponse<JobResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<JobResponse>>(`/api/jobs${query}`, {
    method: "GET",
    token: getToken(),
  });
}

export function getActiveJobById(id: number): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/jobs/${id}`, {
    method: "GET",
    token: getToken(),
  });
}

export function searchJobs(
  filter: JobSearchFilter,
  page = 0,
  size = 10
): Promise<PageResponse<JobResponse>> {
  const query = buildQuery({
    keyword: filter.keyword,
    location: filter.location,
    employmentType: filter.employmentType,
    workMode: filter.workMode,
    page,
    size,
  });

  return apiRequest<PageResponse<JobResponse>>(`/api/jobs/search${query}`, {
    method: "GET",
    token: getToken(),
  });
}

export function applyToJob(jobId: number): Promise<JobApplicationResponse> {
  return apiRequest<JobApplicationResponse>(
    `/api/user/applications/jobs/${jobId}/apply`,
    {
      method: "POST",
      token: getToken(),
    }
  );
}

export function getMyApplications(): Promise<JobApplicationResponse[]> {
  return apiRequest<JobApplicationResponse[]>("/api/user/applications", {
    method: "GET",
    token: getToken(),
  });
}

export function withdrawApplication(applicationId: number): Promise<void> {
  return apiRequest<void>(`/api/user/applications/${applicationId}`, {
    method: "DELETE",
    token: getToken(),
  });
}


export function createCompanyJob(request: JobRequest): Promise<JobResponse> {
  return apiRequest<JobResponse>("/api/company/jobs", {
    method: "POST",
    body: request,
    token: getToken(),
  });
}

export function getMyCompanyJobs(
  page = 0,
  size = 10
): Promise<PageResponse<JobResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<JobResponse>>(`/api/company/jobs${query}`, {
    method: "GET",
    token: getToken(),
  });
}

export function getMyCompanyJobById(id: number): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/company/jobs/${id}`, {
    method: "GET",
    token: getToken(),
  });
}

export function updateCompanyJob(
  id: number,
  request: JobRequest
): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/company/jobs/${id}`, {
    method: "PUT",
    body: request,
    token: getToken(),
  });
}

export function deleteCompanyJob(id: number): Promise<void> {
  return apiRequest<void>(`/api/company/jobs/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export function getApplicationsForJob(
  jobId: number
): Promise<JobApplicationResponse[]> {
  return apiRequest<JobApplicationResponse[]>(
    `/api/company/jobs/${jobId}/applications`,
    {
      method: "GET",
      token: getToken(),
    }
  );
}

export function updateApplicationStatus(
  applicationId: number,
  request: UpdateApplicationStatusRequest
): Promise<JobApplicationResponse> {
  return apiRequest<JobApplicationResponse>(
    `/api/company/jobs/applications/${applicationId}/status`,
    {
      method: "PATCH",
      body: request,
      token: getToken(),
    }
  );
}

