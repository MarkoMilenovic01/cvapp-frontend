import { apiRequest } from "./apiClient";
import type { CompanyResponse } from "../types/company";
import type { JobResponse, PageResponse } from "../types/job";

function getToken() {
  return localStorage.getItem("accessToken");
}

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

export function getCompanyById(companyId: number): Promise<CompanyResponse> {
  return apiRequest<CompanyResponse>(`/api/companies/${companyId}`, {
    method: "GET",
    token: getToken(),
  });
}

export function getActiveJobsByCompany(
  companyId: number,
  page = 0,
  size = 10
): Promise<PageResponse<JobResponse>> {
  const query = buildQuery({ page, size });

  return apiRequest<PageResponse<JobResponse>>(
    `/api/companies/${companyId}/jobs${query}`,
    {
      method: "GET",
      token: getToken(),
    }
  );
}