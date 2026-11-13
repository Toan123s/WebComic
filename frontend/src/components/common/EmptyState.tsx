import { Link } from 'react-router-dom'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="reader-empty">
      <span className="empty-mark" aria-hidden="true">C</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && actionTo && (
        <Link className="button button-primary" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
