import { useEffect, useMemo, useState } from 'react';
import './ReaderPage.css';

const panels = [
    {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOVYzZ2gWCqLAIxW51MhDEooNf1q9mTmxYRkkbw3SLTAllCFa6NigFYCMUTcd0mFN0QY8kNNxU8AOGnFlyc6O5jgLEIXbh0CVJ2FE1g735VWCR1ghgMHf6Zt5Fumi7359qnGVauzF1nxd4rb6TVjfUH8eysTjFVy8y8Qsjs_hFnRdiqgNXabby5lUD6NfQJuN5_0w4r4OVz8FajsNX-JPi8H0V0j_IPFhetLSVbQzm-7J671Dpw2qaKQ',
        alt: 'Trăng máu trên tòa thành Valdoria',
        sfx: 'GOOOOO...',
        dialogue: '"Trăng máu đã tròn... phong ấn một nghìn năm qua... rốt cuộc đã bắt đầu vỡ vụn?!"',
        number: '01/05',
    },
    {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfxke8VChqVVbIgKld_84gkcavQKsV8AbxvvRcPS8nsrWNwINYCoOOD826iytD3EBdKo1zZlfgNMqio4lCjVuY1GI6ZfLZ26E4OZsQ0ZkN4MJ-yPqbSGXz6ddGcuNTHIcEzQ0AzTIu7hL2rwANxZrJvgh0zeeCag0Rg-2szdKFxtl9-9EH0F8VQZXJ12Shz1FuuI0-QKQ6O0mnZuHahHnqNvN0eNbYCVP-j9qlG3uZVGXadPkeSqRAoA',
        alt: 'Bầy quỷ bóng đêm xuất hiện',
        sfx: 'SHRAAASH!',
        dialogue: '"Máu của kẻ mang dấu ấn... gươm thiêng đã phản bội ngươi!"',
        number: '02/05',
    },
    {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN3vB1eYvNbocvK9_3F9NzS3XbjUUZd1RMv8MzXh22u7Qe5ztaZzy5w3t-omD_w2w8ZLue0aQnBehI-Hq1_TRforUL8RVXlizM64xaQllvu9FDD6MYhCmVpfVDIYYoOfYkVw2X8eRZX0bJO9KGvMaNXreIaZ1b0mLzrpf30wAiFesQt1TIXAeytwOCofHl-2IDeCTx05pI9--_35WS_SIlD4QM9d52gVbYv9QJpX_BDDX_-SmlBjeJug',
        alt: 'Thanh kiếm cổ đại phát sáng',
        sfx: 'ZWIIIIINNG!',
        dialogue: '"Khai mở: Nguyệt Thần Huyết Nhẫn!"',
        number: '03/05',
    },
    {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXLLBw3tUIRTb6EovFqyk-DOAI1g27p5mFAC9oOjSIn2eeX1Z-S6KLHXnRwfNrBNHBIDOjTFHXpdGVwUFkragp6aEgWy07Zh9hIkICAE-b4pnE2xjKy4n8OecGk1yqIy2GndgRahHuBmnMCfWBBINmq0n6V1nlo3Vy6geYaeSAcMquu5oyzGCe9GIqP8vrxZ_ZN7mDqirRp7XEEVmW1wo1EYxhDPFMNVp6wUHWkYzvOSLtEwanB5yN2A',
        alt: 'Kaelen tung nhát kiếm năng lượng đỏ',
        sfx: 'BOOOOOM!!',
        dialogue: 'Tia kiếm khí xé toạc màn đêm lạnh giá của Valdoria...',
        number: '04/05',
    },
    {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCIxAJTEFRKWFQrpl5cr7q2KkV7XXoEM64XKmrCEmBZe_O-IvAwULbuRpvrVmCMEX4oz2hsyRTS8xyBJbNX1pZ-9jn89KAmBQjHlNwAScZz5d0JJ3b1nURosD6HftyYgCVBth_30pb9EnwGuJpPoLco6JyYbZ3dxQ3Ue34U4PbcmO7jJzpHACdkDdOYGuROALQX0qlaHft4uiQCbxDbMsDiWCtcya7FP7GH29a4-YsVojPTVLPAVQ0SQ',
        alt: 'Bóng người bí ẩn xuất hiện dưới trăng máu',
        sfx: '',
        dialogue: '"Làm tốt lắm, kẻ thừa kế... Hẹn gặp ngươi tại Huyết Thành."',
        number: '05/05',
    },
];

const chapterList = [
    'Chương 25: Lời nguyền thức tỉnh',
    'Chương 24: Huyết ma trỗi dậy',
    'Chương 23: Dấu vết phong ấn',
    'Chương 22: Tàn tích Valdoria',
    'Chương 21: Lời tiên tri bóng tối',
];

function ReaderPage() {
    const [progress, setProgress] = useState(0);
    const [chapterMenu, setChapterMenu] = useState(false);
    const [chapterSearch, setChapterSearch] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [width, setWidth] = useState(880);
    const [theme, setTheme] = useState<'night' | 'gray' | 'amber'>('night');
    const [mode, setMode] = useState<'scroll' | 'single'>('scroll');
    const [page, setPage] = useState(0);
    const [autoScroll, setAutoScroll] = useState(false);
    const [speed, setSpeed] = useState(2);
    const [bookmarked, setBookmarked] = useState(false);
    const [aiOpen, setAiOpen] = useState(true);
    const [aiMinimized, setAiMinimized] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiReply, setAiReply] = useState('');
    const [comment, setComment] = useState('');
    const [spoiler, setSpoiler] = useState(false);
    const [comments, setComments] = useState([
        { name: 'Vũ Thần Kiếm', initials: 'VN', time: '45 phút trước', text: 'Nét vẽ trận này đỉnh thực sự! Quả chém trang 4 có góc phối cảnh cực kỳ bùng nổ. Mình đoán kẻ xuất hiện ở vòm đá cuối chương là Công Tước Dạ Thần!', likes: 142 },
        { name: 'Hoàng Linh Manga', initials: 'HL', time: '1 giờ trước', text: 'Lời nguyền của Nguyệt Tộc cuối cùng cũng chịu hé lộ. Chap này Kaelen bung sức mạnh coi đã mắt quá!', likes: 89 },
    ]);
    const [spoilerVisible, setSpoilerVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [toast, setToast] = useState('');

    const filteredChapters = useMemo(
        () => chapterList.filter((item) => item.toLowerCase().includes(chapterSearch.toLowerCase())),
        [chapterSearch],
    );

    function notify(message: string) {
        setToast(message);
        window.setTimeout(() => setToast(''), 2600);
    }

    useEffect(() => {
        const updateProgress = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);
        };
        window.addEventListener('scroll', updateProgress);
        updateProgress();
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    useEffect(() => {
        if (!autoScroll || mode === 'single') return;
        const timer = window.setInterval(() => {
            window.scrollBy({ top: speed, behavior: 'auto' });
        }, 45);
        return () => window.clearInterval(timer);
    }, [autoScroll, speed, mode]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
            if (event.key === 'ArrowLeft') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (event.key === 'ArrowRight' && mode === 'single') {
                setPage((current) => Math.min(panels.length - 1, current + 1));
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mode]);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            void document.documentElement.requestFullscreen?.().catch(() => notify('Trình duyệt không hỗ trợ toàn màn hình.'));
        } else {
            void document.exitFullscreen?.();
        }
    }

    function submitComment() {
        if (!comment.trim()) {
            notify('Bạn hãy nhập nội dung bình luận trước nhé.');
            return;
        }
        setComments((current) => [
            { name: 'Bạn đọc', initials: 'BD', time: 'Vừa xong', text: `${spoiler ? '[Có spoiler] ' : ''}${comment.trim()}`, likes: 0 },
            ...current,
        ]);
        setComment('');
        setSpoiler(false);
        notify('Đã thêm bình luận vào giao diện.');
    }

    function askAI(question = aiQuestion) {
        if (!question.trim()) return;
        setAiReply('Đây là bản minh họa giao diện ComicHub AI. Kaelen đã đánh thức sức mạnh của thanh kiếm khi phong ấn dưới trăng máu bắt đầu tan vỡ.');
        setAiQuestion('');
    }

    return (
        <div className={`reader-page reader-theme-${theme}`}>
            <header className="reader-header">
                <div className="reader-header-left">
                    <a className="reader-logo" href="/">ComicHub</a>
                    <span className="reader-header-divider" />
                    <a className="reader-back" href="/comic/the-last-crimson-moon">← Quay lại truyện</a>
                    <div className="reader-current-title">
                        <strong>The Last Crimson Moon</strong>
                        <span>● Chương 25: Lời nguyền thức tỉnh</span>
                    </div>
                </div>
                <div className="reader-header-actions">
                    <button className={bookmarked ? 'reader-small-button active' : 'reader-small-button'} onClick={() => setBookmarked(!bookmarked)}>
                        {bookmarked ? '★ Đã lưu' : '☆ Lưu truyện'}
                    </button>
                    <button className="reader-icon-button" onClick={() => setSettingsOpen(!settingsOpen)} aria-label="Cài đặt">⚙</button>
                    <a className="reader-avatar" href="/login">U</a>
                </div>
            </header>

            <div className="reader-progress-track"><div className="reader-progress-value" style={{ width: `${progress}%` }} /></div>

            <main className="reader-main">
                <nav className="reader-subnav">
                    <div className="reader-chapter-controls">
                        <button className="reader-nav-button" onClick={() => notify('Bạn đang ở chương mới nhất trong dữ liệu mẫu.')}>‹ Chương 24</button>
                        <div className="reader-dropdown-wrap">
                            <button className="reader-nav-button reader-current-chapter" onClick={() => setChapterMenu(!chapterMenu)}>
                                <b>#25</b> Chương 25: Lời nguyền thức tỉnh⌄
                            </button>
                            {chapterMenu && (
                                <div className="reader-chapter-menu">
                                    <input value={chapterSearch} onChange={(event) => setChapterSearch(event.target.value)} placeholder="Tìm kiếm chương..." />
                                    {filteredChapters.map((item) => (
                                        <button key={item} className={item.startsWith('Chương 25') ? 'selected' : ''} onClick={() => { setChapterMenu(false); notify(`${item} đang là dữ liệu xem thử.`); }}>
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="reader-nav-button disabled" disabled>Chương sau ›</button>
                    </div>
                    <div className="reader-mode-switch">
                        <button className={mode === 'scroll' ? 'selected' : ''} onClick={() => setMode('scroll')}>☷ Cuộn dọc</button>
                        <button className={mode === 'single' ? 'selected' : ''} onClick={() => setMode('single')}>▣ Từng trang</button>
                    </div>
                </nav>

                <section className="reader-intro">
                    <span className="reader-kicker">● THE LAST CRIMSON MOON · KỲ ẢO · HÀNH ĐỘNG</span>
                    <h1>Chương 25: Lời Nguyền Thức Tỉnh</h1>
                    <p>Tác giả: Huyết Nguyệt Studio <i>•</i> Dịch thuật: Kuro Team <i>•</i> <span>Độ phân giải: 4K UHD Remaster</span></p>
                    <div className="reader-keyboard-hint">⌨ Nhấn phím [←] hoặc [→] để chuyển trang • Cuộn chuột để lướt mượt</div>
                </section>

                <div className="reader-layout">
                    <section className="reader-lane" style={{ maxWidth: `${width}px` }}>
                        {mode === 'scroll' ? panels.map((panel, index) => (
                            <article className="reader-panel" key={panel.number}>
                                <img src={panel.image} alt={panel.alt} />
                                {panel.sfx && <span className={`reader-sfx reader-sfx-${index}`}>{panel.sfx}</span>}
                                {index === 0 && <div className="reader-dialogue reader-dialogue-top">{panel.dialogue}</div>}
                                {index === 1 && <div className="reader-dialogue reader-dialogue-bottom"><b>Bầy Quỷ Dạ Hành:</b> {panel.dialogue}</div>}
                                {index === 2 && <div className="reader-dialogue reader-dialogue-center"><b>{panel.dialogue}</b><br />Nếu số phận muốn ta trở thành quỷ vương của bóng đêm, ta sẽ dùng chính thanh gươm này để thiêu rụi màn đêm đó!</div>}
                                {index === 3 && <div className="reader-dialogue reader-dialogue-bottom">{panel.dialogue}</div>}
                                {index === 4 && <div className="reader-dialogue reader-dialogue-bottom"><b>Thực thể bóng đêm:</b><br />{panel.dialogue}</div>}
                                <span className="reader-panel-number">COMICHUB WEBTOON • TRANG {panel.number}</span>
                                {index === 4 && <span className="reader-end-stamp">● HẾT CHƯƠNG 25</span>}
                            </article>
                        )) : (
                            <article className="reader-panel reader-single-panel">
                                <img src={panels[page].image} alt={panels[page].alt} />
                                <span className="reader-panel-number">TRANG {panels[page].number}</span>
                                <div className="reader-single-caption">{panels[page].dialogue}</div>
                            </article>
                        )}
                        {mode === 'single' && (
                            <div className="reader-page-controls">
                                <button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>← Trang trước</button>
                                <span>{page + 1} / {panels.length}</span>
                                <button disabled={page === panels.length - 1} onClick={() => setPage((current) => Math.min(panels.length - 1, current + 1))}>Trang sau →</button>
                            </div>
                        )}
                    </section>

                    <aside className="reader-floating-dock">
                        <button title="Mở ComicHub AI" onClick={() => { setAiOpen(true); setAiMinimized(false); }}>✦</button>
                        <button title="Cuộn lên đầu" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
                        <button title="Đánh dấu trang" onClick={() => notify('Đã đánh dấu vị trí đọc hiện tại.')}>▣</button>
                        <button title="Cài đặt đọc" onClick={() => setSettingsOpen(!settingsOpen)}>⚙</button>
                        <button title="Toàn màn hình" onClick={toggleFullscreen}>⛶</button>
                    </aside>
                </div>

                {settingsOpen && (
                    <section className="reader-settings">
                        <div className="reader-settings-heading"><strong>⚙ Tùy chỉnh trải nghiệm</strong><button onClick={() => setSettingsOpen(false)}>×</button></div>
                        <label>Độ rộng hiển thị truyện</label>
                        <div className="reader-setting-options">
                            {[720, 880, 1020].map((item) => <button key={item} className={width === item ? 'selected' : ''} onClick={() => setWidth(item)}>{item}px</button>)}
                        </div>
                        <label>Màu sắc không gian đọc</label>
                        <div className="reader-setting-options">
                            <button className={theme === 'night' ? 'selected' : ''} onClick={() => setTheme('night')}>Đêm sâu</button>
                            <button className={theme === 'gray' ? 'selected' : ''} onClick={() => setTheme('gray')}>Xám dịu</button>
                            <button className={theme === 'amber' ? 'selected' : ''} onClick={() => setTheme('amber')}>Hổ phách</button>
                        </div>
                        <label className="reader-auto-label"><input type="checkbox" checked={autoScroll} onChange={(event) => setAutoScroll(event.target.checked)} /> Tự động cuộn trang</label>
                        <div className="reader-speed"><span>Chậm</span><input type="range" min="1" max="5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><span>Nhanh</span></div>
                    </section>
                )}

                {aiOpen && (
                    <section className={`reader-ai ${aiMinimized ? 'minimized' : ''}`}>
                        <div className="reader-ai-heading">
                            <strong>✦ ComicHub AI <small>BETA</small></strong>
                            <button onClick={() => setAiMinimized(!aiMinimized)}>{aiMinimized ? '□' : '−'}</button>
                            <button onClick={() => setAiOpen(false)}>×</button>
                        </div>
                        {!aiMinimized && <div className="reader-ai-content">
                            <p><b>✨ Trợ lý phân tích:</b><br />Kaelen vừa thức tỉnh thanh gươm Huyết Nhẫn sau khi trăng máu đạt thiên đỉnh. Cổ tự trên lưỡi kiếm trùng khớp với phong ấn của Huyết Ma tại Chương 12.</p>
                            <div className="reader-ai-chips">
                                <button onClick={() => askAI('Tóm tắt chương 25')}>⚡ Tóm tắt Ch.25</button>
                                <button onClick={() => askAI('Nguồn gốc thanh kiếm')}>🗡 Nguồn gốc thanh kiếm</button>
                                <button onClick={() => askAI('Kẻ lạ mặt cuối chương là ai?')}>👁 Kẻ lạ mặt là ai?</button>
                            </div>
                            {aiReply && <p className="reader-ai-reply">{aiReply}</p>}
                            <form onSubmit={(event) => { event.preventDefault(); askAI(); }}>
                                <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Hỏi AI về tình tiết bộ truyện..." />
                                <button type="submit">➤</button>
                            </form>
                        </div>}
                    </section>
                )}

                <section className="reader-complete">
                    <div className="reader-complete-icon">✓</div>
                    <h2>Tuyệt vời! Bạn đã hoàn thành Chương 25</h2>
                    <p>Bạn đang xem chương mới nhất hiện tại của <b>The Last Crimson Moon</b>. Chương 26 dự kiến ra mắt vào Thứ Bảy tuần này (18:00 UTC+7).</p>
                    <div className="reader-complete-actions">
                        <button className="primary" onClick={() => notify('Đã đăng ký nhận thông báo chương mới (bản xem thử).')}>♧ Đăng ký nhận tin Ch.26</button>
                        <a href="/comic/the-last-crimson-moon">← Quay lại trang truyện</a>
                        <button onClick={() => { setBookmarked(true); notify('Đã thêm vào tủ truyện.'); }}>♡ Thêm vào tủ truyện yêu thích</button>
                    </div>
                    <div className="reader-rating">
                        <span>Bạn chấm điểm chương này thế nào?</span>
                        <div>{[1, 2, 3, 4, 5].map((star) => <button key={star} className={rating >= star ? 'rated' : ''} onClick={() => { setRating(star); notify(`Bạn đã chấm ${star}/5 sao.`); }}>★</button>)} <b>{rating ? `${rating}/5` : '4.9/5'} (1.2K lượt)</b></div>
                    </div>
                </section>

                <section className="reader-comments">
                    <div className="reader-comments-title"><h2>Thảo luận & Bình luận</h2><span>{86 + comments.length - 2}</span></div>
                    <div className="reader-comment-form">
                        <div className="reader-comment-avatar">U</div>
                        <div className="reader-comment-fields">
                            <textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Chia sẻ suy nghĩ, giả thuyết về chương truyện..." />
                            <div className="reader-comment-form-bottom">
                                <label><input type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} /> Cảnh báo Spoilers</label>
                                <button onClick={submitComment}>Gửi bình luận</button>
                            </div>
                        </div>
                    </div>
                    <div className="reader-comment-list">
                        {comments.map((item, index) => (
                            <article className="reader-comment" key={`${item.name}-${index}`}>
                                <div className="reader-comment-top"><span className="reader-comment-avatar">{item.initials}</span><div><b>{item.name}</b><small>{item.time}</small></div></div>
                                <p>{item.text}</p>
                                <div className="reader-comment-actions"><button onClick={() => notify('Bạn cần đăng nhập để thích bình luận.')}>♡ {item.likes}</button><button onClick={() => notify('Tính năng trả lời sẽ được bổ sung sau.')}>Trả lời</button><button onClick={() => notify('Đã sao chép liên kết bình luận (bản xem thử).')}>Chia sẻ</button></div>
                            </article>
                        ))}
                        <article className="reader-comment">
                            <div className="reader-comment-top"><span className="reader-comment-avatar">KD</span><div><b>Kaelen_Defenders</b><small>2 giờ trước</small></div></div>
                            <button className="reader-spoiler" onClick={() => setSpoilerVisible(!spoilerVisible)}>⚠ Bình luận chứa thông tin Spoiler về tiểu thuyết gốc (Nhấn để {spoilerVisible ? 'đóng' : 'mở xem'})</button>
                            {spoilerVisible && <p>Giả thuyết: nhân vật bí ẩn có liên quan đến lời tiên tri của Nguyệt Tộc.</p>}
                            <div className="reader-comment-actions"><button onClick={() => notify('Bạn cần đăng nhập để thích bình luận.')}>♡ 34</button><button onClick={() => notify('Tính năng trả lời sẽ được bổ sung sau.')}>Trả lời</button></div>
                        </article>
                    </div>
                    <button className="reader-load-more" onClick={() => notify('Đã hiển thị tất cả bình luận mẫu.')}>Tải thêm bình luận (còn 83 bình luận)</button>
                </section>
            </main>

            <footer className="reader-footer"><span>ComicHub Focused Reader View</span><span>Nhấn F11 để đọc toàn màn hình</span></footer>
            {toast && <div className="reader-toast">ⓘ {toast}</div>}
        </div>
    );
}

export default ReaderPage;