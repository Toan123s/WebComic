
import { useMemo, useState, type FormEvent } from 'react';
import './AdminComicsManagementPage.css';

type ComicStatus = 'Đã xuất bản' | 'Chờ duyệt' | 'Đã duyệt' | 'Bị từ chối' | 'Bản nháp';

type Comic = {
    id: number;
    title: string;
    author: string;
    genres: string[];
    updatedAt: string;
    status: ComicStatus;
    chapters: number;
    reads: string;
    cover: string;
};

type ComicForm = {
    title: string;
    author: string;
    genres: string;
    status: ComicStatus;
    chapters: string;
};

const initialComics: Comic[] = [
    {
        id: 1,
        title: 'Thần Thoại Thức Tỉnh',
        author: 'Lê Hải Đăng',
        genres: ['Hành động', 'Giả tưởng'],
        updatedAt: '28/05/2024',
        status: 'Đã xuất bản',
        chapters: 128,
        reads: '4.2M',
        cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=220&fit=crop',
    },
    {
        id: 2,
        title: 'Vương Quyền Băng Tuyết',
        author: 'Nguyễn Thảo My',
        genres: ['Phiêu lưu', 'Phép thuật'],
        updatedAt: '27/05/2024',
        status: 'Chờ duyệt',
        chapters: 45,
        reads: '890K',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=160&h=220&fit=crop',
    },
    {
        id: 3,
        title: 'Giai Điệu Mùa Hạ',
        author: 'Đặng Quốc Bảo',
        genres: ['Tình cảm', 'Đời thường'],
        updatedAt: '26/05/2024',
        status: 'Đã duyệt',
        chapters: 92,
        reads: '1.6M',
        cover: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=160&h=220&fit=crop',
    },
    {
        id: 4,
        title: 'Kẻ Cắp Giấc Mơ',
        author: 'Trịnh Thu Trang',
        genres: ['Trinh thám', 'Kinh dị'],
        updatedAt: '25/05/2024',
        status: 'Bị từ chối',
        chapters: 15,
        reads: '—',
        cover: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=160&h=220&fit=crop',
    },
    {
        id: 5,
        title: 'Nhật Ký Học Viện Phép Thuật',
        author: 'Phạm Minh Trí',
        genres: ['Học đường', 'Hài hước'],
        updatedAt: '24/05/2024',
        status: 'Đã xuất bản',
        chapters: 64,
        reads: '2.1M',
        cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=160&h=220&fit=crop',
    },
    {
        id: 6,
        title: 'Đại Lục Phong Vân',
        author: 'Hoàng Kim Long',
        genres: ['Võ hiệp', 'Cổ trang'],
        updatedAt: '22/05/2024',
        status: 'Bản nháp',
        chapters: 3,
        reads: '—',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=160&h=220&fit=crop',
    },
];

const emptyForm: ComicForm = {
    title: '',
    author: '',
    genres: '',
    status: 'Bản nháp',
    chapters: '0',
};

const statusOptions: ComicStatus[] = [
    'Bản nháp',
    'Chờ duyệt',
    'Đã duyệt',
    'Đã xuất bản',
    'Bị từ chối',
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

function getStatusClass(status: ComicStatus) {
    switch (status) {
        case 'Đã xuất bản':
            return 'published';
        case 'Chờ duyệt':
            return 'pending';
        case 'Đã duyệt':
            return 'approved';
        case 'Bị từ chối':
            return 'rejected';
        default:
            return 'draft';
    }
}

export default function AdminComicsManagementPage() {
    const [comics, setComics] = useState<Comic[]>(initialComics);
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const [modal, setModal] = useState<'create' | 'edit' | 'detail' | 'confirm' | null>(null);
    const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
    const [confirmAction, setConfirmAction] = useState<'unpublish' | 'delete' | null>(null);
    const [form, setForm] = useState<ComicForm>(emptyForm);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notice, setNotice] = useState('');

    const filteredComics = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        return comics.filter((comic) => {
            const matchesSearch =
                !keyword ||
                comic.title.toLocaleLowerCase('vi').includes(keyword) ||
                comic.author.toLocaleLowerCase('vi').includes(keyword);

            const matchesGenre =
                !genreFilter || comic.genres.some((genre) => genre === genreFilter);

            const matchesAuthor = !authorFilter || comic.author === authorFilter;
            const matchesStatus = !statusFilter || comic.status === statusFilter;

            return matchesSearch && matchesGenre && matchesAuthor && matchesStatus;
        });
    }, [comics, search, genreFilter, authorFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredComics.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleComics = filteredComics.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const publishedCount = comics.filter((comic) => comic.status === 'Đã xuất bản').length;
    const pendingCount = comics.filter((comic) => comic.status === 'Chờ duyệt').length;
    const rejectedCount = comics.filter((comic) => comic.status === 'Bị từ chối').length;

    const authors = [...new Set(comics.map((comic) => comic.author))];
    const genres = [...new Set(comics.flatMap((comic) => comic.genres))];

    function showNotice(message: string) {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 2800);
    }

    function resetFilters() {
        setSearch('');
        setGenreFilter('');
        setAuthorFilter('');
        setStatusFilter('');
        setPage(1);
    }

    function openCreateModal() {
        setSelectedComic(null);
        setForm(emptyForm);
        setModal('create');
    }

    function openEditModal(comic: Comic) {
        setSelectedComic(comic);
        setForm({
            title: comic.title,
            author: comic.author,
            genres: comic.genres.join(', '),
            status: comic.status,
            chapters: String(comic.chapters),
        });
        setModal('edit');
    }

    function openDetailModal(comic: Comic) {
        setSelectedComic(comic);
        setModal('detail');
    }

    function saveComic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const title = form.title.trim();
        const author = form.author.trim();

        if (!title || !author) {
            showNotice('Vui lòng nhập tên truyện và tên tác giả.');
            return;
        }

        const comicData = {
            title,
            author,
            genres: form.genres
                .split(',')
                .map((genre) => genre.trim())
                .filter(Boolean),
            status: form.status,
            chapters: Math.max(0, Number(form.chapters) || 0),
            updatedAt: new Date().toLocaleDateString('vi-VN'),
        };

        if (modal === 'edit' && selectedComic) {
            setComics((current) =>
                current.map((comic) =>
                    comic.id === selectedComic.id ? { ...comic, ...comicData } : comic,
                ),
            );
            showNotice('Đã cập nhật thông tin truyện.');
        } else {
            setComics((current) => [
                {
                    id: Math.max(0, ...current.map((comic) => comic.id)) + 1,
                    ...comicData,
                    reads: '—',
                    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=160&h=220&fit=crop',
                },
                ...current,
            ]);
            setPage(1);
            showNotice('Đã thêm truyện mới vào danh sách.');
        }

        setModal(null);
        setSelectedComic(null);
    }

    function openConfirm(comic: Comic, action: 'unpublish' | 'delete') {
        setSelectedComic(comic);
        setConfirmAction(action);
        setModal('confirm');
    }

    function executeConfirm() {
        if (!selectedComic || !confirmAction) return;

        if (confirmAction === 'unpublish') {
            setComics((current) =>
                current.map((comic) =>
                    comic.id === selectedComic.id
                        ? { ...comic, status: 'Bản nháp' }
                        : comic,
                ),
            );
            showNotice('Đã chuyển truyện về trạng thái bản nháp.');
        } else {
            setComics((current) =>
                current.filter((comic) => comic.id !== selectedComic.id),
            );
            showNotice('Đã xóa truyện khỏi danh sách mẫu.');
        }

        setModal(null);
        setSelectedComic(null);
        setConfirmAction(null);
    }

    function exportCsv() {
        const rows = [
            ['Tên truyện', 'Tác giả', 'Thể loại', 'Số chương', 'Ngày cập nhật', 'Trạng thái'],
            ...filteredComics.map((comic) => [
                comic.title,
                comic.author,
                comic.genres.join(', '),
                String(comic.chapters),
                comic.updatedAt,
                comic.status,
            ]),
        ];

        const csv = '\uFEFF' + rows
            .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
            .join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comichub-comics.csv';
        link.click();
        URL.revokeObjectURL(url);
        showNotice('Đã xuất danh sách truyện ra file CSV.');
    }

    return (
        <div className="admin-comics-page">
            <div
                className={`admin-comics-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`admin-comics-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-comics-brand">
                    <div className="admin-comics-brand-icon">C</div>
                    <div>
                        <strong>ComicHub Admin</strong>
                        <span>Hệ thống Quản trị</span>
                    </div>
                    <button
                        className="admin-mobile-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Đóng menu"
                    >
                        ×
                    </button>
                </div>

                <div className="admin-sidebar-divider" />

                <nav className="admin-comics-nav">
                    {navigation.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={item.href === '/admin/comics' ? 'active' : ''}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <span className="admin-status-dot" />
                    <div>
                        <strong>Hệ thống hoạt động</strong>
                        <span>Phiên bản v2.4.0</span>
                    </div>
                </div>
            </aside>

            <div className="admin-comics-main">
                <header className="admin-comics-header">
                    <button
                        className="admin-menu-button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Mở menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <div className="admin-breadcrumb">
                        <span>Trang quản trị</span>
                        <span className="material-symbols-outlined">chevron_right</span>
                        <strong>Quản lý truyện</strong>
                    </div>

                    <div className="admin-header-actions">
                        <label className="admin-global-search">
                            <span className="material-symbols-outlined">search</span>
                            <input placeholder="Tìm kiếm..." aria-label="Tìm kiếm toàn trang" />
                        </label>

                        <button className="admin-notification" aria-label="Thông báo">
                            <span className="material-symbols-outlined">notifications</span>
                            <i>3</i>
                        </button>

                        <div className="admin-account">
                            <div className="admin-account-avatar">L</div>
                            <div>
                                <strong>Trần Hoạt</strong>
                                <span>Quản trị viên</span>
                            </div>
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                </header>

                <main className="admin-comics-content">
                    <section className="admin-page-heading">
                        <div>
                            <div className="admin-eyebrow">
                                <span>Kho nội dung</span>
                                <i />
                                <small>Vận hành nội dung</small>
                            </div>
                            <h1>Quản lý truyện</h1>
                            <p>
                                Quản lý kho tác phẩm, kiểm soát trạng thái xuất bản và thông tin
                                chi tiết các bộ truyện
                            </p>
                        </div>

                        <div className="admin-heading-actions">
                            <button className="admin-button admin-button-light" onClick={exportCsv}>
                                <span className="material-symbols-outlined">file_download</span>
                                Xuất danh sách
                            </button>
                            <button className="admin-button admin-button-primary" onClick={openCreateModal}>
                                <span className="material-symbols-outlined">add</span>
                                Thêm truyện mới
                            </button>
                        </div>
                    </section>

                    <section className="admin-stats-grid">
                        <article className="admin-stat-card">
                            <div>
                                <span>Tổng số bộ truyện</span>
                                <strong>4,280</strong>
                                <small className="stat-positive">
                                    <span className="material-symbols-outlined">trending_up</span>
                                    +48 truyện mới tháng này
                                </small>
                            </div>
                            <div className="admin-stat-icon blue">
                                <span className="material-symbols-outlined">auto_stories</span>
                            </div>
                        </article>

                        <article className="admin-stat-card">
                            <div>
                                <span>Đang xuất bản trực tuyến</span>
                                <strong>{publishedCount.toLocaleString('vi-VN')}</strong>
                                <small className="stat-positive">
                                    <span className="material-symbols-outlined">verified</span>
                                    Truyện đang hiển thị
                                </small>
                            </div>
                            <div className="admin-stat-icon green">
                                <span className="material-symbols-outlined">public</span>
                            </div>
                        </article>

                        <article className="admin-stat-card">
                            <div>
                                <span>Chờ biên tập kiểm duyệt</span>
                                <strong>{pendingCount}</strong>
                                <small>
                                    <span className="material-symbols-outlined">schedule</span>
                                    Ưu tiên xử lý trong ngày
                                </small>
                            </div>
                            <div className="admin-stat-icon yellow">
                                <span className="material-symbols-outlined">rule</span>
                            </div>
                        </article>

                        <article className="admin-stat-card">
                            <div>
                                <span>Yêu cầu chỉnh sửa / từ chối</span>
                                <strong>{rejectedCount}</strong>
                                <small className="stat-danger">
                                    <span className="material-symbols-outlined">warning</span>
                                    Cần kiểm tra nội dung
                                </small>
                            </div>
                            <div className="admin-stat-icon red">
                                <span className="material-symbols-outlined">report</span>
                            </div>
                        </article>
                    </section>

                    <section className="admin-filter-panel">
                        <div className="admin-filter-grid">
                            <label className="admin-filter-search">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm theo tên truyện hoặc tác giả..."
                                />
                            </label>

                            <select
                                value={genreFilter}
                                onChange={(event) => {
                                    setGenreFilter(event.target.value);
                                    setPage(1);
                                }}
                                aria-label="Lọc thể loại"
                            >
                                <option value="">Tất cả thể loại</option>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>

                            <select
                                value={authorFilter}
                                onChange={(event) => {
                                    setAuthorFilter(event.target.value);
                                    setPage(1);
                                }}
                                aria-label="Lọc tác giả"
                            >
                                <option value="">Tất cả tác giả</option>
                                {authors.map((author) => (
                                    <option key={author} value={author}>{author}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setPage(1);
                                }}
                                aria-label="Lọc trạng thái"
                            >
                                <option value="">Tất cả trạng thái</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <button className="admin-reset-button" onClick={resetFilters}>
                                <span className="material-symbols-outlined">restart_alt</span>
                                Xóa lọc
                            </button>
                        </div>

                        <div className="admin-filter-summary">
                            <div>
                                <strong>Đang lọc theo:</strong>
                                {genreFilter && <span>{genreFilter}</span>}
                                {authorFilter && <span>{authorFilter}</span>}
                                {statusFilter && <span>{statusFilter}</span>}
                                {!genreFilter && !authorFilter && !statusFilter && !search && (
                                    <span>Tất cả truyện</span>
                                )}
                                {search && <span>Từ khóa: {search}</span>}
                            </div>
                            <strong>Đã tìm thấy {filteredComics.length} kết quả</strong>
                        </div>
                    </section>

                    <section className="admin-comics-table-card">
                        <div className="admin-table-scroll">
                            <table className="admin-comics-table">
                                <thead>
                                <tr>
                                    <th className="cover-column">Ảnh bìa</th>
                                    <th>Tên truyện</th>
                                    <th>Tác giả</th>
                                    <th>Thể loại</th>
                                    <th>Ngày cập nhật</th>
                                    <th>Trạng thái</th>
                                    <th className="actions-column">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleComics.map((comic) => (
                                    <tr key={comic.id}>
                                        <td>
                                            <img className="admin-comic-cover" src={comic.cover} alt={`Bìa ${comic.title}`} />
                                        </td>
                                        <td>
                                            <div className="admin-comic-title">
                                                <strong>{comic.title}</strong>
                                                <span>{comic.chapters} chương • {comic.reads} lượt đọc</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-author-cell">
                                                <span>{comic.author.charAt(0)}</span>
                                                <strong>{comic.author}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-genre-list">
                                                {comic.genres.map((genre) => (
                                                    <span key={genre}>{genre}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="admin-date-cell">{comic.updatedAt}</td>
                                        <td>
                        <span className={`admin-status-badge ${getStatusClass(comic.status)}`}>
                          <i />
                            {comic.status}
                        </span>
                                        </td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button title="Xem chi tiết" onClick={() => openDetailModal(comic)}>
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>
                                                <button title="Chỉnh sửa" onClick={() => openEditModal(comic)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                {comic.status === 'Đã xuất bản' ? (
                                                    <button
                                                        className="danger"
                                                        title="Gỡ xuất bản"
                                                        onClick={() => openConfirm(comic, 'unpublish')}
                                                    >
                                                        <span className="material-symbols-outlined">unpublished</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="danger"
                                                        title="Xóa truyện"
                                                        onClick={() => openConfirm(comic, 'delete')}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {visibleComics.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="admin-empty-state">
                                            <span className="material-symbols-outlined">search_off</span>
                                            <strong>Không tìm thấy truyện phù hợp</strong>
                                            <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                                            <button onClick={resetFilters}>Xóa bộ lọc</button>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-table-footer">
                            <div className="admin-pagination-info">
                                Hiển thị <strong>
                                {filteredComics.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                                {' - '}
                                {Math.min(currentPage * pageSize, filteredComics.length)}
                            </strong> của <strong>{filteredComics.length}</strong> truyện

                                <label>
                                    Kích thước:
                                    <select
                                        value={pageSize}
                                        onChange={(event) => {
                                            setPageSize(Number(event.target.value));
                                            setPage(1);
                                        }}
                                    >
                                        <option value={6}>6 / trang</option>
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                    </select>
                                </label>
                            </div>

                            <div className="admin-pagination">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                    Trước
                                </button>
                                <span>Trang {currentPage} / {totalPages}</span>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                >
                                    Sau
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <p className="admin-demo-note">
                        <span className="material-symbols-outlined">info</span>
                        Đây là giao diện quản trị sử dụng dữ liệu mẫu ở frontend.
                    </p>
                </main>
            </div>

            {notice && <div className="admin-toast">{notice}</div>}

            {modal && (
                <div className="admin-modal-backdrop" onMouseDown={() => setModal(null)}>
                    <section className="admin-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <button className="admin-modal-close" onClick={() => setModal(null)} aria-label="Đóng">
                            ×
                        </button>

                        {(modal === 'create' || modal === 'edit') && (
                            <>
                                <div className="admin-modal-heading">
                  <span className="material-symbols-outlined">
                    {modal === 'create' ? 'add_box' : 'edit'}
                  </span>
                                    <div>
                                        <h2>{modal === 'create' ? 'Thêm truyện mới' : 'Chỉnh sửa truyện'}</h2>
                                        <p>Nhập thông tin cơ bản của tác phẩm.</p>
                                    </div>
                                </div>

                                <form className="admin-comic-form" onSubmit={saveComic}>
                                    <label>
                                        Tên truyện <b>*</b>
                                        <input
                                            autoFocus
                                            value={form.title}
                                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                                            placeholder="Nhập tên truyện"
                                            required
                                        />
                                    </label>
                                    <label>
                                        Tác giả <b>*</b>
                                        <input
                                            value={form.author}
                                            onChange={(event) => setForm({ ...form, author: event.target.value })}
                                            placeholder="Nhập tên tác giả"
                                            required
                                        />
                                    </label>
                                    <label>
                                        Thể loại
                                        <input
                                            value={form.genres}
                                            onChange={(event) => setForm({ ...form, genres: event.target.value })}
                                            placeholder="Ví dụ: Hành động, Giả tưởng"
                                        />
                                        <small>Phân cách các thể loại bằng dấu phẩy.</small>
                                    </label>
                                    <div className="admin-form-row">
                                        <label>
                                            Số chương
                                            <input
                                                type="number"
                                                min="0"
                                                value={form.chapters}
                                                onChange={(event) => setForm({ ...form, chapters: event.target.value })}
                                            />
                                        </label>
                                        <label>
                                            Trạng thái
                                            <select
                                                value={form.status}
                                                onChange={(event) => setForm({ ...form, status: event.target.value as ComicStatus })}
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <div className="admin-modal-actions">
                                        <button type="button" className="admin-button admin-button-light" onClick={() => setModal(null)}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="admin-button admin-button-primary">
                                            {modal === 'create' ? 'Thêm truyện' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modal === 'detail' && selectedComic && (
                            <>
                                <div className="admin-modal-heading">
                                    <span className="material-symbols-outlined">menu_book</span>
                                    <div>
                                        <h2>Chi tiết truyện</h2>
                                        <p>Thông tin tác phẩm trong hệ thống.</p>
                                    </div>
                                </div>
                                <div className="admin-detail-content">
                                    <img src={selectedComic.cover} alt={`Bìa ${selectedComic.title}`} />
                                    <div>
                                        <h3>{selectedComic.title}</h3>
                                        <p>Tác giả: <strong>{selectedComic.author}</strong></p>
                                        <p>Số chương: <strong>{selectedComic.chapters}</strong></p>
                                        <p>Lượt đọc: <strong>{selectedComic.reads}</strong></p>
                                        <p>Cập nhật: <strong>{selectedComic.updatedAt}</strong></p>
                                        <span className={`admin-status-badge ${getStatusClass(selectedComic.status)}`}>
                      <i />
                                            {selectedComic.status}
                    </span>
                                        <div className="admin-genre-list">
                                            {selectedComic.genres.map((genre) => <span key={genre}>{genre}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-modal-actions">
                                    <button className="admin-button admin-button-light" onClick={() => setModal(null)}>
                                        Đóng
                                    </button>
                                    <button className="admin-button admin-button-primary" onClick={() => openEditModal(selectedComic)}>
                                        Chỉnh sửa
                                    </button>
                                </div>
                            </>
                        )}

                        {modal === 'confirm' && selectedComic && (
                            <>
                                <div className="admin-confirm-icon">
                  <span className="material-symbols-outlined">
                    {confirmAction === 'unpublish' ? 'unpublished' : 'delete'}
                  </span>
                                </div>
                                <h2 className="admin-confirm-title">
                                    {confirmAction === 'unpublish' ? 'Gỡ xuất bản truyện?' : 'Xóa truyện này?'}
                                </h2>
                                <p className="admin-confirm-description">
                                    {confirmAction === 'unpublish'
                                        ? 'Truyện sẽ không còn hiển thị với độc giả. Bạn có thể thay đổi trạng thái lại sau.'
                                        : 'Bạn đang xóa truyện khỏi danh sách dữ liệu mẫu. Thao tác này không thể hoàn tác trong phiên hiện tại.'}
                                </p>
                                <div className="admin-confirm-comic">
                                    <strong>{selectedComic.title}</strong>
                                    <span>Tác giả: {selectedComic.author}</span>
                                </div>
                                <div className="admin-modal-actions">
                                    <button className="admin-button admin-button-light" onClick={() => setModal(null)}>
                                        Hủy
                                    </button>
                                    <button className="admin-button admin-button-danger" onClick={executeConfirm}>
                                        Xác nhận
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
