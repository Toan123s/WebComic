import { Link } from 'react-router-dom'

export function FollowingPage() {
  return (
    <main className="reader-content feature-unavailable">
      <span className="eyebrow">TÍNH NĂNG ĐANG ĐƯỢC HOÀN THIỆN</span>
      <h1>Theo dõi tác giả<br /><span>sẽ sớm trở lại.</span></h1>
      <p>
        Backend hiện chưa có API theo dõi. Để không hiển thị danh sách giả, mục này sẽ mở khi nghiệp vụ follow được triển khai.
      </p>
      <Link className="button button-primary" to="/search">Khám phá truyện đang có</Link>
    </main>
  )
}
