import { useMemo, useState } from 'react';
import './AdminDashboardPage.css';

type Range = '7 ngày' | '30 ngày' | '90 ngày';

type ReviewComic = {
    id: number;
    title: string;
    author: string;
    date: string;
    genre: string;
    cover: string;
};

const initialReviews: ReviewComic[] = [
    {
        id: 1,
        title: 'Hành Trình Đến Vương Quốc Ánh Sáng',
        author: 'Nguyễn Minh Anh',
        date: '23/11/2026',
        genre: 'Phiêu lưu',
        cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=130&fit=crop',
    },
    {
        id: 2,
        title: 'Bí Mật Của Phù Thủy Trắng',
        author: 'Trần Hoàng Nam',
        date: '22/11/2026',
        genre: 'Giả tưởng',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&h=130&fit=crop',
    },
    {
        id: 3,
        title: 'Mùa Hè Năm Ấy',
        author: 'Lê Ngọc Hà',
        date: '21/11/2026',
        genre: 'Tình cảm',
        cover: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=100&h=130&fit=crop',
    },
    {
        id: 4,
        title: 'Thợ Săn Bóng Đêm',
        author: 'Phạm Quốc Bảo',
        date: '20/11/2026',
        genre: 'Hành động',
        cover: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=100&h=130&fit=crop',
    },
];

const navigation = [
    { label: 'Tổng quan', icon: 'dashboard', href: '/admin' },
    { label: 'Quản lý truyện', icon: 'menu_book', href: '/admin/comics' },
    { label: 'Kiểm duyệt nội dung', icon: 'verified_user', href: '/admin/moderation' },
    { label: 'Quản lý thể loại', icon: 'sell', href: '/admin/genres' },
    { label: 'Quản lý người dùng', icon: 'group', href: '/admin/users' },
    { label: 'Vai trò và phân quyền', icon: 'admin_panel_settings', href: '/admin/roles' },
    { label: 'Quản lý báo cáo', icon: 'flag', href: '/admin/reports' },
    { label: 'Thống kê', icon: 'bar_chart', href: '/admin/statistics' },
    { label: 'Nhật ký hoạt động', icon: 'history', href: '/admin/logs' },
    { label: 'Cài đặt hệ thống', icon: 'settings', href: '/admin/settings' },
];

const rangeData: Record<Range, { labels: string[]; values: number[] }> = {
    '7 ngày': {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [35, 48, 42, 65, 58, 78, 92],
    },
    '30 ngày': {
        labels: ['01/11', '05/11', '10/11', '15/11', '20/11', '25/11', '30/11'],
        values: [28, 42, 36, 58, 52, 75, 92],
    },
    '90 ngày': {
        labels: ['T9', 'Giữa T9', 'T10', 'Giữa T10', 'T11', 'Giữa T11', 'Hiện tại'],
        values: [20, 32, 28, 48, 43, 68, 92],
    },
};

const activities = [
    {
        icon: 'verified',
        color: 'green',
        title: 'Truyện được phê duyệt',
        description: 'Quản trị viên đã duyệt truyện “Thành Phố Trên Mây”.',
        time: '5 phút trước',
    },
    {
        icon: 'person_add',
        color: 'blue',
        title: 'Người dùng mới đăng ký',
        description: 'Tài khoản mới đã tham gia ComicHub.',
        time: '18 phút trước',
    },
    {
        icon: 'flag',
        color: 'orange',
        title: 'Báo cáo nội dung mới',
        description: 'Một báo cáo mới đang chờ xử lý.',
        time: '32 phút trước',
    },
    {
        icon: 'edit_note',
        color: 'purple',
        title: 'Cập nhật thông tin truyện',
        description: 'Tác giả đã cập nhật thông tin một bộ truyện.',
        time: '1 giờ trước',
    },
];

export default function AdminDashboardPage() {
    const [range, setRange] = useState<Range>('30 ngày');
    const [reviews, setReviews] = useState(initialReviews);
    const [selectedComic, setSelectedComic] = useState<ReviewComic | null>(null);
    const [notice, setNotice] = useState('');
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const chart = rangeData[range];

    const chartPoints = useMemo(() => {
        const width = 600;
        const height = 210;

        return chart.values.map((value, index) => ({
            x: 20 + (index * (width - 40)) / (chart.values.length - 1),
            y: height - 15 - (value / 100) * (height - 30),
        }));
    }, [chart]);

    const linePath = chartPoints
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    const areaPath = `${linePath} L 580 210 L 20 210 Z`;

    const showNotice = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 3000);
    };

    const handleRefresh = () => {
        if (refreshing) return;

        setRefreshing(true);
        window.setTimeout(() => {
            setRefreshing(false);
            showNotice('Dữ liệu tổng quan đã được làm mới.');
        }, 700);
    };

    const exportReport = () => {
        const rows = [
            ['Chỉ số', 'Giá trị'],
            ['Tổng số truyện', '4,280'],
            ['Tổng người dùng', '158,420'],
            ['Tổng tác giả', '1,245'],
            ['Truyện chờ duyệt', String(reviews.length)],
            ['Báo cáo chưa xử lý', '14'],
            ['Truyện đã xuất bản', '3,942'],
        ];

        const csv = '\uFEFF' + rows
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'comichub-tong-quan.csv';
        link.click();

        URL.revokeObjectURL(url);
        showNotice('Đã xuất báo cáo tổng quan.');
    };

    const handleReview = (approved: boolean) => {
        if (!selectedComic) return;

        setReviews((previous) =>
            previous.filter((comic) => comic.id !== selectedComic.id),
        );

        showNotice(
            approved
                ? `Đã phê duyệt truyện "${selectedComic.title}".`
                : `Đã từ chối truyện "${selectedComic.title}".`,
        );

        setSelectedComic(null);
    };

    const filteredReviews = reviews.filter((comic) => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        return (
            comic.title.toLocaleLowerCase('vi').includes(keyword) ||
            comic.author.toLocaleLowerCase('vi').includes(keyword)
        );
    });

    return (
        <div className="admin-dashboard-page">
            <aside className="dashboard-sidebar">
                <a className="dashboard-brand" href="/admin">
                    <span className="dashboard-brand-icon">C</span>
                    <span>
                        <strong>ComicHub</strong>
                        <small>ADMINISTRATION</small>
                    </span>
                    <span className="dashboard-mobile-close"
                          onClick={(event) => {
                              event.preventDefault();
                              document.body.classList.remove('dashboard-menu-open');
                          }}>
                        ×
                    </span>
                </a>

                <div className="dashboard-sidebar-label">MENU CHÍNH</div>

                <nav className="dashboard-nav">
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={item.href === '/admin' ? 'active' : ''}
                        >
                            <span className="material-symbols-outlined">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="dashboard-sidebar-bottom">
                    <div className="dashboard-admin-avatar">H</div>
                    <div className="dashboard-admin-info">
                        <strong>Hoạt</strong>
                        <span>Quản trị viên</span>
                    </div>
                    <span className="material-symbols-outlined">more_vert</span>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <button
                        className="dashboard-menu-button"
                        onClick={() =>
                            document.body.classList.toggle('dashboard-menu-open')
                        }
                        aria-label="Mở menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <div className="dashboard-breadcrumb">
                        <span>Trang quản trị</span>
                        <span className="material-symbols-outlined">chevron_right</span>
                        <strong>Tổng quan</strong>
                    </div>

                    <div className="dashboard-header-actions">
                        <label className="dashboard-search">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Tìm kiếm truyện..."
                            />
                        </label>

                        <button
                            className="dashboard-notification"
                            onClick={() => showNotice('Bạn có 3 thông báo mới.')}
                            aria-label="Thông báo"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <i>3</i>
                        </button>

                        <div className="dashboard-header-profile">
                            <div className="dashboard-admin-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <section className="dashboard-heading">
                        <div>
                            <div className="dashboard-eyebrow">COMICHUB ADMINISTRATION</div>
                            <h1>Tổng quan</h1>
                            <p>Báo cáo hiệu suất và trạng thái hệ thống hôm nay</p>
                        </div>

                        <div className="dashboard-heading-actions">
                            <button
                                className="dashboard-button dashboard-button-light"
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <span className={`material-symbols-outlined ${refreshing ? 'is-spinning' : ''}`}>
                                    refresh
                                </span>
                                {refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
                            </button>

                            <button
                                className="dashboard-button dashboard-button-primary"
                                onClick={exportReport}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Xuất báo cáo tổng quan
                            </button>
                        </div>
                    </section>

                    <section className="dashboard-stats">
                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Tổng số truyện</span>
                                <span className="dashboard-stat-icon blue">
                                    <span className="material-symbols-outlined">menu_book</span>
                                </span>
                            </div>
                            <strong>4,280</strong>
                            <div className="dashboard-stat-foot positive">
                                <span className="material-symbols-outlined">trending_up</span>
                                +12.5% <span>so với tháng trước</span>
                            </div>
                        </article>

                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Tổng người dùng</span>
                                <span className="dashboard-stat-icon purple">
                                    <span className="material-symbols-outlined">groups</span>
                                </span>
                            </div>
                            <strong>158,420</strong>
                            <div className="dashboard-stat-foot positive">
                                <span className="material-symbols-outlined">trending_up</span>
                                +8.2% <span>so với tháng trước</span>
                            </div>
                        </article>

                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Tổng tác giả</span>
                                <span className="dashboard-stat-icon orange">
                                    <span className="material-symbols-outlined">edit</span>
                                </span>
                            </div>
                            <strong>1,245</strong>
                            <div className="dashboard-stat-foot positive">
                                <span className="material-symbols-outlined">trending_up</span>
                                +5.4% <span>so với tháng trước</span>
                            </div>
                        </article>

                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Truyện chờ duyệt</span>
                                <span className="dashboard-stat-icon yellow">
                                    <span className="material-symbols-outlined">pending_actions</span>
                                </span>
                            </div>
                            <strong>{reviews.length === 4 ? '38' : 38 - (4 - reviews.length)}</strong>
                            <div className="dashboard-stat-foot warning">
                                <span className="material-symbols-outlined">priority_high</span>
                                Cần xử lý gấp
                            </div>
                        </article>

                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Báo cáo chưa xử lý</span>
                                <span className="dashboard-stat-icon red">
                                    <span className="material-symbols-outlined">flag</span>
                                </span>
                            </div>
                            <strong>14</strong>
                            <div className="dashboard-stat-foot warning">
                                <span className="material-symbols-outlined">error</span>
                                3 mức nghiêm trọng
                            </div>
                        </article>

                        <article className="dashboard-stat-card">
                            <div className="dashboard-stat-top">
                                <span>Truyện đã xuất bản</span>
                                <span className="dashboard-stat-icon green">
                                    <span className="material-symbols-outlined">verified</span>
                                </span>
                            </div>
                            <strong>3,942</strong>
                            <div className="dashboard-stat-foot positive">
                                <span className="material-symbols-outlined">check_circle</span>
                                92.1% <span>tổng số truyện</span>
                            </div>
                        </article>
                    </section>

                    <section className="dashboard-charts">
                        <article className="dashboard-panel dashboard-line-panel">
                            <div className="dashboard-panel-heading">
                                <div>
                                    <h2>Tăng trưởng người dùng</h2>
                                    <p>Số lượng người dùng đăng ký mới</p>
                                </div>
                                <div className="dashboard-range">
                                    {(['7 ngày', '30 ngày', '90 ngày'] as Range[]).map((item) => (
                                        <button
                                            key={item}
                                            className={range === item ? 'active' : ''}
                                            onClick={() => setRange(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="dashboard-chart-summary">
                                <strong>158,420</strong>
                                <span>+8.2% so với kỳ trước</span>
                            </div>

                            <div className="dashboard-line-chart">
                                <div className="dashboard-y-labels">
                                    <span>100</span>
                                    <span>75</span>
                                    <span>50</span>
                                    <span>25</span>
                                    <span>0</span>
                                </div>

                                <svg viewBox="0 0 600 210" preserveAspectRatio="none">
                                    {[15, 60, 105, 150, 195].map((y) => (
                                        <line
                                            key={y}
                                            x1="20"
                                            y1={y}
                                            x2="580"
                                            y2={y}
                                            className="dashboard-grid-line"
                                        />
                                    ))}
                                    <defs>
                                        <linearGradient id="dashboard-area-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2878dc" stopOpacity=".22" />
                                            <stop offset="100%" stopColor="#2878dc" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={areaPath} fill="url(#dashboard-area-gradient)" />
                                    <path d={linePath} className="dashboard-line-path" />
                                    {chartPoints.map((point, index) => (
                                        <circle
                                            key={index}
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            className="dashboard-chart-dot"
                                        />
                                    ))}
                                </svg>
                                <div className="dashboard-x-labels">
                                    {chart.labels.map((label) => <span key={label}>{label}</span>)}
                                </div>
                            </div>
                        </article>

                        <article className="dashboard-panel dashboard-bar-panel">
                            <div className="dashboard-panel-heading">
                                <div>
                                    <h2>Truyện được xuất bản</h2>
                                    <p>Số lượng truyện xuất bản theo tuần</p>
                                </div>
                                <button
                                    className="dashboard-more-button"
                                    onClick={() => showNotice('Đây là thống kê xuất bản theo tuần.')}
                                    aria-label="Thông tin biểu đồ"
                                >
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            </div>

                            <div className="dashboard-bar-summary">
                                <strong>582</strong>
                                <span>+18.4% so với tháng trước</span>
                            </div>

                            <div className="dashboard-legend">
                                <span><i className="comic-dot" /> Comic</span>
                                <span><i className="novel-dot" /> Novel</span>
                            </div>

                            <div className="dashboard-bar-chart">
                                {[
                                    { week: 'Tuần 1', comic: 65, novel: 35 },
                                    { week: 'Tuần 2', comic: 82, novel: 48 },
                                    { week: 'Tuần 3', comic: 72, novel: 42 },
                                    { week: 'Tuần 4', comic: 95, novel: 58 },
                                    { week: 'Tuần 5', comic: 88, novel: 52 },
                                ].map((item) => (
                                    <div className="dashboard-bar-group" key={item.week}>
                                        <div className="dashboard-bars">
                                            <span className="dashboard-bar comic" style={{ height: `${item.comic}%` }} />
                                            <span className="dashboard-bar novel" style={{ height: `${item.novel}%` }} />
                                        </div>
                                        <span className="dashboard-bar-label">{item.week}</span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="dashboard-bottom">
                        <article className="dashboard-panel dashboard-review-panel">
                            <div className="dashboard-panel-heading">
                                <div>
                                    <h2>Truyện chờ kiểm duyệt</h2>
                                    <p>Các truyện đang chờ quản trị viên xem xét</p>
                                </div>
                                <a href="/admin/moderation" className="dashboard-view-all">
                                    Xem tất cả
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </a>
                            </div>

                            <div className="dashboard-review-table-wrap">
                                <table className="dashboard-review-table">
                                    <thead>
                                    <tr>
                                        <th>TÊN TRUYỆN</th>
                                        <th>TÁC GIẢ</th>
                                        <th>NGÀY GỬI</th>
                                        <th>THỂ LOẠI</th>
                                        <th>THAO TÁC</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredReviews.map((comic) => (
                                        <tr key={comic.id}>
                                            <td>
                                                <div className="dashboard-comic-cell">
                                                    <img src={comic.cover} alt={comic.title} />
                                                    <strong>{comic.title}</strong>
                                                </div>
                                            </td>
                                            <td>{comic.author}</td>
                                            <td>{comic.date}</td>
                                            <td><span className="dashboard-genre">{comic.genre}</span></td>
                                            <td>
                                                <button
                                                    className="dashboard-review-button"
                                                    onClick={() => setSelectedComic(comic)}
                                                >
                                                    Xem xét
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredReviews.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="dashboard-empty">
                                                Không tìm thấy truyện phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="dashboard-panel dashboard-activity-panel">
                            <div className="dashboard-panel-heading">
                                <div>
                                    <h2>Hoạt động gần đây</h2>
                                    <p>Các hoạt động mới nhất trên hệ thống</p>
                                </div>
                            </div>

                            <div className="dashboard-activity-list">
                                {activities.map((activity, index) => (
                                    <div className="dashboard-activity-item" key={index}>
                                        <div className={`dashboard-activity-icon ${activity.color}`}>
                                            <span className="material-symbols-outlined">
                                                {activity.icon}
                                            </span>
                                        </div>
                                        <div className="dashboard-activity-text">
                                            <strong>{activity.title}</strong>
                                            <p>{activity.description}</p>
                                            <span>{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a href="/admin/logs" className="dashboard-audit-link">
                                Xem toàn bộ nhật ký kiểm toán
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </a>
                        </article>
                    </section>

                    <footer className="dashboard-footer">
                        © 2026 ComicHub Administration. All rights reserved.
                        <span>Hệ thống đang hoạt động bình thường</span>
                    </footer>
                </div>
            </main>

            {notice && (
                <div className="dashboard-toast">
                    <span className="material-symbols-outlined">check_circle</span>
                    {notice}
                </div>
            )}

            {selectedComic && (
                <div className="dashboard-modal-backdrop" onClick={() => setSelectedComic(null)}>
                    <div className="dashboard-review-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="dashboard-modal-heading">
                            <div>
                                <h2>Xem xét truyện</h2>
                                <p>Kiểm tra thông tin trước khi đưa ra quyết định.</p>
                            </div>
                            <button onClick={() => setSelectedComic(null)} aria-label="Đóng">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="dashboard-modal-comic">
                            <img src={selectedComic.cover} alt={selectedComic.title} />
                            <div>
                                <strong>{selectedComic.title}</strong>
                                <span>Tác giả: {selectedComic.author}</span>
                                <span>Thể loại: {selectedComic.genre}</span>
                                <span>Ngày gửi: {selectedComic.date}</span>
                            </div>
                        </div>

                        <div className="dashboard-modal-actions">
                            <button
                                className="dashboard-button dashboard-button-light"
                                onClick={() => handleReview(false)}
                            >
                                Từ chối
                            </button>
                            <button
                                className="dashboard-button dashboard-button-primary"
                                onClick={() => handleReview(true)}
                            >
                                <span className="material-symbols-outlined">check</span>
                                Phê duyệt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}