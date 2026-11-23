import { useMemo, useState } from 'react';
import './AdminReportsPage.css';

type ReportStatus = 'Chưa xử lý' | 'Đang xử lý' | 'Đã giải quyết' | 'Đã bỏ qua';
type Priority = 'Khẩn cấp' | 'Cao' | 'Trung bình';

type Report = {
    id: string;
    target: string;
    detail: string;
    type: string;
    sender: string;
    username: string;
    priority: Priority;
    time: string;
    status: ReportStatus;
};

const initialReports: Report[] = [
    {
        id: 'BC-896',
        target: 'Đao Thần Tái Thế',
        detail: 'Bình luận tại chương 15',
        type: 'Quấy rối',
        sender: 'Trần Văn Tuấn',
        username: '@docgia_99',
        priority: 'Khẩn cấp',
        time: '10:15 Hôm nay',
        status: 'Chưa xử lý',
    },
    {
        id: 'BC-895',
        target: 'Học Viện Thợ Săn',
        detail: 'Nghi vấn đăng tải lại nội dung',
        type: 'Bản quyền',
        sender: 'Lê Minh Ngọc',
        username: '@trans_team_vn',
        priority: 'Cao',
        time: '08:30 Hôm nay',
        status: 'Đang xử lý',
    },
    {
        id: 'BC-893',
        target: '@bot_freecoin',
        detail: 'Tài khoản có hoạt động bất thường',
        type: 'Spam',
        sender: 'Hệ thống Tự động',
        username: 'Bot Sentinel',
        priority: 'Trung bình',
        time: '22:40 Hôm qua',
        status: 'Đã giải quyết',
    },
    {
        id: 'BC-891',
        target: 'Nắng Hạ',
        detail: 'Ảnh bìa chương 08 cần kiểm tra',
        type: 'Nội dung không phù hợp',
        sender: 'Võ Hoàng Yến',
        username: '@hoangyen_reader',
        priority: 'Cao',
        time: '18:12 Hôm qua',
        status: 'Đã bỏ qua',
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

const statusOptions: ReportStatus[] = [
    'Chưa xử lý',
    'Đang xử lý',
    'Đã giải quyết',
    'Đã bỏ qua',
];

export default function AdminReportsPage() {
    const [reports, setReports] = useState(initialReports);
    const [selectedId, setSelectedId] = useState('BC-896');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tất cả loại');
    const [priorityFilter, setPriorityFilter] = useState('Tất cả mức độ');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [currentPage, setCurrentPage] = useState(1);
    const [notice, setNotice] = useState('');

    const pageSize = 4;

    const filteredReports = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        return reports.filter((report) => {
            const matchesSearch =
                !keyword ||
                [
                    report.id,
                    report.target,
                    report.detail,
                    report.sender,
                    report.username,
                    report.type,
                ].some((value) => value.toLocaleLowerCase('vi').includes(keyword));

            const matchesType =
                typeFilter === 'Tất cả loại' || report.type === typeFilter;

            const matchesPriority =
                priorityFilter === 'Tất cả mức độ' ||
                report.priority === priorityFilter;

            const matchesStatus =
                statusFilter === 'Tất cả trạng thái' ||
                report.status === statusFilter;

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });
    }, [reports, search, typeFilter, priorityFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
    const visibleReports = filteredReports.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const selectedReport =
        reports.find((report) => report.id === selectedId) ?? null;

    const counts = {
        pending: reports.filter((report) => report.status === 'Chưa xử lý').length,
        processing: reports.filter((report) => report.status === 'Đang xử lý').length,
        resolved: reports.filter((report) => report.status === 'Đã giải quyết').length,
    };

    const showNotice = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 2800);
    };

    const updateStatus = (status: ReportStatus) => {
        if (!selectedReport) return;

        setReports((previous) =>
            previous.map((report) =>
                report.id === selectedReport.id ? { ...report, status } : report,
            ),
        );

        showNotice(`Đã cập nhật ${selectedReport.id}: ${status}.`);
    };

    const exportReports = () => {
        const rows = [
            ['Mã báo cáo', 'Đối tượng', 'Chi tiết', 'Loại', 'Người gửi', 'Mức độ', 'Thời gian', 'Trạng thái'],
            ...filteredReports.map((report) => [
                report.id,
                report.target,
                report.detail,
                report.type,
                `${report.sender} (${report.username})`,
                report.priority,
                report.time,
                report.status,
            ]),
        ];

        const csv =
            '\uFEFF' +
            rows
                .map((row) =>
                    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
                )
                .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'comichub-bao-cao-vi-pham.csv';
        link.click();

        URL.revokeObjectURL(url);
        showNotice('Đã xuất danh sách báo cáo dạng CSV.');
    };

    const resetFilters = () => {
        setSearch('');
        setTypeFilter('Tất cả loại');
        setPriorityFilter('Tất cả mức độ');
        setStatusFilter('Tất cả trạng thái');
        setCurrentPage(1);
    };

    return (
        <div className="admin-reports-page">
            <aside className="reports-sidebar">
                <a className="reports-brand" href="/admin">
                    <span className="reports-brand-icon">C</span>
                    <span>
                        <strong>ComicHub</strong>
                        <small>ADMINISTRATION</small>
                    </span>
                </a>

                <div className="reports-sidebar-label">MENU QUẢN TRỊ</div>

                <nav className="reports-nav">
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={item.href === '/admin/reports' ? 'active' : ''}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.href === '/admin/reports' && (
                                <span className="reports-nav-count">{counts.pending}</span>
                            )}
                        </a>
                    ))}
                </nav>

                <div className="reports-sidebar-footer">
                    <div className="reports-admin-avatar">H</div>
                    <div>
                        <strong>Hoạt</strong>
                        <small>Quản trị viên</small>
                    </div>
                    <a href="/" title="Về trang chủ">
                        <span className="material-symbols-outlined">logout</span>
                    </a>
                </div>
            </aside>

            <main className="reports-main">
                <header className="reports-topbar">
                    <div className="reports-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span className="material-symbols-outlined">chevron_right</span>
                        <strong>Quản lý báo cáo</strong>
                    </div>

                    <div className="reports-topbar-right">
                        <label className="reports-global-search">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="search"
                                placeholder="Tìm kiếm..."
                                aria-label="Tìm kiếm"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </label>
                        <button
                            className="reports-icon-button"
                            type="button"
                            aria-label="Thông báo"
                            onClick={() => showNotice('Bạn đang xem khu vực thông báo mẫu.')}
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <i />
                        </button>
                        <div className="reports-topbar-user">
                            <div className="reports-admin-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <small>Administrator</small>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="reports-content">
                    <section className="reports-heading">
                        <div>
                            <div className="reports-eyebrow">TRUNG TÂM KIỂM DUYỆT</div>
                            <h1>Quản lý báo cáo</h1>
                            <p>
                                Giám sát, phân loại và tiếp nhận xử lý báo cáo vi phạm
                                với sự hỗ trợ từ Trợ lý AI.
                            </p>
                        </div>

                        <div className="reports-heading-actions">
                            <button
                                className="reports-button reports-button-light"
                                type="button"
                                onClick={() => showNotice('Nhật ký xử phạt hiện là dữ liệu minh họa.')}
                            >
                                <span className="material-symbols-outlined">history</span>
                                Nhật ký xử phạt
                            </button>
                            <button
                                className="reports-button reports-button-primary"
                                type="button"
                                onClick={exportReports}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Xuất báo cáo
                            </button>
                        </div>
                    </section>

                    <section className="reports-stats">
                        <article className="reports-stat-card">
                            <div className="reports-stat-top">
                                <span>Tổng báo cáo</span>
                                <span className="reports-stat-icon blue">
                                    <span className="material-symbols-outlined">flag</span>
                                </span>
                            </div>
                            <strong>128</strong>
                            <small><b>+12</b> báo cáo hôm nay</small>
                        </article>

                        <article className="reports-stat-card">
                            <div className="reports-stat-top">
                                <span>Chưa xử lý</span>
                                <span className="reports-stat-icon red">
                                    <span className="material-symbols-outlined">priority_high</span>
                                </span>
                            </div>
                            <strong>{34 + counts.pending - 1}</strong>
                            <small className="reports-stat-warning">Cần xử lý gấp</small>
                        </article>

                        <article className="reports-stat-card">
                            <div className="reports-stat-top">
                                <span>Đang xử lý</span>
                                <span className="reports-stat-icon orange">
                                    <span className="material-symbols-outlined">pending_actions</span>
                                </span>
                            </div>
                            <strong>{18 + counts.processing - 1}</strong>
                            <small>4 điều phối viên đang xem</small>
                        </article>

                        <article className="reports-stat-card">
                            <div className="reports-stat-top">
                                <span>Đã giải quyết</span>
                                <span className="reports-stat-icon green">
                                    <span className="material-symbols-outlined">task_alt</span>
                                </span>
                            </div>
                            <strong>{76 + counts.resolved - 1}</strong>
                            <small><b>84%</b> tỷ lệ giải quyết</small>
                        </article>
                    </section>

                    <section className="reports-workspace">
                        <div className="reports-left-column">
                            <div className="reports-panel reports-list-panel">
                                <div className="reports-panel-heading">
                                    <div>
                                        <h2>Danh sách báo cáo</h2>
                                        <p>Các báo cáo được gửi từ cộng đồng ComicHub</p>
                                    </div>
                                    <span className="reports-total-label">
                                        {filteredReports.length} kết quả
                                    </span>
                                </div>

                                <div className="reports-filters">
                                    <label className="reports-filter-search">
                                        <span className="material-symbols-outlined">search</span>
                                        <input
                                            value={search}
                                            onChange={(event) => {
                                                setSearch(event.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Tìm mã, truyện, người gửi..."
                                        />
                                    </label>

                                    <select
                                        aria-label="Lọc loại báo cáo"
                                        value={typeFilter}
                                        onChange={(event) => {
                                            setTypeFilter(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option>Tất cả loại</option>
                                        <option>Quấy rối</option>
                                        <option>Bản quyền</option>
                                        <option>Spam</option>
                                        <option>Nội dung không phù hợp</option>
                                    </select>

                                    <select
                                        aria-label="Lọc mức độ ưu tiên"
                                        value={priorityFilter}
                                        onChange={(event) => {
                                            setPriorityFilter(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option>Tất cả mức độ</option>
                                        <option>Khẩn cấp</option>
                                        <option>Cao</option>
                                        <option>Trung bình</option>
                                    </select>

                                    <select
                                        aria-label="Lọc trạng thái"
                                        value={statusFilter}
                                        onChange={(event) => {
                                            setStatusFilter(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option>Tất cả trạng thái</option>
                                        {statusOptions.map((status) => (
                                            <option key={status}>{status}</option>
                                        ))}
                                    </select>

                                    <button
                                        className="reports-reset-button"
                                        type="button"
                                        onClick={resetFilters}
                                        title="Xóa bộ lọc"
                                    >
                                        <span className="material-symbols-outlined">restart_alt</span>
                                    </button>
                                </div>

                                <div className="reports-table-wrap">
                                    <table className="reports-table">
                                        <thead>
                                        <tr>
                                            <th>MÃ / ĐỐI TƯỢNG</th>
                                            <th>LOẠI BÁO CÁO</th>
                                            <th>NGƯỜI GỬI</th>
                                            <th>ƯU TIÊN</th>
                                            <th>THỜI GIAN</th>
                                            <th>TRẠNG THÁI</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {visibleReports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className={selectedId === report.id ? 'selected' : ''}
                                                onClick={() => setSelectedId(report.id)}
                                            >
                                                <td>
                                                    <strong className="reports-id">{report.id}</strong>
                                                    <span className="reports-target">{report.target}</span>
                                                    <small>{report.detail}</small>
                                                </td>
                                                <td>
                                                    <span className="reports-type">{report.type}</span>
                                                </td>
                                                <td>
                                                    <strong className="reports-sender">{report.sender}</strong>
                                                    <small>{report.username}</small>
                                                </td>
                                                <td>
                                                        <span className={`reports-priority ${report.priority === 'Khẩn cấp' ? 'urgent' : report.priority === 'Cao' ? 'high' : 'medium'}`}>
                                                            {report.priority}
                                                        </span>
                                                </td>
                                                <td className="reports-time">{report.time}</td>
                                                <td>
                                                        <span className={`reports-status ${report.status === 'Chưa xử lý' ? 'pending' : report.status === 'Đang xử lý' ? 'processing' : report.status === 'Đã giải quyết' ? 'resolved' : 'ignored'}`}>
                                                            {report.status}
                                                        </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="reports-row-action"
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setSelectedId(report.id);
                                                        }}
                                                        aria-label={`Xem ${report.id}`}
                                                    >
                                                        <span className="material-symbols-outlined">chevron_right</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {visibleReports.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="reports-empty">
                                                    Không tìm thấy báo cáo phù hợp.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="reports-pagination">
                                    <span>
                                        Hiển thị {filteredReports.length ? (currentPage - 1) * pageSize + 1 : 0}
                                        –{Math.min(currentPage * pageSize, filteredReports.length)} trong {filteredReports.length} báo cáo mẫu
                                    </span>
                                    <div>
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                            aria-label="Trang trước"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <span className="reports-page-number">{currentPage}</span>
                                        <button
                                            type="button"
                                            disabled={currentPage >= totalPages}
                                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                            aria-label="Trang sau"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="reports-panel reports-analytics">
                                <div className="reports-panel-heading">
                                    <div>
                                        <h2>Phân loại báo cáo</h2>
                                        <p>Tỷ trọng theo nhóm vi phạm · Dữ liệu minh họa</p>
                                    </div>
                                    <span className="material-symbols-outlined reports-analytics-icon">donut_small</span>
                                </div>

                                <div className="reports-chart-content">
                                    <div className="reports-donut">
                                        <div>
                                            <strong>128</strong>
                                            <small>Tổng báo cáo</small>
                                        </div>
                                    </div>
                                    <div className="reports-legend">
                                        <div><i className="legend-blue" /><span>Quấy rối ngôn từ</span><strong>45% <small>(58)</small></strong></div>
                                        <div><i className="legend-purple" /><span>Khiếu nại bản quyền</span><strong>30% <small>(38)</small></strong></div>
                                        <div><i className="legend-orange" /><span>Spam & Link rác</span><strong>15% <small>(19)</small></strong></div>
                                        <div><i className="legend-gray" /><span>Vi phạm khác</span><strong>10% <small>(13)</small></strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="reports-right-column">
                            <div className="reports-panel reports-ai-panel">
                                <div className="reports-ai-heading">
                                    <div className="reports-ai-icon">
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                    </div>
                                    <div>
                                        <h2>Trợ lý AI</h2>
                                        <p>Phân tích hỗ trợ kiểm duyệt</p>
                                    </div>
                                    <span className="reports-ai-demo">DEMO</span>
                                </div>

                                {selectedReport ? (
                                    <>
                                        <div className="reports-ai-report-id">
                                            <span>ĐANG PHÂN TÍCH</span>
                                            <strong>{selectedReport.id}</strong>
                                        </div>

                                        <div className="reports-ai-summary">
                                            <h3>Tóm tắt báo cáo</h3>
                                            <p>
                                                Báo cáo liên quan đến <b>{selectedReport.target}</b>.
                                                Nội dung được phân loại là <b>{selectedReport.type.toLowerCase()}</b>.
                                                Cần quản trị viên kiểm tra ngữ cảnh và bằng chứng trước khi đưa ra quyết định.
                                            </p>
                                        </div>

                                        <div className="reports-ai-confidence">
                                            <div>
                                                <span>Độ tin cậy phân loại</span>
                                                <strong>92%</strong>
                                            </div>
                                            <div className="reports-confidence-track"><i /></div>
                                        </div>

                                        <div className="reports-ai-info">
                                            <div>
                                                <span className="material-symbols-outlined">priority_high</span>
                                                <span>Đánh giá ưu tiên</span>
                                                <strong>{selectedReport.priority}</strong>
                                            </div>
                                            <div>
                                                <span className="material-symbols-outlined">content_copy</span>
                                                <span>Báo cáo tương tự</span>
                                                <strong>3 trường hợp</strong>
                                            </div>
                                        </div>

                                        <div className="reports-ai-suggestion">
                                            <strong>
                                                <span className="material-symbols-outlined">lightbulb</span>
                                                Đề xuất xử lý
                                            </strong>
                                            <p>
                                                Đối chiếu nội dung bị báo cáo với quy định cộng đồng,
                                                xem xét bằng chứng và lịch sử liên quan trước khi xử lý.
                                            </p>
                                        </div>

                                        <div className="reports-ai-actions">
                                            <button
                                                type="button"
                                                className="reports-button reports-button-primary"
                                                onClick={() => updateStatus('Đang xử lý')}
                                            >
                                                <span className="material-symbols-outlined">assignment_turned_in</span>
                                                Nhận xử lý
                                            </button>
                                            <button
                                                type="button"
                                                className="reports-button reports-button-light"
                                                onClick={() => showNotice('Chức năng xem báo cáo liên quan đang dùng dữ liệu mẫu.')}
                                            >
                                                Xem báo cáo liên quan
                                            </button>
                                        </div>

                                        <div className="reports-ai-decision">
                                            <button
                                                type="button"
                                                onClick={() => updateStatus('Đã giải quyết')}
                                            >
                                                <span className="material-symbols-outlined">check_circle</span>
                                                Đánh dấu đã giải quyết
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus('Đã bỏ qua')}
                                            >
                                                <span className="material-symbols-outlined">do_not_disturb_on</span>
                                                Bỏ qua báo cáo
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="reports-ai-no-selection">
                                        Chọn một báo cáo trong danh sách để xem phân tích.
                                    </div>
                                )}

                                <div className="reports-ai-disclaimer">
                                    <span className="material-symbols-outlined">info</span>
                                    Phân tích AI chỉ là nội dung minh họa. Quản trị viên cần tự xác minh thông tin trước khi quyết định.
                                </div>
                            </div>

                            <div className="reports-panel reports-context-panel">
                                <div className="reports-panel-heading">
                                    <div>
                                        <h2>Ngữ cảnh báo cáo</h2>
                                        <p>Thông tin đối tượng được chọn</p>
                                    </div>
                                    <span className="material-symbols-outlined">visibility</span>
                                </div>
                                {selectedReport ? (
                                    <div className="reports-context-content">
                                        <span className="reports-context-label">ĐỐI TƯỢNG</span>
                                        <strong>{selectedReport.target}</strong>
                                        <p>{selectedReport.detail}</p>
                                        <div className="reports-context-meta">
                                            <span>Mã báo cáo</span>
                                            <b>{selectedReport.id}</b>
                                        </div>
                                        <div className="reports-context-meta">
                                            <span>Người gửi</span>
                                            <b>{selectedReport.sender}</b>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => showNotice('Liên kết đến nội dung gốc sẽ được tích hợp khi có API.')}
                                        >
                                            Mở nội dung liên quan
                                            <span className="material-symbols-outlined">open_in_new</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="reports-context-empty">Chưa có báo cáo được chọn.</p>
                                )}
                            </div>
                        </aside>
                    </section>

                    <footer className="reports-footer">
                        <span>© 2026 ComicHub Administration</span>
                        <span>Hệ thống quản trị nội dung · Dữ liệu demo</span>
                    </footer>
                </div>
            </main>

            {notice && (
                <div className="reports-toast" role="status">
                    <span className="material-symbols-outlined">check_circle</span>
                    {notice}
                </div>
            )}
        </div>
    );
}