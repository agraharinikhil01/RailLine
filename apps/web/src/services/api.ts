import { ApiError } from '@railline/types';

export class FetchError extends Error {
  public code: string;
  public details?: Record<string, unknown>;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'FetchError';
    this.code = apiError.code;
    this.details = apiError.details;
  }
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data.error || {
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    };
    throw new FetchError(error);
  }

  return (data.data !== undefined ? data.data : data) as T;
}
