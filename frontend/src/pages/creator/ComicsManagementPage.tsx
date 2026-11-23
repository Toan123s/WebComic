
import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './ComicsManagementPage.css';

type ComicStatus = 'Đã duyệt' | 'Bản nháp' | 'Chờ duyệt' | 'Cần chỉnh sửa';

type Comic = {
    id: number;
    title: string;
    genres: string[];
    status: ComicStatus;
    chapters: number;
    updated: string;
    views: number;
    cover: string;
    note?: string;
    description: string;
};

const initialComics: Comic[] = [
    {
        id: 1,
        title: 'Huyền Vũ Ký Sự',
        genres: ['Giả tưởng', 'Võ hiệp'],
        status: 'Đã duyệt',
        chapters: 34,
        updated: '2 giờ trước',
        views: 92000,
        cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD9Lbm_U45salpQzb_PVYBN3BqVonrZB0nkMWopZYQ-rZqLjOgLCMKVGxp2GXOBMPNJIZsJS-HPz8-Ii1OXULmnHFivlC-i8zpCkTl8aeKh0_xghZgJ8Js6negrt6KsNtiP-IdwKCwQAov8_AJpOm3_XZsBXrJF5qyvtJeuDuTQxniPHc17l4B9KTjhFBtpThbNOdZil72HTNfhvEJQhOkk_VPNHULQ7QTgmzeOiUPhzp0IyleRRs5',
        description: 'Thiếu niên mang trong mình ấn ký Huyền Vũ cổ xưa, dấn thân vào cõi loạn thế tìm lại bí mật về môn phái bị lãng quên.',
    },
    {
        id: 2,
        title: 'Thợ Săn Ký Ức Đêm',
        genres: ['Siêu nhiên', 'Trinh thám'],
        status: 'Bản nháp',
        chapters: 1,
        updated: 'Hôm qua',
        views: 1200,
        cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE4gTim_4T_h-SyZlM5erlubkh_RJCW2W7toArhoCdd9upw3Qjxt0AhK6J6JbnJ0vctzYe_msJ-VpVpgkAqLK8iApCoTENSjOQYHqxGQwnYb679AdD4QDdjvOxBZLg56oycy4rUpFgFLBxZwrZ5vWWNiDgWKXnTGVDoMYb5V-Z_DN3fc2oogRVTgYQkQZc8DmsrdGEM8KJ4ZoHesd2ffMakYeIcURn22RgcWqIL2jmsilUuLD85JwA',
        description: 'Một thám tử lần theo những ký ức bí ẩn trong thành phố tương lai.',
    },
    {
        id: 3,
        title: 'Tiệm Trà Không Gian 404',
        genres: ['Khoa học viễn tưởng', 'Hài hước'],
        status: 'Chờ duyệt',
        chapters: 18,
        updated: '2 ngày trước',
        views: 51000,
        cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuF07E-8HJHshMJ8jvRgh9iQyhf7pmoNOXpgqoDb7GfNQ1BXSqA51uaANG7xsgYx-9xSJvY9Za1RK5SxbiVVYX6m-VJGszYBlhXHXs7GB2VN3TxhiCv2ddY-oNpE40o_miQ-zXBgNMi63JWJN3T62q8FjHqr-yqKLcavkf9aTibqDMZrnauhsKlMbaUu5RmPyLLFVYe8lr1q2CDOKUVVkLiQ5DOgBtTKSJy8JxWcZXdfmfiiXT71dH',
        description: 'Một quán trà kỳ lạ nằm giữa trạm không gian, nơi những vị khách từ nhiều hành tinh gặp nhau.',
    },
    {
        id: 4,
        title: 'Kỳ Án Hoàng Thành',
        genres: ['Trinh thám', 'Cổ trang'],
        status: 'Cần chỉnh sửa',
        chapters: 12,
        updated: '4 ngày trước',
        views: 40200,
        cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk9ThGQv4p2bKzh_36Lw764p2U3BsETzN-d_qm-P9y_iNYOUBJ4Hbn1SGUac9e-Br6GmpHpybACWe5oIITuKgjRNml7HkPgwcL3iStsZSTZzSXoV74J5iq4Fr1Eckx94Fi4U8eAaQk7L_R2u9JtbmCbgkEccI14pfZyg77UWLyX_UPmmfctkqQ5BBn2LLulrPjWEcqffwhASMPLsYdMvV58kCoKYyKe6fnMCGL3zFlZh0tW9WwxGxU',
        note: 'BTV: Cần bổ sung trang tóm tắt nhân vật và tăng độ phân giải ảnh bìa.',
        description: 'Một vị quan trẻ điều tra những bí mật bị chôn giấu trong hoàng thành.',
    },
];

const genres = [
    'Giả tưởng', 'Võ hiệp', 'Siêu nhiên', 'Trinh thám',
    'Khoa học viễn tưởng', 'Hài hước', 'Cổ trang', 'Đời thường',
];

const statusClass: Record<ComicStatus, string> = {
    'Đã duyệt': 'approved',
    'Bản nháp': 'draft',
    'Chờ duyệt': 'pending',
    'Cần chỉnh sửa': 'revision',
};

export default function ComicsManagementPage() {
    const [comics, setComics] = useState(initialComics);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [genreFilter, setGenreFilter] = useState('Tất cả thể loại');
    const [sort, setSort] = useState('updated');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [cover, setCover] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [toast, setToast] = useState('');
    const fileInput = useRef<HTMLInputElement>(null);

    const filteredComics = useMemo(() => {
        const result = comics.filter((comic) => {
            const keyword = search.toLowerCase().trim();
            const matchesSearch =
                !keyword ||
                comic.title.toLowerCase().includes(keyword) ||
                comic.genres.some((genre) => genre.toLowerCase().includes(keyword));
            const matchesStatus =
                statusFilter === 'Tất cả trạng thái' || comic.status === statusFilter;
            const matchesGenre =
                genreFilter === 'Tất cả thể loại' || comic.genres.includes(genreFilter);

            return matchesSearch && matchesStatus && matchesGenre;
        });

        return [...result].sort((a, b) => {
            if (sort === 'chapters') return b.chapters - a.chapters;
            if (sort === 'views') return b.views - a.views;
            if (sort === 'name') return a.title.localeCompare(b.title, 'vi');
            return a.id - b.id;
        });
    }, [comics, search, statusFilter, genreFilter, sort]);

    const totalChapters = comics.reduce((sum, comic) => sum + comic.chapters, 0);
    const totalViews = comics.reduce((sum, comic) => sum + comic.views, 0);

    function notify(message: string) {
        setToast(message);
        window.setTimeout(() => setToast(''), 2600);
    }

    function openCreate() {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setSelectedGenres([]);
        setCover('');
        setCoverFile(null);
        setDrawerOpen(true);
    }

    function openEdit(comic: Comic) {
        setEditingId(comic.id);
        setTitle(comic.title);
        setDescription(comic.description);
        setSelectedGenres(comic.genres);
        setCover(comic.cover);
        setCoverFile(null);
        setDrawerOpen(true);
    }

    function toggleGenre(genre: string) {
        setSelectedGenres((current) =>
            current.includes(genre)
                ? current.filter((item) => item !== genre)
                : [...current, genre],
        );
    }

    function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            notify('Vui lòng chọn tệp hình ảnh.');
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            notify('Ảnh bìa không được vượt quá 8MB.');
            return;
        }

        setCoverFile(file);
        setCover(URL.createObjectURL(file));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title.trim()) {
            notify('Vui lòng nhập tên truyện.');
            return;
        }

        if (selectedGenres.length === 0) {
            notify('Vui lòng chọn ít nhất một thể loại.');
            return;
        }

        const nextComic: Comic = {
            id: editingId ?? Date.now(),
            title: title.trim(),
            description: description.trim(),
            genres: selectedGenres,
            status: 'Bản nháp',
            chapters: editingId
                ? comics.find((comic) => comic.id === editingId)?.chapters ?? 0
                : 0,
            updated: 'Vừa cập nhật',
            views: editingId
                ? comics.find((comic) => comic.id === editingId)?.views ?? 0
                : 0,
            cover: cover || 'https://placehold.co/600x800/eef2ff/475569?text=Comic+Cover',
        };

        setComics((current) =>
            editingId
                ? current.map((comic) => comic.id === editingId ? { ...nextComic, status: comic.status } : comic)
                : [nextComic, ...current],
        );

        setDrawerOpen(false);
        notify(editingId ? 'Đã cập nhật thông tin truyện.' : 'Đã tạo bản nháp truyện mới.');
        setCoverFile(null);
    }

    function deleteComic(comic: Comic) {
        if (!window.confirm(`Bạn có chắc muốn xóa truyện "${comic.title}"?`)) return;
        setComics((current) => current.filter((item) => item.id !== comic.id));
        notify('Đã xóa truyện khỏi danh sách.');
    }

    function showReason(comic: Comic) {
        window.alert(comic.note || 'Chưa có phản hồi từ ban biên tập.');
    }

    return (
        <div className="comic-manager">
            <aside className="cm-sidebar">
                <a className="cm-brand" href="/">
                    <span className="cm-brand-icon">✦</span>
                    <span><b>ComicHub</b><small>Studio</small></span>
                </a>

                <div className="cm-workspace">
                    <span className="cm-workspace-icon">🎨</span>
                    <span><strong>Xưởng vẽ sáng tác</strong><small>Không gian tác giả</small></span>
                </div>

                <nav className="cm-nav">
                    <a href="/profile">Tổng quan</a>
                    <a className="active" href="/studio/comics">Quản lý truyện</a>
                    <a href="/studio/comics">Quản lý chương</a>
                    <a href="/studio/ai-assistant">Trợ lý AI <span className="cm-pro">PRO</span></a>
                </nav>

                <div className="cm-sidebar-bottom">
                    <div className="cm-storage">
                        <div className="cm-storage-label"><span>Dung lượng Studio</span><b>32%</b></div>
                        <div className="cm-progress"><span /></div>
                        <div className="cm-storage-meta"><span>3.2 GB</span><span>10 GB khả dụng</span></div>
                    </div>
                    <div className="cm-version"><span>Phiên bản</span><b>v2.5.0 Studio</b></div>
                </div>
            </aside>

            <div className="cm-main">
                <header className="cm-topbar">
                    <div className="cm-breadcrumb"><b>Studio</b><span>›</span><span>Bảng điều khiển sáng tác</span></div>
                    <div className="cm-top-actions">
                        <a className="cm-reader-link" href="/">↗ Trang đọc truyện ComicHub</a>
                        <button className="cm-icon-button" type="button" onClick={() => notify('Bạn không có thông báo mới.')}>♧<i>3</i></button>
                        <button className="cm-user" type="button" onClick={() => notify('Tài khoản tác giả Hoat')}>
                            <span className="cm-user-avatar">N</span>
                            <span><b>Hoat</b><small>Artist</small></span>
                            <span>⌄</span>
                        </button>
                    </div>
                </header>

                <main className="cm-content">
                    <div className="cm-page-heading">
                        <div>
                            <div className="cm-eyebrow">STUDIO <span>›</span> <b>QUẢN LÝ TÁC PHẨM</b></div>
                            <h1>Quản lý truyện</h1>
                            <p>Theo dõi, chỉnh sửa thông tin và tiến độ xuất bản các bộ truyện tranh của bạn trong xưởng sáng tác.</p>
                        </div>
                        <button className="cm-primary-button" type="button" onClick={openCreate}>＋ Tạo truyện mới</button>
                    </div>

                    <section className="cm-filter-panel">
                        <label className="cm-search">⌕
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm theo tên truyện, thể loại, từ khóa..." />
                        </label>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option>Tất cả trạng thái</option>
                            <option>Đã duyệt</option>
                            <option>Chờ duyệt</option>
                            <option>Bản nháp</option>
                            <option>Cần chỉnh sửa</option>
                        </select>
                        <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
                            <option>Tất cả thể loại</option>
                            {genres.map((genre) => <option key={genre}>{genre}</option>)}
                        </select>
                        <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            <option value="updated">Mới cập nhật nhất</option>
                            <option value="chapters">Số chương nhiều nhất</option>
                            <option value="views">Lượt đọc cao nhất</option>
                            <option value="name">Tên A - Z</option>
                        </select>
                        <div className="cm-view-toggle">
                            <button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')} type="button" title="Dạng lưới">▦</button>
                            <button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} type="button" title="Dạng bảng">☷</button>
                        </div>
                    </section>

                    <div className="cm-result-count">Hiển thị <b>{filteredComics.length}</b> / {comics.length} bộ truyện</div>

                    {filteredComics.length > 0 ? (
                        <section className={`cm-comic-grid ${view === 'list' ? 'list-view' : ''}`}>
                            {filteredComics.map((comic) => (
                                <article className="cm-comic-card" key={comic.id}>
                                    <div className="cm-cover-wrap">
                                        <img src={comic.cover} alt={`Bìa truyện ${comic.title}`} />
                                        <span className={`cm-status ${statusClass[comic.status]}`}>{comic.status}</span>
                                        <span className="cm-chapter-count">{comic.chapters} chương</span>
                                    </div>
                                    <div className="cm-card-info">
                                        <div className="cm-tags">{comic.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                                        <h2 title={comic.title}>{comic.title}</h2>
                                        <p className="cm-updated">◷ Cập nhật: {comic.updated}</p>
                                        {comic.note && <div className="cm-editor-note">ⓘ {comic.note}</div>}
                                    </div>
                                    <div className="cm-card-actions">
                                        <button className="cm-card-main-action" type="button" onClick={() => notify(`Mở quản lý chương: ${comic.title}`)}>
                                            {comic.status === 'Bản nháp' ? 'Soạn thảo chương' : 'Quản lý chương'}
                                        </button>
                                        <div className="cm-card-sub-actions">
                                            <button type="button" onClick={() => openEdit(comic)}>✎ Chỉnh sửa</button>
                                            {comic.status === 'Cần chỉnh sửa' ? (
                                                <button type="button" onClick={() => showReason(comic)}>ⓘ Xem lý do</button>
                                            ) : comic.status === 'Chờ duyệt' ? (
                                                <button type="button" onClick={() => notify('Truyện đang chờ ban biên tập xét duyệt.')}>◉ Xem xét duyệt</button>
                                            ) : (
                                                <button type="button" onClick={() => deleteComic(comic)}>⌫ Xóa</button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>
                    ) : (
                        <div className="cm-empty">
                            <span>⌕</span>
                            <h3>Không tìm thấy truyện phù hợp</h3>
                            <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                            <button type="button" onClick={() => { setSearch(''); setStatusFilter('Tất cả trạng thái'); setGenreFilter('Tất cả thể loại'); }}>Xóa bộ lọc</button>
                        </div>
                    )}

                    <section className="cm-bottom-stats">
                        <div className="cm-stat-card"><span className="cm-stat-icon blue">▤</span><div><b>{comics.length} Bộ truyện</b><small>{totalChapters} chương hiện có</small></div></div>
                        <div className="cm-stat-card"><span className="cm-stat-icon purple">◉</span><div><b>{(totalViews / 1000).toFixed(1)}K</b><small>Lượt xem tích lũy toàn bộ truyện</small></div></div>
                        <div className="cm-ai-banner"><div><b>✧ TRỢ LÝ AI SÁNG TẠO</b><strong>Tối ưu kịch bản & phân cảnh</strong><small>Phát triển ý tưởng và phác thảo storyboard.</small></div><a href="/studio/ai-assistant">Thử ngay →</a></div>
                    </section>
                </main>
            </div>

            {drawerOpen && (
                <div className="cm-drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}>
                    <form className="cm-drawer" onSubmit={handleSubmit}>
                        <div className="cm-drawer-header">
                            <div><small>BIÊN TẬP TÁC PHẨM</small><h2>{editingId ? 'Chỉnh sửa truyện' : 'Tạo truyện mới'}</h2></div>
                            <button type="button" onClick={() => setDrawerOpen(false)}>×</button>
                        </div>

                        <div className="cm-drawer-body">
                            <div className="cm-form-group">
                                <label htmlFor="comic-title">Tên bộ truyện <b>*</b></label>
                                <input id="comic-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tên truyện hấp dẫn và ngắn gọn..." required />
                                <small>Tên truyện nên ngắn gọn và dễ nhớ.</small>
                            </div>

                            <div className="cm-form-group">
                                <label>Ảnh bìa tác phẩm (tỉ lệ khuyên dùng 3:4)</label>
                                <input ref={fileInput} className="cm-hidden-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverChange} />
                                <div className="cm-cover-upload">
                                    <div className="cm-upload-box" onClick={() => fileInput.current?.click()}>
                                        <span>⇧</span><b>Tải ảnh bìa từ máy tính</b>
                                        <small>JPG, PNG, WebP · Tối đa 8MB</small>
                                        <button type="button">Chọn tệp</button>
                                        {coverFile && <small>{coverFile.name}</small>}
                                    </div>
                                    <div className="cm-cover-preview">
                                        {cover ? <img src={cover} alt="Xem trước ảnh bìa" /> : <span>Ảnh xem trước</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="cm-form-group">
                                <label>Thể loại chính & phụ <b>*</b></label>
                                <div className="cm-genre-options">
                                    {genres.map((genre) => (
                                        <button key={genre} type="button" className={selectedGenres.includes(genre) ? 'chosen' : ''} onClick={() => toggleGenre(genre)}>
                                            {selectedGenres.includes(genre) ? '✓ ' : '+ '}{genre}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="cm-form-group">
                                <label htmlFor="comic-description">Mô tả / Tóm tắt truyện</label>
                                <textarea id="comic-description" rows={5} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Viết đoạn giới thiệu ngắn gọn, lôi cuốn..." />
                                <div className="cm-char-count">{description.length} / 500 ký tự</div>
                            </div>

                            <div className="cm-schedule-box"><b>◷ Lịch phát hành định kỳ</b><span>Thứ 6 hàng tuần</span><p>Lịch ra chương đều đặn giúp độc giả dễ theo dõi tác phẩm của bạn.</p></div>
                        </div>

                        <div className="cm-drawer-footer">
                            <button type="button" className="cm-cancel-button" onClick={() => setDrawerOpen(false)}>Hủy bỏ</button>
                            <button type="submit" className="cm-save-button">Lưu bản nháp</button>
                        </div>
                    </form>
                </div>
            )}

            {toast && <div className="cm-toast">{toast}</div>}
        </div>
    );
}
