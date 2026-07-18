import { apiRequest } from "./apiClient";
import type {
  AdminCompanyResponse,
  AdminJobResponse,
  AdminStatsResponse,
  AdminUserResponse,
  ChangeRoleRequest,
  InviteRequest,
  PageResponse,
} from "../types/admin";


function buildQuery(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

// Stats

export function getAdminStats(): Promise<AdminStatsResponse> {
  return apiRequest<AdminStatsResponse>("/api/admin/stats", {
    method: "GET",
  });
}

// Users

export function getAdminUsers(
  page = 0,
  size = 20
): Promise<PageResponse<AdminUserResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<AdminUserResponse>>(
    `/api/admin/users${query}`,
    {
      method: "GET",
    }
  );
}

export function getAdminUserById(id: number): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${id}`, {
    method: "GET",
  });
}

export function toggleUserEnabled(id: number): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${id}/toggle`, {
    method: "PATCH",
  });
}

export function changeUserRole(
  id: number,
  request: ChangeRoleRequest
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: request,
  });
}

export function deleteUser(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

// Companies

export function getAdminCompanies(
  page = 0,
  size = 20
): Promise<PageResponse<AdminCompanyResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<AdminCompanyResponse>>(
    `/api/admin/companies${query}`,
    {
      method: "GET",
    }
  );
}

export function getAdminCompanyById(id: number): Promise<AdminCompanyResponse> {
  return apiRequest<AdminCompanyResponse>(`/api/admin/companies/${id}`, {
    method: "GET",
  });
}

export function deleteCompany(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/companies/${id}`, {
    method: "DELETE",
  }); 
}

// Jobs

export function getAdminJobs(
  page = 0,
  size = 20
): Promise<PageResponse<AdminJobResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<AdminJobResponse>>(`/api/admin/jobs${query}`, {
    method: "GET",
  });
}

export function getAdminJobById(id: number): Promise<AdminJobResponse> {
  return apiRequest<AdminJobResponse>(`/api/admin/jobs/${id}`, {
    method: "GET",
  });
}

export function toggleJobActive(id: number): Promise<AdminJobResponse> {
  return apiRequest<AdminJobResponse>(`/api/admin/jobs/${id}/toggle`, {
    method: "PATCH",
  });
}

export function deleteJob(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/jobs/${id}`, {
    method: "DELETE",
  });
}

// Company invite

export function sendCompanyInvite(request: InviteRequest): Promise<void> {
  return apiRequest<void>("/api/auth/company-invites", {
    method: "POST",
    body: request,
  });
}
