
import { useMemo, useState } from 'react';
import './AdminStatisticsPage.css';

type Period = '7' | '30' | '90' | 'custom';

const genreRows = [
    { rank: 1, name: 'Action', reads: 628400, share: '34.1%', growth: '+19.4%', comic: 'Thần Long Giáng Thế', chapter: 'Chapter 142', creator: 'Studio Dragon' },
    { rank: 2, name: 'Romance', reads: 472100, share: '25.6%', growth: '+12.8%', comic: 'Giai Điệu Mùa Hạ', chapter: 'Chapter 89', creator: 'Mây Xanh Team' },
    { rank: 3, name: 'Adventure', reads: 338900, share: '18.4%', growth: '+8.2%', comic: 'Hành Trình Cổ Giới', chapter: 'Chapter 210', creator: 'Phoenix Comics' },
    { rank: 4, name: 'Fantasy', reads: 256000, share: '13.9%', growth: '+5.7%', comic: 'Đại Pháp Sư Hồi Sinh', chapter: 'Chapter 64', creator: 'Hắc Nguyệt Studio' },
    { rank: 5, name: 'Comedy', reads: 147100, share: '8.0%', growth: '-1.4%', comic: 'Lớp Học Siêu Quậy', chapter: 'Chapter 112', creator: 'Tác giả Cỏ Ba Lá' },
];

const readingData = [
    { label: 'Tuần 1', app: 240, web: 160 },
    { label: 'Tuần 2', app: 310, web: 190 },
    { label: 'Tuần 3', app: 275, web: 220 },
    { label: 'Tuần 4', app: 420, web: 285 },
    { label: 'Tuần 5', app: 360, web: 245 },
];

const userData = [
    { label: 'T1', readers: 1200, authors: 350 },
    { label: 'T2', readers: 1550, authors: 430 },
    { label: 'T3', readers: 1850, authors: 520 },
    { label: 'T4', readers: 2200, authors: 610 },
    { label: 'T5', readers: 2680, authors: 720 },
];

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

function AdminStatisticsPage() {
    const [period, setPeriod] = useState<Period>('30');
    const [startDate, setStartDate] = useState('2026-10-24');
    const [endDate, setEndDate] = useState('2026-11-23');
    const [showCustom, setShowCustom] = useState(false);

    const periodLabel = useMemo(() => {
        if (period === '7') return '7 ngày qua';
        if (period === '90') return '90 ngày qua';
        if (period === 'custom') return `${startDate} đến ${endDate}`;
        return '30 ngày qua';
    }, [period, startDate, endDate]);

    const handlePeriodChange = (value: Period) => {
        setPeriod(value);
        setShowCustom(value === 'custom');
    };

    const exportCsv = () => {
        const rows = [
            ['Hạng', 'Thể loại', 'Lượt đọc', 'Tỷ trọng', 'Tăng trưởng', 'Truyện nổi bật', 'Chương', 'Tác giả'],
            ...genreRows.map((item) => [
                item.rank,
                item.name,
                item.reads,
                item.share,
                item.growth,
                item.comic,
                item.chapter,
                item.creator,
            ]),
        ];

        const csv = '\uFEFF' + rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comichub-thong-ke-the-loai.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleExportPdf = () => {
        window.print();
    };

    return (
        <div className="statistics-page">
            <aside className="statistics-sidebar">
                <div className="statistics-brand">
                    <div className="statistics-brand-icon">C</div>
                    <div>
                        <strong>ComicHub</strong>
                        <span>HỆ THỐNG QUẢN TRỊ</span>
                    </div>
                </div>

                <div className="statistics-nav-label">MENU QUẢN TRỊ</div>
                <nav className="statistics-nav">
                    <a href="/admin"><span>▦</span>Tổng quan</a>
                    <a href="/admin/comics"><span>▤</span>Quản lý truyện</a>
                    <a href="/admin/moderation"><span>✓</span>Kiểm duyệt nội dung</a>
                    <a href="/admin/genres"><span>◇</span>Quản lý thể loại</a>
                    <a href="/admin/users"><span>♧</span>Quản lý người dùng</a>
                    <a href="/admin/roles"><span>♙</span>Vai trò và phân quyền</a>
                    <a href="/admin/reports"><span>⚑</span>Quản lý báo cáo</a>
                    <a className="active" href="/admin/statistics"><span>▥</span>Thống kê</a>
                    <a href="/admin/activity-logs">
                        <span>◷</span>Nhật ký hoạt động
                    </a>
                    <a href="/admin/settings"><span>⚙</span>Cài đặt hệ thống</a>
                </nav>

                <div className="statistics-sidebar-bottom">
                    <span className="statistics-online-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="statistics-main">
                <header className="statistics-topbar">
                    <div className="statistics-breadcrumb">
                        <span>Trang quản trị</span>
                        <b>/</b>
                        <strong>Thống kê</strong>
                    </div>
                    <div className="statistics-top-actions">
                        <label className="statistics-search">
                            <span>⌕</span>
                            <input type="search" placeholder="Tìm kiếm..." />
                            <kbd>⌘ K</kbd>
                        </label>
                        <button className="statistics-notification" aria-label="Thông báo">
                            ♧<i>3</i>
                        </button>
                        <div className="statistics-profile">
                            <div className="statistics-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                            <span className="statistics-chevron">⌄</span>
                        </div>
                    </div>
                </header>

                <main className="statistics-content">
                    <div className="statistics-heading">
                        <div>
                            <div className="statistics-eyebrow">BÁO CÁO HỆ THỐNG</div>
                            <h1>Thống kê</h1>
                            <p>
                                Báo cáo chuyên sâu về tăng trưởng người dùng, tương tác tác phẩm
                                và hiệu suất xuất bản trên nền tảng ComicHub.
                            </p>
                        </div>
                        <div className="statistics-heading-status">
                            <span className="statistics-status-dot" />
                            Dữ liệu cập nhật
                        </div>
                    </div>

                    <section className="statistics-toolbar">
                        <div className="statistics-periods">
                            <button className={period === '7' ? 'selected' : ''} onClick={() => handlePeriodChange('7')}>7 ngày qua</button>
                            <button className={period === '30' ? 'selected' : ''} onClick={() => handlePeriodChange('30')}>30 ngày qua</button>
                            <button className={period === '90' ? 'selected' : ''} onClick={() => handlePeriodChange('90')}>90 ngày qua</button>
                            <button className={period === 'custom' ? 'selected' : ''} onClick={() => handlePeriodChange('custom')}>▦ Tùy chỉnh</button>
                        </div>
                        <div className="statistics-export-actions">
                            <button className="statistics-export-excel" onClick={exportCsv}>↓ Xuất Excel</button>
                            <button className="statistics-export-pdf" onClick={handleExportPdf}>▤ Xuất PDF</button>
                        </div>
                    </section>

                    {showCustom && (
                        <section className="statistics-custom-date">
                            <label>
                                Từ ngày
                                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                            </label>
                            <label>
                                Đến ngày
                                <input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} />
                            </label>
                            <button onClick={() => setShowCustom(false)}>Áp dụng</button>
                        </section>
                    )}

                    <div className="statistics-period-caption">
                        Đang hiển thị: <strong>{periodLabel}</strong>
                        <span>Dữ liệu minh họa</span>
                    </div>

                    <section className="statistics-kpis">
                        <article className="statistics-kpi-card">
                            <div className="statistics-kpi-top">
                                <span className="statistics-kpi-icon blue">◉</span>
                                <span className="statistics-kpi-trend positive">↗ 14.2%</span>
                            </div>
                            <span className="statistics-kpi-label">Tổng lượt đọc</span>
                            <strong>1,842,500</strong>
                            <span className="statistics-kpi-foot">So với tháng trước</span>
                        </article>
                        <article className="statistics-kpi-card">
                            <div className="statistics-kpi-top">
                                <span className="statistics-kpi-icon violet">♙</span>
                                <span className="statistics-kpi-trend positive">↗ 8.6%</span>
                            </div>
                            <span className="statistics-kpi-label">Người dùng mới</span>
                            <strong>12,480</strong>
                            <span className="statistics-kpi-foot">So với tháng trước</span>
                        </article>
                        <article className="statistics-kpi-card">
                            <div className="statistics-kpi-top">
                                <span className="statistics-kpi-icon orange">▤</span>
                                <span className="statistics-kpi-trend positive">↗ 18.4%</span>
                            </div>
                            <span className="statistics-kpi-label">Truyện mới</span>
                            <strong>142</strong>
                            <span className="statistics-kpi-foot">So với tháng trước</span>
                        </article>
                        <article className="statistics-kpi-card">
                            <div className="statistics-kpi-top">
                                <span className="statistics-kpi-icon green">▧</span>
                                <span className="statistics-kpi-trend positive">↗ 22.1%</span>
                            </div>
                            <span className="statistics-kpi-label">Chương mới</span>
                            <strong>1,280</strong>
                            <span className="statistics-kpi-foot">So với tháng trước</span>
                        </article>
                        <article className="statistics-kpi-card">
                            <div className="statistics-kpi-top">
                                <span className="statistics-kpi-icon teal">✓</span>
                                <span className="statistics-kpi-trend neutral">96.8%</span>
                            </div>
                            <span className="statistics-kpi-label">Báo cáo đã xử lý</span>
                            <strong>384</strong>
                            <span className="statistics-kpi-foot">Tỷ lệ giải quyết</span>
                        </article>
                    </section>

                    <section className="statistics-chart-grid">
                        <article className="statistics-panel statistics-reading-panel">
                            <div className="statistics-panel-heading">
                                <div>
                                    <h2>Lượt đọc theo thời gian</h2>
                                    <p>So sánh lượt đọc trên ứng dụng và website</p>
                                </div>
                                <button className="statistics-more" aria-label="Tùy chọn">•••</button>
                            </div>
                            <div className="statistics-legend">
                                <span><i className="legend-app" />Ứng dụng</span>
                                <span><i className="legend-web" />Website</span>
                            </div>
                            <div className="statistics-line-chart">
                                <div className="statistics-y-labels">
                                    <span>500K</span><span>400K</span><span>300K</span><span>200K</span><span>100K</span><span>0</span>
                                </div>
                                <div className="statistics-line-plot">
                                    <div className="statistics-grid-lines">
                                        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
                                    </div>
                                    <svg viewBox="0 0 600 220" preserveAspectRatio="none" role="img" aria-label="Biểu đồ lượt đọc theo tuần">
                                        <defs>
                                            <linearGradient id="appArea" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#4778ef" stopOpacity=".22" />
                                                <stop offset="100%" stopColor="#4778ef" stopOpacity="0" />
                                            </linearGradient>
                                            <linearGradient id="webArea" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#16b8a6" stopOpacity=".16" />
                                                <stop offset="100%" stopColor="#16b8a6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 112 L150 82 L300 96 L450 28 L600 56 L600 220 L0 220 Z" fill="url(#appArea)" />
                                        <path d="M0 150 L150 138 L300 124 L450 95 L600 112 L600 220 L0 220 Z" fill="url(#webArea)" />
                                        <polyline points="0,112 150,82 300,96 450,28 600,56" fill="none" stroke="#4778ef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="0,150 150,138 300,124 450,95 600,112" fill="none" stroke="#16b8a6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        {readingData.map((item, index) => (
                                            <g key={item.label}>
                                                <circle cx={index * 150} cy={[112, 82, 96, 28, 56][index]} r="4" fill="#4778ef" stroke="white" strokeWidth="2" />
                                                <circle cx={index * 150} cy={[150, 138, 124, 95, 112][index]} r="4" fill="#16b8a6" stroke="white" strokeWidth="2" />
                                            </g>
                                        ))}
                                    </svg>
                                    <div className="statistics-x-labels">
                                        {readingData.map((item) => <span key={item.label}>{item.label}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="statistics-chart-summary">
                                <div><span>Đỉnh lượt đọc ứng dụng</span><strong>420K <small>Tuần 4</small></strong></div>
                                <div><span>Đỉnh lượt đọc website</span><strong>285K <small>Tuần 4</small></strong></div>
                            </div>
                        </article>

                        <article className="statistics-panel statistics-users-panel">
                            <div className="statistics-panel-heading">
                                <div>
                                    <h2>Tăng trưởng người dùng</h2>
                                    <p>Độc giả và tác giả mới theo tháng</p>
                                </div>
                                <button className="statistics-more" aria-label="Tùy chọn">•••</button>
                            </div>
                            <div className="statistics-legend">
                                <span><i className="legend-readers" />Độc giả</span>
                                <span><i className="legend-authors" />Tác giả</span>
                            </div>
                            <div className="statistics-bar-chart">
                                <div className="statistics-bar-y">
                                    <span>3K</span><span>2.4K</span><span>1.8K</span><span>1.2K</span><span>600</span><span>0</span>
                                </div>
                                <div className="statistics-bar-area">
                                    <div className="statistics-bar-grid">
                                        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
                                    </div>
                                    <div className="statistics-bars">
                                        {userData.map((item) => (
                                            <div className="statistics-bar-group" key={item.label}>
                                                <div className="statistics-bar-pair">
                                                    <i className="reader-bar" style={{ height: `${(item.readers / 3000) * 100}%` }} title={`${formatNumber(item.readers)} độc giả`} />
                                                    <i className="author-bar" style={{ height: `${(item.authors / 3000) * 100}%` }} title={`${formatNumber(item.authors)} tác giả`} />
                                                </div>
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="statistics-users-total">
                                <div><span>Độc giả mới</span><strong>9,480</strong></div>
                                <div><span>Tác giả mới</span><strong>3,000</strong></div>
                            </div>
                        </article>
                    </section>

                    <section className="statistics-chart-grid statistics-second-row">
                        <article className="statistics-panel">
                            <div className="statistics-panel-heading">
                                <div>
                                    <h2>Hoạt động xuất bản &amp; kiểm duyệt</h2>
                                    <p>Tình trạng xử lý nội dung gửi lên hệ thống</p>
                                </div>
                                <span className="statistics-small-badge">30 ngày</span>
                            </div>
                            <div className="statistics-publish-content">
                                <div className="statistics-publish-total">
                                    <strong>180</strong>
                                    <span>Tổng nội dung gửi duyệt</span>
                                    <div className="statistics-publish-track"><i /></div>
                                    <small>100% đã được xử lý</small>
                                </div>
                                <div className="statistics-publish-stats">
                                    <div><i className="publish-approved" /><span>Đã phê duyệt</span><strong>154</strong><small>85.55%</small></div>
                                    <div><i className="publish-rejected" /><span>Bị từ chối</span><strong>26</strong><small>14.45%</small></div>
                                </div>
                            </div>
                            <div className="statistics-response-time">
                                <div><span>Thời gian phản hồi trung bình</span><strong>4.2 giờ</strong></div>
                                <span className="statistics-response-good">↓ Nhanh hơn 1.8 giờ</span>
                            </div>
                        </article>

                        <article className="statistics-panel">
                            <div className="statistics-panel-heading">
                                <div>
                                    <h2>Tỷ lệ phê duyệt và từ chối</h2>
                                    <p>Kết quả xét duyệt nội dung</p>
                                </div>
                                <button className="statistics-more" aria-label="Tùy chọn">•••</button>
                            </div>
                            <div className="statistics-approval-content">
                                <div className="statistics-donut-wrap">
                                    <div className="statistics-donut">
                                        <div><strong>85.5%</strong><span>Phê duyệt</span></div>
                                    </div>
                                </div>
                                <div className="statistics-approval-legend">
                                    <div><i className="approval-green" /><span>Đã phê duyệt</span><strong>154</strong><small>85.5%</small></div>
                                    <div><i className="approval-red" /><span>Bị từ chối</span><strong>26</strong><small>14.5%</small></div>
                                </div>
                            </div>
                            <div className="statistics-rejection-reasons">
                                <strong>Lý do từ chối phổ biến</strong>
                                <div><span>Hình ảnh mờ / sai quy cách</span><b>45%</b></div>
                                <div className="reason-track"><i style={{ width: '45%' }} /></div>
                                <div><span>Bản quyền / dịch không phép</span><b>35%</b></div>
                                <div className="reason-track"><i style={{ width: '35%' }} /></div>
                                <div><span>Sai thể loại</span><b>20%</b></div>
                                <div className="reason-track"><i style={{ width: '20%' }} /></div>
                            </div>
                        </article>
                    </section>

                    <section className="statistics-panel statistics-genre-panel">
                        <div className="statistics-panel-heading statistics-genre-heading">
                            <div>
                                <h2>Top 5 thể loại được đọc nhiều nhất</h2>
                                <p>Thống kê lượt đọc theo danh mục truyện trên toàn nền tảng</p>
                            </div>
                            <button className="statistics-view-all" onClick={exportCsv}>↓ Tải bảng dữ liệu</button>
                        </div>
                        <div className="statistics-table-wrap">
                            <table className="statistics-table">
                                <thead>
                                <tr>
                                    <th>HẠNG</th>
                                    <th>THỂ LOẠI</th>
                                    <th>LƯỢT ĐỌC</th>
                                    <th>TỶ TRỌNG</th>
                                    <th>TĂNG TRƯỞNG</th>
                                    <th>TRUYỆN NỔI BẬT</th>
                                </tr>
                                </thead>
                                <tbody>
                                {genreRows.map((item) => (
                                    <tr key={item.rank}>
                                        <td><span className={`statistics-rank rank-${item.rank}`}>{String(item.rank).padStart(2, '0')}</span></td>
                                        <td><strong className="statistics-genre-name">{item.name}</strong></td>
                                        <td><strong>{formatNumber(item.reads)}</strong></td>
                                        <td>
                                            <div className="statistics-share">
                                                <span>{item.share}</span>
                                                <i><b style={{ width: item.share }} /></i>
                                            </div>
                                        </td>
                                        <td><span className={item.growth.startsWith('-') ? 'statistics-growth negative' : 'statistics-growth positive'}>{item.growth.startsWith('-') ? '↘' : '↗'} {item.growth}</span></td>
                                        <td>
                                            <div className="statistics-featured-comic">
                                                <strong>{item.comic}</strong>
                                                <span>{item.chapter} • {item.creator}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="statistics-table-footer">
                            <span>Hiển thị 5 trên tổng số 32 thể loại</span>
                            <strong>Tổng lượt đọc: 1,842,500</strong>
                        </div>
                    </section>

                    <footer className="statistics-footer">
                        <span>© 2026 ComicHub Admin. Dữ liệu được tổng hợp tự động mỗi 15 phút từ CDN.</span>
                        <a href="/admin/genres">Xem tất cả 32 thể loại →</a>
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default AdminStatisticsPage;
