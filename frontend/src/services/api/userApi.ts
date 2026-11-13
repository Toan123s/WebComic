import { apiClient } from './apiClient'
import type { UserProfile } from '../../types/auth'

export interface UpdateUserProfile {
  username: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

export const userApi = {
  async getById(id: number): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(`/api/users/${id}`)
    return data
  },

  async update(id: number, profile: UpdateUserProfile): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>(`/api/users/${id}`, profile)
    return data
  },
}
