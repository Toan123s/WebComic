export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const first = Math.max(0, Math.min(page - 2, totalPages - 5))
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => first + index,
  )

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        className="page-button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        type="button"
      >
        Trước
      </button>
      {pages.map((item) => (
        <button
          aria-current={item === page ? 'page' : undefined}
          className={`page-button ${item === page ? 'is-current' : ''}`}
          key={item}
          onClick={() => onChange(item)}
          type="button"
        >
          {item + 1}
        </button>
      ))}
      <button
        className="page-button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        type="button"
      >
        Sau
      </button>
    </nav>
  )
}
