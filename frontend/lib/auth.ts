export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

import type { User } from '@/types/stock'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class AuthManager {
  private static instance: AuthManager
  private accessToken: string | null = null
  private refreshToken: string | null = null

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  getAccessToken() {
    return this.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null)
  }

  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const data: LoginResponse = await response.json()
    this.setTokens(data.access_token, data.refresh_token)
    return data.user
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      this.refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
    }
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.refreshToken}`
      }
    })

    if (!response.ok) {
      this.clearTokens()
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token)
    }
    return data.access_token
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }
}
