import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShowcase } from '../../components/reader/AuthShowcase'
import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../services/api/apiClient'

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate replace to="/" />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }
    setSubmitting(true)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
      })
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShowcase>
      <section className="auth-card auth-card-register">
        <div className="auth-card-heading">
          <div><h1>Tạo tài khoản ComicHub</h1><p className="auth-intro">Tham gia cộng đồng và bắt đầu hành trình đọc truyện của bạn.</p></div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Tên hiển thị <span className="optional-label">Công khai</span>
            <input
              autoComplete="name"
              maxLength={100}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tên bạn muốn hiển thị"
              value={displayName}
            />
          </label>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Tên đăng nhập
            <input
              autoComplete="username"
              maxLength={50}
              minLength={3}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username"
              required
              value={username}
            />
          </label>
          <div className="register-password-grid">
            <label>
              Mật khẩu
              <span className="auth-password-field">
                <input
                  autoComplete="new-password"
                  maxLength={72}
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)} type="button">◉</button>
              </span>
            </label>
            <label>
              Xác nhận mật khẩu
              <span className="auth-password-field">
                <input
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                />
                <button aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} onClick={() => setShowConfirmPassword((value) => !value)} type="button">◉</button>
              </span>
            </label>
          </div>
          <label className="auth-checkbox auth-terms">
            <input checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required type="checkbox" />
            <span>Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a> và <a href="#privacy">Chính sách quyền riêng tư</a>.</span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary button-full" disabled={submitting || !acceptedTerms} type="submit">
            {submitting ? 'Đang tạo tài khoản...' : <>Tạo tài khoản <span aria-hidden="true">→</span></>}
          </button>
        </form>
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </section>
    </AuthShowcase>
  )
}
