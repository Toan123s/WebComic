import { useState } from 'react';
import './CreatorDashboardPage.css';

const comics = [
    {
        title: 'Huyền Vũ Ký Sự',
        genre: 'Manhwa Võ hiệp kỳ ảo',
        status: 'Đã duyệt / Xuất bản',
        statusType: 'published',
        chapter: 'Chap 34 mới nhất',
        updated: '2 giờ trước',
        detail: '18,420 lượt đọc',
        cover: '🐉',
        coverType: 'cover-blue',
        action: 'Viết tiếp Chap 35',
    },
    {
        title: 'Thợ Săn Ký Ức Đêm',
        genre: 'Sci-fi Trinh thám',
        status: 'Bản nháp',
        statusType: 'draft',
        chapter: 'Chap 1 (Bản nháp storyboard)',
        updated: 'Hôm qua',
        detail: '12 khung phác thảo',
        cover: '🌃',
        coverType: 'cover-purple',
        action: 'Tiếp tục soạn thảo',
    },
    {
        title: 'Tiệm Trà Không Gian 404',
        genre: 'Sci-Fi Hài hước',
        status: 'Chờ duyệt',
        statusType: 'pending',
        chapter: "Chap 18 - 'Hương Trà Tinh Vân'",
        updated: '2 ngày trước',
        detail: 'Đang trong hàng đợi thẩm định',
        cover: '🪐',
        coverType: 'cover-pink',
        action: 'Xem tiến độ',
    },
    {
        title: 'Kỳ Án Hoàng Thành',
        genre: 'Cổ trang Trinh thám',
        status: 'Cần chỉnh sửa',
        statusType: 'revision',
        chapter: "Chap 12 - 'Bóng Ma Điện Kính Thiên'",
        updated: '4 ngày trước',
        detail: '1 góp ý từ ban biên tập',
        cover: '🏯',
        coverType: 'cover-orange',
        action: 'Sửa & Gửi lại',
    },
];

function CreatorDashboardPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredComics = comics.filter((comic) =>
        comic.title.toLowerCase().includes(search.toLowerCase()),
    );

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div
            className={`creator-dashboard ${
                collapsed ? 'sidebar-collapsed' : ''
            }`}
        >
            {mobileMenuOpen && (
                <button
                    className="dashboard-backdrop"
                    aria-label="Đóng menu"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                className={`dashboard-sidebar ${
                    mobileMenuOpen ? 'mobile-open' : ''
                }`}
            >
                <div className="dashboard-brand">
                    <div className="brand-logo">C</div>

                    <div className="brand-info">
                        <div className="brand-name">
                            ComicHub <span>Studio</span>
                        </div>
                        <div className="brand-subtitle">Không gian Tác giả</div>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={closeMobileMenu}
                        aria-label="Đóng menu"
                    >
                        ×
                    </button>
                </div>

                <div className="dashboard-workspace">
                    <span>🎨</span>
                    <span className="sidebar-label">Xưởng vẽ Sáng tác</span>
                </div>

                <nav className="dashboard-nav">
                    <a href="/studio" className="dashboard-nav-item active">
                        <span className="nav-icon">▦</span>
                        <span className="sidebar-label">Tổng quan</span>
                    </a>

                    <a href="/studio/comics" className="dashboard-nav-item">
                        <span className="nav-icon">▤</span>
                        <span className="sidebar-label">Quản lý truyện</span>
                    </a>

                    <a href="/studio/comics" className="dashboard-nav-item">
                        <span className="nav-icon">▥</span>
                        <span className="sidebar-label">Quản lý chương</span>
                    </a>

                    <a href="/studio/ai-assistant" className="dashboard-nav-item">
                        <span className="nav-icon ai-icon">✧</span>
                        <span className="sidebar-label">Trợ lý AI</span>
                        <span className="nav-pro">PRO</span>
                    </a>
                </nav>

                <div className="dashboard-sidebar-bottom">
                    <div className="storage-box">
                        <div className="storage-heading">
                            <span className="sidebar-label">Dung lượng Studio</span>
                            <strong>32%</strong>
                        </div>

                        <div className="storage-track">
                            <div className="storage-progress" />
                        </div>

                        <div className="storage-caption sidebar-label">
                            <span>3.2 GB</span>
                            <span>10 GB khả dụng</span>
                        </div>
                    </div>

                    <div className="version-info sidebar-label">
                        <span>Phiên bản</span>
                        <span>v2.5.0 Studio</span>
                    </div>
                </div>
            </aside>

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => {
                                if (window.innerWidth <= 900) {
                                    setMobileMenuOpen(!mobileMenuOpen);
                                } else {
                                    setCollapsed(!collapsed);
                                }
                            }}
                            aria-label="Mở hoặc thu gọn menu"
                        >
                            ☰
                        </button>

                        <div className="dashboard-breadcrumb">
                            <strong>Studio</strong>
                            <span>›</span>
                            <span>Tổng quan</span>
                        </div>

                        <div className="dashboard-search">
                            <span>⌕</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm truyện..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="header-actions">
                        <a className="reader-site-link" href="/">
                            ↗ Trang đọc truyện
                        </a>

                        <div className="header-dropdown-wrapper">
                            <button
                                className="notification-button"
                                onClick={() => {
                                    setNotificationOpen(!notificationOpen);
                                    setProfileOpen(false);
                                }}
                                aria-label="Thông báo"
                            >
                                ♧
                                <span className="notification-count">3</span>
                            </button>

                            {notificationOpen && (
                                <div className="header-dropdown notification-dropdown">
                                    <strong>Thông báo</strong>
                                    <div className="dropdown-notice">
                                        <b>Duyệt chương mới</b>
                                        <p>Chương mới đã được ban biên tập phê duyệt.</p>
                                    </div>
                                    <div className="dropdown-notice">
                                        <b>Phản hồi xét duyệt</b>
                                        <p>Có góp ý mới từ ban biên tập.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="header-dropdown-wrapper">
                            <button
                                className="profile-trigger"
                                onClick={() => {
                                    setProfileOpen(!profileOpen);
                                    setNotificationOpen(false);
                                }}
                            >
                                <div className="profile-avatar">H</div>
                                <div className="profile-trigger-info">
                                    <strong>Hoạt</strong>
                                    <span>Artist</span>
                                </div>
                                <span>⌄</span>
                            </button>

                            {profileOpen && (
                                <div className="header-dropdown profile-dropdown">
                                    <div className="dropdown-account">
                                        <strong>Hoạt</strong>
                                        <span>Tài khoản tác giả</span>
                                    </div>

                                    <a href="/studio/profile">♙ Hồ sơ cá nhân</a>
                                    <a href="/studio/profile">⚙ Cài đặt tài khoản</a>
                                    <a href="/login" className="logout-link">
                                        ↪ Đăng xuất
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="dashboard-content">
                    <section className="dashboard-welcome">
                        <div>
                            <div className="welcome-badge">
                                <span className="live-dot" />
                                Bàn làm việc sáng tác trực tiếp
                            </div>

                            <h1>Chào mừng trở lại, Hoạt! ✨</h1>

                            <p>
                                Không gian tập trung sáng tác và phát triển nội dung truyện
                                tranh không xao nhãng.
                            </p>
                        </div>

                        <div className="welcome-actions">
                            <a href="/studio/comics" className="dashboard-button secondary">
                                ＋ Tạo truyện mới
                            </a>

                            <a
                                href="/studio/ai-assistant"
                                className="dashboard-button ai-button"
                            >
                                ✧ Mở Trợ lý AI
                            </a>

                            <a href="/studio/comics" className="dashboard-button primary">
                                ✎ Tiếp tục sáng tác
                            </a>
                        </div>
                    </section>

                    <section className="dashboard-stats">
                        <article className="stat-card">
                            <div className="stat-heading">
                                <span>TỔNG SỐ TRUYỆN</span>
                                <div className="stat-icon blue">▤</div>
                            </div>
                            <div className="stat-number">
                                4 <span>bộ truyện</span>
                            </div>
                            <p>● 3 đang phát hành　·　1 bản nháp</p>
                        </article>

                        <article className="stat-card">
                            <div className="stat-heading">
                                <span>KHỐI LƯỢNG NỘI DUNG</span>
                                <div className="stat-icon purple">▥</div>
                            </div>
                            <div className="stat-number">
                                68 <span>chương đã vẽ</span>
                            </div>
                            <p>Hoàn tất kịch bản và bản thảo khung hình</p>
                        </article>

                        <article className="stat-card">
                            <div className="stat-heading">
                                <span>CHỜ BIÊN TẬP KIỂM DUYỆT</span>
                                <div className="stat-icon cyan">◷</div>
                            </div>
                            <div className="stat-number highlighted">
                                2 <span>chương đang thẩm định</span>
                            </div>
                            <p>Theo dõi tiến độ xét duyệt tác phẩm</p>
                        </article>
                    </section>

                    <section className="recent-section">
                        <div className="section-heading">
                            <div>
                                <h2>Tác phẩm cập nhật gần đây</h2>
                                <p>
                                    Truy cập nhanh vào bản thảo mới nhất để tiếp tục sáng tác.
                                </p>
                            </div>

                            <a href="/studio/comics" className="view-all-link">
                                Tất cả tác phẩm →
                            </a>
                        </div>

                        <div className="comic-list">
                            {filteredComics.length > 0 ? (
                                filteredComics.map((comic) => (
                                    <article className="comic-row" key={comic.title}>
                                        <div className={`comic-cover ${comic.coverType}`}>
                                            {comic.cover}
                                        </div>

                                        <div className="comic-information">
                                            <div className="comic-title-line">
                                                <h3>{comic.title}</h3>
                                                <span className="comic-genre">{comic.genre}</span>
                                                <span className={`comic-status ${comic.statusType}`}>
                          <span />
                                                    {comic.status}
                        </span>
                                            </div>

                                            <div className="comic-meta">
                                                <strong>{comic.chapter}</strong>
                                                <span>•</span>
                                                <span>◷ {comic.updated}</span>
                                                <span>•</span>
                                                <span>{comic.detail}</span>
                                            </div>
                                        </div>

                                        <a
                                            href="/studio/comics"
                                            className="comic-action"
                                        >
                                            {comic.action} →
                                        </a>
                                    </article>
                                ))
                            ) : (
                                <div className="empty-comics">
                                    Không tìm thấy truyện phù hợp với từ khóa "{search}".
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="ai-banner">
                        <div className="ai-banner-icon">✧</div>

                        <div className="ai-banner-content">
                            <div className="ai-banner-title">
                                <h3>Trợ lý Kịch bản &amp; Thoại AI</h3>
                                <span>STUDIO COPILOT</span>
                            </div>

                            <p>
                                Hỗ trợ phát triển ý tưởng, xây dựng tình tiết chương truyện
                                và tinh chỉnh lời thoại nhân vật.
                            </p>
                        </div>

                        <a href="/studio/ai-assistant" className="ai-banner-button">
                            ✧ Bắt đầu cuộc trò chuyện
                        </a>
                    </section>

                    <footer className="dashboard-footer">
                        ComicHub Studio · Không gian sáng tác truyện tranh
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default CreatorDashboardPage;