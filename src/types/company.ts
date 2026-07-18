import type { CVResponse } from "./cv";

export interface CompanyCVSummaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  summary: string;
  favorite: boolean;
}

export interface CVSearchRequest {
  keyword: string;
  skill: string;
  location: string;
}

export interface CVViewResponse {
  cvId: number;
  firstName: string;
  lastName: string;
  viewedAt: string;
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


export interface CompanyRequest {
  name: string;
  description: string;
  website: string;
  industry: string;
}

export interface CompanyResponse {
  id: number;
  name: string;
  description: string;
  website: string;
  industry: string;
  photoUrl?: string | null;
  createdAt: string;
}



export type CompanyCVDetailResponse = CVResponse;