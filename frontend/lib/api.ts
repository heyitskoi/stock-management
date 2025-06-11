import { AuthManager } from './auth'
import { ApiError } from './errorHandler'

class ApiClient {
  private baseURL: string
  private authManager: AuthManager

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    this.authManager = AuthManager.getInstance()
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = this.authManager.getAccessToken() as string | undefined

    const makeRequest = async (authToken?: string): Promise<Response> => {
      return fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
          ...options.headers,
        },
      })
    }

    let response = await makeRequest(token)

    if (response.status === 401 && token) {
      try {
        token = await this.authManager.refreshAccessToken()
        response = await makeRequest(token)
      } catch (error) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
