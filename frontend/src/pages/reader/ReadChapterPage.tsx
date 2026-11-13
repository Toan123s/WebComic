import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { useAuth } from '../../hooks/useAuth'
import { chapterApi } from '../../services/api/chapterApi'
import { comicApi } from '../../services/api/comicApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import { readingHistoryApi } from '../../services/api/readingHistoryApi'
import type { Chapter, ChapterPage } from '../../types/chapter'
import type { Comic } from '../../types/comic'

export function ReadChapterPage() {
  const { chapterId: rawId } = useParams()
  const chapterId = Number(rawId)
  const validId = Number.isSafeInteger(chapterId) && chapterId > 0
  const [searchParams] = useSearchParams()
  const requestedPage = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const pageElements = useRef(new Map<number, HTMLElement>())
  const pendingProgress = useRef<{ chapterId: number; pageNumber: number } | null>(null)
  const progressRequestActive = useRef(false)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [comic, setComic] = useState<Comic | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [pages, setPages] = useState<ChapterPage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedChapterId, setLoadedChapterId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [progressError, setProgressError] = useState('')
  const [savingProgress, setSavingProgress] = useState(false)
  const loading = validId && loadedChapterId !== chapterId

  useEffect(() => {
    let active = true
    if (!validId) return () => { active = false }

    chapterApi.getById(chapterId)
      .then(async (chapterData) => {
        const [pageData, chapterList, comicData] = await Promise.all([
          chapterApi.getPages(chapterId),
          chapterApi.listByComic(chapterData.comicId),
          comicApi.getById(chapterData.comicId),
        ])
        if (!active) return
        setChapter(chapterData)
        setPages(pageData)
        setChapters(
          chapterList
            .filter((item) => item.status === 'PUBLISHED')
            .sort((left, right) => left.chapterNumber - right.chapterNumber),
        )
        setComic(comicData)
        setCurrentPage(Math.min(requestedPage, Math.max(pageData.length, 1)))
        setError('')
        setLoadedChapterId(chapterId)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiErrorMessage(requestError))
          setLoadedChapterId(chapterId)
        }
      })
    return () => { active = false }
  }, [chapterId, requestedPage, validId])

  useEffect(() => {
    if (loading || !pages.length) return
    const timer = window.setTimeout(() => {
      pageElements.current.get(currentPage)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [currentPage, loading, pages.length])

  useEffect(() => {
    if (!pages.length || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const pageNumber = Number(visible?.target.getAttribute('data-page-number'))
        if (pageNumber > 0) setCurrentPage(pageNumber)
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: '-15% 0px -15% 0px' },
    )
    pageElements.current.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pages])

  useEffect(() => {
    if (!isAuthenticated || !chapter || currentPage < 1 || !pages.length) return
    const timer = window.setTimeout(() => {
      pendingProgress.current = { chapterId: chapter.id, pageNumber: currentPage }
      if (progressRequestActive.current) return

      progressRequestActive.current = true
      setSavingProgress(true)
      setProgressError('')
      void (async () => {
        try {
          while (pendingProgress.current) {
            const progress = pendingProgress.current
            pendingProgress.current = null
            await readingHistoryApi.saveProgress(progress.chapterId, progress.pageNumber)
          }
        } catch (requestError) {
          pendingProgress.current = null
          setProgressError(getApiErrorMessage(requestError))
        } finally {
          progressRequestActive.current = false
          setSavingProgress(false)
        }
      })()
    }, 700)
    return () => window.clearTimeout(timer)
  }, [chapter, currentPage, isAuthenticated, pages.length])

  const chapterIndex = useMemo(
    () => chapters.findIndex((item) => item.id === chapterId),
    [chapters, chapterId],
  )
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex >= 0 ? chapters[chapterIndex + 1] ?? null : null

  if (!validId) {
    return (
      <main className="reading-page-shell">
        <ErrorMessage message="Đường dẫn chương không hợp lệ." />
        <Link className="back-link reading-back-link" to="/">Trở về trang chủ</Link>
      </main>
    )
  }
  if (loading) return <main className="reading-page-shell"><Loading label="Đang tải chương truyện..." /></main>
  if (error || !chapter || !comic) {
    return (
      <main className="reading-page-shell">
        <ErrorMessage message={error || 'Không tìm thấy chương truyện.'} onRetry={() => window.location.reload()} />
        <Link className="back-link reading-back-link" to="/">Trở về trang chủ</Link>
      </main>
    )
  }

  return (
    <main className="reading-page-shell">
      <header className="reading-toolbar">
        <Link aria-label="ComicHub trang chủ" className="brand reading-brand" to="/">
          <span className="brand-mark">C</span><span>comic<span>hub</span></span>
        </Link>
        <div className="reading-title">
          <Link to={`/comics/${comic.id}`}>{comic.title}</Link>
          <span>Chương {chapter.chapterNumber}{chapter.title ? ` · ${chapter.title}` : ''}</span>
        </div>
        <div className="reading-toolbar-actions">
          {isAuthenticated && (
            <Link className="text-button" to="/reader/history">Lịch sử đọc</Link>
          )}
          <Link className="text-button" to={`/comics/${comic.id}`}>Chi tiết truyện</Link>
        </div>
      </header>

      <div className="reader-controls">
        <button
          className="reader-control-button"
          disabled={!previousChapter}
          onClick={() => previousChapter && navigate(`/read/${previousChapter.id}`)}
          type="button"
        >
          ← Chương trước
        </button>
        <label className="chapter-picker">
          <span className="sr-only">Chọn chương</span>
          <select
            onChange={(event) => navigate(`/read/${event.target.value}`)}
            value={chapter.id}
          >
            {chapters.map((item) => (
              <option key={item.id} value={item.id}>
                Chương {item.chapterNumber}{item.title ? ` · ${item.title}` : ''}
              </option>
            ))}
          </select>
        </label>
        <span className="page-counter">
          Trang <strong>{currentPage}</strong> / {pages.length}
          {savingProgress && <small> · Đang lưu</small>}
        </span>
        <button
          className="reader-control-button"
          disabled={!nextChapter}
          onClick={() => nextChapter && navigate(`/read/${nextChapter.id}`)}
          type="button"
        >
          Chương tiếp <span aria-hidden="true">→</span>
        </button>
      </div>

      {progressError && (
        <p className="reader-progress-warning" role="status">
          Không thể lưu tiến độ đọc: {progressError}
        </p>
      )}

      {pages.length ? (
        <section className="manga-pages" aria-label="Các trang truyện">
          {pages.map((page) => (
            <figure
              className="manga-page"
              data-page-number={page.pageNumber}
              key={page.id}
              ref={(element) => {
                if (element) pageElements.current.set(page.pageNumber, element)
                else pageElements.current.delete(page.pageNumber)
              }}
            >
              <img
                alt={`${comic.title}, chương ${chapter.chapterNumber}, trang ${page.pageNumber}`}
                decoding="async"
                loading={page.pageNumber > 2 ? 'lazy' : 'eager'}
                onError={(event) => {
                  event.currentTarget.alt = `Không tải được trang ${page.pageNumber}. Hãy thử tải lại trang.`
                }}
                src={chapterApi.imageUrl(page.imageUrl)}
              />
              <figcaption>{page.pageNumber} / {pages.length}</figcaption>
            </figure>
          ))}
        </section>
      ) : (
        <div className="reader-no-pages">
          <h2>Chương này chưa có trang đọc</h2>
          <p>Vui lòng quay lại sau hoặc chọn chương khác.</p>
        </div>
      )}

      <div className="reader-bottom-nav">
        <button
          className="button button-secondary"
          disabled={!previousChapter}
          onClick={() => previousChapter && navigate(`/read/${previousChapter.id}`)}
          type="button"
        >
          ← Chương trước
        </button>
        <button className="button button-soft" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} type="button">
          Lên đầu trang ↑
        </button>
        <button
          className="button button-primary"
          disabled={!nextChapter}
          onClick={() => nextChapter && navigate(`/read/${nextChapter.id}`)}
          type="button"
        >
          Chương tiếp →
        </button>
      </div>
      <section className="reader-end-card">
        <span className="side-card-icon">◉</span>
        <h2>Bạn vừa đọc xong chương này</h2>
        <p>Tiếp tục hành trình với chương tiếp theo hoặc quay lại trang truyện.</p>
        <div className="reader-end-actions">
          {nextChapter && <Link className="button button-primary" to={`/read/${nextChapter.id}`}>Đọc chương tiếp theo →</Link>}
          <Link className="button button-secondary" to={`/comics/${comic.id}`}>Xem thông tin truyện</Link>
          {!isAuthenticated && <Link className="reader-end-login" to="/login">Đăng nhập để lưu tiến độ đọc</Link>}
        </div>
      </section>
      <section className="reader-comments">
        <div className="section-heading"><div><h2>Bình luận chương</h2></div><span className="soon-badge">API sắp có</span></div>
        <p>Chưa thể xem hoặc gửi bình luận vì backend chưa có API cho chức năng này.</p>
      </section>
      <div className="reader-end-link"><Link to={`/comics/${comic.id}`}>← Trở về {comic.title}</Link></div>
    </main>
  )
}
