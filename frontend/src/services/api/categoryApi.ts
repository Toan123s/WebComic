import { apiClient } from './apiClient'
import type { Category } from '../../types/comic'

export const categoryApi = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/api/categories')
    return data
  },
}
