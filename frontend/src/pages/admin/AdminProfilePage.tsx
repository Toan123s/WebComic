
import { useMemo, useState } from 'react';
import './AdminProfilePage.css';

type SessionStatus = 'current' | 'success' | 'warning';

type LoginSession = {
    id: number;
    time: string;
    ip: string;
    device: string;
    location: string;
    status: SessionStatus;
};

const initialSessions: LoginSession[] = [
    {
        id: 1,
        time: '14:32:10 Hôm nay',
        ip: '127.0.0.1',
        device: 'Chrome • Windows 11',
        location: 'TP. Hồ Chí Minh, VN',
        status: 'current',
    },
    {
        id: 2,
        time: '09:15:22 29/05/2026',
        ip: '113.190.23.11',
        device: 'Safari • macOS',
        location: 'Hà Nội, VN',
        status: 'success',
    },
    {
        id: 3,
        time: '18:40:05 28/05/2026',
        ip: '14.161.22.84',
        device: 'Chrome Mobile • iOS',
        location: 'TP. Hồ Chí Minh, VN',
        status: 'success',
    },
    {
        id: 4,
        time: '08:10:14 27/05/2026',
        ip: '42.112.89.50',
        device: 'Firefox • Windows 11',
        location: 'Đà Nẵng, VN',
        status: 'warning',
    },
];

function AdminProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [name, setName] = useState('Hoạt');
    const [username, setUsername] = useState('admin_hoat');
    const [email, setEmail] = useState('admin@comichub.vn');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('Quản trị hệ thống ComicHub');
    const [note, setNote] = useState('Quản trị viên phụ trách vận hành hệ thống.');
    const [toast, setToast] = useState('');
    const [showLogout, setShowLogout] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sessionFilter, setSessionFilter] = useState<'all' | 'success'>('all');
    const [sessions, setSessions] = useState(initialSessions);

    const [page, setPage] = useState(1);

    const filteredSessions = useMemo(
        () => sessions.filter(session =>
            sessionFilter === 'all' || session.status === 'success'
        ),
        [sessions, sessionFilter]
    );

    const pageSize = 4;
    const pageCount = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
    const visibleSessions = filteredSessions.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const notify = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 3500);
    };

    const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        notify('Thông tin hồ sơ đã được cập nhật trong bản demo.');
    };

    const changePassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (newPassword.length < 8) {
            notify('Mật khẩu mới cần có ít nhất 8 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            notify('Mật khẩu xác nhận không khớp.');
            return;
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        notify('Kiểm tra hợp lệ. Chức năng cập nhật thật cần backend.');
    };

    const exportSessions = () => {
        const header = ['Thời gian', 'IP', 'Thiết bị', 'Vị trí', 'Trạng thái'];
        const rows = filteredSessions.map(session => [
            session.time,
            session.ip,
            session.device,
            session.location,
            session.status,
        ]);

        const csv = [header, ...rows]
            .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(','))
            .join('\r\n');

        const blob = new Blob(['\uFEFF' + csv], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comichub-login-sessions.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const revokeSession = (id: number) => {
        setSessions(current => current.filter(session => session.id !== id));
        notify('Đã xóa phiên khỏi danh sách demo.');
    };

    return (
        <div className="admin-profile-page">
            <aside className="profile-sidebar">
                <div className="profile-brand">
                    <div className="profile-brand-icon">C</div>
                    <div>
                        <strong>ComicHub Admin</strong>
                        <span>Hệ thống Quản trị</span>
                    </div>
                </div>

                <nav className="profile-nav">
                    <a href="/admin">▦ <span>Tổng quan</span></a>
                    <a href="/admin/comics">▤ <span>Quản lý truyện</span></a>
                    <a href="/admin/moderation">✓ <span>Kiểm duyệt nội dung</span></a>
                    <a href="/admin/genres">◇ <span>Quản lý thể loại</span></a>
                    <a href="/admin/users">♙ <span>Quản lý người dùng</span></a>
                    <a href="/admin/roles">♧ <span>Vai trò và phân quyền</span></a>
                    <a href="/admin/reports">⚑ <span>Quản lý báo cáo</span></a>
                    <a href="/admin/statistics">▥ <span>Thống kê</span></a>
                    <a href="/admin/activity-logs">◷ <span>Nhật ký hoạt động</span></a>
                    <a href="/admin/settings">⚙ <span>Cài đặt hệ thống</span></a>
                </nav>

                <div className="profile-sidebar-status">
                    <span className="profile-status-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="profile-main">
                <header className="profile-topbar">
                    <div className="profile-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span>›</span>
                        <strong>Hồ sơ quản trị viên</strong>
                    </div>

                    <div className="profile-top-actions">
                        <span className="profile-notification">♧ <b>3</b></span>
                        <div className="profile-top-user">
                            <div className="profile-avatar-small">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="profile-content">
                    <section className="profile-page-heading">
                        <div>
                            <div className="profile-eyebrow">
                                Trang quản trị <span>›</span> Tài khoản <span>›</span> Hồ sơ
                            </div>
                            <h1>Hồ sơ quản trị viên</h1>
                            <p>
                                Quản lý thông tin định danh, tùy chọn bảo mật
                                và lịch sử phiên hoạt động của tài khoản.
                            </p>
                        </div>
                        <span className="profile-2fa-badge">✓ Xác thực 2 lớp (2FA)</span>
                    </section>

                    {toast && (
                        <div className="profile-toast" role="status">
                            <span>✓</span>
                            {toast}
                            <button onClick={() => setToast('')} aria-label="Đóng">×</button>
                        </div>
                    )}

                    <div className="profile-grid">
                        <section className="profile-left-column">
                            <article className="profile-card">
                                <div className="profile-identity">
                                    <div className="profile-avatar-large">H</div>
                                    <div className="profile-identity-info">
                                        <span className="profile-role-badge">Quản trị viên</span>
                                        <h2>{name || 'Hoạt'}</h2>
                                        <p>@{username}</p>
                                        <span>{email}</span>
                                    </div>
                                </div>

                                <div className="profile-info-note">
                                    ⓘ Ảnh đại diện có thể được bổ sung khi kết nối chức năng tải ảnh.
                                </div>

                                <div className="profile-metadata">
                                    <div><span>Mã nhân viên</span><strong>ADM-00192</strong></div>
                                    <div><span>Ngày tạo tài khoản</span><strong>15/03/2022</strong></div>
                                    <div><span>Lần đăng nhập cuối</span><strong>Hôm nay</strong></div>
                                    <div><span>Phiên hiện tại</span><strong>Chrome • Windows</strong></div>
                                </div>

                                <button
                                    className="profile-secondary-button full"
                                    onClick={() => {
                                        setActiveTab('profile');
                                        document.getElementById('profile-edit-form')?.scrollIntoView({
                                            behavior: 'smooth',
                                        });
                                    }}
                                >
                                    ✎ Chỉnh sửa thông tin hồ sơ
                                </button>
                            </article>

                            <article className="profile-card">
                                <div className="profile-card-heading">
                                    <span className="profile-heading-icon">♙</span>
                                    <div>
                                        <h3>Bảo mật và phiên</h3>
                                        <p>Quản lý các phiên đăng nhập của tài khoản</p>
                                    </div>
                                </div>
                                <p className="profile-description">
                                    Bạn có thể xem các phiên đăng nhập và quản lý
                                    danh sách thiết bị trong bản demo.
                                </p>
                                <button
                                    className="profile-secondary-button full"
                                    onClick={() => setShowLogout(true)}
                                >
                                    ↪ Đăng xuất khỏi phiên này
                                </button>
                                <button
                                    className="profile-danger-button full"
                                    onClick={() => notify('Chức năng thu hồi phiên cần kết nối backend.')}
                                >
                                    ⏻ Đăng xuất mọi thiết bị khác
                                </button>
                                <div className="profile-security-note">
                                    ◈ Không nhập hoặc lưu mật khẩu thật trong bản demo frontend.
                                </div>
                            </article>
                        </section>

                        <section className="profile-right-column">
                            <div className="profile-tabs">
                                <button
                                    className={activeTab === 'profile' ? 'active' : ''}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    ♙ Chỉnh sửa hồ sơ
                                </button>
                                <button
                                    className={activeTab === 'security' ? 'active' : ''}
                                    onClick={() => setActiveTab('security')}
                                >
                                    ◈ Đổi mật khẩu &amp; 2FA
                                </button>
                            </div>

                            {activeTab === 'profile' ? (
                                <article className="profile-card" id="profile-edit-form">
                                    <h2>Chỉnh sửa thông tin cá nhân</h2>
                                    <p className="profile-form-description">
                                        Cập nhật thông tin hiển thị của quản trị viên.
                                    </p>

                                    <form onSubmit={saveProfile} className="profile-form">
                                        <div className="profile-form-grid">
                                            <label>
                                                Họ và tên *
                                                <input
                                                    required
                                                    value={name}
                                                    onChange={event => setName(event.target.value)}
                                                />
                                            </label>
                                            <label>
                                                Tên đăng nhập *
                                                <input
                                                    required
                                                    value={username}
                                                    onChange={event => setUsername(event.target.value)}
                                                />
                                            </label>
                                            <label>
                                                Email quản trị *
                                                <input
                                                    required
                                                    type="email"
                                                    value={email}
                                                    onChange={event => setEmail(event.target.value)}
                                                />
                                            </label>
                                            <label>
                                                Số điện thoại
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={event => setPhone(event.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </label>
                                        </div>

                                        <label>
                                            Chức danh / Bộ phận
                                            <input
                                                value={department}
                                                onChange={event => setDepartment(event.target.value)}
                                            />
                                        </label>

                                        <label>
                                            Ghi chú
                                            <textarea
                                                rows={4}
                                                value={note}
                                                onChange={event => setNote(event.target.value)}
                                            />
                                        </label>

                                        <div className="profile-form-actions">
                                            <button type="reset" className="profile-secondary-button">
                                                Đặt lại
                                            </button>
                                            <button type="submit" className="profile-primary-button">
                                                ✓ Lưu thay đổi
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            ) : (
                                <article className="profile-card">
                                    <h2>Thay đổi mật khẩu</h2>
                                    <p className="profile-form-description">
                                        Đây là biểu mẫu minh họa. Chưa có API cập nhật mật khẩu.
                                    </p>

                                    <form onSubmit={changePassword} className="profile-form">
                                        <label>
                                            Mật khẩu hiện tại
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={event => setCurrentPassword(event.target.value)}
                                                required
                                            />
                                        </label>
                                        <label>
                                            Mật khẩu mới
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={event => setNewPassword(event.target.value)}
                                                minLength={8}
                                                required
                                            />
                                        </label>
                                        <label>
                                            Xác nhận mật khẩu mới
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={event => setConfirmPassword(event.target.value)}
                                                required
                                            />
                                        </label>
                                        <label className="profile-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={showPasswords}
                                                onChange={event => setShowPasswords(event.target.checked)}
                                            />
                                            Hiện nội dung mật khẩu
                                        </label>
                                        <div className="profile-security-note">
                                            Mật khẩu nên có tối thiểu 8 ký tự. Không sử dụng mật khẩu
                                            thật trong môi trường demo.
                                        </div>
                                        <div className="profile-form-actions">
                                            <button type="submit" className="profile-primary-button">
                                                Cập nhật mật khẩu
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            )}
                        </section>
                    </div>

                    <section className="profile-card profile-sessions">
                        <div className="profile-session-heading">
                            <div>
                                <h2>Lịch sử đăng nhập &amp; Phiên thiết bị</h2>
                                <p>Theo dõi các phiên đăng nhập gần đây.</p>
                            </div>
                            <div className="profile-session-actions">
                                <select
                                    value={sessionFilter}
                                    onChange={event => {
                                        setSessionFilter(event.target.value as 'all' | 'success');
                                        setPage(1);
                                    }}
                                >
                                    <option value="all">Tất cả phiên</option>
                                    <option value="success">Chỉ phiên thành công</option>
                                </select>
                                <button className="profile-secondary-button" onClick={exportSessions}>
                                    ↓ Xuất CSV
                                </button>
                            </div>
                        </div>

                        <div className="profile-table-wrap">
                            <table className="profile-session-table">
                                <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Địa chỉ IP</th>
                                    <th>Thiết bị</th>
                                    <th>Vị trí</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleSessions.map(session => (
                                    <tr key={session.id}>
                                        <td>{session.time}</td>
                                        <td>{session.ip}</td>
                                        <td>{session.device}</td>
                                        <td>{session.location}</td>
                                        <td>
                                                <span className={`profile-session-status ${session.status}`}>
                                                    {session.status === 'current'
                                                        ? 'Phiên hiện tại'
                                                        : session.status === 'success'
                                                            ? 'Thành công'
                                                            : 'Cảnh báo IP mới'}
                                                </span>
                                        </td>
                                        <td>
                                            {session.status === 'current' ? (
                                                <span className="profile-current-device">Thiết bị này</span>
                                            ) : (
                                                <button
                                                    className="profile-revoke-button"
                                                    onClick={() => revokeSession(session.id)}
                                                >
                                                    Thu hồi
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {visibleSessions.length === 0 && (
                            <p className="profile-empty">Không có phiên đăng nhập phù hợp.</p>
                        )}

                        <div className="profile-pagination">
                            <span>Hiển thị {visibleSessions.length} / {filteredSessions.length} phiên</span>
                            <div>
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(value => value - 1)}
                                >
                                    Trước
                                </button>
                                <span>Trang {page} / {pageCount}</span>
                                <button
                                    disabled={page >= pageCount}
                                    onClick={() => setPage(value => value + 1)}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {showLogout && (
                <div className="profile-modal-overlay" onClick={() => setShowLogout(false)}>
                    <div
                        className="profile-logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-logout-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="profile-modal-icon">↪</div>
                        <h2 id="profile-logout-title">Xác nhận đăng xuất?</h2>
                        <p>
                            Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại?
                            Đây chỉ là hộp thoại demo, chưa thực hiện đăng xuất thật.
                        </p>
                        <div className="profile-modal-actions">
                            <button
                                className="profile-secondary-button"
                                onClick={() => setShowLogout(false)}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="profile-danger-button"
                                onClick={() => {
                                    setShowLogout(false);
                                    notify('Đây là bản demo, chưa kết nối chức năng đăng xuất.');
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProfilePage;
