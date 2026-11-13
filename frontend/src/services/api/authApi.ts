import { apiClient } from './apiClient'
import type { AuthSession, LoginRequest, RegisterRequest } from '../../types/auth'
import type { UserProfile } from '../../types/auth'

export const authApi = {
  async login(request: LoginRequest): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/api/auth/login', request)
    return data
  },

  async register(request: RegisterRequest): Promise<UserProfile> {
    const { data } = await apiClient.post<UserProfile>('/api/users', request)
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/api/auth/logout', { refreshToken })
  },
}
