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
  skipAuthRefresh?: boolean;
};

let accessToken: string | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function setApiRefreshHandler(
  handler: (() => Promise<string | null>) | null,
) {
  refreshHandler = handler;
}

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
  const response = await sendRequest(path, options);

  if (
    response.status === 401 &&
    !options.skipAuthRefresh &&
    refreshHandler
  ) {
    refreshPromise ??= refreshHandler().finally(() => {
      refreshPromise = null;
    });

    const refreshedToken = await refreshPromise;

    if (refreshedToken) {
      return handleResponse<T>(await sendRequest(path, options));
    }
  }

  return handleResponse<T>(response);
}

async function sendRequest(path: string, options: ApiRequestOptions) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
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
): Promise<T> {
  const sendMultipartRequest = () => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
  };

  let response = await sendMultipartRequest();

  if (response.status === 401 && refreshHandler) {
    refreshPromise ??= refreshHandler().finally(() => {
      refreshPromise = null;
    });

    if (await refreshPromise) {
      response = await sendMultipartRequest();
    }
  }

  return handleResponse<T>(response);
}
