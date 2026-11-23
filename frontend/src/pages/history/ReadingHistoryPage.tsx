
import { useMemo, useState } from 'react';
import './ReadingHistoryPage.css';

type ReadingStatus = 'Đang đọc' | 'Đã hoàn thành' | 'Tạm dừng';

type Comic = {
    id: number;
    title: string;
    chapter: string;
    totalChapters: number;
    progress: number;
    status: ReadingStatus;
    lastRead: string;
    image: string;
};

const initialComics: Comic[] = [
    {
        id: 1,
        title: 'The Last Crimson Moon',
        chapter: 'Chương 25',
        totalChapters: 40,
        progress: 62,
        status: 'Đang đọc',
        lastRead: '12 phút trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCO1tiMXUBnus4JCiK6pg3d_e-NYo3DISyfZWZdiMuLQ21qR4eHqr77zIpk25aF27rok3Zz72tG536z4zWyAjLNcw8kNbmpaYivNzCw8-nILRqsZmZY-Rfs9SUoMUACwEQ7AySFPZBpSDza9Ext4zBIxjMMc3ixKw31Uzk1H5Q9NFeO1cd3HP-qhXBwApvbGGwmwAH3OB_IvuB62BhEcIur3Uu8CQJsyfFu6mOC3mbFYquR_btkO5xAg',
    },
    {
        id: 2,
        title: 'Hành Trình Của Kẻ Bất Tử',
        chapter: 'Chương 104',
        totalChapters: 120,
        progress: 86,
        status: 'Đang đọc',
        lastRead: '45 phút trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7xK3I_CGmd6YpfTabHzPW58AE7lO3CMUwxDIzSsCfwNGIVHf2UJj22PRmrixdiL6stT37QYPTTeXoCZ4UoW75gGhUg0nxjhSgPnMB1OarAbwcnAKTuV_Yhm03YpYUOFRoJcTr4AQm6Rh3Z741QnfJYFss5np9RsFi-E2K6aNG2wn0td0r_7w3Ynr8vz43CkZzjboGiWmBI-a8lOanCwd0wCVoKAO64MWi4qVIl6bYcFWqohlXQRuP5A',
    },
    {
        id: 3,
        title: 'Thanh Xuân Trong Mắt Em',
        chapter: 'Chương 42',
        totalChapters: 42,
        progress: 100,
        status: 'Đã hoàn thành',
        lastRead: 'Hôm qua',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzrk7LK3WlupLj3s5iFOa2s7nEdfnhP7LN0p7hB4Pd9M-yC0JZ-WrjrR7gDoPUhZRTC0LBpKLyaH4Av8Uf58HQKVSTVB0DS1ylEp2m9Yswdh6oRWF6vAUF4b5t-AXgpsS7Mx0U8ASQ1h41zPsYut9BHY8RrRWtNJsMtEUK1UttAQ-5nwlxW9r7ZOu1D5j1CEye77cWzpt7kFJhQ9foZSskOEJKv4dk8AN3i8oB8seftG9au9XY2IrFrg',
    },
    {
        id: 4,
        title: 'Đế Quốc Bóng Tối',
        chapter: 'Chương 63',
        totalChapters: 88,
        progress: 72,
        status: 'Tạm dừng',
        lastRead: '2 ngày trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMoQEA_O54r7SQFJlVwHholsJ46ISw5cy_O8DPwW2kzDLFCmajOcTGGhP22sWNDjF8bT-1Ot9C4H_8kRNxUj_sE1wxiURZVtxfPjJ4qYiHzQJYmvU3JENW_1fqfdaUGuHWTtqJhcwQKufIpxMfbBeykxRVGesjcCQGk1n6EYxUYilsZb3NxB9udiaBhsHOpkjMzDkWAb-0m4WodVityfjZ132btSOcevGHgvoCXDMGmp5FSFFNhTWZUg',
    },
    {
        id: 5,
        title: 'Tiệm Bánh Của Mèo Con',
        chapter: 'Chương 15',
        totalChapters: 15,
        progress: 100,
        status: 'Đã hoàn thành',
        lastRead: '3 ngày trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9InFtY08wbB9fp-XR_4bPZ21jkO0CQ6VcyWRnyPRhOhWrV-XQGN7WUCSokA29uVy0rNa4nHSdm4naq6ALOKCG1U6Z3o5pYxu1o1CKDs_gLXxXDB5q0MO-qFmLV_jgc-VEoRvx0tgJw6GgIei_9EdabQ36S1KvxNchEiY8qp6VF_TYIaGP9-6A_WE6IEBq8q2SQwv_SwClnrxE6x1lLyozr-QHMgoYu4wFPZwacHF-eNCbcfuyu15yTg',
    },
    {
        id: 6,
        title: 'Hoa Nở Trong Bóng Tối',
        chapter: 'Chương 56',
        totalChapters: 70,
        progress: 80,
        status: 'Đang đọc',
        lastRead: '4 ngày trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD13afB7SII8wE0MWxtut3yGnMKkDMFqQW2brXORActyOMDtFDhjFPxs10nfibwsm_-oDz3rXyq4RnnU4szRa2VUsHETl8Co9Fk0DTJNBDANLk_zH7fidhL9tZRF2kUzhOxgAG0zLPopk7B9DI3P4vbc7A0gOyoSt205_ebAyCFM0VgDcgPcbMWvCfqhKDeHRjwvePD7Q6dTNi65PDn3NYVPZXl_Ez_myLik4NZXCCYrDvWFK47H-qGTA',
    },
    {
        id: 7,
        title: 'Long Vương Thức Tỉnh',
        chapter: 'Chương 182',
        totalChapters: 200,
        progress: 91,
        status: 'Đang đọc',
        lastRead: '5 ngày trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgPdUMpRiCf1ugeSXsTYol4aeNdGTLw9UESOkVD6zx0NNklOdz6arMjeL_EXcclG_KwB9RQm0x1Sua3_He7CKObNy0ust4x8PY8g0oizoQOJwABF_XeujaG0t7CbfAP25qQZM6uAUWt_9rlT94o5vA5fehZvg1WwLtpfJyrbEDnYEUenUIcskEPBhh2V4bkcM184r4dpvIyuclABuEVYf4xdYb4NPLErazMpzkvrkj9qu2eqZrXnp43Q',
    },
    {
        id: 8,
        title: 'Tuyệt Kiếm Vô Song',
        chapter: 'Chương 95',
        totalChapters: 110,
        progress: 86,
        status: 'Tạm dừng',
        lastRead: '1 tuần trước',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzyb-ropmA7HC_dzBthpKt88DRHJBinhsLmjBnvTjG9HL6iRoo8VjaCcgoHWsqQ_lmSyS3sPFQHxy-83O6LJQrXpIgZu7AAdpw2H915_gJm2YrlpVW080PwEGbMg83v9b46-og_qwsHvL9VfI8ZY8Pk5Mue6ZistKcDJ4l072nwEYk3Q_u1bo8B0CAcLJe7warvxkP31lrKfh4k1gDHLppxHDA5-RaPbRBA2FDXZZvpeQWPs1Z4PiyEQ',
    },
];

const filters = ['Tất cả', 'Đang đọc', 'Đã hoàn thành', 'Tạm dừng'];

function Icon({ children }: { children: string }) {
    return <span className="material-symbols-outlined">{children}</span>;
}

export default function ReadingHistoryPage() {
    const [comics, setComics] = useState(initialComics);
    const [filter, setFilter] = useState('Tất cả');
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const filteredComics = useMemo(
        () => filter === 'Tất cả'
            ? comics
            : comics.filter((comic) => comic.status === filter),
        [comics, filter],
    );

    const completedCount = comics.filter((comic) => comic.status === 'Đã hoàn thành').length;

    function removeComic(id: number) {
        setComics((current) => current.filter((comic) => comic.id !== id));
        setOpenMenu(null);
    }

    function clearHistory() {
        setComics([]);
        setShowConfirm(false);
    }

    return (
        <div className="history-page">
            <header className="history-header">
                <div className="history-header-inner">
                    <a className="history-brand" href="/">
                        <span className="history-brand-icon"><Icon>auto_stories</Icon></span>
                        <span>Comic<span>Hub</span></span>
                    </a>

                    <nav className="history-nav">
                        <a href="/">Trang chủ</a>
                        <a href="/#latest">Truyện mới cập nhật</a>
                        <a className="active" href="/history">Lịch sử đọc</a>
                    </nav>

                    <div className="history-header-actions">
                        <a className="history-notification" href="/history" aria-label="Thông báo">
                            <Icon>notifications</Icon>
                        </a>
                        <a className="history-avatar" href="/login" aria-label="Tài khoản">H</a>
                    </div>
                </div>
            </header>

            <main className="history-main">
                <div className="history-breadcrumb">
                    <a href="/">Trang chủ</a>
                    <Icon>chevron_right</Icon>
                    <span>Lịch sử đọc</span>
                </div>

                <section className="history-heading">
                    <div>
                        <p className="history-eyebrow">THƯ VIỆN CỦA BẠN</p>
                        <h1>Lịch sử đọc</h1>
                        <p className="history-subtitle">
                            Theo dõi hành trình khám phá thế giới truyện tranh của bạn.
                        </p>
                    </div>
                    <button
                        className="history-clear-button"
                        onClick={() => setShowConfirm(true)}
                        disabled={comics.length === 0}
                    >
                        <Icon>delete_sweep</Icon>
                        Xóa toàn bộ lịch sử
                    </button>
                </section>

                <section className="history-stats">
                    <article className="history-stat-card">
                        <span className="history-stat-icon"><Icon>menu_book</Icon></span>
                        <div>
                            <p>Tổng số truyện</p>
                            <strong>{comics.length}</strong>
                            <span>Truyện trong lịch sử</span>
                        </div>
                    </article>
                    <article className="history-stat-card">
                        <span className="history-stat-icon"><Icon>task_alt</Icon></span>
                        <div>
                            <p>Đã hoàn thành</p>
                            <strong>{completedCount}</strong>
                            <span>Truyện đã đọc xong</span>
                        </div>
                    </article>
                    <article className="history-stat-card">
                        <span className="history-stat-icon"><Icon>schedule</Icon></span>
                        <div>
                            <p>Thời gian đọc</p>
                            <strong>12h 45m</strong>
                            <span>Tổng thời gian ước tính</span>
                        </div>
                    </article>
                </section>

                <section className="history-list-section">
                    <div className="history-list-heading">
                        <div>
                            <h2>Truyện đã đọc gần đây</h2>
                            <p>{filteredComics.length} truyện được hiển thị</p>
                        </div>
                        <div className="history-filter">
                            {filters.map((item) => (
                                <button
                                    key={item}
                                    className={filter === item ? 'selected' : ''}
                                    onClick={() => setFilter(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredComics.length > 0 ? (
                        <div className="history-grid">
                            {filteredComics.map((comic) => (
                                <article className="history-card" key={comic.id}>
                                    <div className="history-cover-wrap">
                                        <img src={comic.image} alt={comic.title} className="history-cover" />
                                        <span className={`history-status ${comic.status === 'Đã hoàn thành' ? 'completed' : comic.status === 'Tạm dừng' ? 'paused' : ''}`}>
                                            {comic.status}
                                        </span>
                                        <button
                                            className="history-menu-button"
                                            aria-label={`Tùy chọn ${comic.title}`}
                                            onClick={() => setOpenMenu(openMenu === comic.id ? null : comic.id)}
                                        >
                                            <Icon>more_vert</Icon>
                                        </button>
                                        {openMenu === comic.id && (
                                            <div className="history-menu">
                                                <button onClick={() => removeComic(comic.id)}>
                                                    <Icon>delete</Icon>
                                                    Xóa khỏi lịch sử
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="history-card-content">
                                        <h3>{comic.title}</h3>
                                        <div className="history-chapter-row">
                                            <span>{comic.chapter} / {comic.totalChapters}</span>
                                            <strong>{comic.progress}%</strong>
                                        </div>
                                        <div className="history-progress">
                                            <span style={{ width: `${comic.progress}%` }} />
                                        </div>
                                        <div className="history-card-footer">
                                            <span><Icon>schedule</Icon>{comic.lastRead}</span>
                                            <a href="/comic/the-last-crimson-moon" aria-label={`Đọc tiếp ${comic.title}`}>
                                                Đọc tiếp <Icon>arrow_forward</Icon>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="history-empty">
                            <span><Icon>auto_stories</Icon></span>
                            <h3>{comics.length === 0 ? 'Lịch sử đọc đang trống' : 'Không có truyện trong mục này'}</h3>
                            <p>
                                {comics.length === 0
                                    ? 'Hãy khám phá và đọc những bộ truyện yêu thích để chúng xuất hiện tại đây.'
                                    : 'Thử chọn bộ lọc khác để xem lịch sử đọc của bạn.'}
                            </p>
                            <a href="/">Khám phá truyện <Icon>arrow_forward</Icon></a>
                        </div>
                    )}
                </section>
            </main>

            <footer className="history-footer">
                <a className="history-brand" href="/">
                    <span className="history-brand-icon"><Icon>auto_stories</Icon></span>
                    <span>Comic<span>Hub</span></span>
                </a>
                <p>© 2025 ComicHub Platform. Nền tảng đọc truyện tranh trực tuyến.</p>
                <div>
                    <a href="#terms">Điều khoản</a>
                    <a href="#privacy">Bảo mật</a>
                    <a href="#contact">Liên hệ</a>
                </div>
            </footer>

            {showConfirm && (
                <div className="history-modal-backdrop" role="presentation" onClick={() => setShowConfirm(false)}>
                    <section
                        className="history-confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="history-confirm-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span className="history-confirm-icon"><Icon>delete_sweep</Icon></span>
                        <h2 id="history-confirm-title">Xóa toàn bộ lịch sử đọc?</h2>
                        <p>Thao tác này sẽ xóa tất cả truyện khỏi danh sách lịch sử trên giao diện hiện tại.</p>
                        <div>
                            <button className="history-cancel-button" onClick={() => setShowConfirm(false)}>
                                Hủy
                            </button>
                            <button className="history-confirm-button" onClick={clearHistory}>
                                Xóa lịch sử
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
