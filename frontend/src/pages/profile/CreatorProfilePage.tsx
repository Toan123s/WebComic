import { useState, type ChangeEvent, type FormEvent } from 'react'
import './CreatorProfilePage.css'

type ProfileForm = {
    fullName: string
    penName: string
    username: string
    email: string
    bio: string
    artstation: string
    behance: string
    facebook: string
}

type Toast = {
    id: number
    message: string
    error?: boolean
}

const INITIAL_FORM: ProfileForm = {
    fullName: 'Hoạt',
    penName: 'Hoạt',
    username: 'hoat_creator',
    email: '',
    bio: 'Tác giả truyện tranh tại ComicHub. Yêu thích sáng tác những câu chuyện có chiều sâu và thế giới nhân vật độc đáo.',
    artstation: '',
    behance: '',
    facebook: '',
}

export default function CreatorProfilePage() {
    const [form, setForm] = useState<ProfileForm>(INITIAL_FORM)
    const [avatar, setAvatar] = useState('')
    const [password, setPassword] = useState({
        current: '',
        next: '',
        confirm: '',
    })
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
    const [modal, setModal] = useState(false)
    const [toasts, setToasts] = useState<Toast[]>([])
    const [deviceConnected, setDeviceConnected] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(false)

    const notify = (message: string, error = false) => {
        const id = Date.now() + Math.random()
        setToasts((items) => [...items, { id, message, error }])
        window.setTimeout(() => {
            setToasts((items) => items.filter((item) => item.id !== id))
        }, 3000)
    }

    const updateField = (key: keyof ProfileForm, value: string) => {
        setForm((current) => ({ ...current, [key]: value }))
    }

    const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            notify('Vui lòng chọn một tệp hình ảnh.', true)
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            notify('Ảnh đại diện không được vượt quá 5 MB.', true)
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setAvatar(String(reader.result))
            notify('Đã cập nhật ảnh xem trước.')
        }
        reader.readAsDataURL(file)
    }

    const passwordStrength =
        password.next.length === 0 ? 0 :
            password.next.length < 8 ? 1 :
                password.next.length < 12 ? 2 : 3

    const saveProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.fullName.trim() || !form.penName.trim() || !form.username.trim()) {
            notify('Vui lòng nhập họ tên, bút danh và username.', true)
            return
        }

        notify('Thông tin hồ sơ đã được cập nhật trên giao diện!')
    }

    const changePassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!password.current || !password.next || !password.confirm) {
            notify('Vui lòng nhập đầy đủ các trường mật khẩu.', true)
            return
        }

        if (password.next.length < 8) {
            notify('Mật khẩu mới cần có ít nhất 8 ký tự.', true)
            return
        }

        if (password.next !== password.confirm) {
            notify('Mật khẩu xác nhận không khớp.', true)
            return
        }

        setPassword({ current: '', next: '', confirm: '' })
        notify('Kiểm tra hợp lệ thành công. Chưa gửi mật khẩu lên máy chủ.')
    }

    const togglePassword = (key: string) => {
        setShowPassword((current) => ({ ...current, [key]: !current[key] }))
    }

    const resetProfile = () => {
        setForm(INITIAL_FORM)
        notify('Đã khôi phục thông tin mẫu.')
    }

    return (
        <div className="creator-profile">
            <div className="cp-toasts" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`cp-toast${toast.error ? ' is-error' : ''}`}>
                        <span className="cp-toast-icon">{toast.error ? '!' : '✓'}</span>
                        {toast.message}
                    </div>
                ))}
            </div>

            <aside className="cp-sidebar">
                <div className="cp-brand">
                    <div className="cp-brand-mark">C</div>
                    <div>
                        <strong>ComicHub <span>Studio</span></strong>
                        <small>Không gian Tác giả</small>
                    </div>
                </div>

                <div className="cp-workspace">🎨 <span>Xưởng vẽ Sáng tác</span></div>

                <nav className="cp-side-nav">
                    <a href="/studio/overview">▦ <span>Tổng quan</span></a>
                    <a href="/studio/comics">▤ <span>Quản lý truyện</span></a>
                    <a href="/studio/chapters">▥ <span>Quản lý chương</span></a>
                    <a href="/studio/ai-assistant">✦ <span>Trợ lý AI</span><b>PRO</b></a>
                    <a className="active" href="/studio/profile">◉ <span>Hồ sơ cá nhân</span></a>
                </nav>

                <div className="cp-sidebar-bottom">
                    <div className="cp-storage">
                        <div><span>Dung lượng Studio</span><b>32%</b></div>
                        <div className="cp-storage-track"><i /></div>
                        <div className="cp-storage-info"><span>3.2 GB</span><span>10 GB khả dụng</span></div>
                    </div>
                    <div className="cp-version"><span>Phiên bản</span><b>v2.5.0 Studio</b></div>
                </div>
            </aside>

            <div className="cp-main">
                <header className="cp-topbar">
                    <div className="cp-breadcrumb-top">
                        <b>Studio</b><span>›</span><strong>Hồ sơ cá nhân</strong>
                    </div>
                    <div className="cp-top-actions">
                        <a className="cp-reader-link" href="/">↗ Trang đọc truyện</a>
                        <button className="cp-notification" type="button" onClick={() => notify('Bạn hiện không có thông báo mới.')}>
                            ♧ <i>3</i>
                        </button>
                        <div className="cp-user">
                            <div className="cp-user-avatar">{avatar ? <img src={avatar} alt="Ảnh đại diện" /> : 'H'}</div>
                            <div><b>Hoạt</b><small>Artist</small></div>
                        </div>
                    </div>
                </header>

                <main className="cp-content">
                    <section className="cp-page-heading">
                        <div className="cp-breadcrumb">
                            <span>Studio</span><span>›</span><span>Tài khoản tác giả</span><span>›</span><b>Hồ sơ cá nhân</b>
                        </div>
                        <div className="cp-heading-row">
                            <div>
                                <h1>Hồ sơ cá nhân &amp; Tài khoản</h1>
                                <p>Quản lý định danh sáng tác, bảo mật thông tin và thiết lập hiện diện công khai trên ComicHub.</p>
                            </div>
                            <a href="/" className="cp-public-link">◉ Xem trang độc giả</a>
                        </div>
                    </section>

                    <div className="cp-info-banner">
                        <span className="cp-info-icon">i</span>
                        <div>
                            <b>Hiện diện trên ComicHub</b>
                            <p>Thông tin hồ sơ giúp độc giả nhận diện tác giả và tìm hiểu các tác phẩm của bạn. Chỉ chia sẻ những thông tin liên hệ mà bạn muốn công khai.</p>
                        </div>
                    </div>

                    <div className="cp-layout">
                        <div className="cp-left-column">
                            <section className="cp-card cp-identity-card">
                                <div className="cp-identity">
                                    <div className="cp-avatar-wrap">
                                        <div className="cp-large-avatar">
                                            {avatar ? <img src={avatar} alt="Ảnh đại diện Hoạt" /> : 'H'}
                                        </div>
                                        <label className="cp-avatar-edit" title="Thay ảnh đại diện">
                                            📷
                                            <input type="file" accept="image/*" onChange={handleAvatar} />
                                        </label>
                                    </div>
                                    <div className="cp-identity-info">
                                        <div className="cp-name-line">
                                            <h2>{form.penName || 'Hoạt'}</h2>
                                            <span className="cp-verified">✓ Tác giả</span>
                                        </div>
                                        <p>@{form.username || 'hoat_creator'} · Creator Studio</p>
                                        <div className="cp-avatar-actions">
                                            <label className="cp-small-button">↑ Đổi ảnh đại diện
                                                <input type="file" accept="image/*" onChange={handleAvatar} />
                                            </label>
                                            <button type="button" className="cp-remove-avatar" onClick={() => { setAvatar(''); notify('Đã xóa ảnh xem trước.') }}>Xóa ảnh</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="cp-metrics">
                                    <div><span>Bộ truyện</span><b>4</b></div>
                                    <div><span>Tổng số chương</span><b>68</b></div>
                                    <div><span>Lượt đọc</span><b>412,850</b></div>
                                    <div><span>Đánh giá chung</span><b>4.92 <span className="cp-star">★</span></b></div>
                                </div>
                            </section>

                            <section className="cp-card">
                                <div className="cp-card-heading">
                                    <div>
                                        <h2>Thông tin tác giả công khai</h2>
                                        <p>Thông tin hiển thị trên trang hồ sơ tác giả.</p>
                                    </div>
                                    <span className="cp-heading-icon">▣</span>
                                </div>

                                <form className="cp-form" onSubmit={saveProfile}>
                                    <div className="cp-form-grid">
                                        <label className="cp-field">
                                            <span>Họ và tên tác giả <b>*</b></span>
                                            <input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                                        </label>
                                        <label className="cp-field">
                                            <span>Bút danh / Tên hiển thị <b>*</b></span>
                                            <input value={form.penName} onChange={(e) => updateField('penName', e.target.value)} />
                                        </label>
                                        <label className="cp-field">
                                            <span>Tên người dùng (Username) <b>*</b></span>
                                            <div className="cp-input-prefix"><span>@</span><input value={form.username} onChange={(e) => updateField('username', e.target.value)} /></div>
                                        </label>
                                        <label className="cp-field">
                                            <span>Email liên hệ</span>
                                            <input type="email" placeholder="Nhập email liên hệ (không bắt buộc)" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                                        </label>
                                    </div>

                                    <label className="cp-field">
                                        <span>Tiểu sử &amp; Định hướng sáng tác</span>
                                        <textarea rows={4} maxLength={300} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} />
                                        <small className="cp-char-count">{form.bio.length}/300 ký tự</small>
                                    </label>

                                    <div className="cp-field">
                                        <span>Liên kết mạng xã hội &amp; Portfolio</span>
                                        {([
                                            ['artstation', '✎', 'ArtStation'],
                                            ['behance', '▧', 'Behance'],
                                            ['facebook', 'f', 'Facebook'],
                                        ] as const).map(([key, icon, label]) => (
                                            <div className="cp-social-row" key={key}>
                                                <span className="cp-social-icon">{icon}</span>
                                                <b>{label}</b>
                                                <input
                                                    aria-label={label}
                                                    placeholder={`Nhập liên kết ${label}`}
                                                    value={form[key]}
                                                    onChange={(e) => updateField(key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cp-form-actions">
                                        <button type="button" className="cp-button cp-button-light" onClick={resetProfile}>Khôi phục</button>
                                        <button type="submit" className="cp-button cp-button-primary">✓ Lưu thay đổi</button>
                                    </div>
                                </form>
                            </section>
                        </div>

                        <div className="cp-right-column">
                            <section className="cp-card">
                                <div className="cp-card-heading">
                                    <div>
                                        <h2>Đổi mật khẩu &amp; Bảo mật</h2>
                                        <p>Bảo vệ tài khoản và tác phẩm của bạn.</p>
                                    </div>
                                    <span className="cp-heading-icon">♙</span>
                                </div>

                                <form className="cp-form" onSubmit={changePassword}>
                                    {([
                                        ['current', 'Mật khẩu hiện tại'],
                                        ['next', 'Mật khẩu mới'],
                                        ['confirm', 'Xác nhận mật khẩu mới'],
                                    ] as const).map(([key, label]) => (
                                        <label className="cp-field" key={key}>
                                            <span>{label}</span>
                                            <div className="cp-password-input">
                                                <input
                                                    type={showPassword[key] ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    placeholder="Nhập mật khẩu"
                                                    value={password[key]}
                                                    onChange={(e) => setPassword({ ...password, [key]: e.target.value })}
                                                />
                                                <button type="button" onClick={() => togglePassword(key)} aria-label="Hiện hoặc ẩn mật khẩu">
                                                    {showPassword[key] ? 'Ẩn' : 'Hiện'}
                                                </button>
                                            </div>
                                            {key === 'next' && (
                                                <div className="cp-strength">
                                                    <div><span>Độ mạnh mật khẩu</span><b>{['Chưa nhập', 'Yếu', 'Khá', 'Mạnh'][passwordStrength]}</b></div>
                                                    <div className="cp-strength-bars">
                                                        {[1, 2, 3].map((n) => <i key={n} className={n <= passwordStrength ? `level-${passwordStrength}` : ''} />)}
                                                    </div>
                                                    <small>Nên sử dụng ít nhất 8 ký tự.</small>
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                    <button type="submit" className="cp-button cp-button-light cp-full-button">♧ Cập nhật mật khẩu</button>
                                </form>
                                <p className="cp-security-note">Chức năng đổi mật khẩu cần được kết nối API để cập nhật tài khoản thật.</p>
                            </section>

                            <section className="cp-card">
                                <div className="cp-card-heading">
                                    <div>
                                        <h2>Phiên đăng nhập &amp; Thiết bị</h2>
                                        <p>Quản lý các thiết bị đang hiển thị trong phiên mẫu.</p>
                                    </div>
                                    <span className="cp-heading-icon">▣</span>
                                </div>

                                <div className="cp-device">
                                    <div className="cp-device-icon">▣</div>
                                    <div className="cp-device-info">
                                        <div><b>Trình duyệt hiện tại</b><span className="cp-current-label">Thiết bị này</span></div>
                                        <p>Windows · Trình duyệt web</p>
                                        <small>Phiên đang sử dụng</small>
                                    </div>
                                    <i className="cp-online-dot" />
                                </div>

                                <div className="cp-device cp-device-secondary">
                                    <div className="cp-device-icon">▣</div>
                                    <div className="cp-device-info">
                                        <b>Thiết bị phụ (mẫu)</b>
                                        <p>Phiên đăng nhập minh họa</p>
                                        <small>{deviceConnected ? 'Đang hiển thị trong danh sách' : 'Đã ngắt kết nối trên giao diện'}</small>
                                    </div>
                                    {deviceConnected && (
                                        <button className="cp-disconnect" type="button" onClick={() => { setDeviceConnected(false); notify('Đã ẩn thiết bị mẫu khỏi danh sách.') }}>
                                            Ngắt kết nối
                                        </button>
                                    )}
                                </div>

                                <div className="cp-notification-setting">
                                    <div><b>Thông báo qua email</b><small>Hiển thị tùy chọn nhận thông báo.</small></div>
                                    <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                                </div>

                                <div className="cp-logout-area">
                                    <button className="cp-button cp-logout-button" type="button" onClick={() => setModal(true)}>
                                        ⇥ Đăng xuất khỏi Creator Studio
                                    </button>
                                    <small>Đây là thao tác xác nhận giao diện mẫu.</small>
                                </div>
                            </section>
                        </div>
                    </div>

                    <footer className="cp-footer">© ComicHub Studio · Không gian sáng tác của bạn</footer>
                </main>
            </div>

            {modal && (
                <div className="cp-modal-backdrop" role="presentation" onMouseDown={(e) => {
                    if (e.target === e.currentTarget) setModal(false)
                }}>
                    <div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
                        <div className="cp-modal-icon">⇥</div>
                        <h2 id="cp-modal-title">Xác nhận đăng xuất</h2>
                        <p>Bạn có muốn kết thúc phiên làm việc tại ComicHub Creator Studio không?</p>
                        <div className="cp-modal-actions">
                            <button type="button" className="cp-button cp-button-light" onClick={() => setModal(false)}>Ở lại làm việc</button>
                            <button type="button" className="cp-button cp-logout-button" onClick={() => {
                                setModal(false)
                                notify('Đăng xuất thật cần được kết nối với hệ thống xác thực.')
                            }}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}