import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { comicApi } from '../../services/api/comicApi'
import type { ComicSummary } from '../../types/comic'
import { getApiErrorMessage } from '../../services/api/apiClient'
import { CoverImage } from './CoverImage'

export function AuthShowcase({ children }: { children: ReactNode }) {
  const [featured, setFeatured] = useState<ComicSummary | null>(null)
  const [featureError, setFeatureError] = useState('')

  useEffect(() => {
    let active = true
    comicApi.list()
      .then((comics) => {
        if (active) setFeatured(comics[0] ?? null)
      })
      .catch((error: unknown) => {
        if (active) {
          setFeatured(null)
          setFeatureError(getApiErrorMessage(error))
        }
      })
    return () => { active = false }
  }, [])

  return (
    <main className="auth-page auth-page-split">
      <section className="auth-showcase">
        {featured && <CoverImage className="auth-showcase-cover" src={featured.coverUrl} title={featured.title} />}
        <div className="auth-showcase-overlay" />
        <Link aria-label="ComicHub trang chủ" className="brand auth-showcase-brand" to="/">
          <span className="brand-mark">C</span>
          <span>Comic Hub<small>MANGA · WEBTOON · MANHWA</small></span>
        </Link>
        <span className="auth-server-status">MANGA · WEBTOON · MANHWA</span>
        <div className="auth-showcase-copy">
          <span className="eyebrow">✦ CỘNG ĐỒNG ĐỌC TRUYỆN</span>
          <h1>Mở ra thế giới truyện<br /><span>của riêng bạn</span></h1>
          <p>Khám phá những câu chuyện, lưu lại hành trình đọc và kết nối cùng cộng đồng đam mê truyện tranh.</p>
          {featureError && <p className="auth-showcase-error" role="status">{featureError}</p>}
        </div>
        <div className="auth-feature-strip">
          <article><span>▣</span><strong>Kho truyện đa dạng</strong><small>Khám phá nhiều câu chuyện.</small></article>
          <article><span>◷</span><strong>Lịch sử đọc</strong><small>Tiếp tục từ nơi bạn dừng lại.</small></article>
          <article><span>♧</span><strong>Chương mới</strong><small>Theo dõi hành trình của bạn.</small></article>
        </div>
      </section>
      <section className="auth-form-column">
        {children}
        <footer className="auth-footer">
          © {new Date().getFullYear()} ComicHub Platform
          <span>·</span><a href="#terms">Điều khoản dịch vụ</a><span>·</span><a href="#privacy">Quyền riêng tư</a>
        </footer>
      </section>
    </main>
  )
}
