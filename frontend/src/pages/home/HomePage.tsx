import { useMemo, useState } from 'react';
import './HomePage.css';

type Comic = {
    title: string;
    chapter: string;
    rating: string;
    time?: string;
    status?: string;
    views?: string;
    image: string;
    genre: string;
};

const latestComics: Comic[] = [
    {
        title: 'The Last Crimson Moon',
        chapter: 'Chương 25',
        rating: '9.8',
        time: '12 phút trước',
        status: 'Mới',
        genre: 'Kỳ ảo',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCO1tiMXUBnus4JCiK6pg3d_e-NYo3DISyfZWZdiMuLQ21qR4eHqr77zIpk25aF27rok3Zz72tG536z4zWyAjLNcw8kNbmpaYivNzCw8-nILRqsZmZY-Rfs9SUoMUACwEQ7AySFPZBpSDza9Ext4zBIxjMMc3ixKw31Uzk1H5Q9NFeO1cd3HP-qhXBwApvbGGwmwAH3OB_IvuB62BhEcIur3Uu8CQJsyfFu6mOC3mbFYquR_btkO5xAg',
    },
    {
        title: 'Hành Trình Của Kẻ Bất Tử',
        chapter: 'Chương 104',
        rating: '9.4',
        time: '45 phút trước',
        status: 'Đang ra',
        genre: 'Phiêu lưu',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7xK3I_CGmd6YpfTabHzPW58AE7lO3CMUwxDIzSsCfwNGIVHf2UJj22PRmrixdiL6stT37QYPTTeXoCZ4UoW75gGhUg0nxjhSgPnMB1OarAbwcnAKTuV_Yhm03YpYUOFRoJcTr4AQm6Rh3Z741QnfJYFss5np9RsFi-E2K6aNG2wn0td0r_7w3Ynr8vz43CkZzjboGiWmBI-a8lOanCwd0wCVoKAO64MWi4qVIl6bYcFWqohlXQRuP5A',
    },
    {
        title: 'Thanh Xuân Trong Mắt Em',
        chapter: 'Chương 42',
        rating: '9.1',
        time: '2 giờ trước',
        status: 'Đang ra',
        genre: 'Lãng mạn',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzrk7LK3WlupLj3s5iFOa2s7nEdfnhP7LN0p7hB4Pd9M-yC0JZ-WrjrR7gDoPUhZRTC0LBpKLyaH4Av8Uf58HQKVSTVB0DS1ylEp2m9Yswdh6oRWF6vAUF4b5t-AXgpsS7Mx0U8ASQ1h41zPsYut9BHY8RrRWtNJsMtEUK1UttAQ-5nwlxW9r7ZOu1D5j1CEye77cWzpt7kFJhQ9foZSskOEJKv4dk8AN3i8oB8seftG9au9XY2IrFrg',
    },
    {
        title: 'Đế Quốc Bóng Tối',
        chapter: 'Chương 88',
        rating: '9.6',
        time: '3 giờ trước',
        status: 'Đang ra',
        genre: 'Hành động',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMoQEA_O54r7SQFJlVwHholsJ46ISw5cy_O8DPwW2kzDLFCmajOcTGGhP22sWNDjF8bT-1Ot9C4H_8kRNxUj_sE1wxiURZVtxfPjJ4qYiHzQJYmvU3JENW_1fqfdaUGuHWTtqJhcwQKufIpxMfbBeykxRVGesjcCQGk1n6EYxUYilsZb3NxB9udiaBhsHOpkjMzDkWAb-0m4WodVityfjZ132btSOcevGHgvoCXDMGmp5FSFFNhTWZUg',
    },
    {
        title: 'Tiệm Bánh Của Mèo Con',
        chapter: 'Chương 15',
        rating: '8.9',
        time: '5 giờ trước',
        status: 'Mới',
        genre: 'Đời thường',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9InFtY08wbB9fp-XR_4bPZ21jkO0CQ6VcyWRnyPRhOhWrV-XQGN7WUCSokA29uVy0rNa4nHSdm4naq6ALOKCG1U6Z3o5pYxu1o1CKDs_gLXxXDB5q0MO-qFmLV_jgc-VEoRvx0tgJw6GgIei_9EdabQ36S1KvxNchEiY8qp6VF_TYIaGP9-6A_WE6IEBq8q2SQwv_SwClnrxE6x1lLyozr-QHMgoYu4wFPZwacHF-eNCbcfuyu15yTg',
    },
    {
        title: 'Hoa Nở Trong Bóng Tối',
        chapter: 'Chương 70 (Full)',
        rating: '9.5',
        time: '1 ngày trước',
        status: 'Hoàn thành',
        genre: 'Kỳ ảo',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD13afB7SII8wE0MWxtut3yGnMKkDMFqQW2brXORActyOMDtFDhjFPxs10nfibwsm_-oDz3rXyq4RnnU4szRa2VUsHETl8Co9Fk0DTJNBDANLk_zH7fidhL9tZRF2kUzhOxgAG0zLPopk7B9DI3P4vbc7A0gOyoSt205_ebAyCFM0VgDcgPcbMWvCfqhKDeHRjwvePD7Q6dTNi65PDn3NYVPZXl_Ez_myLik4NZXCCYrDvWFK47H-qGTA',
    },
];

const popularComics: Comic[] = [
    {
        title: 'Long Vương Thức Tỉnh',
        chapter: 'Chương 182',
        rating: '9.9',
        views: '1.8M',
        genre: 'Hành động',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgPdUMpRiCf1ugeSXsTYol4aeNdGTLw9UESOkVD6zx0NNklOdz6arMjeL_EXcclG_KwB9RQm0x1Sua3_He7CKObNy0ust4x8PY8g0oizoQOJwABF_XeujaG0t7CbfAP25qQZM6uAUWt_9rlT94o5vA5fehZvg1WwLtpfJyrbEDnYEUenUIcskEPBhh2V4bkcM184r4dpvIyuclABuEVYf4xdYb4NPLErazMpzkvrkj9qu2eqZrXnp43Q',
    },
    {
        title: 'Tuyệt Kiếm Vô Song',
        chapter: 'Chương 95',
        rating: '9.7',
        views: '1.4M',
        genre: 'Phiêu lưu',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzyb-ropmA7HC_dzBthpKt88DRHJBinhsLmjBnvTjG9HL6iRoo8VjaCcgoHWsqQ_lmSyS3sPFQHxy-83O6LJQrXpIgZu7AAdpw2H915_gJm2YrlpVW080PwEGbMg83v9b46-og_qwsHvL9VfI8ZY8Pk5Mue6ZistKcDJ4l072nwEYk3Q_u1bo8B0CAcLJe7warvxkP31lrKfh4k1gDHLppxHDA5-RaPbRBA2FDXZZvpeQWPs1Z4PiyEQ',
    },
    {
        title: 'Nhà Giả Kim Cuối Cùng',
        chapter: 'Chương 61',
        rating: '9.5',
        views: '1.2M',
        genre: 'Kỳ ảo',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm_bHn0Lx1FZL21xqHvKTWrSgthfZRpS2Aq99C8OMIbBOimtGbsQItILRaI8ugT_NkyftXc0lbnuwQuCML0XPZNyXXZwGltyC5jBh6GS7eIoavgN4lm2vPmfHaly19autk2ByLhPHs3ex8upIDnc3Oip39Pax9hNvUrzKqKP73I9ETeQW1XQXwpeYJTov8GJfl54ne48MxCWH_KSBlU6myLKva-rNwDp4HvzQUhvsOJ6i_FUMYy-aCuQ',
    },
    {
        title: 'Kỷ Nguyên Cybernetic',
        chapter: 'Chương 48',
        rating: '9.4',
        views: '950K',
        genre: 'Khoa học viễn tưởng',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTSP_awuefh2MjofpAm5jN8Kpw7rym_MEtjJYfnbQiUCRQTH-VwNgAjXjfapWImwBMb1a21z21xG_P6oNI2HLatbWIkrU-ZtWI_tBsZYI2x0XfYfhOn7Pd226Ho-XtS6EKndRfA-wpeyMhVqKfKPBtbf9dZK2piZfNaqenhH51HLxC0CZyF0l6bLYRrz5cGSWCJTuSHwJb9BO-U7qdFVwscivjYJNPKY2W9ztFHFleXOk3s-ZsDU3uhg',
    },
    {
        title: 'Âm Dương Pháp Sư',
        chapter: 'Chương 112',
        rating: '9.2',
        views: '880K',
        genre: 'Hành động',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhb3_3TvxhzAiG_xFshgPWjtIdBJoEBbf9aglabes-YgFmaOUzRB47_h28L-jjJ-d44xbN7EmC5ezhYQvJkDWOuOPi3ydSiGQTf4BtrSBBsfzo3TLRS6gJIUY8orMUA5lKRPRNuSz9sxmZnLV2OlLweDAU1ysKpjCe4Re_wZm7S8YABirvT1SjoVG8UeVutoRrYHBIM0qGLl1vGzzXKnEetiVWECfRQVEI3UaAYUctZ6x5qzfyYpAWQg',
    },
    {
        title: 'Kẻ Săn Đêm Bí Ẩn',
        chapter: 'Chương 34',
        rating: '9.3',
        views: '760K',
        genre: 'Kinh dị',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi9p4aWAL-01ovg4QYNXSLTl46xrNeUOwEoan7LjsEI9M0BqcCdBdHkv2yvDaX0ZC8kVBYaHZkYcrcqgr9s9KD9gljKil04tEjKO35gjVQT76sqGS-xG9CvrxNoRtEUPvaWQoBiVj3BsEBmk9w4udlc5aSuH3VBBS3sovM84Pwr0_PCBspgsjV0ihir_EhQXdVlGlGHERRXTMw9_GDNA8daXofmUHtQ87wicdvzQJkTRvKEc3dbI1Ajw',
    },
];

const genres = [
    'Tất cả',
    'Hành động',
    'Phiêu lưu',
    'Kỳ ảo',
    'Lãng mạn',
    'Hài hước',
    'Kinh dị',
    'Đời thường',
    'Khoa học viễn tưởng',
];

const aiSuggestions = [
    '🔍 Tìm truyện theo sở thích',
    '🔥 Gợi ý truyện hay hôm nay',
    '✍️ Viết review truyện',
    '⚔️ Tìm truyện giống bộ này',
];

function Icon({ children }: { children: string }) {
    return <span className="material-symbols-outlined">{children}</span>;
}

function ComicCard({ comic, popular = false }: { comic: Comic; popular?: boolean }) {
    return (
        <article className="comic-card">
            <div className="comic-cover-wrap">
                <a href={comic.title === 'The Last Crimson Moon' ? '/comic/the-last-crimson-moon' : undefined}>
                    <img className="comic-cover" src={comic.image} alt={comic.title} />
                </a>
                {comic.status && <span className="comic-status">{comic.status}</span>}
                <button className="cover-bookmark" aria-label="Lưu truyện">
                    <Icon>bookmark</Icon>
                </button>
            </div>
            <div className="comic-info">
                <h3>
                    {comic.title === 'The Last Crimson Moon' ? (
                        <a href="/comic/the-last-crimson-moon">{comic.title}</a>
                    ) : comic.title}
                </h3>
                <div className="comic-meta">
                    <span>{comic.chapter}</span>
                    <span className="rating">★ {comic.rating}</span>
                </div>
                <div className="comic-time">
                    {popular ? `◉ ${comic.views} lượt đọc` : comic.time}
                </div>
            </div>
        </article>
    );
}

export default function HomePage() {
    const [selectedGenre, setSelectedGenre] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ from: 'user' | 'ai'; text: string }[]>([]);
    const [focusMode, setFocusMode] = useState(true);

    const filteredComics = useMemo(() => {
        return popularComics.filter((comic) => {
            const matchGenre = selectedGenre === 'Tất cả' || comic.genre === selectedGenre;
            const matchSearch = comic.title.toLowerCase().includes(search.toLowerCase());
            return matchGenre && matchSearch;
        });
    }, [selectedGenre, search]);

    function sendMessage(text = chatInput) {
        const value = text.trim();
        if (!value) return;

        setMessages((current) => [
            ...current,
            { from: 'user', text: value },
            {
                from: 'ai',
                text: 'Mình gợi ý bạn thử The Last Crimson Moon nhé! Bộ truyện có màu sắc dark fantasy, hành động và kỳ ảo, hiện đang được nhiều độc giả quan tâm.',
            },
        ]);
        setChatInput('');
    }

    return (
        <div className="comic-home">
            <header className="home-header">
                <div className="header-inner">
                    <a className="brand" href="/">
                        <span className="brand-icon"><Icon>auto_stories</Icon></span>
                        <span>Comic<span>Hub</span></span>
                    </a>

                    <nav className="main-nav">
                        <a className="active" href="/">Trang chủ</a>
                        <a href="#latest">Truyện mới cập nhật</a>
                        <a href="/login">Lịch sử đọc</a>
                    </nav>

                    <div className="header-search">
                        <Icon>search</Icon>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm tên truyện, tác giả..."
                        />
                        <kbd>Ctrl K</kbd>
                    </div>

                    <button className="header-icon" aria-label="Thông báo">
                        <Icon>notifications</Icon>
                        <i />
                    </button>
                    <a className="user-avatar" href="/login" aria-label="Tài khoản">H</a>
                </div>
            </header>

            <main className="home-main">
                <section className="featured-hero">
                    <div className="hero-content">
                        <div className="hero-tags">
                            <span className="tag-live">● Đang tiến hành</span>
                            <span>Hành động</span>
                            <span>Kỳ ảo</span>
                            <span>Phiêu lưu</span>
                        </div>
                        <p className="eyebrow">TRUYỆN NỔI BẬT TUẦN NÀY</p>
                        <h1>The Last Crimson Moon</h1>
                        <p className="hero-description">
                            Một chiến binh trẻ vô tình khám phá ra sức mạnh cổ xưa liên quan đến
                            mặt trăng đỏ bí ẩn và bị cuốn vào cuộc chiến khốc liệt giữa các vị
                            thần sa ngã, mang định mệnh định đoạt sự tồn vong của toàn nhân loại.
                        </p>
                        <div className="hero-actions">
                            <button className="primary-button" onClick={() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' })}>
                                <Icon>menu_book</Icon> Đọc ngay
                            </button>
                            <button className="secondary-button" onClick={() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' })}>
                                Xem chi tiết
                            </button>
                            <button className="hero-save" aria-label="Lưu truyện"><Icon>bookmark</Icon></button>
                        </div>
                    </div>
                    <div className="hero-shade" />
                </section>

                <div className="home-columns">
                    <div className="main-column">
                        <section className="content-section" id="latest">
                            <div className="section-heading">
                                <div>
                                    <p className="eyebrow">ĐỪNG BỎ LỠ</p>
                                    <h2>Truyện mới cập nhật</h2>
                                </div>
                                <a href="#popular">Xem tất cả <Icon>arrow_forward</Icon></a>
                            </div>
                            <div className="latest-grid">
                                {latestComics
                                    .filter((comic) => comic.title.toLowerCase().includes(search.toLowerCase()))
                                    .map((comic) => <ComicCard key={comic.title} comic={comic} />)}
                            </div>
                        </section>

                        <section className="content-section popular-section" id="popular">
                            <div className="section-heading">
                                <div>
                                    <p className="eyebrow">ĐƯỢC ĐỘC GIẢ YÊU THÍCH</p>
                                    <h2>Truyện phổ biến theo thể loại</h2>
                                </div>
                                <a href="#popular">Bảng xếp hạng <Icon>arrow_forward</Icon></a>
                            </div>
                            <div className="genre-list">
                                {genres.map((genre) => (
                                    <button
                                        key={genre}
                                        className={selectedGenre === genre ? 'genre-chip selected' : 'genre-chip'}
                                        onClick={() => setSelectedGenre(genre)}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                            <div className="popular-grid">
                                {filteredComics.map((comic) => (
                                    <ComicCard key={comic.title} comic={comic} popular />
                                ))}
                                {filteredComics.length === 0 && (
                                    <p className="empty-result">Không tìm thấy truyện phù hợp.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="side-column">
                        <section className="ai-panel">
                            <div className="ai-header">
                                <div className="ai-logo"><Icon>smart_toy</Icon></div>
                                <div>
                                    <h2>ComicHub AI</h2>
                                    <p>Trợ lý truyện tranh</p>
                                </div>
                                <span className="ai-version">v2.4</span>
                            </div>

                            <div className="ai-chat">
                                <div className="ai-message">
                                    Xin chào! Mình là trợ lý ComicHub. Bạn đang muốn tìm một bộ truyện
                                    mới hay cần gợi ý theo sở thích?
                                </div>
                                <div className="user-message">
                                    Gợi ý cho mình bộ dark fantasy nào hot nhất hiện tại?
                                </div>
                                <div className="ai-message">
                                    Bạn có thể thử bộ truyện này:
                                    <div className="ai-comic-preview">
                                        <img
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiMYkUYn7_Kd2mfSjPtzpAVsFxxJb7C-Td0SkWWBJiSKy5knVh87-Gve5GEzTK2Roq0BWXq5vifkxg65Np_eYgCHFLr_XX6ZxvIOqP6QCNWfH7wbJyaGsHdYbLfQmpRh-cIPyVx1R2u3A5x9_igV5Jzqyb4ra12GTMEgovEgokP5A"
                                            alt="The Last Crimson Moon"
                                        />
                                        <div>
                                            <strong>The Last Crimson Moon</strong>
                                            <span>Dark Fantasy · ★ 9.8</span>
                                        </div>
                                    </div>
                                </div>
                                {messages.map((message, index) => (
                                    <div key={`${index}-${message.from}`} className={message.from === 'user' ? 'user-message' : 'ai-message'}>
                                        {message.text}
                                    </div>
                                ))}
                            </div>

                            <div className="ai-suggestions">
                                {aiSuggestions.map((suggestion) => (
                                    <button key={suggestion} onClick={() => setChatInput(suggestion)}>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            <form
                                className="ai-input"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendMessage();
                                }}
                            >
                                <input
                                    value={chatInput}
                                    onChange={(event) => setChatInput(event.target.value)}
                                    placeholder="Hỏi ComicHub AI..."
                                />
                                <button type="submit" aria-label="Gửi tin nhắn"><Icon>send</Icon></button>
                            </form>
                            <p className="ai-disclaimer">AI có thể đưa ra gợi ý chưa hoàn toàn chính xác.</p>
                        </section>

                        <section className="focus-panel">
                            <div className="focus-icon"><Icon>dark_mode</Icon></div>
                            <div className="focus-copy">
                                <h3>Chế độ đọc tập trung</h3>
                                <p>Tối ưu cho màn hình đêm</p>
                            </div>
                            <button
                                className={focusMode ? 'toggle-switch on' : 'toggle-switch'}
                                onClick={() => setFocusMode((value) => !value)}
                                aria-label="Bật tắt chế độ đọc tập trung"
                            >
                                <span />
                            </button>
                            <span className="focus-state">{focusMode ? 'Tự động' : 'Đã tắt'}</span>
                        </section>
                    </aside>
                </div>
            </main>

            <footer className="home-footer">
                <a className="brand" href="/">
                    <span className="brand-icon"><Icon>auto_stories</Icon></span>
                    <span>Comic<span>Hub</span></span>
                </a>
                <p>© 2025 ComicHub Platform. Nền tảng đọc truyện tranh trực tuyến.</p>
                <div>
                    <a href="#terms">Điều khoản</a>
                    <a href="#privacy">Bảo mật</a>
                    <a href="#contact">Liên hệ</a>
                </div>
            </footer>
        </div>
    );
}
