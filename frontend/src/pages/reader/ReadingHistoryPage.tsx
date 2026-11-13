import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { CoverImage } from '../../components/reader/CoverImage'
import { getApiErrorMessage } from '../../services/api/apiClient'
import { readingHistoryApi } from '../../services/api/readingHistoryApi'
import type { ReadingHistory } from '../../types/reader'
import { formatDate } from '../../utils/media'

export function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    readingHistoryApi.list()
      .then((items) => {
        if (active) setHistory(items)
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [retry])

  const load = () => {
    setError('')
    setLoading(true)
    setRetry((value) => value + 1)
  }

  const remove = async (item: ReadingHistory) => {
    setRemovingId(item.id)
    setError('')
    try {
      await readingHistoryApi.remove(item.id)
      setHistory((current) => current.filter((entry) => entry.id !== item.id))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setRemovingId(null)
    }
  }

  const completedCount = history.filter((item) => item.pageCount > 0 && item.lastPageNumber >= item.pageCount).length
  const readingCount = history.length - completedCount
  const visibleHistory = useMemo(
    () => history.filter((item) => {
      const completed = item.pageCount > 0 && item.lastPageNumber >= item.pageCount
      return filter === 'all' || (filter === 'completed' ? completed : !completed)
    }),
    [filter, history],
  )

  return (
    <main className="reader-content personal-library-page">
      <div className="page-intro library-intro history-intro">
        <div>
          <span className="eyebrow">TỦ SÁCH CÁ NHÂN</span>
          <h1>Lịch sử đọc</h1>
          <p>Danh sách những bộ truyện bạn đã từng đọc. Tiếp tục hành trình từ nơi bạn dừng lại.</p>
        </div>
        <div className="history-summary">
          <div><strong>{completedCount}</strong><span>Đã hoàn thành</span></div>
          <div><strong>{readingCount}</strong><span>Đang đọc</span></div>
        </div>
      </div>

      <nav aria-label="Lọc lịch sử đọc" className="history-tabs">
        <button className={filter === 'all' ? 'is-selected' : ''} onClick={() => setFilter('all')} type="button">Tất cả <span>{history.length}</span></button>
        <button className={filter === 'reading' ? 'is-selected' : ''} onClick={() => setFilter('reading')} type="button">Đang đọc <span>{readingCount}</span></button>
        <button className={filter === 'completed' ? 'is-selected' : ''} onClick={() => setFilter('completed')} type="button">Đã hoàn thành <span>{completedCount}</span></button>
      </nav>

      {loading ? (
        <Loading label="Đang tải lịch sử đọc..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : history.length === 0 ? (
        <EmptyState
          actionLabel="Tìm truyện để đọc"
          actionTo="/search"
          description="Khi bạn đọc một chương, tiến độ gần nhất sẽ được lưu tại đây."
          title="Chưa có lịch sử đọc"
        />
      ) : (
        visibleHistory.length ? (
          <div className="library-list history-grid">
          {visibleHistory.map((item) => {
            const progress = item.pageCount > 0
              ? Math.min(100, Math.round((item.lastPageNumber / item.pageCount) * 100))
              : 0
            return (
              <article className="library-card history-card" key={item.id}>
                <Link className="library-cover-link" to={`/comics/${item.comicId}`}>
                  <CoverImage className="library-cover" src={item.comicCoverUrl} title={item.comicTitle} />
                </Link>
                <div className="library-card-copy">
                  <span className={`history-status ${progress >= 100 ? 'is-completed' : ''}`}>{progress >= 100 ? 'Đã hoàn thành' : 'Đang đọc'}</span>
                  <Link className="library-title" to={`/comics/${item.comicId}`}>{item.comicTitle}</Link>
                  <p>Chương {item.chapterNumber}{item.chapterTitle ? ` · ${item.chapterTitle}` : ''}</p>
                  <div className="reading-progress">
                    <span><i style={{ width: `${progress}%` }} /></span>
                    <small>{progress}%</small>
                  </div>
                  <small className="history-read-date">{formatDate(item.readAt)} · Trang {item.lastPageNumber}/{item.pageCount}</small>
                </div>
                <div className="library-card-actions">
                  <Link className="button button-primary button-small" to={`/read/${item.chapterId}?page=${item.lastPageNumber}`}>
                    {progress >= 100 ? 'Đọc lại →' : 'Tiếp tục đọc →'}
                  </Link>
                  <button
                    className="text-button remove-button"
                    disabled={removingId === item.id}
                    onClick={() => remove(item)}
                    type="button"
                  >
                    {removingId === item.id ? 'Đang xóa...' : 'Xóa lịch sử'}
                  </button>
                </div>
              </article>
            )
          })}
          </div>
        ) : (
          <EmptyState description="Hiện chưa có truyện trong trạng thái này." title="Không có kết quả" />
        )
      )}
    </main>
  )
}
