import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { Loading } from '../../components/common/Loading'
import { useAuth } from '../../hooks/useAuth'
import { bookmarkApi } from '../../services/api/bookmarkApi'
import { getApiErrorMessage } from '../../services/api/apiClient'
import { readingHistoryApi } from '../../services/api/readingHistoryApi'
import { userApi } from '../../services/api/userApi'
import type { UserProfile } from '../../types/auth'
import { formatDate } from '../../utils/media'

export function ReaderProfilePage() {
  const { session, updateDisplayName } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [libraryCounts, setLibraryCounts] = useState<{ bookmarks: number; history: number } | null>(null)
  const [libraryStatsError, setLibraryStatsError] = useState('')

  useEffect(() => {
    let active = true
    if (!session) return () => { active = false }
    userApi.getById(session.userId)
      .then((user) => {
        if (!active) return
        setProfile(user)
        setDisplayName(user.displayName ?? '')
        setAvatarUrl(user.avatarUrl ?? '')
        setBio(user.bio ?? '')
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [session])

  useEffect(() => {
    let active = true
    Promise.all([bookmarkApi.list(), readingHistoryApi.list()])
      .then(([bookmarks, history]) => {
        if (active) setLibraryCounts({ bookmarks: bookmarks.length, history: history.length })
      })
      .catch((requestError: unknown) => {
        if (active) setLibraryStatsError(getApiErrorMessage(requestError))
      })
    return () => { active = false }
  }, [])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await userApi.update(profile.id, {
        username: profile.username,
        email: profile.email,
        displayName,
        avatarUrl,
        bio,
      })
      setProfile(updated)
      updateDisplayName(updated.displayName)
      setSuccess('Thông tin hồ sơ đã được cập nhật.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="reader-content"><Loading label="Đang tải hồ sơ..." /></main>
  if (error && !profile) {
    return <main className="reader-content"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></main>
  }
  if (!profile) return null

  return (
    <main className="reader-content profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar">
          {avatarUrl ? <img alt="" onError={(event) => { event.currentTarget.hidden = true }} src={avatarUrl} /> : null}
          <span>{(displayName || profile.username).slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="profile-header-copy">
          <span className="eyebrow">TRANG CÁ NHÂN</span>
          <h1>{displayName || profile.username}</h1>
          <p>@{profile.username} <span>·</span> {profile.email}</p>
          <p>{bio || 'Chào mừng bạn đến với ComicHub.'}</p>
        </div>
        <div className="profile-header-stats">
          <div><strong>{libraryCounts?.bookmarks ?? '—'}</strong><span>Yêu thích</span></div>
          <div><strong>{libraryCounts?.history ?? '—'}</strong><span>Lịch sử đọc</span></div>
        </div>
        {libraryStatsError && <p className="profile-stats-error" role="status">{libraryStatsError}</p>}
      </div>

      <nav aria-label="Điều hướng hồ sơ" className="profile-tabs">
        <a aria-current="page" className="is-selected" href="#profile-info">Thông tin cá nhân</a>
        <Link to="/reader/bookmarks">Truyện yêu thích</Link>
        <Link to="/reader/following">Truyện theo dõi <small>API sắp có</small></Link>
        <Link to="/reader/history">Lịch sử đọc</Link>
      </nav>

      <div className="profile-grid">
        <section className="profile-card" id="profile-info">
          <div className="section-heading">
            <div><h2>Cập nhật hồ sơ</h2></div>
            <span className="chapter-count">Tham gia: {formatDate(profile.createdAt)}</span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}
          <form className="profile-form" onSubmit={save}>
            <label>
              Tên hiển thị
              <input maxLength={100} onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
            </label>
            <label>
              Ảnh đại diện URL
              <input maxLength={500} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." value={avatarUrl} />
            </label>
            <label>
              Giới thiệu
              <textarea maxLength={500} onChange={(event) => setBio(event.target.value)} rows={4} value={bio} />
            </label>
            <div className="profile-readonly-fields">
              <span><small>Tên đăng nhập</small><strong>{profile.username}</strong></span>
              <span><small>Email</small><strong>{profile.email}</strong></span>
              <span><small>Tham gia</small><strong>{formatDate(profile.createdAt)}</strong></span>
            </div>
            <button className="button button-primary" disabled={saving} type="submit">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </section>

        <aside className="profile-side-panels">
          <section className="profile-card profile-password-card">
            <div className="section-heading"><div><h2>Đổi mật khẩu</h2></div><span className="soon-badge">Sắp có</span></div>
            <p className="muted-copy">API đổi mật khẩu chưa được triển khai. Thông tin đăng nhập hiện tại vẫn được bảo vệ.</p>
            <label>Mật khẩu hiện tại<input disabled placeholder="Chưa khả dụng" type="password" /></label>
            <button className="button button-secondary button-full" disabled type="button">Cập nhật mật khẩu</button>
          </section>
          <section className="profile-card profile-privacy-card">
            <div className="section-heading"><div><h2>Cài đặt &amp; quyền riêng tư</h2></div></div>
            <p className="muted-copy">Các tùy chọn thông báo và quyền riêng tư chưa có API lưu.</p>
            <label><span>Thông báo khi có chương mới</span><input aria-label="Thông báo khi có chương mới" disabled type="checkbox" /></label>
            <label><span>Nhận email sự kiện</span><input aria-label="Nhận email sự kiện" disabled type="checkbox" /></label>
            <label><span>Ẩn lịch sử đọc công khai</span><input aria-label="Ẩn lịch sử đọc công khai" disabled type="checkbox" /></label>
          </section>
        </aside>
      </div>
    </main>
  )
}
