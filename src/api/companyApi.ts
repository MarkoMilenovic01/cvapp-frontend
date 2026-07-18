import {
  apiRequest,
  apiMultipartRequest,
} from "./apiClient";

import type {
  CompanyCVDetailResponse,
  CompanyCVSummaryResponse,
  CVSearchRequest,
  CVViewResponse,
  PageResponse,
  CompanyRequest,
  CompanyResponse
} from "../types/company";





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

export function getAllCVs(
  page = 0,
  size = 10
): Promise<PageResponse<CompanyCVSummaryResponse>> {
  const query = buildQuery({
    page,
    size,
  });

  return apiRequest<PageResponse<CompanyCVSummaryResponse>>(
    `/api/company/cvs${query}`,
    {
      method: "GET",
    }
  );
}

export function searchCVs(
  request: CVSearchRequest,
  page = 0,
  size = 10
): Promise<PageResponse<CompanyCVSummaryResponse>> {
  const query = buildQuery({
    keyword: request.keyword,
    skill: request.skill,
    location: request.location,
    page,
    size,
  });

  return apiRequest<PageResponse<CompanyCVSummaryResponse>>(
    `/api/company/cvs/search${query}`,
    {
      method: "GET",
    }
  );
}

export function getCVById(id: number): Promise<CompanyCVDetailResponse> {
  return apiRequest<CompanyCVDetailResponse>(`/api/company/cvs/${id}`, {
    method: "GET",
  });
}

export function addFavorite(id: number): Promise<void> {
  return apiRequest<void>(`/api/company/cvs/${id}/favorite`, {
    method: "POST",
  });
}

export function removeFavorite(id: number): Promise<void> {
  return apiRequest<void>(`/api/company/cvs/${id}/favorite`, {
    method: "DELETE",
  });
}

export function getFavorites(): Promise<CompanyCVSummaryResponse[]> {
  return apiRequest<CompanyCVSummaryResponse[]>("/api/company/favorites", {
    method: "GET",
  });
}

export function getHistory(): Promise<CVViewResponse[]> {
  return apiRequest<CVViewResponse[]>("/api/company/history", {
    method: "GET",
  });
}


export function getMyCompanyProfile(): Promise<CompanyResponse> {
  return apiRequest<CompanyResponse>("/api/company/me", {
    method: "GET",
  });
}

export function updateMyCompanyProfile(
  request: CompanyRequest
): Promise<CompanyResponse> {
  return apiRequest<CompanyResponse>("/api/company/me", {
    method: "PUT",
    body: request,
  });
}

export function uploadCompanyPhoto(file: File): Promise<{
  url: string;
  publicId?: string;
}> {
  return apiMultipartRequest("/api/company/photo", file);
}

export function deleteCompanyPhoto(): Promise<void> {
  return apiRequest<void>("/api/company/photo", {
    method: "DELETE",
  });
}
