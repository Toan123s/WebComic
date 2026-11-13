import { Link } from 'react-router-dom'
import type { ComicSummary } from '../../types/comic'
import { formatCount } from '../../utils/media'
import { CoverImage } from './CoverImage'

const publicationLabels: Record<string, string> = {
  ONGOING: 'Đang tiến hành',
  COMPLETED: 'Đã hoàn thành',
  HIATUS: 'Tạm ngưng',
}

export function ComicCard({ comic }: { comic: ComicSummary }) {
  return (
    <article className="comic-card">
      <Link
        aria-label={`Xem truyện ${comic.title}`}
        className="comic-card-cover-link"
        to={`/comics/${comic.id}`}
      >
        <CoverImage className="comic-card-cover" src={comic.coverUrl} title={comic.title} />
        <span className="comic-status-tag">
          {publicationLabels[comic.publicationStatus] ?? comic.publicationStatus}
        </span>
      </Link>
      <div className="comic-card-copy">
        <Link className="comic-card-title" to={`/comics/${comic.id}`}>
          {comic.title}
        </Link>
        <span className="comic-card-author">{comic.authorName || 'Tác giả ẩn danh'}</span>
        <div className="comic-card-meta">
          <span className="rating-mark">★ {comic.ratingAvg?.toFixed(1) ?? '—'}</span>
          <span>{formatCount(comic.viewCount)} lượt xem</span>
        </div>
      </div>
    </article>
  )
}
