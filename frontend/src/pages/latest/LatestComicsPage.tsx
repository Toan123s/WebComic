
import { useMemo, useState } from 'react';
import './LatestComicsPage.css';

type Comic = {
    id: number;
    title: string;
    slug: string;
    image: string;
    chapter: number;
    genre: string;
    time: string;
    status: 'new' | 'hot' | 'full' | 'normal';
    following: boolean;
};

const initialComics: Comic[] = [
    {
        id: 1,
        title: 'The Last Crimson Moon',
        slug: 'the-last-crimson-moon',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvM4ulHJEuuQqmxD1Yj1PfkVkBpSBdFN3RcOVp8z_mVljARf54H9uKlgwYKCkcxpoJDSAF6ulwtTSmbjgrNo-sOzlihXOr1EcG93stvf0gGzhPy5WueKJyEQa62QBEwH6NTjGB5FVJS_oO4pzUaaehycxtU5X0BKomcW8BwMvgdvwvsPm3s8rhCEHPTlRFCe-9IEF5ns8OWl9Ko--t10V1ZY_SljsK4l3SbXD7r281cKpLlKW3Y_DmXA',
        chapter: 25, genre: 'Kỳ ảo', time: '5 phút trước', status: 'hot', following: true,
    },
    {
        id: 2,
        title: 'Thanh Xuân Trong Mưa',
        slug: 'thanh-xuan-trong-mua',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIOoNMMO3e-t0OvAan6c3gXCbB7cDMVhans_UzqEP35ZGRhEDhd_5iW29SCgy-o39F-x7JTtyXubaqJUq3936hEVKR8hbjUILY1P5UWvhJh2DL1xEFHwDL_I66iRg73cXY4pyXKAxJc8-5NrCyh_Gk6S8cUsAGIhkCyQle4HaZ4Qt8rxEedUTCySUkpC3P2SXzxskvPMFYcoc_fzXjQ1qIBfVk1JhfRoHoFBN_eXqv12GmSxoIIbLYLw',
        chapter: 42, genre: 'Lãng mạn', time: '15 phút trước', status: 'new', following: true,
    },
    {
        id: 3,
        title: 'Đế Quốc Bóng Tối',
        slug: 'de-quoc-bong-toi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX0d3CuU0ZqREEHZARWRzHSNWXDYvbKFgOzfFFX5mfV4am-62W_QHnzTHjwJ8pxffQx3TVQrRF75ECVYxArqoTYB-Ucth1EuL3oYDUWHZ8iwL1g1qCVL17zZSPyqG4RAU1SkMSqZ7TGG_jRXL1RFHwwmEZ1Wwtw6SwxRF2WUiBZeWMEHLnb5iYNdv0PvDgR06dLtQOvLhghdBy40R2UKOeQF4rqkN1D3hSM95QqhWbGMKxyDn6jP4gIw',
        chapter: 88, genre: 'Hành động', time: '35 phút trước', status: 'normal', following: true,
    },
    {
        id: 4,
        title: 'Tiệm Bánh Của Mèo Đen',
        slug: 'tiem-banh-cua-meo-den',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTxgoWwcJi3JgeCg7ZPsAAUrj2JI7GzABU49TtQMTFYNhSCOlKgjmz6lHRNmDQ5MRfmNvrnu-ldPAuuJZqAL4qEBe1LOmkg4-ZgsuYR0pGOaEh-aq1Ou25JkDIlyi1768gkmWvb1CT25T_IA0kKVx5w8-BnUm2iXlcZlHTAEtm8aVdrIZmtGyyZ6xwzRtIuZoPUgc490sRWyWUuobKv16oi_7CXInc-FCgWDc3rchjKxtiSZQ0LeusoA',
        chapter: 15, genre: 'Đời thường', time: '1 giờ trước', status: 'new', following: false,
    },
    {
        id: 5,
        title: 'Vô Hạn Thế Giới',
        slug: 'vo-han-the-gioi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvTCF5vAc58FyritroXCFcs6K2enkj9xKEI4ND2wa0hpXClNt--Ub-br2NzCEQMe2ZllV1Y3ja8g8nIpYesx7Yns4Uf8fOomJozT_6uFaolJtdxT9x8EjzQtkEYBUDTEs51OUucfzx-wnrdxVPi4k57Pqdmf5lVAzA11eMO0XN-IE8bOCk8dQQoaJLB0Maa9M-USodlEiCwKHCK79KsbxkC7WXNyN4IUZRtNXYoAj9X8O3nLhrPRbLA',
        chapter: 52, genre: 'Viễn tưởng', time: '2 giờ trước', status: 'full', following: false,
    },
    {
        id: 6,
        title: 'Hoa Nở Trong Bóng Tối',
        slug: 'hoa-no-trong-bong-toi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHAZo0IB6w9tQGDE88lBgr3fxQHhdV3CB9yUbZtLh53PLQ6_0HSWjAnNJ4Uhnt1ioKVMC4Xkr8cZoDCZbgJfzUoCYTMBeC3GZNUbCl7T8JtsLGw8QJjSPZ9TSa4gXxbyc61oTx1jKgyEOiOz83BWWmO5Gp_z-NGiuSR8TTC68meyU--8YSkVQVDhCGWji0BjiHChUZIuIpvqYeBK1bof5QfO0YZjng5cZISVjessvWdOWhFZFGhcbRBg',
        chapter: 70, genre: 'Hành động', time: '3 giờ trước', status: 'normal', following: true,
    },
    {
        id: 7,
        title: 'Tuyệt Kiếm Vô Song',
        slug: 'tuyet-kiem-vo-song',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlB4TkCd9HudggXzXL3NjnEiuxLmkXpGOh_jF66RStCQCfpWnmgWznno_GFwFXSIqeF0KB0lTJvSa48i6oD8KnPPKlsFglOlWD9OjEl39mTJhjQCTqpHH6cC5WtXVJwxQdaE66w9PsQPEM3EmD-FveZTUFlF9OIUMqpfL1ieHm91iPvjm-XUmM7gwb8my4fRgon_ABkdh5QQFx35Rup_tNq88eDXEfzQiHOxeS2BZShfsXQ0K0t5qeXA',
        chapter: 95, genre: 'Võ thuật', time: '4 giờ trước', status: 'hot', following: false,
    },
    {
        id: 8,
        title: 'Nhà Giả Kim Cuối Cùng',
        slug: 'nha-gia-kim-cuoi-cung',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArvtezDNAICBjmd9DjmFHgilqr0uYBrfCA-qD2Yq19kysrTAWQs-c2yj6-HTBgndW3gM5I-hnE73hqXrBkeXOBKlQc8bJoUrK3Wg-eQG3qLEvmoawK9jXkTZW5KOIvCSp9qv41Y5tG-SfvJSVh21mqD6g1cXflTyGyoxPZvXoRNQYKLhkWNaY2f1YyOeE-nvQLCFp1b0oY6aa4hXdXfXlpytZQAlInW20aLPU3_fLukbyDRJPK3WW9-w',
        chapter: 61, genre: 'Bí ẩn', time: '5 giờ trước', status: 'full', following: false,
    },
    {
        id: 9,
        title: 'Kỷ Nguyên Cybernetic',
        slug: 'ky-nguyen-cybernetic',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXs51JsxHGXJZvVdV7WZQXmsgRBlFny9bheBHNZ8CZmug9c5m9DBdfLUE0AOYhc9vI8fM57Bt6E9V6pRd47oCbS4yRcte7u8IU-usKh9KYczIIUnwtS6Ev-YQMaY7AZe8yV3ICSTnc9Ti-ozxkxWUgm9exvO7_vkv-QhlZbx2M17Aj0LqNDAiDj4_OSLJeF-KFk8G6Z5yQvE1HUnLtyMzzlAknxsYWJBpPigXY6jylY7jqJaJgwYPMOQ',
        chapter: 48, genre: 'Viễn tưởng', time: '6 giờ trước', status: 'normal', following: true,
    },
    {
        id: 10,
        title: 'Âm Dương Pháp Sư',
        slug: 'am-duong-phap-su',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATaKoh99ICFM7dhZyTmpNF-I-wy_swDX31WFkP_K_Lr2Y6r3j4TyFCjPHAsV1buqUlEa2xbuY08upYidrUTosfLpdaNE8BAW5x5POWEDhpfWUGaSoKx6Ombu_8_bg0IaDHaXOrq9QaJ1fygvfgyQH-omoYzIJTdGrEPSNcSzf48C6zXyUqaiRLKe0b5IMYiUx53BHHNPTpnR6vvakUG7kEzS1_HQs10EmTYnYMARskYiv1zA_6JYHRew',
        chapter: 112, genre: 'Kỳ ảo', time: '7 giờ trước', status: 'normal', following: false,
    },
    {
        id: 11,
        title: 'Kẻ Săn Đêm Bí Ẩn',
        slug: 'ke-san-dem-bi-an',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1oY0tjAOHEU5hX3WhM-nSyexHFz15WYisyVGQxCMz-QqfN5I8ttkpFlTmOE24VlfLbYyXhYmyB3Hy9okOltPMor6tT3tfmNKzz5j1jYQeK4cJNj4OeMUS_v-OMtlBSeR-40OPZJkoK-_HJocjO6ICyunMgpoCIwLVR7d0B_4-a2y-Q8KkN5w8xWShxMO9W3OFJm0i4lhTwAypwqjUOjCdrmKy8VxOoSx8lVg7f0FCS0shoT1qZbkJGw',
        chapter: 34, genre: 'Bí ẩn', time: '8 giờ trước', status: 'full', following: false,
    },
    {
        id: 12,
        title: 'Huyết Chiến Vực Thẳm',
        slug: 'huyet-chien-vuc-tham',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnIIyxpOFQiuIEMj7UDmdzx3LwNOcgGxHI68p6_8x3Y_pNZ8QK83o9W_pVYhPUcLJrCs1jKZP9zfcZ7trZ6K4wLbCh5JxemG1aNkxlvVsQkU6xxene9ysTAteN-6fOmRtyfKHaliErd-ZJxGiT15Z1F_iBoMqsry6xaB16Qn5-PslvVbamWNW2A_ETfQaf-X27hgTCoMQ1vHoSXyOOD-OVHDNL5smedqy7T9SDW3P-Uxkv2WHMopQC4Q',
        chapter: 19, genre: 'Hành động', time: '10 giờ trước', status: 'new', following: true,
    },
];

function LatestComicsPage() {
    const [comics] = useState(initialComics);
    const [activeFilter, setActiveFilter] = useState('all');
    const [genre, setGenre] = useState('all');
    const [sort, setSort] = useState('newest');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const filteredComics = useMemo(() => {
        let result = [...comics];

        if (activeFilter === 'following') {
            result = result.filter((comic) => comic.following);
        } else if (activeFilter === 'new') {
            result = result.filter((comic) => comic.status === 'new');
        } else if (activeFilter === 'completed') {
            result = result.filter((comic) => comic.status === 'full');
        }

        if (genre !== 'all') {
            result = result.filter((comic) => comic.genre === genre);
        }

        if (search.trim()) {
            result = result.filter((comic) =>
                comic.title.toLowerCase().includes(search.toLowerCase()),
            );
        }

        if (sort === 'chapters') {
            result.sort((a, b) => b.chapter - a.chapter);
        } else if (sort === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        } else {
            result.sort((a, b) => a.id - b.id);
        }

        return result;
    }, [comics, activeFilter, genre, sort, search]);

    return (
        <div className="latest-page">
            <header className="latest-header">
                <div className="latest-header-inner">
                    <a className="latest-logo" href="/">
                        <span className="latest-logo-icon">🔥</span>
                        <span>Comic<span>Hub</span></span>
                    </a>

                    <nav className="latest-nav">
                        <a href="/">Trang chủ</a>
                        <a className="active" href="/latest">Truyện mới cập nhật</a>
                        <a href="/history">Lịch sử đọc</a>
                    </nav>

                    <div className="latest-header-actions">
                        <input
                            className="latest-search"
                            placeholder="Tìm tên truyện..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <a className="latest-avatar" href="/login">U</a>
                    </div>
                </div>
            </header>

            <main className="latest-main">
                <section className="latest-heading">
                    <div>
                        <span className="latest-live"><i /> CẬP NHẬT 24/7</span>
                        <h1>Truyện mới cập nhật <span>/</span> <small>Real-time</small></h1>
                        <p>
                            Cập nhật những chương truyện mới nhất. Khám phá các bộ manga,
                            manhwa tuyển chọn không thể bỏ lỡ.
                        </p>
                    </div>

                    <div className="latest-system">
                        <span className="system-icon">ϟ</span>
                        <div>
                            <small>HỆ THỐNG ĐỒNG BỘ</small>
                            <strong>14.280+ chương mới hôm nay</strong>
                        </div>
                    </div>
                </section>

                <section className="latest-toolbar">
                    <div className="latest-filters">
                        <button className={activeFilter === 'all' ? 'selected' : ''} onClick={() => setActiveFilter('all')}>Tất cả</button>
                        <button className={activeFilter === 'following' ? 'selected' : ''} onClick={() => setActiveFilter('following')}>♡ Đang theo dõi</button>
                        <button className={activeFilter === 'new' ? 'selected' : ''} onClick={() => setActiveFilter('new')}>● Mới ra chương</button>
                        <button className={activeFilter === 'completed' ? 'selected' : ''} onClick={() => setActiveFilter('completed')}>Hoàn thành</button>
                    </div>

                    <div className="latest-controls">
                        <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                            <option value="all">Tất cả thể loại</option>
                            <option value="Hành động">Hành động</option>
                            <option value="Kỳ ảo">Kỳ ảo</option>
                            <option value="Lãng mạn">Lãng mạn</option>
                            <option value="Bí ẩn">Bí ẩn</option>
                            <option value="Đời thường">Đời thường</option>
                            <option value="Viễn tưởng">Viễn tưởng</option>
                            <option value="Võ thuật">Võ thuật</option>
                        </select>

                        <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            <option value="newest">Mới cập nhật nhất</option>
                            <option value="chapters">Số chương nhiều nhất</option>
                            <option value="title">Tên truyện A-Z</option>
                        </select>

                        <div className="latest-view-switch">
                            <button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')} title="Dạng lưới">▦</button>
                            <button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} title="Dạng danh sách">☷</button>
                        </div>
                    </div>
                </section>

                <section className={`latest-comic-grid ${view === 'list' ? 'list-view' : ''}`}>
                    {filteredComics.map((comic) => (
                        <a className="latest-comic-card" href={`/comics/${comic.slug}`} key={comic.id}>
                            <div className="latest-cover">
                                <img src={comic.image} alt={comic.title} loading="lazy" />
                                {comic.status === 'hot' && <span className="comic-badge hot">HOT</span>}
                                {comic.status === 'new' && <span className="comic-badge new">MỚI</span>}
                                {comic.status === 'full' && <span className="comic-badge full">FULL</span>}
                                <span className="comic-genre">{comic.genre}</span>
                            </div>

                            <div className="latest-card-info">
                                <h2 title={comic.title}>{comic.title}</h2>
                                <div className="latest-card-meta">
                                    <strong>Chương {comic.chapter}{comic.status === 'full' ? ' (Full)' : ''}</strong>
                                    <span>◷ {comic.time}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </section>

                {filteredComics.length === 0 && (
                    <div className="latest-empty">
                        <span>📚</span>
                        <h2>Không tìm thấy truyện</h2>
                        <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                        <button onClick={() => {
                            setSearch('');
                            setGenre('all');
                            setActiveFilter('all');
                        }}>Xóa bộ lọc</button>
                    </div>
                )}

                <div className="latest-pagination">
                    <span>Hiển thị <strong>{filteredComics.length === 0 ? 0 : 1} - {filteredComics.length}</strong> trong tổng số <strong>{filteredComics.length}</strong> bộ truyện</span>
                    <div>
                        <button disabled>‹</button>
                        <button className="current">1</button>
                        <button disabled>›</button>
                    </div>
                </div>
            </main>

            <footer className="latest-footer">
                <strong>Comic<span>Hub</span></strong>
                <span>© 2025 ComicHub Platform. Nền tảng đọc truyện tranh trực tuyến.</span>
                <div>
                    <a href="#">Điều khoản</a>
                    <a href="#">Bảo mật</a>
                    <a href="#">Liên hệ</a>
                </div>
            </footer>
        </div>
    );
}

export default LatestComicsPage;
