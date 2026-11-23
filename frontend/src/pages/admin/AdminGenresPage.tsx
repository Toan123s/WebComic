
import { useMemo, useState } from 'react';
import './AdminGenresPage.css';

type GenreStatus = 'active' | 'hidden';
type FilterStatus = 'all' | GenreStatus;
type Genre = {
    id: number;
    name: string;
    slug: string;
    description: string;
    comicCount: number;
    status: GenreStatus;
    createdAt: string;
};

const initialGenres: Genre[] = [
    {
        id: 1,
        name: 'Hành động',
        slug: 'hanh-dong',
        description: 'Truyện với các pha hành động gay cấn, chiến đấu võ thuật và những màn đối đầu kịch tính.',
        comicCount: 1420,
        status: 'active',
        createdAt: '12/03/2023',
    },
    {
        id: 2,
        name: 'Phiêu lưu',
        slug: 'phieu-luu',
        description: 'Khám phá vùng đất mới, hành trình tìm kiếm kho báu và giải mã những bí ẩn.',
        comicCount: 1120,
        status: 'active',
        createdAt: '15/04/2023',
    },
    {
        id: 3,
        name: 'Hài hước',
        slug: 'hai-huoc',
        description: 'Những tình huống dí dỏm, vui nhộn mang lại cảm giác giải trí nhẹ nhàng.',
        comicCount: 856,
        status: 'active',
        createdAt: '20/06/2023',
    },
    {
        id: 4,
        name: 'Tình cảm',
        slug: 'tinh-cam',
        description: 'Những câu chuyện về tình cảm, tình bạn và các mối quan hệ trong cuộc sống.',
        comicCount: 1048,
        status: 'active',
        createdAt: '01/07/2023',
    },
    {
        id: 5,
        name: 'Kinh dị',
        slug: 'kinh-di',
        description: 'Không khí bí ẩn, hồi hộp cùng các yếu tố siêu nhiên và tâm linh.',
        comicCount: 342,
        status: 'hidden',
        createdAt: '18/08/2023',
    },
    {
        id: 6,
        name: 'Giả tưởng',
        slug: 'gia-tuong',
        description: 'Thế giới phép thuật, thần thoại và những năng lực đặc biệt.',
        comicCount: 630,
        status: 'active',
        createdAt: '22/09/2023',
    },
    {
        id: 7,
        name: 'Trinh thám',
        slug: 'trinh-tham',
        description: 'Những vụ án bí ẩn, suy luận logic và hành trình tìm kiếm sự thật.',
        comicCount: 512,
        status: 'active',
        createdAt: '05/11/2023',
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

const makeSlug = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

const emptyForm = {
    name: '',
    slug: '',
    description: '',
    status: 'active' as GenreStatus,
};

export default function AdminGenresPage() {
    const [genres, setGenres] = useState<Genre[]>(initialGenres);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('count');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(7);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [notice, setNotice] = useState('');

    const activeCount = genres.filter((item) => item.status === 'active').length;
    const hiddenCount = genres.filter((item) => item.status === 'hidden').length;

    const filteredGenres = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        const result = genres.filter((item) => {
            const matchesSearch =
                item.name.toLocaleLowerCase('vi').includes(keyword) ||
                item.slug.toLowerCase().includes(keyword) ||
                item.description.toLocaleLowerCase('vi').includes(keyword);

            const matchesStatus = filter === 'all' || item.status === filter;
            return matchesSearch && matchesStatus;
        });

        return [...result].sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name, 'vi');
            if (sort === 'date') return b.id - a.id;
            return b.comicCount - a.comicCount;
        });
    }, [genres, search, filter, sort]);

    const totalPages = Math.max(1, Math.ceil(filteredGenres.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleGenres = filteredGenres.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const showNotice = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 2800);
    };

    const openCreateModal = () => {
        setEditingGenre(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (genre: Genre) => {
        setEditingGenre(genre);
        setForm({
            name: genre.name,
            slug: genre.slug,
            description: genre.description,
            status: genre.status,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingGenre(null);
        setForm(emptyForm);
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const name = form.name.trim();
        const slug = form.slug.trim();

        if (!name || !slug) {
            showNotice('Vui lòng nhập tên và slug thể loại.');
            return;
        }

        const duplicate = genres.some(
            (item) =>
                item.slug.toLowerCase() === slug.toLowerCase() &&
                item.id !== editingGenre?.id,
        );

        if (duplicate) {
            showNotice('Slug này đã được sử dụng. Vui lòng chọn slug khác.');
            return;
        }

        if (editingGenre) {
            setGenres((previous) =>
                previous.map((item) =>
                    item.id === editingGenre.id
                        ? { ...item, name, slug, description: form.description.trim(), status: form.status }
                        : item,
                ),
            );
            showNotice('Đã cập nhật thể loại.');
        } else {
            const newGenre: Genre = {
                id: Math.max(0, ...genres.map((item) => item.id)) + 1,
                name,
                slug,
                description: form.description.trim(),
                comicCount: 0,
                status: form.status,
                createdAt: new Date().toLocaleDateString('vi-VN'),
            };
            setGenres((previous) => [newGenre, ...previous]);
            setPage(1);
            showNotice('Đã thêm thể loại mới.');
        }

        closeModal();
    };

    const toggleStatus = (genre: Genre) => {
        const nextStatus: GenreStatus =
            genre.status === 'active' ? 'hidden' : 'active';

        setGenres((previous) =>
            previous.map((item) =>
                item.id === genre.id ? { ...item, status: nextStatus } : item,
            ),
        );

        showNotice(
            nextStatus === 'active'
                ? `Đã hiển thị thể loại "${genre.name}".`
                : `Đã ẩn thể loại "${genre.name}".`,
        );
    };

    const deleteGenre = (genre: Genre) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa thể loại "${genre.name}" khỏi dữ liệu demo?`,
        );

        if (!confirmed) return;

        setGenres((previous) => previous.filter((item) => item.id !== genre.id));
        showNotice('Đã xóa thể loại khỏi dữ liệu demo.');
    };

    const exportData = () => {
        const rows = [
            ['Tên thể loại', 'Slug', 'Mô tả', 'Số lượng truyện', 'Trạng thái', 'Ngày tạo'],
            ...filteredGenres.map((item) => [
                item.name,
                item.slug,
                item.description,
                String(item.comicCount),
                item.status === 'active' ? 'Đang hiển thị' : 'Đang ẩn',
                item.createdAt,
            ]),
        ];

        const csv =
            '\uFEFF' +
            rows
                .map((row) =>
                    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
                )
                .join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comichub-the-loai.csv';
        link.click();
        URL.revokeObjectURL(url);

        showNotice('Đã xuất danh sách thể loại ra file CSV.');
    };

    return (
        <div className="admin-genres-page">
            <aside className="genres-sidebar">
                <a className="genres-brand" href="/admin">
                    <span className="genres-brand-icon">C</span>
                    <span>
                        <strong>ComicHub Admin</strong>
                        <small>HỆ THỐNG QUẢN TRỊ</small>
                    </span>
                </a>

                <div className="genres-sidebar-caption">MENU QUẢN TRỊ</div>
                <nav className="genres-nav">
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={item.href === '/admin/genres' ? 'active' : ''}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="genres-system-status">
                    <span className="genres-status-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <small>Phiên bản v2.4.0</small>
                    </div>
                </div>
            </aside>

            <div className="genres-main">
                <header className="genres-header">
                    <div className="genres-breadcrumb">
                        <a href="/admin">Trang quản trị</a>
                        <span className="material-symbols-outlined">chevron_right</span>
                        <strong>Quản lý thể loại</strong>
                    </div>
                    <div className="genres-header-right">
                        <label className="genres-global-search">
                            <span className="material-symbols-outlined">search</span>
                            <input placeholder="Tìm kiếm..." />
                        </label>
                        <button className="genres-notification" aria-label="Thông báo">
                            <span className="material-symbols-outlined">notifications</span>
                            <i>3</i>
                        </button>
                        <div className="genres-admin-profile">
                            <div className="genres-admin-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <small>Quản trị viên</small>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="genres-content">
                    <section className="genres-page-heading">
                        <div>
                            <div className="genres-eyebrow">
                                DANH MỤC HỆ THỐNG <span>›</span> PHÂN LOẠI TRUYỆN
                            </div>
                            <h1>Quản lý thể loại</h1>
                            <p>Quản lý các thể loại truyện trên nền tảng ComicHub.</p>
                        </div>
                        <div className="genres-heading-actions">
                            <button className="genres-button secondary" onClick={exportData}>
                                <span className="material-symbols-outlined">file_download</span>
                                Xuất dữ liệu
                            </button>
                            <button className="genres-button primary" onClick={openCreateModal}>
                                <span className="material-symbols-outlined">add</span>
                                Thêm thể loại
                            </button>
                        </div>
                    </section>

                    <section className="genres-stats">
                        <button
                            className={`genres-stat-card ${filter === 'all' ? 'selected' : ''}`}
                            onClick={() => { setFilter('all'); setPage(1); }}
                        >
                            <span className="genres-stat-icon blue">
                                <span className="material-symbols-outlined">category</span>
                            </span>
                            <span className="genres-stat-info">
                                <small>Tất cả thể loại</small>
                                <strong>{genres.length}</strong>
                            </span>
                            <span className="material-symbols-outlined stat-end">filter_list</span>
                        </button>

                        <button
                            className={`genres-stat-card ${filter === 'active' ? 'selected' : ''}`}
                            onClick={() => { setFilter('active'); setPage(1); }}
                        >
                            <span className="genres-stat-icon green">
                                <span className="material-symbols-outlined">visibility</span>
                            </span>
                            <span className="genres-stat-info">
                                <small>Đang hiển thị</small>
                                <strong>{activeCount}</strong>
                                <em>{genres.length ? ((activeCount / genres.length) * 100).toFixed(1) : '0'}%</em>
                            </span>
                            <span className="genres-live-dot" />
                        </button>

                        <button
                            className={`genres-stat-card ${filter === 'hidden' ? 'selected' : ''}`}
                            onClick={() => { setFilter('hidden'); setPage(1); }}
                        >
                            <span className="genres-stat-icon gray">
                                <span className="material-symbols-outlined">visibility_off</span>
                            </span>
                            <span className="genres-stat-info">
                                <small>Đang ẩn</small>
                                <strong>{hiddenCount}</strong>
                                <em>Tạm dừng</em>
                            </span>
                            <span className="genres-live-dot gray-dot" />
                        </button>
                    </section>

                    <section className="genres-table-card">
                        <div className="genres-toolbar">
                            <label className="genres-table-search">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    value={search}
                                    onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                                    placeholder="Tìm kiếm thể loại..."
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </label>

                            <label className="genres-sort">
                                <span>Sắp xếp:</span>
                                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                    <option value="count">Số lượng truyện giảm dần</option>
                                    <option value="name">Tên A-Z</option>
                                    <option value="date">Ngày tạo mới nhất</option>
                                </select>
                            </label>
                        </div>

                        <div className="genres-table-scroll">
                            <table className="genres-table">
                                <thead>
                                <tr>
                                    <th>Tên thể loại</th>
                                    <th>Mô tả</th>
                                    <th className="align-right">Số lượng truyện</th>
                                    <th className="align-center">Trạng thái</th>
                                    <th className="align-right">Ngày tạo</th>
                                    <th className="align-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleGenres.map((genre) => (
                                    <tr key={genre.id}>
                                        <td>
                                            <div className="genres-name-cell">
                                                <span className="genres-color-dot" />
                                                <div>
                                                    <strong>{genre.name}</strong>
                                                    <small>slug: /the-loai/{genre.slug}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="genres-description">{genre.description}</td>
                                        <td className="align-right">
                                            <strong className="genres-count">{genre.comicCount.toLocaleString('vi-VN')}</strong>
                                            <span className="genres-unit"> bộ</span>
                                        </td>
                                        <td className="align-center">
                                                <span className={`genres-status ${genre.status}`}>
                                                    <i />
                                                    {genre.status === 'active' ? 'Đang hiển thị' : 'Đang ẩn'}
                                                </span>
                                        </td>
                                        <td className="align-right genres-date">{genre.createdAt}</td>
                                        <td>
                                            <div className="genres-row-actions">
                                                <button title="Chỉnh sửa" onClick={() => openEditModal(genre)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button
                                                    title={genre.status === 'active' ? 'Ẩn thể loại' : 'Hiện thể loại'}
                                                    onClick={() => toggleStatus(genre)}
                                                >
                                                        <span className="material-symbols-outlined">
                                                            {genre.status === 'active' ? 'visibility' : 'visibility_off'}
                                                        </span>
                                                </button>
                                                <button className="delete" title="Xóa" onClick={() => deleteGenre(genre)}>
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleGenres.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="genres-empty">
                                            <span className="material-symbols-outlined">search_off</span>
                                            Không tìm thấy thể loại phù hợp.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="genres-pagination">
                            <span>
                                Hiển thị <strong>{filteredGenres.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredGenres.length)}</strong>
                                {' '}trên tổng số <strong>{filteredGenres.length}</strong> thể loại
                            </span>
                            <div>
                                <button disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="Trang đầu">
                                    <span className="material-symbols-outlined">first_page</span>
                                </button>
                                <button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} aria-label="Trang trước">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="genres-current-page">{currentPage}</span>
                                <button disabled={currentPage >= totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Trang sau">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                                <button disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)} aria-label="Trang cuối">
                                    <span className="material-symbols-outlined">last_page</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {modalOpen && (
                <div className="genres-modal-backdrop" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeModal();
                }}>
                    <section className="genres-modal">
                        <header>
                            <div className="genres-modal-icon">
                                <span className="material-symbols-outlined">
                                    {editingGenre ? 'edit' : 'add_box'}
                                </span>
                            </div>
                            <div>
                                <h2>{editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</h2>
                                <p>{editingGenre ? 'Cập nhật thông tin thể loại' : 'Tạo phân loại mới cho danh mục truyện'}</p>
                            </div>
                            <button className="genres-modal-close" onClick={closeModal} aria-label="Đóng">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </header>

                        <form onSubmit={handleSave}>
                            <label className="genres-form-field">
                                <span>Tên thể loại <b>*</b></span>
                                <input
                                    required
                                    value={form.name}
                                    placeholder="Ví dụ: Khoa học viễn tưởng"
                                    onChange={(event) => {
                                        const name = event.target.value;
                                        setForm((previous) => ({
                                            ...previous,
                                            name,
                                            slug: editingGenre ? previous.slug : makeSlug(name),
                                        }));
                                    }}
                                />
                            </label>

                            <label className="genres-form-field">
                                <span>Đường dẫn tĩnh (Slug) <b>*</b></span>
                                <div className="genres-slug-input">
                                    <span>/the-loai/</span>
                                    <input
                                        required
                                        value={form.slug}
                                        placeholder="khoa-hoc-vien-tuong"
                                        onChange={(event) => setForm((previous) => ({
                                            ...previous,
                                            slug: makeSlug(event.target.value),
                                        }))}
                                    />
                                </div>
                                <small>Slug được tự động tạo từ tên thể loại. Bạn có thể chỉnh sửa.</small>
                            </label>

                            <label className="genres-form-field">
                                <span>Mô tả ngắn</span>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    placeholder="Nhập mô tả cho thể loại..."
                                    onChange={(event) => setForm((previous) => ({
                                        ...previous,
                                        description: event.target.value,
                                    }))}
                                />
                            </label>

                            <label className="genres-form-status">
                                <span>
                                    <strong>Trạng thái hiển thị</strong>
                                    <small>Cho phép thể loại xuất hiện trên trang độc giả</small>
                                </span>
                                <select
                                    value={form.status}
                                    onChange={(event) => setForm((previous) => ({
                                        ...previous,
                                        status: event.target.value as GenreStatus,
                                    }))}
                                >
                                    <option value="active">Đang hiển thị</option>
                                    <option value="hidden">Đang ẩn</option>
                                </select>
                            </label>

                            <footer>
                                <button type="button" className="genres-button secondary" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="genres-button primary">
                                    {editingGenre ? 'Lưu thay đổi' : 'Lưu thể loại'}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {notice && <div className="genres-toast">{notice}</div>}
        </div>
    );
}
