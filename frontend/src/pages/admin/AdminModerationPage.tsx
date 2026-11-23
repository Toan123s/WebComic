import { useMemo, useState } from 'react';
import './AdminModerationPage.css';

type ReviewStatus = 'pending' | 'approved' | 'rejected';
type SubmissionType = 'comic' | 'chapter';

type Submission = {
    id: number;
    title: string;
    author: string;
    category: string;
    time: string;
    type: SubmissionType;
    status: ReviewStatus;
    pages: number;
    size: string;
    trust: number;
    description: string;
};

const initialSubmissions: Submission[] = [
    {
        id: 1,
        title: 'Đao Thần Tái Thế - Chương 12: Huyết Chiến',
        author: 'Lê Khắc Nam',
        category: 'Võ hiệp',
        time: '14:20',
        type: 'chapter',
        status: 'pending',
        pages: 24,
        size: '18.5 MB',
        trust: 98,
        description: 'Bản thảo chương 12 gồm 24 trang ảnh WebP.',
    },
    {
        id: 2,
        title: 'Học Viện Thợ Săn - Truyện mới',
        author: 'Bùi Thanh Hương',
        category: 'Hành động',
        time: '11:05',
        type: 'comic',
        status: 'pending',
        pages: 18,
        size: '14.2 MB',
        trust: 95,
        description: 'Tác phẩm mới gửi lên hệ thống để xét duyệt.',
    },
    {
        id: 3,
        title: 'Lời Hẹn Dưới Mưa - Chương 03',
        author: 'Ngô Khánh An',
        category: 'Tình cảm',
        time: '09:30',
        type: 'chapter',
        status: 'pending',
        pages: 20,
        size: '16.8 MB',
        trust: 92,
        description: 'Chương mới của bộ truyện Lời Hẹn Dưới Mưa.',
    },
    {
        id: 4,
        title: 'Thành Phố Ánh Sao - Chương 08',
        author: 'Phạm Minh Anh',
        category: 'Giả tưởng',
        time: '08:45',
        type: 'chapter',
        status: 'approved',
        pages: 16,
        size: '12.4 MB',
        trust: 97,
        description: 'Chương truyện đã được kiểm duyệt.',
    },
    {
        id: 5,
        title: 'Ký Ức Mùa Hạ - Truyện mới',
        author: 'Trần Ngọc Mai',
        category: 'Đời thường',
        time: '08:10',
        type: 'comic',
        status: 'rejected',
        pages: 12,
        size: '9.6 MB',
        trust: 86,
        description: 'Bản thảo cần chỉnh sửa trước khi gửi lại.',
    },
];

const statusLabels: Record<ReviewStatus, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
};

function AdminModerationPage() {
    const [submissions, setSubmissions] =
        useState<Submission[]>(initialSubmissions);
    const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
    const [typeFilter, setTypeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(1);
    const [selectedPage, setSelectedPage] = useState(3);
    const [zoom, setZoom] = useState(100);
    const [note, setNote] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('copyright');
    const [rejectMessage, setRejectMessage] = useState('');
    const [toast, setToast] = useState('');

    const counts = useMemo(() => ({
        pending: submissions.filter((item) => item.status === 'pending').length,
        approved: submissions.filter((item) => item.status === 'approved').length,
        rejected: submissions.filter((item) => item.status === 'rejected').length,
    }), [submissions]);

    const filteredSubmissions = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return submissions.filter((item) => {
            const matchesStatus = item.status === activeTab;
            const matchesType =
                typeFilter === 'all' || item.type === typeFilter;
            const matchesSearch =
                !keyword ||
                item.title.toLowerCase().includes(keyword) ||
                item.author.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword);

            return matchesStatus && matchesType && matchesSearch;
        });
    }, [submissions, activeTab, typeFilter, search]);

    const selectedSubmission =
        submissions.find((item) => item.id === selectedId) ??
        filteredSubmissions[0] ??
        null;

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2500);
    };

    const changeStatus = (status: ReviewStatus) => {
        if (!selectedSubmission) return;

        setSubmissions((current) =>
            current.map((item) =>
                item.id === selectedSubmission.id
                    ? { ...item, status }
                    : item,
            ),
        );

        setActiveTab(status);
        showToast(
            status === 'approved'
                ? 'Đã phê duyệt nội dung thành công.'
                : 'Đã từ chối nội dung.',
        );
    };

    const confirmReject = () => {
        if (!rejectMessage.trim()) {
            showToast('Vui lòng nhập lời nhắn gửi tác giả.');
            return;
        }

        changeStatus('rejected');
        setRejectOpen(false);
        setRejectMessage('');
    };

    const switchTab = (status: ReviewStatus) => {
        setActiveTab(status);
        setTypeFilter('all');
        setSearch('');
    };

    return (
        <div className="moderation-page">
            <aside className="moderation-sidebar">
                <div className="moderation-brand">
                    <div className="moderation-brand-icon">C</div>
                    <div>
                        <strong>ComicHub Admin</strong>
                        <span>Hệ thống Quản trị</span>
                    </div>
                </div>

                <div className="moderation-sidebar-divider" />

                <nav className="moderation-nav">
                    <a href="/admin"><span>▦</span>Tổng quan</a>
                    <a href="/admin/comics"><span>▤</span>Quản lý truyện</a>
                    <a className="active" href="/admin/moderation">
                        <span>✓</span>Kiểm duyệt nội dung
                    </a>
                    <a href="/admin/genres"><span>◇</span>Quản lý thể loại</a>
                    <a href="/admin/users"><span>♧</span>Quản lý người dùng</a>
                    <a href="/admin/roles"><span>♙</span>Vai trò và phân quyền</a>
                    <a href="/admin/reports"><span>⚑</span>Quản lý báo cáo</a>
                    <a href="/admin/statistics"><span>▥</span>Thống kê</a>
                    <a href="/admin/activity-logs">
                        <span>◷</span>Nhật ký hoạt động
                    </a>
                    <a href="#"><span>⚙</span>Cài đặt hệ thống</a>
                </nav>

                <div className="moderation-sidebar-bottom">
                    <span className="moderation-online-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="moderation-main">
                <header className="moderation-topbar">
                    <div className="moderation-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span>›</span>
                        <strong>Kiểm duyệt nội dung</strong>
                    </div>

                    <div className="moderation-admin">
                        <div className="moderation-admin-avatar">H</div>
                        <div>
                            <strong>Hoạt</strong>
                            <span>Quản trị viên</span>
                        </div>
                    </div>
                </header>

                <main className="moderation-content">
                    <section className="moderation-heading">
                        <div>
                            <div className="moderation-eyebrow">
                                <span /> HỆ THỐNG KIỂM DUYỆT CẤP 1
                            </div>
                            <h1>Kiểm duyệt nội dung</h1>
                            <p>
                                Xét duyệt truyện và chương mới từ tác giả
                                trước khi xuất bản
                            </p>
                        </div>

                        <div className="moderation-tabs">
                            {(['pending', 'approved', 'rejected'] as const).map(
                                (status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={activeTab === status ? 'active' : ''}
                                        onClick={() => switchTab(status)}
                                    >
                                        {statusLabels[status]}
                                        <span>{counts[status]}</span>
                                    </button>
                                ),
                            )}
                        </div>
                    </section>

                    <section className="moderation-workspace">
                        <div className="moderation-queue">
                            <div className="moderation-filter-card">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="⌕  Tìm tác phẩm, tác giả..."
                                />

                                <div className="moderation-filter-chips">
                                    {[
                                        { value: 'all', label: 'Tất cả' },
                                        { value: 'comic', label: 'Truyện mới' },
                                        { value: 'chapter', label: 'Chương mới' },
                                    ].map((filter) => (
                                        <button
                                            type="button"
                                            key={filter.value}
                                            className={typeFilter === filter.value ? 'active' : ''}
                                            onClick={() => setTypeFilter(filter.value)}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="moderation-queue-list">
                                {filteredSubmissions.length === 0 ? (
                                    <div className="moderation-empty">
                                        Không tìm thấy nội dung phù hợp.
                                    </div>
                                ) : (
                                    filteredSubmissions.map((item) => (
                                        <button
                                            type="button"
                                            key={item.id}
                                            className={`moderation-submission ${
                                                selectedSubmission?.id === item.id ? 'selected' : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedId(item.id);
                                                setSelectedPage(1);
                                                setZoom(100);
                                                setNote('');
                                            }}
                                        >
                                            <div className="moderation-cover">
                                                {item.type === 'comic' ? '📚' : '📖'}
                                            </div>
                                            <div className="moderation-submission-info">
                                                <div className="moderation-submission-meta">
                                                    <span>{item.category}</span>
                                                    <time>{item.time}</time>
                                                </div>
                                                <strong>{item.title}</strong>
                                                <small>♙ {item.author}</small>
                                                <div className="moderation-submission-status">
                                                    <span>Trạng thái</span>
                                                    <b className={`status-${item.status}`}>
                                                        {statusLabels[item.status]}
                                                    </b>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="moderation-detail">
                            {selectedSubmission ? (
                                <>
                                    <section className="moderation-panel moderation-review-card">
                                        <div className="moderation-detail-top">
                                            <div>
                                                <div className="moderation-tags">
                                                    <span>
                                                        {selectedSubmission.type === 'comic'
                                                            ? 'Truyện mới'
                                                            : 'Chương truyện'}
                                                    </span>
                                                    <span>{selectedSubmission.pages} trang ảnh</span>
                                                    <span>{selectedSubmission.size}</span>
                                                    <span className="trust-tag">
                                                        ✓ Tác giả uy tín {selectedSubmission.trust}%
                                                    </span>
                                                </div>
                                                <h2>{selectedSubmission.title}</h2>
                                                <p>
                                                    Tác giả: <strong>{selectedSubmission.author}</strong>
                                                    <span> · </span>
                                                    {selectedSubmission.category}
                                                </p>
                                            </div>

                                            {selectedSubmission.status === 'pending' && (
                                                <div className="moderation-actions">
                                                    <button
                                                        type="button"
                                                        className="reject-button"
                                                        onClick={() => setRejectOpen(true)}
                                                    >
                                                        Từ chối
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="approve-button"
                                                        onClick={() => changeStatus('approved')}
                                                    >
                                                        ✓ Phê duyệt
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="moderation-checks">
                                            <strong>✓ Kiểm tra tiêu chuẩn tự động</strong>
                                            <span>✓ Không có nội dung vi phạm</span>
                                            <span>✓ Kiểm tra bản quyền</span>
                                            <span>✓ Chất lượng ảnh đạt yêu cầu</span>
                                        </div>
                                    </section>

                                    <section className="moderation-panel moderation-viewer">
                                        <div className="moderation-viewer-heading">
                                            <strong>
                                                Xem trước nội dung · Trang {selectedPage} / {selectedSubmission.pages}
                                            </strong>
                                            <div className="moderation-zoom">
                                                <button
                                                    type="button"
                                                    aria-label="Thu nhỏ"
                                                    onClick={() => setZoom((value) => Math.max(50, value - 10))}
                                                >
                                                    −
                                                </button>
                                                <span>{zoom}%</span>
                                                <button
                                                    type="button"
                                                    aria-label="Phóng to"
                                                    onClick={() => setZoom((value) => Math.min(150, value + 10))}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="moderation-page-preview">
                                            <div
                                                className="moderation-comic-sheet"
                                                style={{ transform: `scale(${zoom / 100})` }}
                                            >
                                                <span>COMICHUB · BẢN XEM TRƯỚC</span>
                                                <div className="moderation-comic-art">
                                                    <div className="comic-art-title">
                                                        {selectedSubmission.title}
                                                    </div>
                                                    <div className="comic-art-figure">✦</div>
                                                    <p>
                                                        Trang {String(selectedPage).padStart(2, '0')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="moderation-page-picker">
                                            {Array.from(
                                                { length: Math.min(selectedSubmission.pages, 6) },
                                                (_, index) => index + 1,
                                            ).map((pageNumber) => (
                                                <button
                                                    type="button"
                                                    key={pageNumber}
                                                    className={selectedPage === pageNumber ? 'active' : ''}
                                                    onClick={() => setSelectedPage(pageNumber)}
                                                >
                                                    <span>{String(pageNumber).padStart(2, '0')}</span>
                                                    Trang {pageNumber}
                                                </button>
                                            ))}
                                        </div>

                                        <label className="moderation-note">
                                            <strong>Ghi chú nội bộ cho kiểm duyệt viên</strong>
                                            <textarea
                                                rows={3}
                                                value={note}
                                                onChange={(event) => setNote(event.target.value)}
                                                placeholder="Nhập ghi chú nội bộ (không bắt buộc)..."
                                            />
                                        </label>
                                    </section>

                                    <section className="moderation-panel moderation-history">
                                        <h3>◷ Nhật ký tiến trình xét duyệt</h3>
                                        <div className="moderation-timeline">
                                            <div>
                                                <b>{selectedSubmission.time}</b>
                                                <span>Tác giả nộp</span>
                                                <p>{selectedSubmission.description}</p>
                                            </div>
                                            <div>
                                                <b>Hệ thống</b>
                                                <span>Kiểm tra tự động</span>
                                                <p>Đã hoàn tất bước kiểm tra sơ bộ.</p>
                                            </div>
                                            {selectedSubmission.status !== 'pending' && (
                                                <div>
                                                    <b>Mới cập nhật</b>
                                                    <span>{statusLabels[selectedSubmission.status]}</span>
                                                    <p>Trạng thái hồ sơ đã được cập nhật trong giao diện.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <div className="moderation-panel moderation-no-selection">
                                    Chọn một nội dung trong danh sách để bắt đầu kiểm duyệt.
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {rejectOpen && selectedSubmission && (
                <div
                    className="moderation-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setRejectOpen(false);
                    }}
                >
                    <section className="moderation-modal">
                        <div className="moderation-modal-heading">
                            <div>
                                <span>!</span>
                                <div>
                                    <h3>Từ chối duyệt nội dung</h3>
                                    <p>{selectedSubmission.title}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setRejectOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="moderation-modal-body">
                            <label>
                                Lý do từ chối chính <b>*</b>
                                <select
                                    value={rejectReason}
                                    onChange={(event) => setRejectReason(event.target.value)}
                                >
                                    <option value="copyright">Vi phạm bản quyền hình ảnh</option>
                                    <option value="quality">Chất lượng ảnh chưa đạt</option>
                                    <option value="content">Nội dung chưa phù hợp quy định</option>
                                    <option value="other">Lý do khác</option>
                                </select>
                            </label>

                            <label>
                                Lời nhắn gửi tác giả <b>*</b>
                                <textarea
                                    rows={4}
                                    value={rejectMessage}
                                    onChange={(event) => setRejectMessage(event.target.value)}
                                    placeholder="Nhập lý do cụ thể để tác giả biết và chỉnh sửa..."
                                />
                            </label>
                        </div>

                        <div className="moderation-modal-footer">
                            <button
                                type="button"
                                onClick={() => setRejectOpen(false)}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="confirm-reject"
                                onClick={confirmReject}
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {toast && <div className="moderation-toast">{toast}</div>}
        </div>
    );
}

export default AdminModerationPage;
