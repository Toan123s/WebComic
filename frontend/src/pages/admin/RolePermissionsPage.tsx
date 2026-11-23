
import { useEffect, useState } from 'react';
import './RolePermissionsPage.css';

type RoleId = 'guest' | 'user' | 'author' | 'moderator' | 'admin';

type Role = {
    id: RoleId;
    name: string;
    description: string;
    icon: string;
    color: string;
    members: number;
};

type Permission = {
    id: string;
    name: string;
    description: string;
};

const roles: Role[] = [
    {
        id: 'guest',
        name: 'Khách',
        description: 'Người chưa đăng nhập',
        icon: '👤',
        color: 'gray',
        members: 1250,
    },
    {
        id: 'user',
        name: 'Người dùng',
        description: 'Thành viên thông thường',
        icon: '📖',
        color: 'blue',
        members: 8450,
    },
    {
        id: 'author',
        name: 'Tác giả',
        description: 'Người sáng tạo nội dung',
        icon: '✍️',
        color: 'purple',
        members: 328,
    },
    {
        id: 'moderator',
        name: 'Kiểm duyệt viên',
        description: 'Quản lý và kiểm duyệt nội dung',
        icon: '🛡️',
        color: 'orange',
        members: 12,
    },
    {
        id: 'admin',
        name: 'Quản trị viên',
        description: 'Quản lý toàn bộ hệ thống',
        icon: '⚙️',
        color: 'red',
        members: 3,
    },
];

const permissions: Permission[] = [
    { id: 'read', name: 'Đọc truyện', description: 'Xem nội dung truyện công khai' },
    { id: 'comment', name: 'Bình luận và đánh giá', description: 'Đăng bình luận và đánh giá truyện' },
    { id: 'follow', name: 'Theo dõi truyện', description: 'Thêm truyện vào danh sách theo dõi' },
    { id: 'publish', name: 'Đăng truyện và chương', description: 'Tạo và đăng nội dung mới' },
    { id: 'own', name: 'Quản lý truyện của bản thân', description: 'Chỉnh sửa truyện do mình đăng' },
    { id: 'moderate', name: 'Kiểm duyệt truyện và chương', description: 'Phê duyệt hoặc từ chối nội dung' },
    { id: 'reports', name: 'Xử lý báo cáo', description: 'Tiếp nhận và xử lý báo cáo vi phạm' },
    { id: 'users', name: 'Quản lý người dùng', description: 'Quản lý tài khoản thành viên' },
    { id: 'categories', name: 'Quản lý thể loại', description: 'Thêm, sửa và xóa thể loại' },
    { id: 'system', name: 'Quản lý hệ thống', description: 'Truy cập các thiết lập hệ thống' },
];

type PermissionState = Record<RoleId, boolean[]>;

const defaultPermissions: PermissionState = {
    guest: [true, false, false, false, false, false, false, false, false, false],
    user: [true, true, true, false, false, false, false, false, false, false],
    author: [true, true, true, true, true, false, false, false, false, false],
    moderator: [true, true, true, false, false, true, true, false, false, false],
    admin: [true, true, true, true, true, true, true, true, true, true],
};

const STORAGE_KEY = 'comichub-role-permissions';

function loadPermissions(): PermissionState {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            return JSON.parse(saved) as PermissionState;
        }
    } catch {
        // Nếu dữ liệu lưu không hợp lệ, sử dụng cấu hình mặc định.
    }

    return defaultPermissions;
}

export default function RolePermissionsPage() {
    const [selectedRole, setSelectedRole] = useState<RoleId>('user');
    const [permissionState, setPermissionState] =
        useState<PermissionState>(loadPermissions);
    const [search, setSearch] = useState('');
    const [savedMessage, setSavedMessage] = useState('');

    const currentRole = roles.find((role) => role.id === selectedRole)!;

    useEffect(() => {
        if (!savedMessage) return;

        const timeout = window.setTimeout(() => {
            setSavedMessage('');
        }, 2500);

        return () => window.clearTimeout(timeout);
    }, [savedMessage]);

    const togglePermission = (roleId: RoleId, index: number) => {
        setPermissionState((previous) => ({
            ...previous,
            [roleId]: previous[roleId].map((value, currentIndex) =>
                currentIndex === index ? !value : value,
            ),
        }));
    };

    const savePermissions = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(permissionState));
        setSavedMessage('Đã lưu cấu hình quyền hạn trên trình duyệt!');
    };

    const resetRole = () => {
        if (!window.confirm(`Bạn có muốn khôi phục quyền mặc định cho vai trò ${currentRole.name}?`)) {
            return;
        }

        setPermissionState((previous) => ({
            ...previous,
            [selectedRole]: [...defaultPermissions[selectedRole]],
        }));

        setSavedMessage('Đã khôi phục quyền mặc định cho vai trò này.');
    };

    const resetAll = () => {
        if (!window.confirm('Bạn có chắc muốn khôi phục toàn bộ quyền mặc định?')) {
            return;
        }

        setPermissionState(
            Object.fromEntries(
                Object.entries(defaultPermissions).map(([key, value]) => [
                    key,
                    [...value],
                ]),
            ) as PermissionState,
        );

        setSavedMessage('Đã khôi phục toàn bộ cấu hình mặc định.');
    };

    const filteredPermissions = permissions
        .map((permission, index) => ({ ...permission, index }))
        .filter((permission) =>
            permission.name.toLowerCase().includes(search.toLowerCase()),
        );

    const totalEnabled = permissionState[selectedRole].filter(Boolean).length;

    return (
        <div className="role-admin">
            <aside className="role-sidebar">
                <div className="role-brand">
                    <div className="role-brand-icon">C</div>
                    <div>
                        <strong>ComicHub</strong>
                        <span>ADMIN CONSOLE</span>
                    </div>
                </div>

                <div className="role-sidebar-label">MENU CHÍNH</div>

                <nav className="role-nav">
                    <a href="/" className="role-nav-item">
                        <span>▦</span> Tổng quan
                    </a>
                    <a href="/admin/comics" className="role-nav-item">
                        <span>📚</span> Quản lý truyện
                    </a>
                    <a href="/admin/moderation" className="role-nav-item">
                        <span>✓</span> Kiểm duyệt nội dung
                    </a>
                    <a href="/admin/categories" className="role-nav-item">
                        <span>▤</span> Quản lý thể loại
                    </a>
                    <a href="/admin/users" className="role-nav-item">
                        <span>♙</span> Quản lý người dùng
                    </a>
                    <a href="/admin/roles" className="role-nav-item active">
                        <span>⚿</span> Vai trò và phân quyền
                    </a>
                    <a href="/admin/reports" className="role-nav-item">
                        <span>⚑</span> Quản lý báo cáo
                    </a>
                    <a href="/admin/statistics" className="role-nav-item">
                        <span>▥</span> Thống kê
                    </a>
                    <a href="/admin/logs" className="role-nav-item">
                        <span>☷</span> Nhật ký hoạt động
                    </a>
                    <a href="/admin/settings" className="role-nav-item">
                        <span>⚙</span> Cài đặt hệ thống
                    </a>
                </nav>

                <div className="role-sidebar-bottom">
                    <div className="role-admin-avatar">A</div>
                    <div>
                        <strong>Administrator</strong>
                        <span>Quản trị viên hệ thống</span>
                    </div>
                    <span className="role-online-dot" />
                </div>
            </aside>

            <main className="role-main">
                <header className="role-topbar">
                    <div className="role-breadcrumb">
                        Admin <span>/</span> Hệ thống <span>/</span>
                        <strong>Vai trò và phân quyền</strong>
                    </div>

                    <div className="role-top-actions">
                        <input
                            className="role-top-search"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <button className="role-notification" aria-label="Thông báo">
                            ♧<i />
                        </button>
                        <div className="role-top-avatar">A</div>
                    </div>
                </header>

                <div className="role-content">
                    <div className="role-heading">
                        <div>
                            <div className="role-eyebrow">QUẢN TRỊ HỆ THỐNG</div>
                            <h1>Vai trò và phân quyền</h1>
                            <p>Quản lý quyền truy cập và phạm vi hoạt động của từng nhóm người dùng.</p>
                        </div>

                        <button className="role-reset-all" onClick={resetAll}>
                            ↺ Khôi phục mặc định
                        </button>
                    </div>

                    <div className="role-security-notice">
                        <span className="role-notice-icon">🛡️</span>
                        <div>
                            <strong>Kiểm soát quyền truy cập hệ thống</strong>
                            <p>
                                Thay đổi quyền hạn có thể ảnh hưởng đến hoạt động của người dùng.
                                Hãy kiểm tra kỹ trước khi lưu cấu hình.
                            </p>
                        </div>
                    </div>

                    <section className="role-section">
                        <div className="role-section-heading">
                            <div>
                                <h2>Các vai trò trong hệ thống</h2>
                                <p>Chọn một vai trò để xem và chỉnh sửa quyền hạn.</p>
                            </div>
                            <span className="role-count">05 VAI TRÒ</span>
                        </div>

                        <div className="role-cards">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedRole(role.id)}
                                >
                                    <div className={`role-card-icon ${role.color}`}>
                                        {role.icon}
                                    </div>
                                    <div className="role-card-name">{role.name}</div>
                                    <div className="role-card-description">{role.description}</div>
                                    <div className="role-card-footer">
                                        <strong>{role.members.toLocaleString('vi-VN')}</strong>
                                        <span>thành viên</span>
                                    </div>
                                    {selectedRole === role.id && (
                                        <span className="role-selected-mark">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="role-workspace">
                        <section className="role-panel role-permission-panel">
                            <div className="role-panel-heading">
                                <div>
                                    <h2>Ma trận phân quyền</h2>
                                    <p>Bật hoặc tắt quyền truy cập cho từng vai trò.</p>
                                </div>
                                <span className="role-permission-count">
                  {totalEnabled}/{permissions.length} quyền
                </span>
                            </div>

                            <div className="role-table-wrap">
                                <table className="role-table">
                                    <thead>
                                    <tr>
                                        <th>QUYỀN HẠN</th>
                                        {roles.map((role) => (
                                            <th key={role.id}>
                                                <button
                                                    className={selectedRole === role.id ? 'current' : ''}
                                                    onClick={() => setSelectedRole(role.id)}
                                                >
                                                    {role.name}
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredPermissions.map((permission) => (
                                        <tr key={permission.id}>
                                            <td>
                                                <strong>{permission.name}</strong>
                                                <span>{permission.description}</span>
                                            </td>

                                            {roles.map((role) => (
                                                <td key={role.id}>
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={permissionState[role.id][permission.index]}
                                                        aria-label={`${permission.name} - ${role.name}`}
                                                        className={`role-switch ${
                                                            permissionState[role.id][permission.index]
                                                                ? 'on'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            togglePermission(role.id, permission.index)
                                                        }
                                                    >
                                                        <span />
                                                    </button>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {filteredPermissions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="role-empty">
                                                Không tìm thấy quyền hạn phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="role-table-footer">
                <span>
                  Đang chọn: <strong>{currentRole.name}</strong>
                </span>
                                <span>
                  Có thể bật/tắt quyền trực tiếp trong bảng.
                </span>
                            </div>
                        </section>

                        <aside className="role-side-panel">
                            <section className="role-panel role-detail-panel">
                                <div className="role-detail-heading">
                                    <div className={`role-detail-icon ${currentRole.color}`}>
                                        {currentRole.icon}
                                    </div>
                                    <div>
                                        <span>VAI TRÒ ĐANG CHỌN</span>
                                        <h2>{currentRole.name}</h2>
                                    </div>
                                </div>

                                <p className="role-detail-description">
                                    {currentRole.description}
                                </p>

                                <div className="role-detail-stats">
                                    <div>
                                        <span>Số thành viên</span>
                                        <strong>{currentRole.members.toLocaleString('vi-VN')}</strong>
                                    </div>
                                    <div>
                                        <span>Quyền được cấp</span>
                                        <strong>{totalEnabled}/{permissions.length}</strong>
                                    </div>
                                </div>

                                <div className="role-progress-label">
                                    <span>Mức độ phân quyền</span>
                                    <strong>{Math.round((totalEnabled / permissions.length) * 100)}%</strong>
                                </div>

                                <div className="role-progress">
                  <span
                      style={{
                          width: `${(totalEnabled / permissions.length) * 100}%`,
                      }}
                  />
                                </div>

                                <h3>Quyền đang được cấp</h3>
                                <div className="role-scope-list">
                                    {permissions.map((permission, index) =>
                                            permissionState[selectedRole][index] ? (
                                                <span key={permission.id}>
                        <i>✓</i> {permission.name}
                      </span>
                                            ) : null,
                                    )}

                                    {totalEnabled === 0 && (
                                        <span>Chưa có quyền nào được cấp.</span>
                                    )}
                                </div>

                                <div className="role-detail-actions">
                                    <button className="role-reset-button" onClick={resetRole}>
                                        Khôi phục vai trò
                                    </button>
                                    <button className="role-save-button" onClick={savePermissions}>
                                        Lưu cấu hình quyền hạn
                                    </button>
                                </div>

                                {savedMessage && (
                                    <div className="role-feedback" role="status">
                                        ✓ {savedMessage}
                                    </div>
                                )}
                            </section>

                            <section className="role-panel role-activity-panel">
                                <div className="role-panel-heading">
                                    <div>
                                        <h2>Hoạt động tuần này</h2>
                                        <p>Minh họa số lượt hoạt động theo ngày.</p>
                                    </div>
                                </div>

                                <div className="role-chart">
                                    {[35, 58, 42, 78, 55, 92, 68].map((height, index) => (
                                        <div className="role-chart-column" key={index}>
                                            <div className="role-chart-bar">
                                                <span style={{ height: `${height}%` }} />
                                            </div>
                                            <small>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</small>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="role-panel role-audit-panel">
                                <h2>Nhật ký hoạt động</h2>
                                <div className="role-audit-item">
                                    <span className="role-audit-dot blue" />
                                    <div>
                                        <strong>Cập nhật quyền người dùng</strong>
                                        <small>Hệ thống ghi nhận thay đổi cấu hình</small>
                                        <time>Hôm nay</time>
                                    </div>
                                </div>
                                <div className="role-audit-item">
                                    <span className="role-audit-dot purple" />
                                    <div>
                                        <strong>Vai trò tác giả được cập nhật</strong>
                                        <small>Điều chỉnh quyền quản lý nội dung</small>
                                        <time>Hôm qua</time>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <footer className="role-footer">
                        ComicHub Admin Console <span>•</span> Quản lý vai trò và quyền truy cập
                    </footer>
                </div>
            </main>
        </div>
    );
}
