import { useMemo, useState } from 'react';
import './ComicDetailPage.css';

type Chapter = {
    number: number;
    title: string;
    date: string;
    views: string;
    isNew?: boolean;
};

type Comment = {
    name: string;
    role?: string;
    time: string;
    content: string;
    likes: number;
};

const chapters: Chapter[] = [
    { number: 25, title: 'Lời nguyền thức tỉnh', date: '2 giờ trước', views: '4.8K', isNew: true },
    { number: 24, title: 'Bí mật dưới ánh trăng', date: '1 ngày trước', views: '12.1K' },
    { number: 23, title: 'Thành phố đổ nát', date: '3 ngày trước', views: '18.4K' },
    { number: 22, title: 'Kẻ canh giữ vương mộ', date: '5 ngày trước', views: '22.9K' },
    { number: 21, title: 'Khởi đầu mới', date: '1 tuần trước', views: '29.0K' },
    { number: 20, title: 'Dấu ấn cổ xưa', date: '2 tuần trước', views: '31.2K' },
    { number: 19, title: 'Bóng đêm trỗi dậy', date: '2 tuần trước', views: '32.5K' },
];

const recommendations = [
    {
        title: 'Đế Quốc Bóng Tối', chapter: 'Chương 88', genre: 'Kỳ ảo', rating: '9.1',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8zHizjU1ZlHFZ9aP1ePC6jYVyGuM9OVzzi63i1FrGsfH1HePb9z-pe77vZnkZGos_CZ13_jmswhod9A_45hqfVX7w7Or4qi5u9QAzQvGR8DHHCgaXYvBJLSYbFdThts8a6uyAPUm6vmN2rXOl8CDB6et9a-TxCgtUbXx2o2LApaGUqkxmPqz0NKA4376a2wV_4x8nCPwc8qM_RfbScUJCGp1v6A2b8Y_U-LRKILmLGRb6HuGr4rNs9A',
    },
    {
        title: 'Hành Trình Của Kẻ Bất Tử', chapter: 'Chương 104', genre: 'Hành động', rating: '8.8',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbuMMh6aoIywRA3ysvzfxZcYelm-2WWxDksktq05JBZMhgaocVSnMdbvP-4eY5om1Qk2MedJz2FT6h14OtsinWAdOWW-y66gzKhD7qFQUlT6Qr2hD-HQCMRCkPSjH6qB_eGOMbBi7H2bJ9X716ekBUY1RoYhwfVb-pM-buJ6-jzxZTOsqKXjVPVxam3LPrAUdU78olPXN-02P0Oah2KHLerYt8Xkw0EraYcgP3Etu6rYQMwIXuvroumQ',
    },
    {
        title: 'Vô Hạn Thế Giới', chapter: 'Chương 52', genre: 'Phiêu lưu', rating: '8.6',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhuqrc6w8gfiIAEzprmeY0Tq9EkAjVjTM2_VQ90sg3yv3RjYp65Qg8M-PDmoC2YjPTSKzi5M2L5Zg4gWqhEvso_ffmtD6tuM1XRxQxguRuFw38VGxX-XarKrgI3PcVGdj_NrmITzZiOT2GrlKu6KYCn1TLNEKugbPc9HFfCGSn2KGkzZpbAbCqWqmX9sOhbtgTETMNsBToaPrS2e0zY9w3ymn6ZQRRatBmis2mRiSJxkKQssCf4esdoQ',
    },
    {
        title: 'Hoa Nở Trong Bóng Tối', chapter: 'Chương 70', genre: 'Huyền bí', rating: '9.3',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgPNFwxW3nt253YTaUVxSQxE2J3Gu7s2APCTvEn3CnyjShcLqTa-C3Kt8zDrLqKCOKPYbHkBXXtLhiAXUA6nbJO0XUu3LX5RPBsR0MisLAJotttXG2SIDRkeCSbndpb39IscGLJrHwo0VciudS5NEP_QQ6BOseJXwNaieclZfSiMLklSaCqZoydWp-84MPwP6QNMnpb2nF4fEZtMAET5ih4iUJZtq6os1sPHUOX74YAw5_vLv-N9qs-w',
    },
    {
        title: 'Kỵ Sĩ Ánh Trăng', chapter: 'Chương 30', genre: 'Siêu nhiên', rating: '8.7',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVKM8kohmTvQzEJr-1mgFylEsQCU3SGoOOfqZoyHo9NH5ug1xVYMywgHPhueueBNgNIrfZmMAwyywos_ahjhZc-baIFVtkQMhVSK2moqQVaZJ9w9_lqxpLlJUnDE8TLtDJtmHSiScyh6cZ0lHGGI_wg-XgtFAd1WYbvVStxn_qhgWSw8IOrT5jWtcTfYo_JNkboYB7A2u8AruiEXjlvojWW9dhNXQ2vc5zZULpdTmmTDmUTErnoKNZTA',
    },
];

const initialComments: Comment[] = [
    {
        name: 'HuyHoang_Dark',
        role: 'VIP Đọc giả',
        time: '2 giờ trước',
        content: 'Cốt truyện cuốn hút thật sự, combat chương 25 vẽ đỉnh cao! Nét kiếm tích hợp năng lượng huyết nguyệt trông mượt dã man. Dự đoán chương sau sư phụ sẽ ra tay cứu main.',
        likes: 14,
    },
    {
        name: 'MangaFan99',
        time: '5 giờ trước',
        content: 'Không ngờ thân thế của main lại có liên quan đến Huyết Nguyệt tộc... Giờ thì thanh kiếm của Kaelen chính là chìa khóa mở phong ấn rồi. Hóng chương mới từng ngày!',
        likes: 8,
    },
];

function ComicDetailPage() {
    const [bookmarked, setBookmarked] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [chapterSearch, setChapterSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showAllChapters, setShowAllChapters] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(initialComments);
    const [toast, setToast] = useState('');

    const visibleChapters = useMemo(() => {
        const filtered = chapters.filter((chapter) =>
            `${chapter.number} ${chapter.title}`.toLowerCase().includes(chapterSearch.toLowerCase())
        );
        return [...filtered].sort((a, b) =>
            sortOrder === 'newest' ? b.number - a.number : a.number - b.number
        ).slice(0, showAllChapters ? chapters.length : 5);
    }, [chapterSearch, sortOrder, showAllChapters]);

    function notify(message: string) {
        setToast(message);
        window.setTimeout(() => setToast(''), 2600);
    }

    function submitComment() {
        const content = commentText.trim();
        if (!content) {
            notify('Bạn hãy nhập nội dung bình luận trước nhé.');
            return;
        }
        setComments((current) => [
            { name: 'Bạn đọc', time: 'Vừa xong', content, likes: 0 },
            ...current,
        ]);
        setCommentText('');
        notify('Đã thêm bình luận vào giao diện mẫu.');
    }

    return (
        <div className="comic-detail">
            <header className="cd-header">
                <a className="cd-brand" href="/">
                    <span className="cd-brand-mark">C</span>
                    <span>Comic<span>Hub</span></span>
                </a>
                <nav className="cd-nav">
                    <a href="/">Trang chủ</a>
                    <a href="/#latest">Truyện mới cập nhật</a>
                    <a href="/login">Lịch sử đọc</a>
                </nav>
                <div className="cd-header-actions">
                    <label className="cd-search">
                        <span className="material-symbols">search</span>
                        <input placeholder="Tìm kiếm truyện..." />
                        <kbd>Ctrl K</kbd>
                    </label>
                    <button className="cd-icon-button" onClick={() => notify('Bạn chưa có thông báo mới.')} aria-label="Thông báo">
                        <span className="material-symbols">notifications</span>
                    </button>
                    <a href="/login" className="cd-avatar" aria-label="Tài khoản">
                        <span>U</span>
                    </a>
                </div>
            </header>

            <main className="cd-main">
                <div className="cd-breadcrumb">
                    <a href="/">Trang chủ</a><span>/</span><a href="/">Kỳ ảo</a><span>/</span>
                    <strong>The Last Crimson Moon</strong>
                </div>

                <section className="cd-hero">
                    <div className="cd-cover-column">
                        <div className="cd-cover-wrap">
                            <img
                                className="cd-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC40swwYDoQZvZfaMtAMKSV3UwexCI2jA-0RGulTDVuQ_JJMKoSizeGx8bXPqH-oR0yTX0DiuFfulGLB7QkgFrQfsA4jnhlS7105j-kKIaOWdP50pcXE8JbEpQ_EakAQJ0oM9EbbtnZFII_iIzWo24OY2vd59SL6SxzjqPwQQNMaruNGb0gpHmPDkIwz7Tpkv_LWi-1tLVm5XmUNYxnhtDsZahU5S4pZnjqwa5cMu7yb_LkXXXrk0mRLQ"
                                alt="Bìa truyện The Last Crimson Moon"
                            />
                            <span className="cd-cover-badge">MANGA</span>
                        </div>
                        <div className="cd-cover-rating"><span>★</span> 8.9 <small>/ 10</small></div>
                        <div className="cd-cover-stats">
                            <div><strong>1.2M</strong><span>Lượt xem</span></div>
                            <div><strong>85.4K</strong><span>Theo dõi</span></div>
                            <div><strong>25</strong><span>Chương</span></div>
                        </div>
                    </div>

                    <div className="cd-info">
                        <div className="cd-eyebrow"><span>SHONEN DARK</span><i>Đang tiến hành</i></div>
                        <h1>The Last Crimson Moon</h1>
                        <p className="cd-alias">Tên khác: Crimson Moon Chronicles</p>
                        <div className="cd-meta-grid">
                            <div><span>Tác giả</span><strong>Tác giả mẫu (Studio Nocturne)</strong></div>
                            <div><span>Họa sĩ</span><strong>Akihiro &amp; Crimson Team</strong></div>
                            <div><span>Đánh giá cộng đồng</span><strong className="cd-meta-rating">★ 8.9/10 <small>(Dữ liệu mẫu)</small></strong></div>
                        </div>
                        <div className="cd-genres">
                            {['Hành động', 'Kỳ ảo', 'Phiêu lưu', 'Siêu nhiên', 'Kịch tính'].map((genre) => (
                                <span key={genre}>{genre}</span>
                            ))}
                        </div>
                        <p className="cd-short-description">
                            Trong một thế giới nơi mặt trăng đỏ báo hiệu sự thức tỉnh của những sức mạnh cổ xưa,
                            một chiến binh trẻ dần phát hiện bí mật về thân thế của mình. Trên hành trình tìm kiếm
                            sự thật giữa tàn tích hoang tàn, cậu phải đối mặt với những thế lực hắc ám có thể vĩnh
                            viễn thay đổi vận mệnh của cả thế giới.
                        </p>
                        <div className="cd-primary-actions">
                            <button className="cd-read-button" onClick={() => window.location.href = '/comic/the-last-crimson-moon/chapter-25'}>
                                <span className="material-symbols">menu_book</span> Đọc chương mới nhất <small>Ch.25</small>
                            </button>
                            <button className="cd-start-button" onClick={() => notify('Đang mở giao diện đọc chương 1...')}>
                                Đọc từ đầu <small>Ch.1</small>
                            </button>
                        </div>
                        <div className="cd-secondary-actions">
                            <button onClick={() => { setBookmarked(!bookmarked); notify(bookmarked ? 'Đã bỏ khỏi tủ truyện.' : 'Đã thêm vào tủ truyện.'); }}>
                                <span className="material-symbols">{bookmarked ? 'bookmark_added' : 'bookmark_add'}</span>
                                {bookmarked ? 'Đã lưu truyện' : 'Thêm vào tủ truyện'}
                            </button>
                            <button onClick={() => {
                                if (navigator.clipboard) {
                                    void navigator.clipboard.writeText(window.location.href).then(
                                        () => notify('Đã sao chép liên kết truyện.'),
                                        () => notify('Không thể sao chép liên kết trên trình duyệt này.')
                                    );
                                } else notify('Trình duyệt không hỗ trợ sao chép liên kết.');
                            }}>
                                <span className="material-symbols">share</span> Chia sẻ
                            </button>
                        </div>
                    </div>
                </section>

                <div className="cd-content-grid">
                    <div className="cd-left-column">
                        <section className="cd-panel cd-synopsis">
                            <div className="cd-section-heading"><h2>Giới thiệu truyện</h2><span>✦</span></div>
                            <div className={`cd-synopsis-copy ${expanded ? 'is-expanded' : ''}`}>
                                <p>Kỷ nguyên Huyết Nguyệt trỗi dậy cứ sau mỗi nghìn năm, phủ lên bầu trời màu đỏ rực thê lương và đánh thức những cấm thuật cổ xưa đã bị phong ấn dưới đáy vực sâu của Đế chế cổ Valdoria.</p>
                                <p>Kaelen — một kiếm sĩ cô độc lang bạt giữa các pháo đài đổ nát, mang trong huyết quản ấn ký của Hội Nguyệt Ảnh. Cậu không hề hay biết rằng thanh kiếm gãy rỉ sét bên mình chính là phong ấn cuối cùng gìn giữ trật tự nhân gian. Khi bầu trời dần nhuốm sắc đỏ thẫm và những tín đồ cuồng tín ráo riết săn lùng hậu duệ cuối cùng, Kaelen buộc phải lựa chọn: chấp nhận số phận bị nuốt chửng bởi lời nguyền bóng tối, hay dùng chính ngọn lửa ấy để thiêu rụi màn đêm vô tận.</p>
                                <p>Tác phẩm kết hợp nhuần nhuyễn giữa phong cách hành động dark-fantasy dồn dập, các trận đấu kiếm nghẹt thở cùng nét vẽ giàu chi tiết mang âm hưởng gothic kỳ vĩ.</p>
                            </div>
                            <button className="cd-expand-button" onClick={() => setExpanded(!expanded)}>
                                {expanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung'} <span className="material-symbols">{expanded ? 'expand_less' : 'expand_more'}</span>
                            </button>
                        </section>

                        <section className="cd-panel cd-chapters">
                            <div className="cd-section-heading"><h2>Danh sách chương <small>25 chương</small></h2></div>
                            <div className="cd-chapter-tools">
                                <label className="cd-chapter-search">
                                    <span className="material-symbols">search</span>
                                    <input value={chapterSearch} onChange={(event) => setChapterSearch(event.target.value)} placeholder="Tìm số chương..." />
                                </label>
                                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'newest' | 'oldest')} aria-label="Sắp xếp chương">
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                </select>
                            </div>
                            <div className="cd-chapter-list">
                                {visibleChapters.map((chapter) => (
                                    <button className="cd-chapter-row" key={chapter.number} onClick={() => notify(`Đang mở Chương ${chapter.number}: ${chapter.title}`)}>
                                        <span className="cd-chapter-number">Chương {chapter.number}</span>
                                        <strong>{chapter.title} {chapter.isNew && <i>MỚI</i>}</strong>
                                        <span className="cd-chapter-date">{chapter.date}</span>
                                        <span className="cd-chapter-views"><span className="material-symbols">visibility</span>{chapter.views}</span>
                                    </button>
                                ))}
                                {visibleChapters.length === 0 && <p className="cd-empty">Không tìm thấy chương phù hợp.</p>}
                            </div>
                            <button className="cd-all-chapters" onClick={() => setShowAllChapters(!showAllChapters)}>
                                {showAllChapters ? 'Thu gọn danh sách' : 'Xem tất cả 25 chương'} <span className="material-symbols">arrow_forward</span>
                            </button>
                        </section>

                        <section className="cd-panel cd-comments">
                            <div className="cd-section-heading">
                                <h2>Bình luận độc giả <small>{148 + comments.length - initialComments.length}</small></h2>
                                <span className="cd-comment-sort">Sắp xếp: Mới nhất</span>
                            </div>
                            <div className="cd-comment-form">
                                <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Chia sẻ cảm nghĩ của bạn về bộ truyện, giả thuyết cốt truyện..." />
                                <div className="cd-comment-form-bottom">
                                    <span>Hỗ trợ Markdown · Hãy bình luận văn minh</span>
                                    <button onClick={submitComment}><span className="material-symbols">send</span> Gửi bình luận</button>
                                </div>
                            </div>
                            <p className="cd-login-note">Bạn cần <a href="/login">Đăng nhập ngay</a> để đồng bộ bình luận của mình.</p>
                            <div className="cd-comment-list">
                                {comments.map((comment, index) => (
                                    <article className="cd-comment" key={`${comment.name}-${index}`}>
                                        <div className="cd-comment-avatar">{comment.name.slice(0, 1).toUpperCase()}</div>
                                        <div className="cd-comment-body">
                                            <div className="cd-comment-author"><strong>{comment.name}</strong>{comment.role && <span>{comment.role}</span>}<time>{comment.time}</time></div>
                                            <p>{comment.content}</p>
                                            <button onClick={() => notify('Bạn cần đăng nhập để thích bình luận.')}><span className="material-symbols">thumb_up</span> {comment.likes}</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="cd-right-column">
                        <section className="cd-panel cd-stats-panel">
                            <div className="cd-section-heading"><h2>Thông số tương tác</h2></div>
                            <div className="cd-stat-line"><div><span>Đánh giá độc giả</span><strong>8.9/10</strong></div><div className="cd-progress"><i style={{ width: '89%' }} /></div></div>
                            <div className="cd-stat-line"><div><span>Tần suất ra chương</span><strong>2 chương/tuần</strong></div><div className="cd-progress"><i style={{ width: '75%' }} /></div></div>
                            <div className="cd-stat-line"><div><span>Độ yêu thích</span><strong>Top 3 tuần</strong></div><div className="cd-progress"><i style={{ width: '95%' }} /></div></div>
                            <div className="cd-tags"><span>#DarkFantasy</span><span>#Swordmaster</span><span>#Gothic</span><span>#AncientPower</span></div>
                        </section>

                        <section className="cd-panel cd-recommendations">
                            <div className="cd-section-heading"><h2>Truyện bạn có thể thích</h2></div>
                            <div className="cd-recommend-list">
                                {recommendations.map((comic) => (
                                    <button className="cd-recommend-item" key={comic.title} onClick={() => notify(`Bạn đã chọn ${comic.title}.`)}>
                                        <img src={comic.image} alt={comic.title} />
                                        <span className="cd-recommend-info"><strong>{comic.title}</strong><small>{comic.chapter} • {comic.genre}</small><em>★ {comic.rating}</em></span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            <footer className="cd-footer">
                <a className="cd-brand" href="/"><span className="cd-brand-mark">C</span><span>Comic<span>Hub</span></span></a>
                <p>© 2025 ComicHub Platform. Nền tảng đọc truyện tranh trực tuyến.</p>
                <div><a href="/">Điều khoản</a><a href="/">Bảo mật</a><a href="/">Liên hệ</a></div>
            </footer>

            {toast && <div className="cd-toast"><span className="material-symbols">info</span>{toast}</div>}
        </div>
    );
}

export default ComicDetailPage;
