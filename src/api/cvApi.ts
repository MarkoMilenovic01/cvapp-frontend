import { apiMultipartRequest, apiRequest } from "./apiClient";
import type {
  CVRequest,
  CVResponse,
  EducationRequest,
  EducationResponse,
  ExperienceRequest,
  ExperienceResponse,
  SkillRequest,
  SkillResponse,
  UploadResponse,
} from "../types/cv";

function getToken() {
  return localStorage.getItem("accessToken");
}

// CV profile

export function getMyCV(): Promise<CVResponse> {
  return apiRequest<CVResponse>("/api/user/cv", {
    method: "GET",
    token: getToken(),
  });
}

export function saveCV(request: CVRequest): Promise<CVResponse> {
  return apiRequest<CVResponse>("/api/user/cv", {
    method: "PUT",
    body: request,
    token: getToken(),
  });
}

export function deleteCV(): Promise<void> {
  return apiRequest<void>("/api/user/cv", {
    method: "DELETE",
    token: getToken(),
  });
}

// Education

export function getEducation(): Promise<EducationResponse[]> {
  return apiRequest<EducationResponse[]>("/api/user/cv/education", {
    method: "GET",
    token: getToken(),
  });
}

export function addEducation(
  request: EducationRequest
): Promise<EducationResponse> {
  return apiRequest<EducationResponse>("/api/user/cv/education", {
    method: "POST",
    body: request,
    token: getToken(),
  });
}

export function updateEducation(
  id: number,
  request: EducationRequest
): Promise<EducationResponse> {
  return apiRequest<EducationResponse>(`/api/user/cv/education/${id}`, {
    method: "PUT",
    body: request,
    token: getToken(),
  });
}

export function deleteEducation(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/education/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

// Experience

export function getExperience(): Promise<ExperienceResponse[]> {
  return apiRequest<ExperienceResponse[]>("/api/user/cv/experience", {
    method: "GET",
    token: getToken(),
  });
}

export function addExperience(
  request: ExperienceRequest
): Promise<ExperienceResponse> {
  return apiRequest<ExperienceResponse>("/api/user/cv/experience", {
    method: "POST",
    body: request,
    token: getToken(),
  });
}

export function updateExperience(
  id: number,
  request: ExperienceRequest
): Promise<ExperienceResponse> {
  return apiRequest<ExperienceResponse>(`/api/user/cv/experience/${id}`, {
    method: "PUT",
    body: request,
    token: getToken(),
  });
}

export function deleteExperience(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/experience/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

// Skills

export function getSkills(): Promise<SkillResponse[]> {
  return apiRequest<SkillResponse[]>("/api/user/cv/skills", {
    method: "GET",
    token: getToken(),
  });
}

export function addSkill(request: SkillRequest): Promise<SkillResponse> {
  return apiRequest<SkillResponse>("/api/user/cv/skills", {
    method: "POST",
    body: request,
    token: getToken(),
  });
}

export function updateSkill(
  id: number,
  request: SkillRequest
): Promise<SkillResponse> {
  return apiRequest<SkillResponse>(`/api/user/cv/skills/${id}`, {
    method: "PUT",
    body: request,
    token: getToken(),
  });
}

export function deleteSkill(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/skills/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

// Uploads

export function uploadCVPhoto(file: File): Promise<UploadResponse> {
  return apiMultipartRequest<UploadResponse>(
    "/api/user/cv/photo",
    file,
    getToken()
  );
}

export function deleteCVPhoto(): Promise<void> {
  return apiRequest<void>("/api/user/cv/photo", {
    method: "DELETE",
    token: getToken(),
  });
}

export function uploadCVPdf(file: File): Promise<UploadResponse> {
  return apiMultipartRequest<UploadResponse>(
    "/api/user/cv/pdf",
    file,
    getToken()
  );
}

export function deleteCVPdf(): Promise<void> {
  return apiRequest<void>("/api/user/cv/pdf", {
    method: "DELETE",
    token: getToken(),
  });
}