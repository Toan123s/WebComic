import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { CoverImage } from '../../components/reader/CoverImage'
import { bookmarkApi } from '../../services/api/bookmarkApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import type { Bookmark } from '../../types/reader'
import { formatDate } from '../../utils/media'

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    bookmarkApi.list()
      .then((items) => {
        if (active) setBookmarks(items)
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

  const remove = async (bookmark: Bookmark) => {
    setRemovingId(bookmark.id)
    setError('')
    try {
      await bookmarkApi.remove(bookmark.id)
      setBookmarks((current) => current.filter((item) => item.id !== bookmark.id))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main className="reader-content personal-library-page">
      <div className="page-intro library-intro">
        <div>
          <span className="eyebrow">GÓC RIÊNG CỦA BẠN</span>
          <h1>Tủ truyện<br /><span>đã lưu.</span></h1>
          <p>Những bộ truyện bạn yêu thích, luôn nằm trong tầm tay.</p>
        </div>
        <div className="library-count"><strong>{bookmarks.length}</strong><span>truyện trong tủ</span></div>
      </div>

      {loading ? (
        <Loading label="Đang mở tủ truyện..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          actionLabel="Khám phá truyện"
          actionTo="/search"
          description="Lưu bộ truyện bạn muốn đọc để quay lại bất cứ lúc nào."
          title="Tủ truyện đang chờ câu chuyện đầu tiên"
        />
      ) : (
        <div className="library-list bookmark-grid">
          {bookmarks.map((bookmark) => (
            <article className="library-card" key={bookmark.id}>
              <Link className="library-cover-link" to={`/comics/${bookmark.comicId}`}>
                <CoverImage className="library-cover" src={bookmark.coverUrl} title={bookmark.title} />
              </Link>
              <div className="library-card-copy">
                <span className="eyebrow">ĐÃ LƯU {formatDate(bookmark.createdAt)}</span>
                <Link className="library-title" to={`/comics/${bookmark.comicId}`}>{bookmark.title}</Link>
                <p>Tiếp tục khám phá chương truyện mới nhất.</p>
              </div>
              <div className="library-card-actions">
                <Link className="button button-primary button-small" to={`/comics/${bookmark.comicId}`}>Mở truyện →</Link>
                <button
                  className="text-button remove-button"
                  disabled={removingId === bookmark.id}
                  onClick={() => remove(bookmark)}
                  type="button"
                >
                  {removingId === bookmark.id ? 'Đang xóa...' : 'Bỏ lưu'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
