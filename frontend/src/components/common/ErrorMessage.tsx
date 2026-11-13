export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="reader-error" role="alert">
      <div>
        <strong>Không tải được dữ liệu</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="button button-secondary" onClick={onRetry} type="button">
          Thử lại
        </button>
      )}
    </div>
  )
}
