import { supabase } from './supabase'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * API client with automatic authentication header injection
 */
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      }
    }

    return {}
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const authHeader = await this.getAuthHeader()

    const response = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const authHeader = await this.getAuthHeader()

    const response = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async patch<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const authHeader = await this.getAuthHeader()

    const response = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const authHeader = await this.getAuthHeader()

    const response = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }
}

export const apiClient = new ApiClient(API_BASE)

