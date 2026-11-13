import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { CoverImage } from '../../components/reader/CoverImage'
import { useAuth } from '../../hooks/useAuth'
import { bookmarkApi } from '../../services/api/bookmarkApi'
import { chapterApi } from '../../services/api/chapterApi'
import { comicApi } from '../../services/api/comicApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import type { Category, Comic, ComicSummary } from '../../types/comic'
import type { Chapter } from '../../types/chapter'
import type { Bookmark } from '../../types/reader'
import { formatCount, formatDate } from '../../utils/media'

const publicationLabels: Record<string, string> = {
  ONGOING: 'Đang tiến hành',
  COMPLETED: 'Đã hoàn thành',
  HIATUS: 'Tạm ngưng',
}

export function ComicDetailPage() {
  const { comicId: rawId } = useParams()
  const comicId = Number(rawId)
  const validId = Number.isSafeInteger(comicId) && comicId > 0
  const { isAuthenticated, session } = useAuth()
  const navigate = useNavigate()
  const [comic, setComic] = useState<Comic | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recommendations, setRecommendations] = useState<ComicSummary[]>([])
  const [recommendationError, setRecommendationError] = useState('')
  const [bookmarkState, setBookmarkState] = useState<{
    comicId: number
    userId: number
    bookmark: Bookmark
  } | null>(null)
  const [loadedId, setLoadedId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [bookmarkError, setBookmarkError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [bookmarkBusy, setBookmarkBusy] = useState(false)
  const loading = validId && loadedId !== comicId

  useEffect(() => {
    let active = true
    if (!validId) return () => { active = false }

    Promise.all([comicApi.getById(comicId), chapterApi.listByComic(comicId)])
      .then(([comicData, chapterData]) => {
        if (!active) return
        setComic(comicData)
        setChapters(chapterData.filter((chapter) => chapter.status === 'PUBLISHED'))
        setError('')
        setLoadedId(comicId)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiErrorMessage(requestError))
          setLoadedId(comicId)
        }
      })

    comicApi.getCategories(comicId)
      .then((items) => {
        if (active) setCategories(items)
      })
      .catch((requestError: unknown) => {
        if (active) setCategoryError(getApiErrorMessage(requestError))
      })

    return () => { active = false }
  }, [comicId, validId])

  useEffect(() => {
    let active = true
    comicApi.list()
      .then((items) => {
        if (active) {
          setRecommendations(items.filter((item) => item.id !== comicId).slice(0, 5))
          setRecommendationError('')
        }
      })
      .catch(() => {
        if (active) setRecommendationError('Không tải được danh sách truyện gợi ý.')
      })
    return () => { active = false }
  }, [comicId])

  useEffect(() => {
    let active = true
    if (isAuthenticated && validId && session) {
      bookmarkApi.list()
        .then((items) => {
          if (active) {
            const found = items.find((item) => item.comicId === comicId)
            setBookmarkState(found
              ? { comicId, userId: session.userId, bookmark: found }
              : null)
            setBookmarkError('')
          }
        })
        .catch((requestError: unknown) => {
          if (active) setBookmarkError(getApiErrorMessage(requestError))
        })
    }
    return () => { active = false }
  }, [comicId, isAuthenticated, session, validId])

  const bookmark = isAuthenticated && session
    && bookmarkState?.comicId === comicId
    && bookmarkState.userId === session.userId
    ? bookmarkState.bookmark
    : null
  const latestChapter = useMemo(
    () => chapters.reduce<Chapter | null>(
      (latest, chapter) => !latest || chapter.chapterNumber > latest.chapterNumber ? chapter : latest,
      null,
    ),
    [chapters],
  )
  const firstChapter = useMemo(
    () => chapters.reduce<Chapter | null>(
      (first, chapter) => !first || chapter.chapterNumber < first.chapterNumber ? chapter : first,
      null,
    ),
    [chapters],
  )
  const orderedChapters = useMemo(
    () => [...chapters].sort((left, right) => right.chapterNumber - left.chapterNumber),
    [chapters],
  )

  const toggleBookmark = async () => {
    if (!isAuthenticated || !session) {
      navigate('/login', { state: { from: { pathname: `/comics/${comicId}` } } })
      return
    }
    setBookmarkBusy(true)
    setBookmarkError('')
    try {
      if (bookmark) {
        await bookmarkApi.remove(bookmark.id)
        setBookmarkState(null)
      } else {
        const added = await bookmarkApi.add(comicId)
        setBookmarkState({
          comicId,
          userId: session.userId,
          bookmark: added,
        })
      }
    } catch (requestError) {
      setBookmarkError(getApiErrorMessage(requestError))
    } finally {
      setBookmarkBusy(false)
    }
  }

  if (!validId) return <main className="reader-content"><ErrorMessage message="Đường dẫn truyện không hợp lệ." /></main>
  if (loading) return <main className="reader-content"><Loading label="Đang mở thông tin truyện..." /></main>
  if (error || !comic) {
    return <main className="reader-content"><ErrorMessage message={error || 'Không tìm thấy truyện.'} onRetry={() => window.location.reload()} /></main>
  }

  return (
    <main className="reader-content comic-detail-page">
      <Link className="back-link" to="/"><span aria-hidden="true">←</span> Trở về khám phá</Link>
      <div className="comic-detail-layout">
        <div className="comic-detail-main">
          <section className="comic-detail-hero">
            <div className="detail-cover-wrap">
              <CoverImage className="detail-cover" src={comic.coverUrl} title={comic.title} />
              <span className="detail-cover-rating">★ {comic.ratingAvg?.toFixed(1) ?? '—'}</span>
            </div>
            <div className="detail-copy">
              <div className="detail-kickers">
                <span className="hero-tag">MANGA</span>
                <span className="hero-tag hero-tag-live">● {publicationLabels[comic.publicationStatus] ?? comic.publicationStatus}</span>
              </div>
              <h1>{comic.title}</h1>
              <p className="detail-subtitle">Tác phẩm của {comic.authorName || 'Tác giả ẩn danh'}</p>
              <div className="detail-creator-stats">
                <div><span>TÁC GIẢ</span><strong>{comic.authorName || 'Tác giả ẩn danh'}</strong></div>
                <div><span>ĐÁNH GIÁ CỘNG ĐỒNG</span><strong>★ {comic.ratingAvg?.toFixed(1) ?? '—'} <small>({formatCount(comic.ratingCount)} đánh giá)</small></strong></div>
              </div>
              <div className="detail-badges">
                {categories.map((category) => <span className="detail-category" key={category.id}>{category.name}</span>)}
              </div>
              {categoryError && <p className="field-hint">Không tải được thể loại: {categoryError}</p>}
              <p className="detail-summary">{comic.description?.trim() || 'Tác giả chưa thêm phần giới thiệu cho bộ truyện này.'}</p>
              <div className="detail-actions">
                {latestChapter ? (
                  <Link className="button button-primary" to={`/read/${latestChapter.id}`}>Đọc chương mới nhất <span aria-hidden="true">→</span></Link>
                ) : (
                  <button className="button button-primary" disabled type="button">Chưa có chương công khai</button>
                )}
                {firstChapter && (
                  <Link className="button button-secondary" to={`/read/${firstChapter.id}`}>Đọc từ đầu</Link>
                )}
                <button
                  aria-pressed={bookmark !== null}
                  className={`button ${bookmark ? 'button-saved' : 'button-secondary'}`}
                  disabled={bookmarkBusy}
                  onClick={toggleBookmark}
                  type="button"
                >
                  {bookmarkBusy ? 'Đang lưu...' : bookmark ? 'Đã lưu' : 'Thêm vào tủ truyện'}
                </button>
                <button aria-label="Chia sẻ (sắp có)" className="button button-secondary icon-action" disabled title="Chia sẻ sẽ có trong phiên bản sau" type="button">↗</button>
              </div>
              {bookmarkError && <p className="form-error" role="alert">{bookmarkError}</p>}
              <p className="detail-updated">Cập nhật {formatDate(comic.updatedAt)}</p>
            </div>
          </section>

          <section className="detail-description detail-panel">
            <div className="section-heading">
              <div><h2>Giới thiệu truyện</h2></div>
              <span className="chapter-count">TÓM TẮT</span>
            </div>
            <p>{comic.description?.trim() || 'Tác giả chưa thêm phần giới thiệu cho bộ truyện này.'}</p>
          </section>

          <section className="chapter-list-section detail-panel">
            <div className="section-heading">
              <div><h2>Danh sách chương</h2></div>
              <span className="chapter-count">{chapters.length} chương</span>
            </div>
            {chapters.length ? (
              <div className="chapter-list">
                {orderedChapters.map((chapter) => (
                  <Link className="chapter-row" key={chapter.id} to={`/read/${chapter.id}`}>
                    <span className="chapter-row-number">CHƯƠNG {chapter.chapterNumber}</span>
                    <span className="chapter-row-title">{chapter.title || `Chương ${chapter.chapterNumber}`}</span>
                    <span className="chapter-row-pages">{chapter.pageCount} trang</span>
                    <span className="chapter-row-date">{formatDate(chapter.publishedAt)}</span>
                    <span className="chapter-row-arrow" aria-hidden="true">›</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState description="Các chương sẽ xuất hiện ở đây sau khi được xuất bản." title="Chưa có chương công khai" />
            )}
          </section>

          <section className="detail-panel detail-comments">
            <div className="section-heading"><div><h2>Bình luận độc giả</h2></div><span className="soon-badge">API sắp có</span></div>
            <div className="comment-unavailable">
              <span className="side-card-icon">▤</span>
              <p>Phần bình luận sẽ mở khi backend có API bình luận. Hiện tại chưa thể gửi hoặc xem bình luận.</p>
            </div>
          </section>
        </div>

        <aside className="comic-detail-sidebar">
          <section className="detail-side-card">
            <h2>Thông số tương tác</h2>
            <div className="detail-metric"><span>Lượt xem</span><strong>{formatCount(comic.viewCount)}</strong></div>
            <div className="detail-metric"><span>Đánh giá</span><strong>★ {comic.ratingAvg?.toFixed(1) ?? '—'} / 10</strong></div>
            <div className="detail-metric"><span>Số chương</span><strong>{chapters.length}</strong></div>
            <div className="detail-metric"><span>Cập nhật</span><strong>{formatDate(comic.updatedAt)}</strong></div>
            <p className="field-hint">Điểm đánh giá được hiển thị từ dữ liệu hiện có; API gửi đánh giá chưa khả dụng.</p>
          </section>
          <section className="detail-side-card">
            <div className="section-heading"><div><h2>Truyện bạn có thể thích</h2></div></div>
            {recommendations.length ? recommendations.map((item) => (
              <Link className="recommendation-row" key={item.id} to={`/comics/${item.id}`}>
                <CoverImage src={item.coverUrl} title={item.title} />
                <span><strong>{item.title}</strong><small>★ {item.ratingAvg?.toFixed(1) ?? '—'} · {formatCount(item.viewCount)} lượt xem</small></span>
              </Link>
            )) : <p className="muted-copy">{recommendationError || 'Chưa có truyện gợi ý.'}</p>}
          </section>
        </aside>
      </div>
    </main>
  )
}
