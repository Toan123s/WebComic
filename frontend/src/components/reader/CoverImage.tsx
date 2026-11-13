import { useState } from 'react'
import { resolveMediaUrl } from '../../utils/media'

export function CoverImage({
  src,
  title,
  className = '',
}: {
  src: string | null | undefined
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const url = resolveMediaUrl(src)

  return (
    <div className={`cover-image ${className}`} aria-label={title}>
      {url && !failed ? (
        <img alt={title} loading="lazy" onError={() => setFailed(true)} src={url} />
      ) : (
        <span aria-hidden="true">{title.trim().slice(0, 1).toUpperCase() || 'C'}</span>
      )}
    </div>
  )
}
