export interface Bookmark {
  id: number
  comicId: number
  title: string
  slug: string
  coverUrl: string | null
  createdAt: string
}

export interface ReadingHistory {
  id: number
  comicId: number
  comicTitle: string
  comicSlug: string
  comicCoverUrl: string | null
  chapterId: number
  chapterNumber: number
  chapterTitle: string | null
  lastPageNumber: number
  pageCount: number
  readAt: string
}
