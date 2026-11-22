
import { useState } from 'react';
import type { FormEvent } from 'react';
import './RegisterPage.css';

const features = [
    { icon: 'grid_view', title: 'Kho truyện', description: 'Đa dạng thể loại' },
    { icon: 'bookmark', title: 'Lịch sử đọc', description: 'Đồng bộ tức thì' },
    { icon: 'bolt', title: 'Chương mới', description: 'Thông báo siêu tốc' },
];

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [message, setMessage] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage('');

        if (displayName.trim().length < 2) {
            setMessage('Tên hiển thị cần có ít nhất 2 ký tự.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        if (username.trim().length < 4) {
            setMessage('Tên đăng nhập cần có ít nhất 4 ký tự.');
            return;
        }

        if (password.length < 8) {
            setMessage('Mật khẩu cần có ít nhất 8 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (!acceptedTerms) {
            setMessage('Vui lòng đồng ý với điều khoản sử dụng.');
            return;
        }

        setMessage('Thông tin hợp lệ! Đây là bản giao diện, chức năng tạo tài khoản chưa kết nối Backend.');
    }

    return (
        <main className="rg-page">
            {/* PANEL BÊN TRÁI */}
            <section className="rg-promo">
                <div className="rg-promo-image" />
                <div className="rg-promo-gradient" />
                <div className="rg-promo-glow" />

                <header className="rg-brand">
                    <a href="/" className="rg-brand-link">
                        <div className="rg-brand-logo">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCol6i3SjN7Zn7_YLjlGw535ocF0V2M0rTnDynIP9TY-MFm-P0B4N2mPehcYCpia8I1lwZnfpZR6T_93vIfmm8jxmQygpwfml6pb5OjxtyAMrwMS63LMfuykdhydeh2P9VXybvDk9TDJtAlwIMzKrJ9nm7n31ZdVLdt7f8sB0kW43_Yjh6I3JtLOsAXut21lKOEtCVaIydDv4jvVn1CE22GLcFNYte12nMmweb0jvJVcJB8stMligDdww"
                                alt="ComicHub Logo"
                            />
                        </div>
                        <div className="rg-brand-text">
                            <span>ComicHub</span>
                            <small>Manga Sanctuary</small>
                        </div>
                    </a>
                </header>

                <div className="rg-promo-content">
                    <div className="rg-promo-badge">
                        <i />
                        Nền tảng đọc truyện thế hệ mới
                    </div>

                    <h1>
                        <span>Mở ra thế giới truyện</span>
                        <span className="rg-highlight-text">của riêng bạn</span>
                    </h1>

                    <p className="rg-promo-description">
                        Khám phá hàng nghìn câu chuyện, lưu lại hành trình đọc và kết nối
                        cùng cộng đồng độc giả đam mê truyện tranh toàn quốc.
                    </p>

                    <div className="rg-reading-stat">
                        <div className="rg-stat-icon">
                            <span className="material-symbols-outlined">auto_stories</span>
                        </div>
                        <div>
                            <strong>Hơn 45.000+ Bộ truyện</strong>
                            <small>Cập nhật liên tục 24/7 không gián đoạn</small>
                        </div>
                    </div>
                </div>

                <div className="rg-features">
                    {features.map((feature) => (
                        <div className="rg-feature" key={feature.title}>
                            <div className="rg-feature-icon">
                                <span className="material-symbols-outlined">{feature.icon}</span>
                            </div>
                            <div className="rg-feature-text">
                                <strong>{feature.title}</strong>
                                <small>{feature.description}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PANEL BÊN PHẢI */}
            <section className="rg-form-panel">
                <div className="rg-form-glow" />

                <div className="rg-register-card">
                    <div className="rg-mobile-brand">
                        <a href="/" className="rg-brand-link">
                            <div className="rg-brand-logo">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCol6i3SjN7Zn7_YLjlGw535ocF0V2M0rTnDynIP9TY-MFm-P0B4N2mPehcYCpia8I1lwZnfpZR6T_93vIfmm8jxmQygpwfml6pb5OjxtyAMrwMS63LMfuykdhydeh2P9VXybvDk9TDJtAlwIMzKrJ9nm7n31ZdVLdt7f8sB0kW43_Yjh6I3JtLOsAXut21lKOEtCVaIydDv4jvVn1CE22GLcFNYte12nMmweb0jvJVcJB8stMligDdww"
                                    alt="ComicHub Logo"
                                />
                            </div>
                            <div className="rg-brand-text">
                                <span>ComicHub</span>
                                <small>Manga Sanctuary</small>
                            </div>
                        </a>
                    </div>

                    <div className="rg-form-heading">
                        <h2>Tạo tài khoản ComicHub</h2>
                        <p>Tham gia cộng đồng và bắt đầu hành trình đọc truyện của bạn.</p>
                    </div>

                    <form className="rg-form" onSubmit={handleSubmit} noValidate>
                        <div className="rg-field">
                            <label htmlFor="rg-display-name">
                                <span>Tên hiển thị</span>
                                <small>Công khai</small>
                            </label>
                            <div className="rg-input-box">
                                <span className="material-symbols-outlined">badge</span>
                                <input
                                    id="rg-display-name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Ví dụ: MangaReader_99"
                                    value={displayName}
                                    onChange={(event) => setDisplayName(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rg-field">
                            <label htmlFor="rg-email">Email</label>
                            <div className="rg-input-box">
                                <span className="material-symbols-outlined">mail</span>
                                <input
                                    id="rg-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rg-field">
                            <label htmlFor="rg-username">Tên đăng nhập</label>
                            <div className="rg-input-box">
                                <span className="material-symbols-outlined">person</span>
                                <input
                                    id="rg-username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rg-password-grid">
                            <div className="rg-field">
                                <label htmlFor="rg-password">Mật khẩu</label>
                                <div className="rg-input-box">
                                    <span className="material-symbols-outlined">lock</span>
                                    <input
                                        id="rg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="rg-password-toggle"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="rg-field">
                                <label htmlFor="rg-confirm-password">Xác nhận mật khẩu</label>
                                <div className="rg-input-box">
                                    <span className="material-symbols-outlined">lock_reset</span>
                                    <input
                                        id="rg-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="rg-password-toggle"
                                        onClick={() => setShowConfirmPassword((value) => !value)}
                                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <label className="rg-terms">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(event) => setAcceptedTerms(event.target.checked)}
                            />
                            <span>
                                Tôi đồng ý với <a href="/terms">Điều khoản sử dụng</a> và{' '}
                                <a href="/privacy">Chính sách quyền riêng tư</a>.
                            </span>
                        </label>

                        {message && (
                            <p className="rg-message" role="status">{message}</p>
                        )}

                        <button className="rg-submit" type="submit">
                            <span>Tạo tài khoản</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </form>

                    <div className="rg-login-prompt">
                        <p>
                            Đã có tài khoản?
                            <a href="/">Đăng nhập</a>
                        </p>
                    </div>

                    <footer className="rg-footer">
                        <div className="rg-footer-links">
                            <a href="/terms">Điều khoản dịch vụ</a>
                            <a href="/privacy">Quyền riêng tư</a>
                            <a href="mailto:support@comichub.vn">Hỗ trợ</a>
                        </div>
                        <p>© 2026 ComicHub Platform. All rights reserved.</p>
                    </footer>
                </div>
            </section>
        </main>
    );
}
