import { apiRequest } from "./apiClient";
import type {
  JobApplicationResponse,
  JobResponse,
  JobSearchFilter,
  PageResponse,
  JobRequest,
  UpdateApplicationStatusRequest
} from "../types/job";


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
  });
}

export function getActiveJobById(id: number): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/jobs/${id}`, {
    method: "GET",
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
    companyName: filter.companyName,
    page,
    size,
  });

  return apiRequest<PageResponse<JobResponse>>(`/api/jobs/search${query}`, {
    method: "GET",
  });
}

export function applyToJob(jobId: number): Promise<JobApplicationResponse> {
  return apiRequest<JobApplicationResponse>(
    `/api/user/applications/jobs/${jobId}/apply`,
    {
      method: "POST",
    }
  );
}

export function getMyApplications(): Promise<JobApplicationResponse[]> {
  return apiRequest<JobApplicationResponse[]>("/api/user/applications", {
    method: "GET",
  });
}

export function withdrawApplication(applicationId: number): Promise<void> {
  return apiRequest<void>(`/api/user/applications/${applicationId}`, {
    method: "DELETE",
  });
}


export function createCompanyJob(request: JobRequest): Promise<JobResponse> {
  return apiRequest<JobResponse>("/api/company/jobs", {
    method: "POST",
    body: request,
  });
}

export function getMyCompanyJobs(
  page = 0,
  size = 10
): Promise<PageResponse<JobResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<JobResponse>>(`/api/company/jobs${query}`, {
    method: "GET",
  });
}

export function getMyCompanyJobById(id: number): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/company/jobs/${id}`, {
    method: "GET",
  });
}

export function updateCompanyJob(
  id: number,
  request: JobRequest
): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/api/company/jobs/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteCompanyJob(id: number): Promise<void> {
  return apiRequest<void>(`/api/company/jobs/${id}`, {
    method: "DELETE",
  });
}

export function getApplicationsForJob(
  jobId: number
): Promise<JobApplicationResponse[]> {
  return apiRequest<JobApplicationResponse[]>(
    `/api/company/jobs/${jobId}/applications`,
    {
      method: "GET",
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
    }
  );
}
