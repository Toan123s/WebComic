
import { useMemo, useState, type FormEvent } from 'react';
import './AdminUsersPage.css';

type UserRole = 'guest' | 'user' | 'creator' | 'moderator' | 'admin';
type UserStatus = 'active' | 'banned' | 'unverified';

type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    joinedAt: string;
    status: UserStatus;
    avatar?: string;
    warning?: string;
    comics: number;
    views: string;
    warnings: number;
};

const initialUsers: User[] = [
    {
        id: 'USR-88294',
        name: 'Phan Đình Tùng',
        username: '@tungkute',
        email: 'tungkute@gmail.com',
        role: 'creator',
        joinedAt: '12/01/2023',
        status: 'active',
        comics: 14,
        views: '125K',
        warnings: 0,
    },
    {
        id: 'USR-88295',
        name: 'Đỗ Thị Lan Anh',
        username: '@lananh_manga',
        email: 'lananh.do@outlook.com',
        role: 'user',
        joinedAt: '15/03/2023',
        status: 'active',
        comics: 0,
        views: '2.4K',
        warnings: 0,
    },
    {
        id: 'USR-88296',
        name: 'Hoàng Văn Nam',
        username: '@nam_mod',
        email: 'nam.hoang@comichub.vn',
        role: 'moderator',
        joinedAt: '02/08/2022',
        status: 'active',
        comics: 0,
        views: '8.2K',
        warnings: 0,
    },
    {
        id: 'USR-88297',
        name: 'Trương Gia Bảo',
        username: '@baotruong_98',
        email: 'bao.truong98@yahoo.com',
        role: 'user',
        joinedAt: '10/11/2023',
        status: 'banned',
        warning: 'Vi phạm bình luận',
        comics: 0,
        views: '1.2K',
        warnings: 2,
    },
    {
        id: 'USR-88298',
        name: 'Nguyễn Thị Bích',
        username: '@bichnguyen',
        email: 'bich.art@comic.vn',
        role: 'creator',
        joinedAt: '05/02/2024',
        status: 'unverified',
        comics: 3,
        views: '12K',
        warnings: 0,
    },
    {
        id: 'USR-88299',
        name: 'Lê Quốc Việt',
        username: '@viet_admin',
        email: 'viet.le@comichub.vn',
        role: 'admin',
        joinedAt: '01/01/2022',
        status: 'active',
        comics: 0,
        views: '32K',
        warnings: 0,
    },
    {
        id: 'USR-88300',
        name: 'Trần Minh Khôi',
        username: '@khoi_reader',
        email: 'khoi@gmail.com',
        role: 'user',
        joinedAt: '20/04/2024',
        status: 'active',
        comics: 0,
        views: '980',
        warnings: 0,
    },
    {
        id: 'USR-88301',
        name: 'Phạm Ngọc Mai',
        username: '@maistory',
        email: 'mai@comic.vn',
        role: 'creator',
        joinedAt: '18/06/2024',
        status: 'unverified',
        comics: 5,
        views: '45K',
        warnings: 0,
    },
];

const roleLabels: Record<UserRole, string> = {
    guest: 'Khách',
    user: 'Người dùng',
    creator: 'Tác giả',
    moderator: 'Kiểm duyệt viên',
    admin: 'Quản trị viên',
};

const statusLabels: Record<UserStatus, string> = {
    active: 'Hoạt động',
    banned: 'Bị khóa',
    unverified: 'Chưa xác minh',
};

type ModalType = 'lock' | 'role' | 'add' | null;

function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modal, setModal] = useState<ModalType>(null);

    const [lockReason, setLockReason] = useState('spam');
    const [lockNote, setLockNote] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('user');

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const pageSize = 6;

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !keyword ||
                user.name.toLowerCase().includes(keyword) ||
                user.username.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                user.id.toLowerCase().includes(keyword);

            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = !statusFilter || user.status === statusFilter;

            const [day, month, year] = user.joinedAt.split('/').map(Number);
            const joinedDate = new Date(year, month - 1, day);
            const now = new Date();

            const matchesDate =
                !dateFilter ||
                (dateFilter === '30d' &&
                    now.getTime() - joinedDate.getTime() <= 30 * 86400000 &&
                    joinedDate <= now) ||
                (dateFilter === 'year' && year === now.getFullYear());

            return matchesSearch && matchesRole && matchesStatus && matchesDate;
        });
    }, [users, search, roleFilter, statusFilter, dateFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

    const currentUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize,
    );

    const bannedCount = users.filter((user) => user.status === 'banned').length;
    const unverifiedCount = users.filter(
        (user) => user.status === 'unverified',
    ).length;
    const creatorCount = users.filter(
        (user) => user.role === 'creator' && user.status === 'active',
    ).length;

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');
        setDateFilter('');
        setPage(1);
    };

    const openDrawer = (user: User) => {
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    const openModal = (type: ModalType, user?: User) => {
        setSelectedUser(user ?? null);
        setModal(type);

        if (type === 'role' && user) {
            setNewRole(user.role);
        }

        if (type === 'lock') {
            setLockReason('spam');
            setLockNote('');
        }
    };

    const closeModal = () => {
        setModal(null);
        setSelectedUser(null);
    };

    const confirmLock = () => {
        if (!selectedUser) return;

        setUsers((previous) =>
            previous.map((user) =>
                user.id === selectedUser.id
                    ? {
                        ...user,
                        status: 'banned',
                        warning: lockReason === 'spam'
                            ? 'Vi phạm quy chuẩn bình luận'
                            : lockReason === 'copyright'
                                ? 'Vi phạm bản quyền'
                                : lockReason === 'fraud'
                                    ? 'Vi phạm gian lận'
                                    : lockReason === 'security'
                                        ? 'Nghi vấn bảo mật'
                                        : lockNote || 'Vi phạm quy định',
                        warnings: user.warnings + 1,
                    }
                    : user,
            ),
        );

        closeModal();
        setDrawerOpen(false);
    };

    const unlockUser = (user: User) => {
        setUsers((previous) =>
            previous.map((item) =>
                item.id === user.id
                    ? { ...item, status: 'active', warning: undefined }
                    : item,
            ),
        );

        if (selectedUser?.id === user.id) {
            setSelectedUser({
                ...user,
                status: 'active',
                warning: undefined,
            });
        }
    };

    const saveRole = () => {
        if (!selectedUser) return;

        setUsers((previous) =>
            previous.map((user) =>
                user.id === selectedUser.id
                    ? { ...user, role: newRole }
                    : user,
            ),
        );

        closeModal();
    };

    const addAdministrator = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!newName.trim() || !newEmail.trim()) return;

        const newUser: User = {
            id: `USR-${Date.now()}`,
            name: newName.trim(),
            username: `@${newEmail.split('@')[0]}`,
            email: newEmail.trim(),
            role: 'admin',
            joinedAt: new Date().toLocaleDateString('vi-VN'),
            status: 'active',
            comics: 0,
            views: '0',
            warnings: 0,
        };

        setUsers((previous) => [newUser, ...previous]);
        setNewName('');
        setNewEmail('');
        setPage(1);
        closeModal();
    };

    const exportUsers = () => {
        const headers = [
            'ID',
            'Họ tên',
            'Tên người dùng',
            'Email',
            'Vai trò',
            'Ngày tham gia',
            'Trạng thái',
        ];

        const rows = filteredUsers.map((user) => [
            user.id,
            user.name,
            user.username,
            user.email,
            roleLabels[user.role],
            user.joinedAt,
            statusLabels[user.status],
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
            )
            .join('\n');

        const blob = new Blob(['\uFEFF' + csv], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'comichub-users.csv';
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="admin-users-page">
            <aside className="users-sidebar">
                <div className="users-brand">
                    <div className="users-brand-icon">C</div>
                    <div>
                        <strong>ComicHub Admin</strong>
                        <span>Hệ thống Quản trị</span>
                    </div>
                </div>

                <div className="users-sidebar-divider" />

                <nav className="users-nav">
                    <a href="/admin"><span>▦</span>Tổng quan</a>
                    <a href="/admin/comics"><span>▤</span>Quản lý truyện</a>
                    <a href="/admin/moderation"><span>✓</span>Kiểm duyệt nội dung</a>
                    <a href="/admin/genres"><span>◇</span>Quản lý thể loại</a>
                    <a className="active" href="/admin/users"><span>♧</span>Quản lý người dùng</a>
                    <a href="/admin/roles"><span>♙</span>Vai trò và phân quyền</a>
                    <a href="/admin/reports"><span>⚑</span>Quản lý báo cáo</a>
                    <a href="/admin/statistics"><span>▥</span>Thống kê</a>
                    <a href="/admin/activity-logs">
                        <span>◷</span>Nhật ký hoạt động
                    </a>
                    <a href="/admin/settings"><span>⚙</span>Cài đặt hệ thống</a>
                </nav>

                <div className="users-sidebar-bottom">
                    <span className="users-online-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="users-main">
                <header className="users-topbar">
                    <div className="users-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span>›</span>
                        <strong>Quản lý người dùng</strong>
                    </div>

                    <div className="users-topbar-right">
                        <div className="users-global-search">
                            <span>⌕</span>
                            <input placeholder="Tìm kiếm..." />
                        </div>

                        <button className="users-notification" type="button" aria-label="Thông báo">
                            ♧<i>3</i>
                        </button>

                        <div className="users-admin-profile">
                            <div className="users-admin-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="users-content">
                    <section className="users-kpi-grid">
                        <article className="users-kpi-card">
                            <div>
                                <span>TỔNG NGƯỜI DÙNG</span>
                                <strong>48,290</strong>
                                <small className="positive">↗ +8.4% tháng này</small>
                            </div>
                            <div className="users-kpi-icon blue">♧</div>
                        </article>

                        <article className="users-kpi-card">
                            <div>
                                <span>TÁC GIẢ HOẠT ĐỘNG</span>
                                <strong>{creatorCount.toLocaleString('vi-VN')}</strong>
                                <small className="positive">↗ Tác giả đang hoạt động</small>
                            </div>
                            <div className="users-kpi-icon purple">✎</div>
                        </article>

                        <article className="users-kpi-card">
                            <div>
                                <span>TÀI KHOẢN BỊ KHÓA</span>
                                <strong className="danger-text">{bannedCount}</strong>
                                <small className="negative">! Cần theo dõi</small>
                            </div>
                            <div className="users-kpi-icon red">⚒</div>
                        </article>

                        <article className="users-kpi-card">
                            <div>
                                <span>CHỜ XÁC MINH</span>
                                <strong>{unverifiedCount}</strong>
                                <small>◷ Chờ xử lý</small>
                            </div>
                            <div className="users-kpi-icon gray">◷</div>
                        </article>
                    </section>

                    <section className="users-page-heading">
                        <div>
                            <div className="users-eyebrow">
                                <span>Tài nguyên</span>
                                <small>• Bản quyền &amp; Vận hành</small>
                            </div>
                            <h1>Quản lý người dùng</h1>
                            <p>
                                Tra cứu, giám sát hoạt động và điều chỉnh trạng thái tài khoản
                                trên hệ thống ComicHub
                            </p>
                        </div>

                        <div className="users-heading-actions">
                            <button className="users-button secondary" onClick={exportUsers}>
                                ⇩ Xuất file người dùng
                            </button>
                            <button
                                className="users-button primary"
                                onClick={() => openModal('add')}
                            >
                                + Thêm quản trị viên
                            </button>
                        </div>
                    </section>

                    <section className="users-filter-panel">
                        <div className="users-filter-grid">
                            <label className="users-search-field">
                                <span>⌕</span>
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm theo tên, email, ID người dùng..."
                                />
                            </label>

                            <select
                                value={roleFilter}
                                onChange={(event) => {
                                    setRoleFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="guest">Khách</option>
                                <option value="user">Người dùng</option>
                                <option value="creator">Tác giả</option>
                                <option value="moderator">Kiểm duyệt viên</option>
                                <option value="admin">Quản trị viên</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="banned">Bị khóa</option>
                                <option value="unverified">Chưa xác minh</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(event) => {
                                    setDateFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Mọi thời điểm</option>
                                <option value="30d">30 ngày qua</option>
                                <option value="year">Năm nay</option>
                            </select>

                            <button className="users-reset-button" onClick={resetFilters}>
                                ↻ Đặt lại bộ lọc
                            </button>
                        </div>
                    </section>

                    <section className="users-table-panel">
                        <div className="users-table-scroll">
                            <table className="users-table">
                                <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th className="align-right">Ngày tham gia</th>
                                    <th>Trạng thái tài khoản</th>
                                    <th className="align-right">Thao tác</th>
                                </tr>
                                </thead>

                                <tbody>
                                {currentUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={user.status === 'banned' ? 'banned-row' : ''}
                                    >
                                        <td>
                                            <div className="users-identity">
                                                <div className="users-avatar">
                                                    {user.name
                                                        .split(' ')
                                                        .slice(-2)
                                                        .map((part) => part[0])
                                                        .join('')}
                                                </div>
                                                <div>
                                                    <button
                                                        className="users-name"
                                                        onClick={() => openDrawer(user)}
                                                    >
                                                        {user.name}
                                                    </button>
                                                    <span>{user.username}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="users-email">{user.email}</td>

                                        <td>
                        <span className={`users-role role-${user.role}`}>
                          {roleLabels[user.role]}
                        </span>
                                        </td>

                                        <td className="align-right users-date">{user.joinedAt}</td>

                                        <td>
                                            <div className="users-status-cell">
                          <span className={`users-status status-${user.status}`}>
                            <i />
                              {statusLabels[user.status]}
                          </span>
                                                {user.warning && (
                                                    <small className="users-warning">{user.warning}</small>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="users-row-actions">
                                                <button
                                                    title="Xem chi tiết"
                                                    onClick={() => openDrawer(user)}
                                                >
                                                    ◉
                                                </button>

                                                {user.status === 'banned' ? (
                                                    <button
                                                        className="unlock-action"
                                                        title="Mở khóa tài khoản"
                                                        onClick={() => unlockUser(user)}
                                                    >
                                                        ↗
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="lock-action"
                                                        title="Khóa tài khoản"
                                                        onClick={() => openModal('lock', user)}
                                                    >
                                                        ♙
                                                    </button>
                                                )}

                                                <button
                                                    title="Thay đổi vai trò"
                                                    onClick={() => openModal('role', user)}
                                                >
                                                    ⚙
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {currentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="users-empty">
                                            Không tìm thấy người dùng phù hợp.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="users-pagination">
              <span>
                Hiển thị{' '}
                  <strong>
                  {filteredUsers.length === 0
                      ? 0
                      : (page - 1) * pageSize + 1}
                      {' - '}
                      {Math.min(page * pageSize, filteredUsers.length)}
                </strong>{' '}
                  trên tổng số <strong>{filteredUsers.length}</strong> người dùng
              </span>

                            <div>
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                                >
                                    ‹
                                </button>

                                <span className="users-page-number">
                  {page} / {totalPages}
                </span>

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((value) => Math.min(totalPages, value + 1))
                                    }
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {drawerOpen && selectedUser && (
                <>
                    <button
                        className="users-drawer-backdrop"
                        aria-label="Đóng chi tiết"
                        onClick={() => setDrawerOpen(false)}
                    />

                    <aside className="users-drawer">
                        <div className="users-drawer-header">
                            <div className="users-drawer-heading">
                                <div className="users-avatar large">
                                    {selectedUser.name
                                        .split(' ')
                                        .slice(-2)
                                        .map((part) => part[0])
                                        .join('')}
                                </div>
                                <div>
                                    <strong>Chi tiết tài khoản</strong>
                                    <span>{roleLabels[selectedUser.role]}</span>
                                    <small>ID: #{selectedUser.id}</small>
                                </div>
                            </div>
                            <button onClick={() => setDrawerOpen(false)}>✕</button>
                        </div>

                        <div className="users-drawer-body">
                            <div className="users-mini-stats">
                                <div><strong>{selectedUser.comics}</strong><span>Truyện sáng tác</span></div>
                                <div><strong>{selectedUser.views}</strong><span>Lượt đọc</span></div>
                                <div><strong>{selectedUser.warnings}</strong><span>Lần cảnh cáo</span></div>
                            </div>

                            <section className="users-drawer-section">
                                <h3>Thông tin cá nhân</h3>
                                <div className="users-detail-box">
                                    <div><span>Họ và tên:</span><strong>{selectedUser.name}</strong></div>
                                    <div><span>Tên định danh:</span><strong>{selectedUser.username}</strong></div>
                                    <div><span>Email:</span><strong>{selectedUser.email}</strong></div>
                                    <div><span>Mã tài khoản:</span><strong>{selectedUser.id}</strong></div>
                                    <div><span>Ngày đăng ký:</span><strong>{selectedUser.joinedAt}</strong></div>
                                    <div><span>Trạng thái:</span><strong>{statusLabels[selectedUser.status]}</strong></div>
                                </div>
                            </section>

                            <section className="users-drawer-section">
                                <h3>Lịch sử hệ thống</h3>
                                <div className="users-activity-item">
                                    <span>↥</span>
                                    <div><strong>Hoạt động trên ComicHub</strong><small>Dữ liệu minh họa cho giao diện</small></div>
                                </div>
                                <div className="users-activity-item">
                                    <span>✓</span>
                                    <div><strong>Tham gia nền tảng</strong><small>{selectedUser.joinedAt}</small></div>
                                </div>
                            </section>
                        </div>

                        <div className="users-drawer-footer">
                            <button
                                className="users-button secondary"
                                onClick={() => openModal('role', selectedUser)}
                            >
                                ⚙ Thay đổi vai trò
                            </button>

                            {selectedUser.status === 'banned' ? (
                                <button
                                    className="users-button success"
                                    onClick={() => unlockUser(selectedUser)}
                                >
                                    Mở khóa tài khoản
                                </button>
                            ) : (
                                <button
                                    className="users-button danger"
                                    onClick={() => openModal('lock', selectedUser)}
                                >
                                    ♙ Khóa tài khoản
                                </button>
                            )}
                        </div>
                    </aside>
                </>
            )}

            {modal && (
                <div className="users-modal-backdrop" onMouseDown={closeModal}>
                    <section
                        className="users-modal"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="users-modal-header">
                            <div>
                                <h2>
                                    {modal === 'lock'
                                        ? 'Xác nhận khóa tài khoản?'
                                        : modal === 'role'
                                            ? 'Thay đổi vai trò'
                                            : 'Thêm quản trị viên'}
                                </h2>
                                <p>
                                    {modal === 'lock'
                                        ? `Bạn đang yêu cầu đình chỉ quyền truy cập của ${selectedUser?.name}.`
                                        : modal === 'role'
                                            ? `Chọn vai trò mới cho ${selectedUser?.name}.`
                                            : 'Nhập thông tin tài khoản quản trị viên mới.'}
                                </p>
                            </div>
                            <button onClick={closeModal}>✕</button>
                        </div>

                        {modal === 'lock' && (
                            <div className="users-modal-body">
                                <label>
                                    Lý do khóa tài khoản <b>*</b>
                                    <select
                                        value={lockReason}
                                        onChange={(event) => setLockReason(event.target.value)}
                                    >
                                        <option value="spam">Vi phạm quy chuẩn bình luận và phát ngôn</option>
                                        <option value="copyright">Vi phạm bản quyền truyện sáng tác</option>
                                        <option value="fraud">Gian lận doanh thu / lượt xem</option>
                                        <option value="security">Nghi vấn tài khoản bị xâm nhập</option>
                                        <option value="other">Lý do khác</option>
                                    </select>
                                </label>

                                <label>
                                    Ghi chú bổ sung
                                    <textarea
                                        rows={3}
                                        value={lockNote}
                                        onChange={(event) => setLockNote(event.target.value)}
                                        placeholder="Nhập ghi chú nội bộ..."
                                    />
                                </label>

                                <div className="users-modal-actions">
                                    <button className="users-button secondary" onClick={closeModal}>Hủy</button>
                                    <button className="users-button danger" onClick={confirmLock}>Khóa ngay</button>
                                </div>
                            </div>
                        )}

                        {modal === 'role' && (
                            <div className="users-modal-body">
                                <label>
                                    Vai trò tài khoản
                                    <select
                                        value={newRole}
                                        onChange={(event) => setNewRole(event.target.value as UserRole)}
                                    >
                                        <option value="guest">Khách</option>
                                        <option value="user">Người dùng</option>
                                        <option value="creator">Tác giả</option>
                                        <option value="moderator">Kiểm duyệt viên</option>
                                        <option value="admin">Quản trị viên</option>
                                    </select>
                                </label>

                                <div className="users-modal-actions">
                                    <button className="users-button secondary" onClick={closeModal}>Hủy</button>
                                    <button className="users-button primary" onClick={saveRole}>Lưu thay đổi</button>
                                </div>
                            </div>
                        )}

                        {modal === 'add' && (
                            <form className="users-modal-body" onSubmit={addAdministrator}>
                                <label>
                                    Họ và tên <b>*</b>
                                    <input
                                        required
                                        value={newName}
                                        onChange={(event) => setNewName(event.target.value)}
                                        placeholder="Nhập họ và tên"
                                    />
                                </label>

                                <label>
                                    Email <b>*</b>
                                    <input
                                        required
                                        type="email"
                                        value={newEmail}
                                        onChange={(event) => setNewEmail(event.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                </label>

                                <p className="users-form-note">
                                    Tài khoản được thêm vào danh sách demo với vai trò Quản trị viên.
                                </p>

                                <div className="users-modal-actions">
                                    <button type="button" className="users-button secondary" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="users-button primary">Thêm quản trị viên</button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminUsersPage;

