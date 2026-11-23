import { useMemo, useState } from 'react';
import './AdminActivityLogPage.css';

type LogStatus = 'Thành công' | 'Thất bại' | 'Cảnh báo';

type ActivityLog = {
    id: string;
    actor: string;
    role: string;
    action: string;
    target: string;
    description: string;
    time: string;
    ip: string;
    status: LogStatus;
    actionType: string;
    avatar: string;
    location: string;
    device: string;
    note: string;
};

const initialLogs: ActivityLog[] = [
    {
        id: 'AUD-2024-88412',
        actor: 'Phan Anh',
        role: 'Kiểm duyệt viên',
        action: 'Phê duyệt chương truyện',
        target: 'Đao Thần Tái Thế • Chương 45',
        description: 'Tác giả: Minh Dạ Thiên Quân (ID: #CR-2089)',
        time: '14:25 Hôm nay',
        ip: '14.161.22.84',
        status: 'Thành công',
        actionType: 'approve',
        avatar: 'PA',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Chrome / Windows 11',
        note: 'Chương truyện đã vượt qua kiểm tra AI và được duyệt thủ công.',
    },
    {
        id: 'AUD-2024-88409',
        actor: 'Hoạt',
        role: 'Quản trị viên',
        action: 'Khóa tài khoản',
        target: 'Tài khoản @user_bad99',
        description: 'Vi phạm phát tán truyện không được cấp phép',
        time: '11:10 Hôm nay',
        ip: '118.69.182.10',
        status: 'Thành công',
        actionType: 'ban_user',
        avatar: 'H',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Chrome / Windows 11',
        note: 'Tài khoản được khóa sau khi xác minh báo cáo vi phạm.',
    },
    {
        id: 'AUD-2024-88395',
        actor: 'Mai Lan',
        role: 'Kiểm duyệt viên',
        action: 'Từ chối chương truyện',
        target: 'Tuyệt Thế Huyết Ma • Chương 12',
        description: 'Hình ảnh mờ, có watermark bên thứ ba',
        time: '09:45 Hôm nay',
        ip: '27.72.63.140',
        status: 'Thành công',
        actionType: 'reject',
        avatar: 'ML',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Edge / Windows 11',
        note: 'Tác giả cần gửi lại hình ảnh đạt yêu cầu chất lượng.',
    },
    {
        id: 'AUD-2024-88370',
        actor: 'Hệ thống tự động',
        role: 'Cron Daemon',
        action: 'Cập nhật thể loại',
        target: 'Thể loại Khoa học viễn tưởng',
        description: 'Tự động gắn lại tag cho 35 tác phẩm',
        time: '03:00 Hôm nay',
        ip: 'Localhost',
        status: 'Cảnh báo',
        actionType: 'category',
        avatar: 'SYS',
        location: 'Máy chủ nội bộ',
        device: 'Background Worker',
        note: 'Một số tag cần được quản trị viên kiểm tra lại.',
    },
    {
        id: 'AUD-2024-88310',
        actor: 'Mai Lan',
        role: 'Kiểm duyệt viên',
        action: 'Xử lý báo cáo',
        target: 'Báo cáo vi phạm #BC-896',
        description: 'Đã xử lý 12 bình luận vi phạm',
        time: '16:30 29/05/2024',
        ip: '27.72.63.140',
        status: 'Thành công',
        actionType: 'report',
        avatar: 'ML',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Chrome / Windows 11',
        note: 'Báo cáo đã được xử lý và lưu lại lịch sử.',
    },
    {
        id: 'AUD-2024-88280',
        actor: 'Hoạt',
        role: 'Quản trị viên',
        action: 'Thay đổi quyền truy cập',
        target: 'Tài khoản @editor_viet',
        description: 'Không thể xác thực phiên thay đổi quyền',
        time: '10:15 29/05/2024',
        ip: '118.69.182.10',
        status: 'Thất bại',
        actionType: 'perm',
        avatar: 'H',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Chrome / Windows 11',
        note: 'Thao tác không hoàn tất do bước xác thực thất bại.',
    },
    {
        id: 'AUD-2024-88261',
        actor: 'Phan Anh',
        role: 'Kiểm duyệt viên',
        action: 'Phê duyệt truyện',
        target: 'Hành Trình Cổ Giới',
        description: 'Truyện mới đã vượt qua quy trình kiểm duyệt',
        time: '09:20 29/05/2024',
        ip: '14.161.22.84',
        status: 'Thành công',
        actionType: 'approve',
        avatar: 'PA',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        device: 'Chrome / Windows 11',
        note: 'Tác phẩm đã được phê duyệt để xuất bản.',
    },
];

const actionOptions = [
    { value: '', label: 'Loại hành động: Tất cả' },
    { value: 'approve', label: 'Phê duyệt truyện/chương' },
    { value: 'reject', label: 'Từ chối chương' },
    { value: 'ban_user', label: 'Khóa tài khoản' },
    { value: 'category', label: 'Cập nhật thể loại' },
    { value: 'report', label: 'Xử lý báo cáo' },
    { value: 'perm', label: 'Thay đổi phân quyền' },
];

function AdminActivityLogPage() {
    const [logs] = useState<ActivityLog[]>(initialLogs);
    const [search, setSearch] = useState('');
    const [actorFilter, setActorFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [toast, setToast] = useState('');

    const pageSize = 6;

    const filteredLogs = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesSearch =
                !keyword ||
                [
                    log.id,
                    log.actor,
                    log.action,
                    log.target,
                    log.description,
                    log.ip,
                ].some((value) => value.toLowerCase().includes(keyword));

            const matchesActor = !actorFilter || log.actor === actorFilter;
            const matchesAction =
                !actionFilter || log.actionType === actionFilter;
            const matchesStatus =
                !statusFilter || log.status === statusFilter;

            const matchesTime =
                timeFilter === 'all' ||
                (timeFilter === 'today' && log.time.includes('Hôm nay')) ||
                (timeFilter === 'older' && !log.time.includes('Hôm nay'));

            return (
                matchesSearch &&
                matchesActor &&
                matchesAction &&
                matchesStatus &&
                matchesTime
            );
        });
    }, [logs, search, actorFilter, actionFilter, statusFilter, timeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    const visibleLogs = filteredLogs.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const resetFilters = () => {
        setSearch('');
        setActorFilter('');
        setActionFilter('');
        setTimeFilter('all');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2500);
    };

    const exportCsv = () => {
        const headers = [
            'Mã sự kiện',
            'Người thực hiện',
            'Vai trò',
            'Hành động',
            'Đối tượng',
            'Thời gian',
            'IP',
            'Kết quả',
        ];

        const rows = filteredLogs.map((log) => [
            log.id,
            log.actor,
            log.role,
            log.action,
            log.target,
            log.time,
            log.ip,
            log.status,
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(','),
            )
            .join('\r\n');

        const blob = new Blob(['\uFEFF' + csv], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'comichub-activity-logs.csv';
        link.click();

        URL.revokeObjectURL(url);
        showToast('Đã xuất file CSV thành công.');
    };

    const copyPayload = async () => {
        if (!selectedLog) return;

        const payload = {
            event_id: selectedLog.id,
            actor: selectedLog.actor,
            action: selectedLog.actionType,
            target: selectedLog.target,
            status: selectedLog.status,
            client_ip: selectedLog.ip,
            timestamp: selectedLog.time,
        };

        try {
            await navigator.clipboard.writeText(
                JSON.stringify(payload, null, 2),
            );
            showToast('Đã sao chép dữ liệu JSON.');
        } catch {
            showToast('Không thể sao chép. Hãy kiểm tra quyền trình duyệt.');
        }
    };

    const statusClass = (status: LogStatus) => {
        if (status === 'Thành công') return 'activity-status-success';
        if (status === 'Thất bại') return 'activity-status-failed';
        return 'activity-status-warning';
    };

    return (
        <div className="activity-page">
            <aside className="activity-sidebar">
                <div>
                    <div className="activity-brand">
                        <div className="activity-brand-logo">C</div>
                        <div>
                            <strong>ComicHub Admin</strong>
                            <span>Hệ thống Quản trị</span>
                        </div>
                    </div>

                    <div className="activity-sidebar-divider" />

                    <nav className="activity-nav">
                        <a href="/admin"><span>▦</span>Tổng quan</a>
                        <a href="/admin/comics"><span>▤</span>Quản lý truyện</a>
                        <a href="/admin/moderation"><span>✓</span>Kiểm duyệt nội dung</a>
                        <a href="/admin/genres"><span>◇</span>Quản lý thể loại</a>
                        <a href="/admin/users"><span>♧</span>Quản lý người dùng</a>
                        <a href="/admin/roles"><span>♙</span>Vai trò và phân quyền</a>
                        <a href="/admin/reports"><span>⚑</span>Quản lý báo cáo</a>
                        <a href="/admin/statistics"><span>▥</span>Thống kê</a>
                        <a className="active" href="/admin/activity-logs">
                            <span>◷</span>Nhật ký hoạt động
                        </a>
                        <a href="/admin/settings"><span>⚙</span>Cài đặt hệ thống</a>
                    </nav>
                </div>

                <div className="activity-sidebar-footer">
                    <span className="activity-online-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="activity-main">
                <header className="activity-topbar">
                    <div className="activity-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span>›</span>
                        <strong>Nhật ký hoạt động</strong>
                    </div>

                    <div className="activity-topbar-right">
                        <div className="activity-global-search">
                            <span>⌕</span>
                            <input placeholder="Tìm kiếm..." />
                        </div>
                        <button
                            className="activity-notification"
                            type="button"
                            aria-label="Thông báo"
                        >
                            ♧<i>3</i>
                        </button>
                        <div className="activity-profile">
                            <div className="activity-profile-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="activity-content">
                    <section className="activity-heading">
                        <div>
                            <div className="activity-eyebrow">
                                <span>✓</span>
                                HỆ THỐNG KIỂM TOÁN
                                <i />
                                <small>ID Sổ cái: LEDGER-VN-2024</small>
                            </div>
                            <h1>Nhật ký hoạt động</h1>
                            <p>
                                Ghi nhận và tra cứu lịch sử thao tác của Quản
                                trị viên và Kiểm duyệt viên trên ComicHub.
                                Dữ liệu chỉ đọc phục vụ kiểm toán.
                            </p>
                        </div>

                        <div className="activity-readonly-notice">
                            <span>◈</span>
                            <p>
                                Nhật ký được lưu trữ tự động và bảo mật.
                                Không thể chỉnh sửa hoặc xóa bỏ.
                            </p>
                        </div>
                    </section>

                    <section className="activity-metrics">
                        <article className="activity-metric-card">
                            <div className="activity-metric-label">
                                <span>Sự kiện hôm nay</span><b>▤</b>
                            </div>
                            <strong>1,482</strong>
                            <span className="activity-metric-change">↗ +12.4%</span>
                            <div className="activity-progress"><i style={{ width: '78%' }} /></div>
                        </article>

                        <article className="activity-metric-card">
                            <div className="activity-metric-label">
                                <span>Tỷ lệ thành công</span><b>✓</b>
                            </div>
                            <strong>99.64%</strong>
                            <span className="activity-metric-stable">Ổn định</span>
                            <div className="activity-progress"><i className="green" style={{ width: '99%' }} /></div>
                        </article>

                        <article className="activity-metric-card">
                            <div className="activity-metric-label">
                                <span>Cảnh báo / Ngoại lệ</span><b className="orange">!</b>
                            </div>
                            <strong>5 vụ việc</strong>
                            <span className="activity-metric-warning">Đã xem xét</span>
                            <div className="activity-progress"><i className="orange-bar" style={{ width: '15%' }} /></div>
                        </article>

                        <article className="activity-metric-card">
                            <div className="activity-metric-label">
                                <span>Kiểm duyệt viên trực tuyến</span><b>♧</b>
                            </div>
                            <strong>14 nhân sự</strong>
                            <span className="activity-metric-neutral">3 Quản trị</span>
                            <div className="activity-progress"><i style={{ width: '65%' }} /></div>
                        </article>
                    </section>

                    <section className="activity-filter-card">
                        <div className="activity-filter-grid">
                            <label className="activity-search-field">
                                <span>⌕</span>
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Tìm người thực hiện, đối tượng, mã sự kiện..."
                                />
                            </label>

                            <select
                                value={actorFilter}
                                onChange={(event) => {
                                    setActorFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Người thực hiện: Tất cả</option>
                                <option value="Hoạt">Hoạt - Quản trị viên</option>
                                <option value="Mai Lan">Mai Lan - KDV</option>
                                <option value="Phan Anh">Phan Anh - KDV</option>
                                <option value="Hệ thống tự động">Hệ thống tự động</option>
                            </select>

                            <select
                                value={actionFilter}
                                onChange={(event) => {
                                    setActionFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                {actionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={timeFilter}
                                onChange={(event) => {
                                    setTimeFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">Thời gian: Tất cả</option>
                                <option value="today">Hôm nay</option>
                                <option value="older">Trước hôm nay</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Kết quả: Tất cả</option>
                                <option value="Thành công">Thành công</option>
                                <option value="Thất bại">Thất bại</option>
                                <option value="Cảnh báo">Cảnh báo</option>
                            </select>

                            <button
                                className="activity-reset-button"
                                onClick={resetFilters}
                                type="button"
                            >
                                ↻ <span>Đặt lại</span>
                            </button>
                        </div>
                    </section>

                    <section className="activity-table-card">
                        <div className="activity-table-heading">
                            <div>
                                <h2>Lịch sử thao tác</h2>
                                <p>Các sự kiện được ghi nhận trên hệ thống</p>
                            </div>
                            <button
                                className="activity-export-button"
                                onClick={exportCsv}
                                type="button"
                            >
                                ⇩ Xuất CSV
                            </button>
                        </div>

                        <div className="activity-table-scroll">
                            <table className="activity-table">
                                <thead>
                                <tr>
                                    <th>Người thực hiện</th>
                                    <th>Hành động</th>
                                    <th>Đối tượng</th>
                                    <th>Thời gian</th>
                                    <th>Kết quả</th>
                                    <th>Chi tiết</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className={selectedLog?.id === log.id ? 'selected' : ''}
                                    >
                                        <td>
                                            <div className="activity-actor">
                                                <div className={`activity-avatar ${log.avatar === 'SYS' ? 'system' : ''}`}>
                                                    {log.avatar}
                                                </div>
                                                <div>
                                                    <strong>{log.actor}</strong>
                                                    <span>{log.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                                <span className={`activity-action-tag ${log.actionType}`}>
                                                    {log.action}
                                                </span>
                                        </td>
                                        <td>
                                            <div className="activity-target">
                                                <strong>{log.target}</strong>
                                                <span>{log.description}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="activity-time">
                                                <strong>{log.time}</strong>
                                                <span>IP: {log.ip}</span>
                                            </div>
                                        </td>
                                        <td>
                                                <span className={`activity-status ${statusClass(log.status)}`}>
                                                    <i />{log.status}
                                                </span>
                                        </td>
                                        <td>
                                            <button
                                                className="activity-detail-button"
                                                onClick={() => setSelectedLog(log)}
                                                type="button"
                                            >
                                                Xem chi tiết <span>›</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {visibleLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="activity-empty">
                                            Không tìm thấy nhật ký phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="activity-pagination">
                            <span>
                                Hiển thị <strong>{filteredLogs.length ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredLogs.length)}</strong>
                                {' '}trong tổng số <strong>{filteredLogs.length}</strong> bản ghi
                            </span>
                            <div>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    type="button"
                                >«</button>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    type="button"
                                >‹</button>
                                <strong>{currentPage}</strong>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    type="button"
                                >›</button>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    type="button"
                                >»</button>
                            </div>
                        </div>
                    </section>

                    <section className="activity-integrity">
                        <div className="activity-integrity-icon">▧</div>
                        <div>
                            <strong>Chứng thực tính toàn vẹn chuỗi Hash (SHA-256)</strong>
                            <p>
                                Khối hiện tại #892,109 đã được ghi nhận an toàn.
                                Khóa kiểm tra: <b>e3b0c442...98b0</b>
                            </p>
                        </div>
                        <span className="activity-sealed">▣ Bản ghi chỉ đọc</span>
                    </section>
                </main>
            </div>

            {selectedLog && (
                <div
                    className="activity-drawer-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedLog(null);
                        }
                    }}
                >
                    <aside className="activity-drawer">
                        <div className="activity-drawer-header">
                            <div>
                                <span className="activity-drawer-label">BẢN GHI CHỈ ĐỌC</span>
                                <small>#{selectedLog.id}</small>
                                <h2>Chi tiết nhật ký kiểm toán</h2>
                                <p>Thông tin sự kiện được ghi nhận trên hệ thống</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                aria-label="Đóng"
                                type="button"
                            >×</button>
                        </div>

                        <div className="activity-drawer-body">
                            <div className={`activity-drawer-status ${statusClass(selectedLog.status)}`}>
                                <div>
                                    <strong>Trạng thái giao dịch</strong>
                                    <span>{selectedLog.status}</span>
                                </div>
                                <b>{selectedLog.status === 'Thất bại' ? 'HTTP 400' : 'HTTP 200 OK'}</b>
                            </div>

                            <section className="activity-detail-section">
                                <div className="activity-detail-row">
                                    <span>Mã sự kiện</span>
                                    <strong>{selectedLog.id}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Người thực hiện</span>
                                    <strong>{selectedLog.actor} · {selectedLog.role}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Địa chỉ IP</span>
                                    <strong>{selectedLog.ip}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Thiết bị</span>
                                    <strong>{selectedLog.device}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Vị trí kết nối</span>
                                    <strong>{selectedLog.location}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Thao tác</span>
                                    <strong>{selectedLog.action}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Đối tượng</span>
                                    <strong>{selectedLog.target}</strong>
                                </div>
                                <div className="activity-detail-row">
                                    <span>Thời gian</span>
                                    <strong>{selectedLog.time}</strong>
                                </div>
                            </section>

                            <section className="activity-system-note">
                                <strong>ⓘ Ghi chú hệ thống</strong>
                                <p>{selectedLog.note}</p>
                            </section>

                            <section className="activity-payload">
                                <div>
                                    <strong>Payload Snapshot (Chỉ đọc)</strong>
                                    <button onClick={copyPayload} type="button">
                                        Sao chép JSON
                                    </button>
                                </div>
                                <pre>{JSON.stringify({
                                    event_id: selectedLog.id,
                                    actor: selectedLog.actor,
                                    action: selectedLog.actionType,
                                    target: selectedLog.target,
                                    status: selectedLog.status,
                                    client_ip: selectedLog.ip,
                                    timestamp: selectedLog.time,
                                }, null, 2)}</pre>
                            </section>
                        </div>

                        <div className="activity-drawer-footer">
                            <span>▣ Bản ghi niêm phong</span>
                            <button
                                onClick={() => setSelectedLog(null)}
                                type="button"
                            >Đóng</button>
                        </div>
                    </aside>
                </div>
            )}

            {toast && <div className="activity-toast">{toast}</div>}
        </div>
    );
}

export default AdminActivityLogPage;