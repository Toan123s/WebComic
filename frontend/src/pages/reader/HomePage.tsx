import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { ComicCard } from '../../components/reader/ComicCard'
import { CoverImage } from '../../components/reader/CoverImage'
import { useAuth } from '../../hooks/useAuth'
import { comicApi } from '../../services/api/comicApi'
import { categoryApi } from '../../services/api/categoryApi'
import { chapterApi } from '../../services/api/chapterApi'
import { readingHistoryApi } from '../../services/api/readingHistoryApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import type { Category, ComicSummary } from '../../types/comic'
import type { Chapter } from '../../types/chapter'
import type { ReadingHistory } from '../../types/reader'
import { formatDate } from '../../utils/media'

export function HomePage() {
  const { isAuthenticated, session } = useAuth()
  const userId = session?.userId ?? null
  const [comics, setComics] = useState<ComicSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [featuredChapterState, setFeaturedChapterState] = useState<{ comicId: number; chapter: Chapter | null } | null>(null)
  const [featuredChapterErrorState, setFeaturedChapterErrorState] = useState<{ comicId: number; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState<{ userId: number; message: string } | null>(null)
  const [historyOwnerId, setHistoryOwnerId] = useState<number | null>(null)
  const [retry, setRetry] = useState(0)
  const featured = comics[0]
  const featuredId = featured?.id
  const featuredChapter = featuredId !== undefined && featuredChapterState?.comicId === featuredId
    ? featuredChapterState.chapter
    : null
  const featuredChapterError = featuredId !== undefined && featuredChapterErrorState?.comicId === featuredId
    ? featuredChapterErrorState.message
    : ''

  useEffect(() => {
    let active = true
    Promise.all([comicApi.list(), categoryApi.list()])
      .then(([comicResults, categoryResults]) => {
        if (!active) return
        setComics(comicResults)
        setCategories(categoryResults)
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [retry])

  useEffect(() => {
    let active = true
    if (isAuthenticated && userId !== null) {
      readingHistoryApi
        .list()
        .then((items) => {
          if (active) {
            setHistory(items.slice(0, 4))
            setHistoryOwnerId(userId)
          }
        })
        .catch((requestError: unknown) => {
          if (active) setHistoryError({
            userId,
            message: getApiErrorMessage(requestError),
          })
        })
    }
    return () => {
      active = false
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    let active = true
    if (featuredId === undefined) return () => { active = false }
    chapterApi.listByComic(featuredId)
      .then((items) => {
        if (!active) return
        const latest = items
          .filter((item) => item.status === 'PUBLISHED')
          .sort((left, right) => right.chapterNumber - left.chapterNumber)[0] ?? null
        setFeaturedChapterState({ comicId: featuredId, chapter: latest })
      })
      .catch((requestError: unknown) => {
        if (active) {
          setFeaturedChapterErrorState({ comicId: featuredId, message: getApiErrorMessage(requestError) })
        }
      })
    return () => { active = false }
  }, [featuredId])

  const visibleHistory = session && historyOwnerId === session.userId ? history : []
  const visibleHistoryError = session && historyError?.userId === session.userId
    ? historyError.message
    : ''

  const retryLoad = () => {
    setError('')
    setLoading(true)
    setRetry((value) => value + 1)
  }

  return (
    <main className="reader-content">
      {loading ? (
        <Loading label="Đang tìm những câu chuyện hay..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={retryLoad} />
      ) : comics.length === 0 ? (
        <EmptyState
          actionLabel="Thử tìm kiếm"
          actionTo="/search"
          description="Danh sách truyện công khai hiện chưa có nội dung."
          title="Chưa có truyện để khám phá"
        />
      ) : (
        <>
          {featured && (
            <section className="home-hero">
              <CoverImage className="home-hero-cover" src={featured.coverUrl} title={featured.title} />
              <div className="home-hero-copy">
                <div className="hero-tags">
                  <span className="hero-tag">MANGA</span>
                  <span className="hero-tag hero-tag-live">● {featured.publicationStatus === 'COMPLETED'
                    ? 'Đã hoàn thành'
                    : featured.publicationStatus === 'HIATUS' ? 'Tạm ngưng' : 'Đang tiến hành'}</span>
                </div>
                <h1>{featured.title}</h1>
                <p>
                  {featured.authorName ? `Tác giả ${featured.authorName}. ` : ''}
                  Khám phá câu chuyện và các chương mới nhất trên ComicHub.
                </p>
                {featuredChapterError && <p className="hero-chapter-error" role="status">{featuredChapterError}</p>}
                <div className="featured-actions">
                  <Link className="button button-primary" to={featuredChapter ? `/read/${featuredChapter.id}` : `/comics/${featured.id}`}>
                    {featuredChapter ? 'Đọc ngay' : 'Xem truyện'} <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="button button-secondary" to={`/comics/${featured.id}`}>Xem chi tiết</Link>
                </div>
              </div>
            </section>
          )}

          <div className="home-columns">
            <div className="home-feed">
              <section className="reader-section home-section">
                <div className="section-heading">
                  <div><h2>Truyện mới cập nhật</h2></div>
                  <Link className="section-link" to="/updates">Xem tất cả <span aria-hidden="true">→</span></Link>
                </div>
                <div className="comic-grid home-card-grid">
                  {comics.slice(0, 6).map((comic) => <ComicCard comic={comic} key={comic.id} />)}
                </div>
              </section>

              <section className="reader-section home-section">
                <div className="section-heading">
                  <div><h2>Truyện phổ biến theo thể loại</h2></div>
                  <Link className="section-link" to="/search">Xem tất cả <span aria-hidden="true">→</span></Link>
                </div>
                {categories.length > 0 ? (
                  <div className="category-pills home-category-pills">
                    <Link className="category-pill is-selected" to="/search">Tất cả</Link>
                    {categories.slice(0, 7).map((category) => (
                      <Link
                        className="category-pill"
                        key={category.id}
                        to={`/search?categoryId=${category.id}`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">Chưa có thể loại nào được tạo.</p>
                )}
                <div className="comic-grid home-card-grid popular-grid">
                  {[...comics]
                    .sort((left, right) => (right.ratingAvg ?? 0) - (left.ratingAvg ?? 0))
                    .slice(0, 6)
                    .map((comic) => <ComicCard comic={comic} key={comic.id} />)}
                </div>
              </section>
            </div>

            <aside className="home-sidebar">
              <section className="home-side-card assistant-card">
                <div className="side-card-heading">
                  <span className="side-card-icon">✦</span>
                  <div><strong>ComicHub AI</strong><small>Gợi ý truyện thông minh</small></div>
                  <span className="soon-badge">Sắp có</span>
                </div>
                <p>Trợ lý gợi ý truyện sẽ khả dụng khi backend AI được triển khai.</p>
                <div className="assistant-suggestions" aria-label="Gợi ý mẫu, chưa khả dụng">
                  <span>Truyện theo sở thích</span>
                  <span>Truyện mới hôm nay</span>
                  <span>Review truyện</span>
                </div>
                <label className="assistant-input">
                  <span className="sr-only">Hỏi ComicHub AI</span>
                  <input disabled placeholder="Tính năng đang được phát triển" />
                  <button aria-label="Gửi câu hỏi" disabled type="button">➤</button>
                </label>
              </section>

              <section className="home-side-card">
                <div className="side-card-heading">
                  <span className="side-card-icon">◷</span>
                  <div><strong>Chế độ đọc tập trung</strong><small>Tối ưu cho màn hình đêm</small></div>
                  <span className="side-card-note">Tự động</span>
                </div>
              </section>

              {isAuthenticated && (
                <section className="home-side-card">
                  <div className="section-heading side-section-heading">
                    <div><h2>Đọc tiếp</h2></div>
                    <Link className="section-link" to="/reader/history">Tất cả</Link>
                  </div>
                  {visibleHistoryError ? (
                    <p className="inline-notice" role="status">{visibleHistoryError}</p>
                  ) : visibleHistory.length ? (
                    <div className="continue-list side-continue-list">
                      {visibleHistory.slice(0, 3).map((item) => (
                        <Link className="continue-card" key={item.id} to={`/read/${item.chapterId}?page=${item.lastPageNumber}`}>
                          <CoverImage src={item.comicCoverUrl} title={item.comicTitle} />
                          <span className="continue-copy">
                            <strong>{item.comicTitle}</strong>
                            <span>Ch. {item.chapterNumber} · Trang {item.lastPageNumber}/{item.pageCount}</span>
                            <span className="continue-date">{formatDate(item.readAt)}</span>
                          </span>
                          <span className="continue-arrow" aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-copy">Lịch sử đọc sẽ hiện ở đây khi bạn bắt đầu đọc.</p>
                  )}
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  )
}
