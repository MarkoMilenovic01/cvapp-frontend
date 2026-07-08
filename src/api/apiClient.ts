import type { ApiErrorBody } from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status?: number;
  details?: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

function parseJsonOrUndefined<T>(text: string): T {
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();

  if (!response.ok) {
    let errorBody: ApiErrorBody = {
      message: "Something went wrong",
      status: response.status,
    };

    try {
      if (text.trim()) {
        const parsedBody = JSON.parse(text) as ApiErrorBody;

        errorBody = {
          message: parsedBody.message ?? "Something went wrong",
          status: parsedBody.status ?? response.status,
          details: parsedBody.details,
        };
      }
    } catch {
      // Keep default errorBody if response body is empty or invalid JSON
    }

    throw new ApiError(
      errorBody.message ?? "Something went wrong",
      errorBody.status ?? response.status,
      errorBody.details,
    );
  }

  return parseJsonOrUndefined<T>(text);
}

export async function apiMultipartRequest<T>(
  path: string,
  file: File,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await response.text();

  if (!response.ok) {
    let errorBody: ApiErrorBody = {
      message: "Something went wrong",
      status: response.status,
    };

    try {
      if (text.trim()) {
        const parsedBody = JSON.parse(text) as ApiErrorBody;

        errorBody = {
          message: parsedBody.message ?? "Something went wrong",
          status: parsedBody.status ?? response.status,
          details: parsedBody.details,
        };
      }
    } catch {
      // Keep default errorBody
    }

    throw new ApiError(
      errorBody.message ?? "Something went wrong",
      errorBody.status ?? response.status,
      errorBody.details,
    );
  }

  return parseJsonOrUndefined<T>(text);
}