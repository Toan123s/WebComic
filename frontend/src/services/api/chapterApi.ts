import { apiClient } from './apiClient'
import type { Chapter, ChapterPage } from '../../types/chapter'

export const chapterApi = {
  async listByComic(comicId: number): Promise<Chapter[]> {
    const { data } = await apiClient.get<Chapter[]>(`/api/comics/${comicId}/chapters`)
    return data
  },

  async getById(chapterId: number): Promise<Chapter> {
    const { data } = await apiClient.get<Chapter>(`/api/chapters/${chapterId}`)
    return data
  },

  async getPages(chapterId: number): Promise<ChapterPage[]> {
    const { data } = await apiClient.get<ChapterPage[]>(
      `/api/chapters/${chapterId}/pages`,
    )
    return data
  },

  imageUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path
    const baseUrl = apiClient.defaults.baseURL || window.location.origin
    return new URL(path, baseUrl).toString()
  },
}
