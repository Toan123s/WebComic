
import { useMemo, useRef, useState } from 'react';
import './ChapterManagementPage.css';

type ChapterStatus = 'Bản nháp' | 'Đã xuất bản' | 'Chờ duyệt lại';

type Chapter = {
    id: number;
    title: string;
    status: ChapterStatus;
    pages: number;
    date: string;
    reads: string;
};

type ComicPage = {
    id: number;
    name: string;
    src: string;
};

const initialChapters: Chapter[] = [
    {
        id: 35,
        title: 'Lối Thoát Sinh Tồn',
        status: 'Bản nháp',
        pages: 4,
        date: 'Vừa chỉnh sửa',
        reads: '-',
    },
    {
        id: 34,
        title: 'Cấm Địa Thần Binh',
        status: 'Đã xuất bản',
        pages: 28,
        date: '14/10/2024',
        reads: '4.8k',
    },
    {
        id: 33,
        title: 'Quyết Chiến Hắc Phong Cốc',
        status: 'Đã xuất bản',
        pages: 32,
        date: '07/10/2024',
        reads: '5.2k',
    },
    {
        id: 32,
        title: 'Thần Thú Thức Giác',
        status: 'Chờ duyệt lại',
        pages: 26,
        date: '02/10/2024',
        reads: '-',
    },
    {
        id: 31,
        title: 'Ẩn Long Khởi Sắc',
        status: 'Đã xuất bản',
        pages: 24,
        date: '25/09/2024',
        reads: '6.1k',
    },
];

const initialPages: ComicPage[] = [
    {
        id: 1,
        name: 'chap35_p01.png',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnt75Sx2G8RF1ev4MfDeTn-QrF5HyAbJ1SXs3HZUEfmc20vAE5AwAUKQoMEB2pvxpA6l4CwvyPsc6arNpRJ1Z2TVlIfKsuOA3IId9NyQ6n82MgdMvmeDENnMrKicUwe5j6CyLr3JE2xwtvvIRhKkQ5uYgDAvKi-CErTh5y9fb0tUCKkAudennlRNwNICm1WFqXeBMSoTSRufNlZik0qp7A0ULCG7g8Z0MMsTCFTtxgxVGvD079V-Jk',
    },
    {
        id: 2,
        name: 'chap35_p02.png',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc0mvTWGwADbKzjCwYM9ehypIGUDXCNj2sfgxtyyQRdGAHou3JJmky4IM55KuKpMzXKlMmNPVefjxvxqy_gtU7fp7HsGSL-w9T_zMSMGtbhR7KVtVHQcsj06ePY69CpbDIiGim2IAxCL7w91LAjNNFTwbfPRLomLeyndUpN5uBDj3GGnbAwAl5GCuV-rFB9-AsXVM7K5Eww6siktkC_EBDF_gt7WIRcLAn66Poozy9i2zLN2-hmJss',
    },
    {
        id: 3,
        name: 'chap35_p03.png',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbCLKeexK4eDYRZXZ4XwtIyMOBKv4tnjAv9S_8wcP-w2jJ4ukKQNCyTVsMyPNZbY8Qnm5yZQWB2D8DNCsQZ3usbjr46z6FQ07lHauZ7Ba56_2wO-31InIaGXxety_x_oBi4kHYXe5GyJ1f4ZoxMMbYqba3HnERUiMyyh8R_NdKHd0xJtrKdGCYT0uhoX8qGY3XKyZzV1lWwTGl6wEGc7Zuq0fGtMItk7HrKipXwN-80u-eiV0T2MYw',
    },
    {
        id: 4,
        name: 'chap35_p04.webp',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoNWPQ8H-koPAyeaZ_rg59658rPoIkafqbeJM9IY_2qfgH59z8ne-9ZZHg0MtKJ7PEIlSsDR7Ri8I4BEiykt-YATjLUI3dL8cP0iX2cEO9uFtfoOr5lIzUBM2jQMeNxQbBuY9d4nV-BpX3Y3JmEV55mP78wPwTMShy8Tb-TlwNsxWQiINFAbOMecUclU5C88UgoNtK024H2LzVRbJ2qHDBOV_6NmZCPQJ7lF4rXrcbCoGyv5R1jzLi',
    },
];

const suggestedDialogue =
    'Bước qua lằn ranh này, thứ rơi xuống mặt đất sẽ không còn là tuyết trắng... mà là thủ cấp của ngươi!';

function ChapterManagementPage() {
    const [chapters, setChapters] = useState(initialChapters);
    const [selectedChapter, setSelectedChapter] = useState(35);
    const [search, setSearch] = useState('');
    const [chapterNumber, setChapterNumber] = useState('35');
    const [chapterTitle, setChapterTitle] = useState('Lối Thoát Sinh Tồn');
    const [authorNote, setAuthorNote] = useState(
        'Cảm ơn mọi người đã chờ đợi! Chương 35 này mình vẽ các phân cảnh hành động liên tục trong 5 ngày. Mong độc giả thích bước ngoặt mới của nhân vật chính!',
    );
    const [dialogue, setDialogue] = useState(
        '"Nếu ngươi còn bước thêm một bước nữa qua làn ranh kiếm này, ta không dám chắc thứ rơi xuống là tuyết hay là đầu của ngươi."',
    );
    const [pages, setPages] = useState(initialPages);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [spacing, setSpacing] = useState(0);
    const [toast, setToast] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(suggestedDialogue);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredChapters = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return chapters;

        return chapters.filter(
            (chapter) =>
                chapter.title.toLowerCase().includes(keyword) ||
                String(chapter.id).includes(keyword),
        );
    }, [chapters, search]);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2800);
    };

    const selectChapter = (chapter: Chapter) => {
        setSelectedChapter(chapter.id);
        setChapterNumber(String(chapter.id));
        setChapterTitle(chapter.title);
        setAuthorNote('');
    };

    const handleUpload = (files: FileList | null) => {
        if (!files) return;

        const validFiles = Array.from(files).filter((file) => {
            if (!file.type.startsWith('image/')) {
                showToast('Chỉ chấp nhận tập tin hình ảnh.');
                return false;
            }

            if (file.size > 50 * 1024 * 1024) {
                showToast(`${file.name} vượt quá giới hạn 50MB.`);
                return false;
            }

            return true;
        });

        const newPages = validFiles.map((file) => ({
            id: Date.now() + Math.random(),
            name: file.name,
            src: URL.createObjectURL(file),
        }));

        setPages((current) => [...current, ...newPages]);

        if (newPages.length > 0) {
            showToast(`Đã thêm ${newPages.length} trang ảnh vào bản xem trước.`);
        }
    };

    const movePage = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= pages.length) return;

        setPages((current) => {
            const updated = [...current];
            [updated[index], updated[target]] = [updated[target], updated[index]];
            return updated;
        });
    };

    const removePage = (id: number) => {
        setPages((current) => current.filter((page) => page.id !== id));
        showToast('Đã xóa trang khỏi bản xem trước.');
    };

    const handleAnalyze = () => {
        setAiLoading(true);

        window.setTimeout(() => {
            setAiResult(suggestedDialogue);
            setAiLoading(false);
            showToast('Đã tạo gợi ý lời thoại mẫu.');
        }, 650);
    };

    const saveDraft = () => {
        showToast('Đã lưu trạng thái bản nháp trên giao diện thử nghiệm.');
    };

    const submitForReview = () => {
        if (!chapterTitle.trim()) {
            showToast('Vui lòng nhập tiêu đề chương.');
            return;
        }

        if (pages.length === 0) {
            showToast('Bạn cần thêm ít nhất một trang truyện.');
            return;
        }

        showToast('Đây là bản mô phỏng: chức năng gửi duyệt chưa kết nối API.');
    };

    const applySuggestion = () => {
        setDialogue(aiResult);
        showToast('Đã áp dụng gợi ý vào ô lời thoại.');
    };

    const copySuggestion = async () => {
        try {
            await navigator.clipboard.writeText(aiResult);
            showToast('Đã sao chép lời thoại.');
        } catch {
            showToast('Trình duyệt không cho phép sao chép tự động.');
        }
    };

    const addNewChapter = () => {
        const nextId = Math.max(...chapters.map((chapter) => chapter.id), 0) + 1;

        const newChapter: Chapter = {
            id: nextId,
            title: 'Chương mới',
            status: 'Bản nháp',
            pages: 0,
            date: 'Vừa tạo',
            reads: '-',
        };

        setChapters((current) => [newChapter, ...current]);
        setSelectedChapter(nextId);
        setChapterNumber(String(nextId));
        setChapterTitle('Chương mới');
        setAuthorNote('');
        setPages([]);
        showToast(`Đã tạo bản nháp chương ${nextId}.`);
    };

    return (
        <div className="chapter-studio">
            <aside className="chapter-sidebar">
                <div className="chapter-brand">
                    <div className="chapter-brand-mark">C</div>
                    <div>
                        <div className="chapter-brand-name">
                            ComicHub <span>Studio</span>
                        </div>
                        <div className="chapter-brand-label">Không gian Tác giả</div>
                    </div>
                </div>

                <div className="chapter-workspace-label">
                    <span>🎨</span> Xưởng vẽ Sáng tác
                </div>

                <nav className="chapter-nav">
                    <a href="/studio">Tổng quan</a>
                    <a href="/studio/comics">Quản lý truyện</a>
                    <a className="active" href="/studio/chapters">
                        Quản lý chương
                    </a>
                    <a href="/studio/ai-assistant">
                        Trợ lý AI <span className="pro-label">PRO</span>
                    </a>
                    <a href="/studio/profile">Hồ sơ cá nhân</a>
                </nav>

                <div className="chapter-sidebar-bottom">
                    <div className="storage-card">
                        <div className="storage-heading">
                            <span>Dung lượng Studio</span>
                            <strong>32%</strong>
                        </div>
                        <div className="storage-track">
                            <div />
                        </div>
                        <div className="storage-values">
                            <span>3.2 GB</span>
                            <span>10 GB khả dụng</span>
                        </div>
                    </div>
                    <div className="chapter-version">
                        <span>Phiên bản</span>
                        <strong>v2.5.0 Studio</strong>
                    </div>
                </div>
            </aside>

            <div className="chapter-main">
                <header className="chapter-topbar">
                    <div className="chapter-breadcrumb">
                        <strong>Studio</strong>
                        <span>›</span>
                        <span>Quản lý chương</span>
                    </div>

                    <div className="chapter-topbar-right">
                        <a className="reader-link" href="/">
                            ↗ Trang Đọc Truyện ComicHub
                        </a>
                        <button
                            className="notification-button"
                            type="button"
                            onClick={() => showToast('Bạn hiện không có thông báo mới.')}>
                            ♧ <span>3</span>
                        </button>
                        <a className="chapter-user" href="/studio/profile">
                            <div className="chapter-avatar">H</div>
                            <div>
                                <strong>Hoạt</strong>
                                <small>Artist</small>
                            </div>
                            <span>⌄</span>
                        </a>
                    </div>
                </header>

                <main className="chapter-content">
                    <section className="chapter-heading">
                        <div className="chapter-heading-info">
                            <a className="back-button" href="/studio/comics" title="Quay lại">
                                ←
                            </a>
                            <div className="comic-cover-placeholder">玄</div>
                            <div>
                                <div className="chapter-title-line">
                                    <h1>Huyền Vũ Ký Sự</h1>
                                    <span className="chapter-count">34 chương phát hành</span>
                                    <span className="published-label">Đã xuất bản</span>
                                </div>
                                <p>
                                    Tác giả: Hoạt <span>•</span> Thể loại: Huyền huyễn • Võ thuật
                                    Webtoon <span>•</span> <b>ID: #HVKS-8902</b>
                                </p>
                            </div>
                        </div>

                        <div className="chapter-heading-actions">
                            <button
                                className="button button-soft"
                                type="button"
                                onClick={() => setPreviewOpen(true)}>
                                ▣ Xem trước Webtoon
                            </button>
                            <button
                                className="button button-primary"
                                type="button"
                                onClick={addNewChapter}>
                                ＋ Thêm chương mới
                            </button>
                        </div>
                    </section>

                    <div className="chapter-workspace">
                        <aside className="chapter-left-column">
                            <section className="panel chapter-list-panel">
                                <div className="panel-heading">
                                    <h2>☷ Danh sách chương</h2>
                                    <span className="chapter-total">{chapters.length} tập</span>
                                </div>

                                <div className="chapter-search">
                                    <span>⌕</span>
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Tìm theo tên chương, số tập..."
                                    />
                                </div>

                                <div className="chapter-list">
                                    {filteredChapters.map((chapter) => (
                                        <button
                                            className={`chapter-list-item ${
                                                selectedChapter === chapter.id ? 'selected' : ''
                                            }`}
                                            key={chapter.id}
                                            type="button"
                                            onClick={() => selectChapter(chapter)}>
                                            <div className="chapter-item-top">
                                                <span className="chapter-number">#Chap {chapter.id}</span>
                                                <span
                                                    className={`status-label ${
                                                        chapter.status === 'Đã xuất bản'
                                                            ? 'status-published'
                                                            : chapter.status === 'Chờ duyệt lại'
                                                                ? 'status-review'
                                                                : 'status-draft'
                                                    }`}>
                          {chapter.status}
                        </span>
                                            </div>
                                            <strong>{chapter.title}</strong>
                                            <div className="chapter-item-meta">
                                                <span>▤ {chapter.pages} trang</span>
                                                <span>•</span>
                                                <span>{chapter.date}</span>
                                            </div>
                                            {chapter.reads !== '-' && (
                                                <div className="chapter-reads">{chapter.reads} lượt đọc</div>
                                            )}
                                        </button>
                                    ))}

                                    {filteredChapters.length === 0 && (
                                        <div className="chapter-empty">
                                            Không tìm thấy chương phù hợp.
                                        </div>
                                    )}
                                </div>

                                <div className="autosave-note">
                                    <span>☁</span>
                                    <span>Tự động lưu bản thảo</span>
                                    <strong>Đang bật</strong>
                                </div>
                            </section>

                            <section className="creator-notice">
                                <h3>✎ Tác quyền vẽ minh họa</h3>
                                <p>
                                    ComicHub hỗ trợ bản vẽ từ Clip Studio Paint, Photoshop và
                                    Procreate. Bạn có thể tải lên ảnh PNG, JPG hoặc WebP để xem
                                    trước bố cục Webtoon.
                                </p>
                            </section>
                        </aside>

                        <section className="chapter-right-column">
                            <section className="panel chapter-editor-panel">
                                <div className="editor-heading">
                                    <h2>● Chỉnh sửa nội dung • Chương {chapterNumber}</h2>
                                    <span className="draft-badge">BẢN THẢO CHƯA CÔNG KHAI</span>
                                </div>

                                <div className="chapter-fields">
                                    <label>
                                        <span>Số thứ tự chương</span>
                                        <div className="number-input">
                                            <b>#</b>
                                            <input
                                                value={chapterNumber}
                                                onChange={(event) => setChapterNumber(event.target.value)}
                                                inputMode="numeric"
                                            />
                                        </div>
                                    </label>

                                    <label>
                                        <span>Tiêu đề chương</span>
                                        <input
                                            value={chapterTitle}
                                            onChange={(event) => setChapterTitle(event.target.value)}
                                            placeholder="Nhập tiêu đề chương..."
                                        />
                                    </label>
                                </div>

                                <label className="author-note-field">
                                    <span>Lời nhắn của tác giả gửi độc giả</span>
                                    <textarea
                                        rows={3}
                                        value={authorNote}
                                        onChange={(event) => setAuthorNote(event.target.value)}
                                        placeholder="Viết lời nhắn gửi độc giả ở cuối chương..."
                                    />
                                </label>
                            </section>

                            <section className="panel upload-panel">
                                <div className="upload-heading">
                                    <div>
                                        <h2>⇧ Danh sách trang vẽ Webtoon</h2>
                                        <p>
                                            Tải lên các trang vẽ từ máy tính. Dùng nút mũi tên để sắp
                                            xếp thứ tự đọc.
                                        </p>
                                    </div>
                                    <span className="page-count">▧ {pages.length} trang</span>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    className="visually-hidden"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    multiple
                                    onChange={(event) => {
                                        handleUpload(event.target.files);
                                        event.target.value = '';
                                    }}
                                />

                                <div
                                    className="upload-dropzone"
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        handleUpload(event.dataTransfer.files);
                                    }}>
                                    <div className="upload-icon">▧</div>
                                    <strong>Kéo thả tập tin trang tranh vào đây</strong>
                                    <p>Hỗ trợ PNG, JPG, WebP • Tối đa 50MB mỗi ảnh</p>
                                    <button
                                        className="button button-soft"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}>
                                        ▣ Duyệt thư mục máy tính
                                    </button>
                                </div>

                                <div className="page-strip-heading">
                                    <strong>THỨ TỰ TRANG HIỂN THỊ ({pages.length} trang)</strong>
                                    <span>Dùng nút mũi tên để đổi vị trí</span>
                                </div>

                                <div className="page-grid">
                                    {pages.map((page, index) => (
                                        <article className="page-card" key={page.id}>
                                            <div className="page-image">
                                                <img src={page.src} alt={`Trang ${index + 1}`} />
                                                <span className="page-index">
                          Trang {String(index + 1).padStart(2, '0')}
                        </span>
                                                <button
                                                    className="page-zoom"
                                                    type="button"
                                                    title="Phóng to"
                                                    onClick={() => setPreviewImage(page.src)}>
                                                    ⌕
                                                </button>
                                            </div>
                                            <div className="page-card-footer">
                                                <span title={page.name}>{page.name}</span>
                                                <div>
                                                    <button
                                                        type="button"
                                                        title="Chuyển sang trái"
                                                        disabled={index === 0}
                                                        onClick={() => movePage(index, -1)}>
                                                        ←
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Chuyển sang phải"
                                                        disabled={index === pages.length - 1}
                                                        onClick={() => movePage(index, 1)}>
                                                        →
                                                    </button>
                                                    <button
                                                        className="delete-page"
                                                        type="button"
                                                        title="Xóa trang"
                                                        onClick={() => removePage(page.id)}>
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {pages.length === 0 && (
                                    <div className="chapter-empty">
                                        Chưa có trang tranh. Hãy tải ảnh lên để bắt đầu.
                                    </div>
                                )}
                            </section>

                            <section className="panel dialogue-panel">
                                <div className="dialogue-heading">
                                    <h2>✧ Hỗ trợ kịch bản &amp; lời thoại</h2>
                                    <span>TRỢ LÝ VĂN BẢN MÔ PHỎNG</span>
                                </div>
                                <p>
                                    Nhập lời thoại của bạn để xem gợi ý chỉnh sửa. Nội dung gợi ý
                                    không tự động thay đổi bản nháp.
                                </p>

                                <div className="dialogue-grid">
                                    <div className="dialogue-input-area">
                                        <label htmlFor="dialogue-input">
                                            Lời thoại nháp của tác giả
                                        </label>
                                        <textarea
                                            id="dialogue-input"
                                            rows={5}
                                            value={dialogue}
                                            onChange={(event) => setDialogue(event.target.value)}
                                        />
                                        <button
                                            className="button button-tertiary"
                                            type="button"
                                            onClick={handleAnalyze}
                                            disabled={aiLoading}>
                                            {aiLoading ? '◌ Đang phân tích...' : '✧ Chuốt thoại kịch tính hơn'}
                                        </button>
                                    </div>

                                    <div className="dialogue-suggestion">
                                        <strong>✦ Gợi ý lời thoại mẫu</strong>
                                        <blockquote>{aiResult}</blockquote>
                                        <div className="suggestion-actions">
                                            <button
                                                className="button button-soft"
                                                type="button"
                                                onClick={copySuggestion}>
                                                Sao chép
                                            </button>
                                            <button
                                                className="button button-primary"
                                                type="button"
                                                onClick={applySuggestion}>
                                                ✓ Áp dụng vào bản nháp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="chapter-footer-actions">
                                <div>
                                    <span>✓</span>
                                    <strong>{pages.length} trang đang có trong bản xem trước</strong>
                                </div>
                                <div className="footer-buttons">
                                    <button
                                        className="button button-soft"
                                        type="button"
                                        onClick={saveDraft}>
                                        Lưu bản nháp
                                    </button>
                                    <button
                                        className="button button-outline"
                                        type="button"
                                        onClick={() => setPreviewOpen(true)}>
                                        ▣ Xem trước Webtoon
                                    </button>
                                    <button
                                        className="button button-primary"
                                        type="button"
                                        onClick={submitForReview}>
                                        ↑ Gửi kiểm duyệt
                                    </button>
                                </div>
                            </section>
                        </section>
                    </div>
                </main>
            </div>

            {previewOpen && (
                <div className="webtoon-modal">
                    <header className="webtoon-modal-header">
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(false)}>
                            ← Quay lại chỉnh sửa
                        </button>
                        <strong>
                            Chương {chapterNumber}: {chapterTitle}
                        </strong>
                        <div className="preview-spacing">
                            <span>Khoảng cách:</span>
                            {[0, 8, 16].map((value) => (
                                <button
                                    className={spacing === value ? 'chosen' : ''}
                                    key={value}
                                    type="button"
                                    onClick={() => setSpacing(value)}>
                                    {value}px
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="webtoon-scroll">
                        <div className="webtoon-pages" style={{ gap: `${spacing}px` }}>
                            {pages.map((page, index) => (
                                <img
                                    key={page.id}
                                    src={page.src}
                                    alt={`Trang ${index + 1}`}
                                />
                            ))}
                            {pages.length === 0 && (
                                <p>Chưa có trang truyện để xem trước.</p>
                            )}
                        </div>
                        <div className="webtoon-ending">
                            <h2>Hết chương {chapterNumber}</h2>
                            <p>{chapterTitle}</p>
                            <button
                                className="button button-primary"
                                type="button"
                                onClick={() => setPreviewOpen(false)}>
                                Quay lại chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div
                    className="image-lightbox"
                    onClick={() => setPreviewImage(null)}>
                    <button
                        type="button"
                        aria-label="Đóng ảnh"
                        onClick={() => setPreviewImage(null)}>
                        ×
                    </button>
                    <img
                        src={previewImage}
                        alt="Xem phóng to trang truyện"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}

            {toast && <div className="chapter-toast">{toast}</div>}
        </div>
    );
}

export default ChapterManagementPage;
