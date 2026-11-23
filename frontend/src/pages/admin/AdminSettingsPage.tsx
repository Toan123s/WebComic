import { useState } from 'react';
import './AdminSettingsPage.css';

type Settings = {
    platformName: string;
    description: string;
    email: string;
    hotline: string;
    autoModeration: boolean;
    freeCreatorRegistration: boolean;
    chapterLimit: string;
    language: string;
    announcement: string;
    showBanner: boolean;
    maintenanceMode: boolean;
};

const defaultSettings: Settings = {
    platformName: 'ComicHub - Nền tảng truyện tranh trực tuyến',
    description:
        'Cổng đọc và xuất bản truyện tranh trực tuyến hàng đầu dành cho cộng đồng tác giả và độc giả Việt Nam.',
    email: 'support@comichub.vn',
    hotline: '1900 6868',
    autoModeration: true,
    freeCreatorRegistration: true,
    chapterLimit: '50',
    language: 'vi',
    announcement: 'Chào mừng bạn đến với phiên bản thử nghiệm ComicHub v2.4.0!',
    showBanner: true,
    maintenanceMode: false,
};

type SettingsTab = 'platform' | 'display' | 'admin' | 'general';

function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [savedSettings, setSavedSettings] =
        useState<Settings>(defaultSettings);
    const [activeTab, setActiveTab] = useState<SettingsTab>('platform');
    const [toast, setToast] = useState('');
    const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);

    const updateSetting = <K extends keyof Settings>(
        key: K,
        value: Settings[K],
    ) => {
        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 3500);
    };

    const handleSave = () => {
        if (settings.maintenanceMode && !savedSettings.maintenanceMode) {
            setMaintenanceConfirm(true);
            return;
        }

        setSavedSettings({ ...settings });
        showToast('Đã lưu thay đổi cài đặt thành công!');
    };

    const confirmMaintenance = () => {
        setSavedSettings({ ...settings });
        setMaintenanceConfirm(false);
        showToast('Đã cập nhật cấu hình bảo trì hệ thống.');
    };

    const handleCancel = () => {
        setSettings({ ...savedSettings });
        showToast('Đã hủy các thay đổi chưa lưu.');
    };

    const handleReset = () => {
        setSettings({ ...defaultSettings });
        showToast('Đã khôi phục cấu hình mặc định.');
    };

    return (
        <div className="admin-settings-page">
            <aside className="settings-sidebar">
                <div className="settings-brand">
                    <div className="settings-brand-icon">C</div>
                    <div>
                        <strong>ComicHub Admin</strong>
                        <span>Hệ thống Quản trị</span>
                    </div>
                </div>

                <div className="settings-sidebar-divider" />

                <nav className="settings-nav">
                    <a href="/admin">
                        <span>▦</span>Tổng quan
                    </a>
                    <a href="/admin/comics">
                        <span>▤</span>Quản lý truyện
                    </a>
                    <a href="/admin/moderation">
                        <span>✓</span>Kiểm duyệt nội dung
                    </a>
                    <a href="/admin/genres">
                        <span>◇</span>Quản lý thể loại
                    </a>
                    <a href="/admin/users">
                        <span>♧</span>Quản lý người dùng
                    </a>
                    <a href="/admin/roles">
                        <span>♙</span>Vai trò và phân quyền
                    </a>
                    <a href="/admin/reports">
                        <span>⚑</span>Quản lý báo cáo
                    </a>
                    <a href="/admin/statistics"><span>▥</span>Thống kê</a>
                    <a href="/admin/activity-logs">
                        <span>◷</span>Nhật ký hoạt động
                    </a>
                    <a className="active" href="/admin/settings">
                        <span>⚙</span>Cài đặt hệ thống
                    </a>
                </nav>

                <div className="settings-sidebar-bottom">
                    <span className="settings-online-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="settings-main">
                <header className="settings-topbar">
                    <div className="settings-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span>›</span>
                        <strong>Cài đặt hệ thống</strong>
                    </div>

                    <div className="settings-topbar-right">
                        <div className="settings-search">
                            <span>⌕</span>
                            <input placeholder="Tìm kiếm..." />
                        </div>
                        <button
                            className="settings-notification"
                            type="button"
                            aria-label="Thông báo"
                        >
                            ♧<i>3</i>
                        </button>
                        <div className="settings-admin-profile">
                            <div className="settings-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="settings-content">
                    <div className="settings-page-heading">
                        <div>
                            <div className="settings-eyebrow">
                                <span>⚙</span> TRUNG TÂM ĐIỀU HÀNH
                            </div>
                            <h1>Cài đặt hệ thống</h1>
                            <p>
                                Thiết lập cấu hình nền tảng, giao diện hiển thị
                                và các tùy chọn quản trị cơ bản trên ComicHub.
                            </p>
                        </div>

                        <div className="settings-server-status">
                            <span className="settings-online-dot" />
                            <div>
                                <strong>Cụm máy chủ: Production AP-East</strong>
                                <span>Đồng bộ lúc: 14:32:05 (UTC+7)</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-tabs">
                        <button
                            className={activeTab === 'platform' ? 'active' : ''}
                            onClick={() => setActiveTab('platform')}
                            type="button"
                        >
                            <span>▣</span>Thông tin nền tảng
                        </button>
                        <button
                            className={activeTab === 'display' ? 'active' : ''}
                            onClick={() => setActiveTab('display')}
                            type="button"
                        >
                            <span>◐</span>Cấu hình hiển thị
                        </button>
                        <button
                            className={activeTab === 'admin' ? 'active' : ''}
                            onClick={() => setActiveTab('admin')}
                            type="button"
                        >
                            <span>♙</span>Cài đặt quản trị
                        </button>
                        <button
                            className={activeTab === 'general' ? 'active' : ''}
                            onClick={() => setActiveTab('general')}
                            type="button"
                        >
                            <span>⚙</span>Tùy chọn chung
                        </button>
                    </div>

                    <div className="settings-grid">
                        <div className="settings-left-column">
                            {activeTab === 'platform' && (
                                <>
                                    <section className="settings-card">
                                        <div className="settings-card-heading">
                                            <div className="settings-card-icon blue">
                                                ▣
                                            </div>
                                            <div>
                                                <h2>Thông tin nền tảng ComicHub</h2>
                                                <p>
                                                    Định danh thương hiệu, thông
                                                    tin pháp lý và kênh liên hệ
                                                    kỹ thuật.
                                                </p>
                                            </div>
                                            <span className="settings-public-badge">
                                                Công khai
                                            </span>
                                        </div>

                                        <div className="settings-logo-upload">
                                            <div className="settings-logo-preview">
                                                C
                                            </div>
                                            <div className="settings-logo-info">
                                                <strong>
                                                    Biểu trưng &amp; Nhận diện
                                                </strong>
                                                <span>
                                                    Định dạng PNG, SVG tối đa
                                                    2MB. Tỷ lệ tối ưu 1:1 hoặc
                                                    4:1 cho thanh tiêu đề.
                                                </span>
                                            </div>
                                            <label className="settings-upload-button">
                                                ↑ Tải lên logo mới
                                                <input
                                                    type="file"
                                                    accept="image/png,image/svg+xml"
                                                    onChange={() =>
                                                        showToast(
                                                            'Chức năng tải logo cần được kết nối backend.',
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        <div className="settings-form-grid">
                                            <label className="settings-field full">
                                                <span>Tên nền tảng</span>
                                                <input
                                                    value={settings.platformName}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'platformName',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="settings-field full">
                                                <span>
                                                    Mô tả ngắn (SEO &amp; Giới
                                                    thiệu)
                                                </span>
                                                <textarea
                                                    rows={3}
                                                    value={settings.description}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'description',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="settings-field">
                                                <span>Email liên hệ hệ thống</span>
                                                <input
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'email',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="settings-field">
                                                <span>
                                                    Hotline hỗ trợ kỹ thuật
                                                </span>
                                                <input
                                                    value={settings.hotline}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'hotline',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>
                                    </section>

                                    <section className="settings-card">
                                        <div className="settings-card-heading">
                                            <div className="settings-card-icon green">
                                                ◈
                                            </div>
                                            <div>
                                                <h2>
                                                    Cấu hình xuất bản &amp; Kiểm
                                                    duyệt
                                                </h2>
                                                <p>
                                                    Quy trình tiền kiểm tra, phê
                                                    duyệt truyện và thông số tài
                                                    nguyên tập tin.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="settings-toggle-list">
                                            <ToggleSetting
                                                title="Chế độ kiểm duyệt tự động bằng AI"
                                                description="Tự động phân tích hình ảnh và bình luận bằng AI trước khi chuyển đến Kiểm duyệt viên."
                                                badge="Vision v3.2"
                                                checked={settings.autoModeration}
                                                onChange={(value) =>
                                                    updateSetting(
                                                        'autoModeration',
                                                        value,
                                                    )
                                                }
                                            />
                                            <ToggleSetting
                                                title="Cho phép đăng ký tác giả tự do"
                                                description="Người dùng có thể trực tiếp nâng cấp tài khoản sang Creator mà không cần đơn xét duyệt tiền kỳ."
                                                checked={
                                                    settings.freeCreatorRegistration
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        'freeCreatorRegistration',
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="settings-form-grid settings-select-grid">
                                            <label className="settings-field">
                                                <span>
                                                    Giới hạn dung lượng mỗi chương
                                                    truyện
                                                </span>
                                                <select
                                                    value={settings.chapterLimit}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'chapterLimit',
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="25">
                                                        25 MB / chương
                                                    </option>
                                                    <option value="50">
                                                        50 MB / chương (Khuyên
                                                        dùng)
                                                    </option>
                                                    <option value="100">
                                                        100 MB / chương
                                                    </option>
                                                    <option value="200">
                                                        200 MB / chương (Ultra HD)
                                                    </option>
                                                </select>
                                            </label>

                                            <label className="settings-field">
                                                <span>
                                                    Ngôn ngữ mặc định hệ thống
                                                </span>
                                                <select
                                                    value={settings.language}
                                                    onChange={(event) =>
                                                        updateSetting(
                                                            'language',
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="vi">
                                                        Tiếng Việt (vi-VN)
                                                    </option>
                                                    <option value="en">
                                                        English (US)
                                                    </option>
                                                    <option value="ja">
                                                        日本語 (ja-JP)
                                                    </option>
                                                </select>
                                            </label>
                                        </div>
                                    </section>
                                </>
                            )}

                            {activeTab === 'display' && (
                                <section className="settings-card">
                                    <div className="settings-card-heading">
                                        <div className="settings-card-icon blue">
                                            ◐
                                        </div>
                                        <div>
                                            <h2>Cấu hình hiển thị</h2>
                                            <p>
                                                Quản lý thông báo và nội dung
                                                hiển thị trên nền tảng.
                                            </p>
                                        </div>
                                    </div>

                                    <label className="settings-field full">
                                        <span>Thông báo toàn hệ thống</span>
                                        <textarea
                                            rows={4}
                                            value={settings.announcement}
                                            onChange={(event) =>
                                                updateSetting(
                                                    'announcement',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>

                                    <ToggleSetting
                                        title="Hiển thị banner thông báo"
                                        description="Ghim thông báo trên header của trang người dùng."
                                        checked={settings.showBanner}
                                        onChange={(value) =>
                                            updateSetting('showBanner', value)
                                        }
                                    />
                                </section>
                            )}

                            {activeTab === 'admin' && (
                                <section className="settings-card">
                                    <div className="settings-card-heading">
                                        <div className="settings-card-icon blue">
                                            ♙
                                        </div>
                                        <div>
                                            <h2>Cài đặt quản trị</h2>
                                            <p>
                                                Các tùy chọn bảo mật và vận hành
                                                dành cho quản trị viên.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="settings-info-panel">
                                        <strong>Tài khoản quản trị hiện tại</strong>
                                        <span>Hoạt · Quản trị viên</span>
                                        <span>
                                            Các thay đổi quan trọng cần được
                                            xác nhận trước khi áp dụng.
                                        </span>
                                    </div>

                                    <ToggleSetting
                                        title="Chế độ bảo trì hệ thống"
                                        description="Khi bật, người dùng thông thường sẽ không thể truy cập nền tảng."
                                        checked={settings.maintenanceMode}
                                        onChange={(value) =>
                                            updateSetting(
                                                'maintenanceMode',
                                                value,
                                            )
                                        }
                                        danger
                                    />
                                </section>
                            )}

                            {activeTab === 'general' && (
                                <section className="settings-card">
                                    <div className="settings-card-heading">
                                        <div className="settings-card-icon green">
                                            ⚙
                                        </div>
                                        <div>
                                            <h2>Tùy chọn chung</h2>
                                            <p>
                                                Cấu hình ngôn ngữ và giới hạn
                                                tài nguyên mặc định.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="settings-form-grid">
                                        <label className="settings-field">
                                            <span>Ngôn ngữ mặc định</span>
                                            <select
                                                value={settings.language}
                                                onChange={(event) =>
                                                    updateSetting(
                                                        'language',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="vi">
                                                    Tiếng Việt
                                                </option>
                                                <option value="en">
                                                    English
                                                </option>
                                                <option value="ja">日本語</option>
                                            </select>
                                        </label>

                                        <label className="settings-field">
                                            <span>
                                                Giới hạn dung lượng chương
                                            </span>
                                            <select
                                                value={settings.chapterLimit}
                                                onChange={(event) =>
                                                    updateSetting(
                                                        'chapterLimit',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="25">25 MB</option>
                                                <option value="50">50 MB</option>
                                                <option value="100">100 MB</option>
                                                <option value="200">200 MB</option>
                                            </select>
                                        </label>
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="settings-right-column">
                            <section className="settings-card">
                                <div className="settings-card-heading">
                                    <div className="settings-card-icon purple">
                                        ♧
                                    </div>
                                    <div>
                                        <h2>Thông báo &amp; Bảo trì</h2>
                                        <p>
                                            Quản trị trạng thái và cờ vận hành.
                                        </p>
                                    </div>
                                </div>

                                <label className="settings-field full">
                                    <span>Thông báo toàn hệ thống</span>
                                    <textarea
                                        rows={4}
                                        value={settings.announcement}
                                        onChange={(event) =>
                                            updateSetting(
                                                'announcement',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <ToggleSetting
                                    title="Hiển thị banner thông báo"
                                    description="Ghim trên header người dùng."
                                    checked={settings.showBanner}
                                    onChange={(value) =>
                                        updateSetting('showBanner', value)
                                    }
                                />

                                <div className="settings-maintenance-box">
                                    <div className="settings-maintenance-title">
                                        <strong>⚠ Chế độ bảo trì hệ thống</strong>
                                        <span
                                            className={
                                                settings.maintenanceMode
                                                    ? 'enabled'
                                                    : ''
                                            }
                                        >
                                            {settings.maintenanceMode
                                                ? 'Đang bật'
                                                : 'Đang tắt'}
                                        </span>
                                    </div>
                                    <p>
                                        Khi bật, chỉ tài khoản quản trị được
                                        phép truy cập. Người đọc sẽ thấy trang
                                        thông báo bảo trì.
                                    </p>
                                    <ToggleSetting
                                        title="Kích hoạt bảo trì"
                                        checked={settings.maintenanceMode}
                                        onChange={(value) =>
                                            updateSetting(
                                                'maintenanceMode',
                                                value,
                                            )
                                        }
                                        danger
                                    />
                                    <small>
                                        ◈ Cần xác nhận trước khi lưu chế độ bảo
                                        trì.
                                    </small>
                                </div>
                            </section>

                            <section className="settings-card settings-telemetry">
                                <div className="settings-telemetry-heading">
                                    <strong>TÌNH TRẠNG TÀI NGUYÊN CDN</strong>
                                    <span>Bình thường</span>
                                </div>

                                <ResourceBar
                                    label="Băng thông tháng này"
                                    value="64.2 TB / 100 TB"
                                    percent={64.2}
                                />
                                <ResourceBar
                                    label="Lưu trữ hình ảnh truyện"
                                    value="1.84 TB / 5 TB"
                                    percent={36.8}
                                    green
                                />

                                <div className="settings-telemetry-footer">
                                    <span>
                                        Cache hit ratio: <strong>98.4%</strong>
                                    </span>
                                    <span>
                                        API Latency: <strong>32ms</strong>
                                    </span>
                                </div>
                                <p className="settings-demo-note">
                                    Số liệu minh họa giao diện, chưa kết nối
                                    dịch vụ CDN thực tế.
                                </p>
                            </section>
                        </div>
                    </div>

                    <div className="settings-action-bar">
                        <div>
                            <span>ⓘ</span>
                            Các thay đổi chỉ được áp dụng sau khi nhấn Lưu
                            thay đổi.
                        </div>
                        <div className="settings-action-buttons">
                            <button
                                className="settings-reset-button"
                                type="button"
                                onClick={handleReset}
                            >
                                ↻ Khôi phục mặc định
                            </button>
                            <button
                                className="settings-cancel-button"
                                type="button"
                                onClick={handleCancel}
                            >
                                Hủy
                            </button>
                            <button
                                className="settings-save-button"
                                type="button"
                                onClick={handleSave}
                            >
                                ✓ Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {toast && (
                <div className="settings-toast">
                    <span>✓</span>
                    <div>
                        <strong>Thông báo</strong>
                        <p>{toast}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToast('')}
                        aria-label="Đóng thông báo"
                    >
                        ×
                    </button>
                </div>
            )}

            {maintenanceConfirm && (
                <div className="settings-modal-backdrop">
                    <div className="settings-confirm-modal">
                        <div className="settings-confirm-icon">!</div>
                        <h2>Xác nhận bật chế độ bảo trì?</h2>
                        <p>
                            Đây là thao tác ảnh hưởng đến quyền truy cập của
                            người dùng. Bạn có chắc chắn muốn lưu cấu hình này?
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={() => setMaintenanceConfirm(false)}
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={confirmMaintenance}
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

type ToggleSettingProps = {
    title: string;
    description?: string;
    badge?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    danger?: boolean;
};

function ToggleSetting({
                           title,
                           description,
                           badge,
                           checked,
                           onChange,
                           danger = false,
                       }: ToggleSettingProps) {
    return (
        <div className={`settings-toggle-row ${danger ? 'danger' : ''}`}>
            <div className="settings-toggle-copy">
                <div className="settings-toggle-title">
                    <strong>{title}</strong>
                    {badge && <span>{badge}</span>}
                </div>
                {description && <p>{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                className={`settings-switch ${checked ? 'checked' : ''}`}
                onClick={() => onChange(!checked)}
            >
                <span />
            </button>
        </div>
    );
}

type ResourceBarProps = {
    label: string;
    value: string;
    percent: number;
    green?: boolean;
};

function ResourceBar({
                         label,
                         value,
                         percent,
                         green = false,
                     }: ResourceBarProps) {
    return (
        <div className="settings-resource">
            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
            <div className="settings-resource-track">
                <span
                    className={green ? 'green' : ''}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export default AdminSettingsPage;
