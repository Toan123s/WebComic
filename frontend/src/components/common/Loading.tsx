export function Loading({ label = 'Đang tải nội dung...' }: { label?: string }) {
  return (
    <div className="reader-loading" role="status" aria-live="polite">
      <span className="reader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
