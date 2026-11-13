import { apiClient } from './apiClient'
import type { Category, Comic, ComicPage, ComicSummary, PublicationStatus } from '../../types/comic'

export interface ComicSearchParams {
  keyword?: string
  categoryId?: number
  publicationStatus?: PublicationStatus
  page?: number
  size?: number
}

export const comicApi = {
  async list(): Promise<ComicSummary[]> {
    const { data } = await apiClient.get<ComicSummary[]>('/api/comics')
    return data
  },

  async search(params: ComicSearchParams): Promise<ComicPage<ComicSummary>> {
    const { data } = await apiClient.get<ComicPage<ComicSummary>>('/api/comics/search', {
      params,
    })
    return data
  },

  async getById(id: number): Promise<Comic> {
    const { data } = await apiClient.get<Comic>(`/api/comics/${id}`)
    return data
  },

  async getCategories(id: number): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>(`/api/comics/${id}/categories`)
    return data
  },
}
