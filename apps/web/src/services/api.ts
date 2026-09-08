import { ApiError } from '@railline/types';
import { clientFallbackHandler } from './clientFallback';

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

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (!data.error) {
        return (data.data !== undefined ? data.data : data) as T;
      }
    }
  } catch {
    // If backend is not reached or network error, proceed to client fallback
  }

  // Graceful client-side fallback (direct RailRadar API / local database)
  // Ensures Vercel static deployments never show "Unable to track train"
  return clientFallbackHandler<T>(endpoint);
}
