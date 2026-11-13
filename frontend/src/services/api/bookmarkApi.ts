import { apiClient } from './apiClient'
import type { Bookmark } from '../../types/reader'

export const bookmarkApi = {
  async list(): Promise<Bookmark[]> {
    const { data } = await apiClient.get<Bookmark[]>('/api/bookmarks')
    return data
  },

  async add(comicId: number): Promise<Bookmark> {
    const { data } = await apiClient.post<Bookmark>('/api/bookmarks', { comicId })
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/bookmarks/${id}`)
  },
}
