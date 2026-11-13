export interface Chapter {
  id: number
  comicId: number
  chapterNumber: number
  title: string | null
  status: string
  rejectReason: string | null
  pageCount: number
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

export interface ChapterPage {
  id: number
  pageNumber: number
  imageUrl: string
  width: number | null
  height: number | null
  fileSize: number | null
}
