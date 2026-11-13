import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShowcase } from '../../components/reader/AuthShowcase'
import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../services/api/apiClient'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate replace to="/" />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ usernameOrEmail: usernameOrEmail.trim(), password })
      const state = location.state as { from?: { pathname?: string } } | null
      navigate(state?.from?.pathname ?? '/', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShowcase>
      <section className="auth-card">
        <div className="auth-card-heading">
          <div><h1>Chào mừng trở lại!</h1><p className="auth-intro">Đăng nhập để tiếp tục hành trình đọc truyện của bạn.</p></div>
          <span className="auth-lock" aria-hidden="true">▣</span>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email hoặc tên đăng nhập
            <input
              autoComplete="username"
              placeholder="reader@comichub.vn hoặc username"
              onChange={(event) => setUsernameOrEmail(event.target.value)}
              required
              value={usernameOrEmail}
            />
          </label>
          <label>
            Mật khẩu
            <span className="auth-password-field">
              <input
                autoComplete="current-password"
                placeholder="Nhập mật khẩu của bạn"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)} type="button">◉</button>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="auth-remember-row">
            <label className="auth-checkbox" title="Tùy chọn ghi nhớ đăng nhập chưa được hỗ trợ">
              <input disabled type="checkbox" /> Ghi nhớ đăng nhập
            </label>
            <span className="auth-unavailable">Quên mật khẩu?</span>
          </div>
          <button className="button button-primary button-full" disabled={submitting} type="submit">
            {submitting ? 'Đang đăng nhập...' : <>Đăng nhập <span aria-hidden="true">→</span></>}
          </button>
        </form>
        <div className="auth-divider"><span>HOẶC TIẾP TỤC QUA</span></div>
        <div className="auth-social-actions">
          <button disabled type="button">Google <small>Sắp có</small></button>
          <button disabled type="button">Apple ID <small>Sắp có</small></button>
        </div>
        <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </section>
    </AuthShowcase>
  )
}
