import { apiClient } from './apiClient'
import type { ReadingHistory } from '../../types/reader'

export const readingHistoryApi = {
  async list(): Promise<ReadingHistory[]> {
    const { data } = await apiClient.get<ReadingHistory[]>('/api/reading-history')
    return data
  },

  async saveProgress(chapterId: number, lastPageNumber: number): Promise<ReadingHistory> {
    const { data } = await apiClient.put<ReadingHistory>(
      '/api/reading-history/progress',
      { chapterId, lastPageNumber },
    )
    return data
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/reading-history/${id}`)
  },
}
