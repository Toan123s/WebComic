import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { Pagination } from '../../components/common/Pagination'
import { ComicCard } from '../../components/reader/ComicCard'
import { categoryApi } from '../../services/api/categoryApi'
import { comicApi } from '../../services/api/comicApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import type { Category, ComicPage, ComicSummary, PublicationStatus } from '../../types/comic'

const pageSize = 12

function SearchFilters({
  keyword,
  categoryId,
  publicationStatus,
  categories,
  onSearch,
  onFilter,
}: {
  keyword: string
  categoryId: string
  publicationStatus: string
  categories: Category[]
  onSearch: (keyword: string) => void
  onFilter: (key: 'categoryId' | 'publicationStatus', value: string) => void
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSearch(String(formData.get('keyword') ?? '').trim())
  }

  return (
    <form className="filter-panel" key={keyword} onSubmit={submit}>
      <label className="filter-search">
        <span>Từ khóa</span>
        <input
          defaultValue={keyword}
          maxLength={100}
          name="keyword"
          placeholder="Tên truyện hoặc tác giả..."
          type="search"
        />
      </label>
      <label>
        <span>Thể loại</span>
        <select
          onChange={(event) => onFilter('categoryId', event.target.value)}
          value={categoryId}
        >
          <option value="">Tất cả thể loại</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Trạng thái</span>
        <select
          onChange={(event) => onFilter('publicationStatus', event.target.value)}
          value={publicationStatus}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ONGOING">Đang tiến hành</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="HIATUS">Tạm ngưng</option>
        </select>
      </label>
      <button className="button button-primary filter-submit">Tìm truyện</button>
    </form>
  )
}

export function SearchPage() {
  const location = useLocation()
  const isUpdatesPage = location.pathname === '/updates'
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const keyword = searchParams.get('keyword') ?? ''
  const categoryId = searchParams.get('categoryId') ?? ''
  const publicationStatus = searchParams.get('publicationStatus') ?? ''
  const parsedPage = Number(searchParams.get('page') ?? 0)
  const page = Number.isSafeInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0
  const [categories, setCategories] = useState<Category[]>([])
  const [results, setResults] = useState<ComicPage<ComicSummary> | null>(null)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [retry, setRetry] = useState(0)
  const requestKey = JSON.stringify({ keyword, categoryId, publicationStatus, page, retry })
  const [loadedKey, setLoadedKey] = useState('')
  const loading = loadedKey !== requestKey

  useEffect(() => {
    let active = true
    categoryApi.list()
      .then((items) => {
        if (active) setCategories(items)
      })
      .catch((requestError: unknown) => {
        if (active) setCategoryError(getApiErrorMessage(requestError))
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const categoryNumber = Number(categoryId)
    const parsedCategory = Number.isSafeInteger(categoryNumber) && categoryNumber > 0
      ? categoryNumber
      : undefined
    const selectedStatus: PublicationStatus | undefined =
      publicationStatus === 'ONGOING'
        || publicationStatus === 'COMPLETED'
        || publicationStatus === 'HIATUS'
        ? publicationStatus
        : undefined
    comicApi.search({
      keyword: keyword || undefined,
      categoryId: parsedCategory,
      publicationStatus: selectedStatus,
      page,
      size: pageSize,
    })
      .then((response) => {
        if (active) {
          setResults(response)
          setError('')
          setLoadedKey(requestKey)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiErrorMessage(requestError))
          setLoadedKey(requestKey)
        }
      })
    return () => {
      active = false
    }
  }, [keyword, categoryId, publicationStatus, page, retry, requestKey])

  const updateParams = (next: Record<string, string>) => {
    const updated = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value) updated.set(key, value)
      else updated.delete(key)
    })
    updated.set('page', '0')
    setSearchParams(updated)
  }

  const changePage = (nextPage: number) => {
    const updated = new URLSearchParams(searchParams)
    updated.set('page', String(nextPage))
    setSearchParams(updated)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className={`reader-content search-page ${isUpdatesPage ? 'updates-page' : ''}`}>
      <div className={`page-intro ${isUpdatesPage ? 'updates-intro' : ''}`}>
        <div>
          <span className="eyebrow">{isUpdatesPage ? '● CẬP NHẬT TRUYỆN' : 'KHO TRUYỆN COMICHUB'}</span>
          <h1>{isUpdatesPage ? 'Truyện mới cập nhật' : <>Tìm câu chuyện<br /><span>tiếp theo của bạn.</span></>}</h1>
          <p>{isUpdatesPage
            ? 'Theo dõi danh sách truyện công khai mới nhất trên ComicHub.'
            : 'Khám phá truyện theo tên, tác giả, thể loại hoặc trạng thái xuất bản.'}</p>
        </div>
        {isUpdatesPage && (
          <div className="updates-summary"><strong>{results?.totalElements ?? '—'}</strong><span>truyện trong danh sách</span></div>
        )}
        {!isUpdatesPage && <div className="intro-decoration" aria-hidden="true"><span>✦</span><i /><b /></div>}
      </div>

      {isUpdatesPage && (
        <div className="updates-toolbar">
          <nav aria-label="Bộ lọc cập nhật" className="updates-tabs">
            <Link className={!publicationStatus ? 'is-selected' : ''} to="/updates">Tất cả</Link>
            <button disabled title="Chưa có API theo dõi">Đang theo dõi</button>
            <button disabled title="Backend chưa cung cấp bộ lọc chương mới">Mới ra chương</button>
            <button
              className={publicationStatus === 'COMPLETED' ? 'is-selected' : ''}
              onClick={() => updateParams({ publicationStatus: 'COMPLETED' })}
              type="button"
            >
              Hoàn thành
            </button>
          </nav>
          <div className="updates-view-toggle" aria-label="Kiểu hiển thị">
            <button aria-label="Hiển thị dạng lưới" className={viewMode === 'grid' ? 'is-selected' : ''} onClick={() => setViewMode('grid')} type="button">▦</button>
            <button aria-label="Hiển thị dạng danh sách" className={viewMode === 'list' ? 'is-selected' : ''} onClick={() => setViewMode('list')} type="button">☷</button>
          </div>
        </div>
      )}

      <SearchFilters
        categoryId={categoryId}
        categories={categories}
        keyword={keyword}
        onFilter={(key, value) => updateParams({ [key]: value })}
        onSearch={(value) => updateParams({ keyword: value })}
        publicationStatus={publicationStatus}
      />

      {categoryError && <p className="inline-notice" role="status">Không tải được danh sách thể loại: {categoryError}</p>}

      <section className="reader-section search-results-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{keyword ? `KẾT QUẢ CHO “${keyword}”` : isUpdatesPage ? 'DANH SÁCH TRUYỆN CÔNG KHAI' : 'DANH SÁCH TRUYỆN'}</span>
            <h2>{loading ? 'Đang tìm kiếm...' : `${results?.totalElements ?? 0} truyện phù hợp`}</h2>
          </div>
          <Link className="section-link" to={isUpdatesPage ? '/' : '/updates'}>{isUpdatesPage ? 'Trang chủ' : 'Truyện mới cập nhật'} <span aria-hidden="true">→</span></Link>
        </div>
        {loading ? (
          <Loading label="Đang tìm truyện..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setRetry((value) => value + 1)} />
        ) : !results?.content.length ? (
          <EmptyState
            actionLabel="Xóa bộ lọc"
            actionTo="/search"
            description="Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc."
            title="Chưa tìm thấy truyện phù hợp"
          />
        ) : (
          <>
            <div className={`comic-grid ${isUpdatesPage ? 'updates-grid' : ''} ${viewMode === 'list' ? 'is-list' : ''}`}>
              {results.content.map((comic) => <ComicCard comic={comic} key={comic.id} />)}
            </div>
            <Pagination onChange={changePage} page={results.page} totalPages={results.totalPages} />
          </>
        )}
      </section>
    </main>
  )
}
