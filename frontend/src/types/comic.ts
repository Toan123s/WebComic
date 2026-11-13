export type PublicationStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS'

export interface ComicSummary {
  id: number
  title: string
  slug: string
  coverUrl: string | null
  authorName: string | null
  publicationStatus: PublicationStatus
  ratingAvg: number | null
  ratingCount: number
  viewCount: number
}

export interface Comic extends ComicSummary {
  authorId: number
  description: string | null
  moderationStatus: string
  rejectReason: string | null
  createdAt: string
  updatedAt: string
}

export interface ComicPage<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
}
