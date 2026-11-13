import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/api/apiClient'
import { SearchBar } from '../components/common/SearchBar'

const navigation = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/updates', label: 'Truyện mới cập nhật' },
  { to: '/reader/history', label: 'Lịch sử đọc' },
]

export function ReaderLayout() {
  const { session, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  const isReading = location.pathname.startsWith('/read/')

  const handleLogout = async () => {
    setLogoutError('')
    try {
      await logout()
      navigate('/')
    } catch (error) {
      setLogoutError(getApiErrorMessage(error))
      navigate('/')
    }
  }

  return (
    <div className={`reader-shell ${isReading ? 'reader-shell-reading' : ''}`}>
      <div className="reader-main">
        {!isReading && (
          <header className="reader-topbar">
            <Link aria-label="ComicHub trang chủ" className="brand" to="/">
              <span className="brand-mark">C</span>
              <span>ComicHub</span>
            </Link>
            <nav className="reader-nav" aria-label="Điều hướng chính">
              {navigation.map((item) => (
                <NavLink
                  className={({ isActive }) => `reader-nav-link ${isActive ? 'is-active' : ''}`}
                  end={item.end}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="topbar-search"><SearchBar /></div>
            <div className="topbar-account">
              <button
                aria-label="Thông báo (sắp có)"
                className="topbar-icon-button"
                disabled
                title="Thông báo sẽ có trong phiên bản sau"
                type="button"
              >
                ♧
              </button>
              {isAuthenticated && session ? (
                <>
                  <Link aria-label="Hồ sơ cá nhân" className="account-link" to="/reader/profile">
                    <span className="avatar-bubble">
                      {(session.displayName || session.username).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="account-name">{session.displayName || session.username}</span>
                  </Link>
                  <button aria-label="Đăng xuất" className="text-button logout-button" onClick={handleLogout} type="button">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link className="text-button" to="/login">Đăng nhập</Link>
                  <Link className="button button-primary button-small" to="/register">Đăng ký</Link>
                </>
              )}
            </div>
          </header>
        )}
        {logoutError && <p className="inline-notice" role="status">{logoutError}</p>}
        <Outlet />
        {!isReading && (
          <footer className="reader-footer">
            <Link className="brand brand-footer" to="/">
              <span className="brand-mark">C</span><span>comic<span>hub</span></span>
            </Link>
            <span>© {new Date().getFullYear()} ComicHub Platform. Nền tảng đọc truyện tranh trực tuyến.</span>
            <nav aria-label="Liên kết cuối trang" className="footer-links">
              <Link to="/reader/profile">Tài khoản</Link>
              <Link to="/reader/bookmarks">Tủ truyện</Link>
              <Link to="/updates">Truyện mới</Link>
            </nav>
          </footer>
        )}
      </div>
    </div>
  )
}
