import { useEffect, useRef, useState } from 'react'
import './ProfilePage.css'
import {
    ALL_GENRES, COMICS, COMMENTS, FOLLOWS, HISTORY,
    type Comic, type CommentItem, type FollowItem, type HistoryItem,
} from './profileData'

type TabId = 'profile' | 'favorites' | 'following' | 'history' | 'comments'
type Toast = { id: number; msg: string; error?: boolean }

const Icon = ({ n, fill }: { n: string; fill?: boolean }) => (
    <span className={`ms${fill ? ' fill' : ''}`}>{n}</span>
)
const Cover = ({ c, className }: { c: Comic; className: string }) => (
    <div className={className} style={{ background: `linear-gradient(160deg, ${c.from}, ${c.to})` }}>
        {c.cover && <img src={c.cover} alt={c.title} />}
    </div>
)
const comicOf = (id: number) => COMICS.find((c) => c.id === id)!

export default function ProfilePage() {
    const [tab, setTab] = useState<TabId>('profile')
    const [toasts, setToasts] = useState<Toast[]>([])
    const toast = (msg: string, error = false) => {
        const id = Date.now() + Math.random()
        setToasts((t) => [...t, { id, msg, error }])
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
    }

    const [favs, setFavs] = useState<Comic[]>(COMICS)
    const [follows, setFollows] = useState<FollowItem[]>(FOLLOWS)
    const [history, setHistory] = useState<HistoryItem[]>(HISTORY)
    const [comments, setComments] = useState<CommentItem[]>(COMMENTS)
    const [confirmClear, setConfirmClear] = useState(false)

    const INIT = {
        name: 'Kuro MangaMaster', username: 'kuromanga', email: 'kuro.reader@gmail.com',
        bio: 'Đam mê dark fantasy, seinen và manhwa hành động giật gân. Cày đêm là đam mê, một đêm 100 chap! Cứ truyện nét vẽ cháy là vào việc.',
        genres: ['Dark Fantasy', 'Hành động', 'Huyền bí', 'Seinen'],
    }
    const [form, setForm] = useState(INIT)
    const [pwd, setPwd] = useState({ cur: '', next: '', confirm: '' })
    const [show, setShow] = useState<Record<string, boolean>>({})
    const pwdRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)

    useEffect(() => { // nạp font icon nếu index.html chưa có
        if (!document.getElementById('ms-font')) {
            const l = document.createElement('link'); l.id = 'ms-font'; l.rel = 'stylesheet'
            l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
            document.head.appendChild(l)
        }
    }, [])

    const strength = pwd.next.length === 0 ? 0 : pwd.next.length < 6 ? 1 : pwd.next.length < 10 ? 2 : 3
    const strengthText = ['Chưa nhập', 'Yếu', 'Khá', 'Rất mạnh'][strength]

    const updatePassword = () => {
        if (!pwd.cur) return toast('Vui lòng nhập mật khẩu hiện tại!', true)
        if (pwd.next.length < 8) return toast('Mật khẩu mới phải có tối thiểu 8 ký tự!', true)
        if (pwd.next !== pwd.confirm) return toast('Xác nhận mật khẩu mới không khớp!', true)
        // TODO: POST /api/auth/change-password
        toast('Cập nhật mật khẩu thành công!'); setPwd({ cur: '', next: '', confirm: '' })
    }
    const goEdit = () => { setTab('profile'); setTimeout(() => nameRef.current?.focus(), 50) }
    const goPwd = () => { setTab('profile'); setTimeout(() => pwdRef.current?.focus(), 50) }

    const tabs: { id: TabId; icon: string; label: string; count?: number }[] = [
        { id: 'profile', icon: 'manage_accounts', label: 'Thông tin cá nhân' },
        { id: 'favorites', icon: 'favorite', label: 'Truyện yêu thích', count: favs.length },
        { id: 'following', icon: 'bookmark', label: 'Truyện theo dõi', count: follows.length },
        { id: 'history', icon: 'history', label: 'Lịch sử đọc', count: history.length },
        { id: 'comments', icon: 'chat', label: 'Bình luận của tôi', count: comments.length },
    ]

    return (
        <div className="pf">
            <div className="toasts">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast${t.error ? ' error' : ''}`}>
                        <span className={t.error ? '' : 'pri'}><Icon n={t.error ? 'error' : 'check_circle'} /></span>{t.msg}
                    </div>
                ))}
            </div>

            {/* Breadcrumb */}
            <section className="crumbs">
                <div className="wrap">
                    <div className="row"><span><Icon n="home" /> Trang chủ</span><Icon n="chevron_right" /> Tài khoản độc giả <Icon n="chevron_right" /><b className="pri">Trang cá nhân</b></div>
                    <div className="row">
                        <span><span className="pri"><Icon n="calendar_today" /></span>Gia nhập: <b>15/10/2023</b></span>
                        <span><span className="pri"><Icon n="schedule" /></span><b>48</b> Giờ đọc</span>
                        <span><span className="pri"><Icon n="menu_book" /></span><b>12</b> Truyện hoàn thành</span>
                    </div>
                </div>
            </section>

            {/* Hero */}
            <section className="hero">
                <div className="wrap">
                    <div className="hero-card">
                        <div className="hero-left">
                            <div className="avatar-wrap">
                                <div className="avatar head">K</div>
                                <label className="avatar-btn">
                                    <Icon n="photo_camera" />
                                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && toast('Đã tải lên ảnh đại diện mới thành công!')} />
                                </label>
                            </div>
                            <div>
                                <div className="name-row">
                                    <h1 className="head">{form.name}</h1>
                                    <span className="badge-honor"><Icon n="verified" />Tác giả danh dự</span>
                                </div>
                                <div className="handle"><span className="mono">@{form.username}</span> • {form.email} <span className="pri"><Icon n="check_circle" /></span></div>
                                <p className="bio-quote">“{form.bio}”</p>
                                <div className="chips">
                                    {[['nightlight', 'Cú đêm Manga'], ['local_fire_department', 'Fan Cuồng Berserk'], ['comment', 'Bình luận viên Vàng']].map(([i, l]) => (
                                        <span key={l} className="chip"><span className="pri"><Icon n={i} /></span>{l}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hero-right">
                            <div className="btn-row">
                                <button className="btn btn-pri" onClick={goEdit}><Icon n="edit" />Chỉnh sửa hồ sơ</button>
                                <button className="btn btn-sec" onClick={goPwd}><Icon n="lock_reset" />Đổi mật khẩu</button>
                            </div>
                            <div className="stats">
                                <div className="stat"><b className="head pri">{favs.length}</b><span>Yêu thích</span></div>
                                <div className="stat"><b className="head">{follows.length}</b><span>Theo dõi</span></div>
                                <div className="stat"><b className="head" style={{ color: '#dee2f1' }}>{comments.length}</b><span>Bình luận</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <nav className="tabs">
                <div className="wrap">
                    {tabs.map((t) => (
                        <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                            <Icon n={t.icon} />{t.label}
                            {t.count !== undefined && <span className="count">{t.count}</span>}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="wrap body">
                {/* TAB: profile */}
                {tab === 'profile' && (
                    <div className="grid-profile">
                        <div className="card">
                            <div className="card-head">
                                <h2><span className="pri"><Icon n="badge" /></span>Cập nhật hồ sơ</h2>
                                <small>Cập nhật lần cuối: 2 ngày trước</small>
                            </div>
                            <div className="row2">
                                <label className="field"><span>Tên hiển thị <span className="pri">*</span></span>
                                    <input ref={nameRef} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                                <label className="field"><span>Tên người dùng (ID) <span className="pri">*</span></span>
                                    <input className="input mono" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
                            </div>
                            <label className="field"><span className="line"><span style={{ fontSize: 14 }}>Email tài khoản</span><span className="pri">Đã kích hoạt</span></span>
                                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                <span className="hint">Email được dùng để nhận cảnh báo bảo mật và khôi phục tài khoản.</span></label>
                            <label className="field"><span>Giới thiệu bản thân (Bio)</span>
                                <textarea rows={3} maxLength={250} className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                                <span className="line muted"><span>Tối đa 250 ký tự</span><span>{form.bio.length}/250</span></span></label>
                            <div className="field"><span>Thể loại truyện yêu thích</span>
                                <div className="pills">
                                    {ALL_GENRES.map((g) => {
                                        const on = form.genres.includes(g)
                                        return <button key={g} type="button" className={`pill${on ? ' on' : ''}`}
                                                       onClick={() => setForm({ ...form, genres: on ? form.genres.filter((x) => x !== g) : [...form.genres, g] })}>{g}</button>
                                    })}
                                </div>
                            </div>
                            <div className="actions">
                                <button className="btn btn-pri" onClick={() => toast('Thông tin hồ sơ cá nhân đã được lưu!')}><Icon n="check" />Lưu thay đổi</button>
                                <button className="btn btn-sec muted" onClick={() => setForm(INIT)}>Khôi phục ban đầu</button>
                            </div>
                        </div>

                        <div className="col">
                            <div className="card">
                                <div className="card-head"><h2><span className="pri"><Icon n="key" /></span>Đổi mật khẩu</h2></div>
                                {([['cur', 'Mật khẩu hiện tại', '••••••••••••'], ['next', 'Mật khẩu mới', 'Nhập ít nhất 8 ký tự'], ['confirm', 'Xác nhận mật khẩu mới', 'Nhập lại mật khẩu mới']] as const).map(([k, label, ph]) => (
                                    <div key={k} className="field"><span>{label}</span>
                                        <div className="pwd">
                                            <input ref={k === 'cur' ? pwdRef : undefined} className="input" type={show[k] ? 'text' : 'password'} placeholder={ph} value={pwd[k]} onChange={(e) => setPwd({ ...pwd, [k]: e.target.value })} />
                                            <button type="button" className="eye" onClick={() => setShow({ ...show, [k]: !show[k] })}><Icon n={show[k] ? 'visibility_off' : 'visibility'} /></button>
                                        </div>
                                        {k === 'next' && (
                                            <div className="strength">
                                                <div className="top"><span className="muted">Độ an toàn:</span><span className="pri">{strengthText}</span></div>
                                                <div className="bars">{[1, 2, 3].map((i) => <i key={i} className={i <= strength ? (strength === 1 ? 'weak' : 'on') : ''} />)}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button className="btn btn-sec w100" onClick={updatePassword}><Icon n="security" />Cập nhật mật khẩu</button>
                            </div>
                            <div className="card" style={{ gap: 8 }}>
                                <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span className="pri"><Icon n="tune" /></span>Cài đặt &amp; Quyền riêng tư</h3>
                                {[['Thông báo khi có chương mới', true], ['Nhận email sự kiện & khuyến mãi', false], ['Ẩn lịch sử đọc công khai', true]].map(([l, c]) => (
                                    <label key={l as string} className="setting">{l}<input type="checkbox" defaultChecked={c as boolean} /></label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: favorites */}
                {tab === 'favorites' && (
                    <section>
                        <div className="sec-head"><div><h2><span className="pri"><Icon n="favorite" /></span>Bộ sưu tập Yêu thích</h2><p>Tất cả những bộ truyện bạn đã bấm thả tim và ưu tiên đọc.</p></div></div>
                        <div className="fav-grid">
                            {favs.map((c) => (
                                <div key={c.id} className="comic">
                                    <div className="cover-box">
                                        <Cover c={c} className="cover" />
                                        <div className="shade" />
                                        {c.badge && <span className="badge">{c.badge}</span>}
                                        <button className="heart" title="Bỏ yêu thích" onClick={() => { setFavs(favs.filter((x) => x.id !== c.id)); toast('Đã xóa truyện khỏi danh sách yêu thích!') }}><Icon n="favorite" fill /></button>
                                        <div className="cover-meta"><span className="ch">Ch. {c.chapter}</span><span className="star"><Icon n="star" fill />{c.rating}</span></div>
                                    </div>
                                    <div className="comic-body">
                                        <div><small>{c.genres}</small><h3>{c.title}</h3></div>
                                        <button className="btn-read"><Icon n="menu_book" />Đọc ngay</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TAB: following */}
                {tab === 'following' && (
                    <section>
                        <div className="sec-head">
                            <div><h2><span className="pri"><Icon n="bookmark" /></span>Danh sách theo dõi ({follows.length})</h2><p>Nhận thông báo ngay khi nhóm dịch xuất bản chương mới.</p></div>
                            <button className="btn btn-sec muted" onClick={() => { setFollows(follows.map((f) => ({ ...f, bell: true }))); toast('Đã bật chuông thông báo chương mới!') }}><Icon n="notifications_active" />Bật tất cả chuông</button>
                        </div>
                        <div className="list">
                            {follows.map((f) => { const c = comicOf(f.comicId); return (
                                <div key={f.comicId} className="item">
                                    <div className="item-left">
                                        <Cover c={c} className="thumb" />
                                        <div style={{ minWidth: 0 }}>
                                            <div className="tagrow"><span className={`tag${f.hasNew ? ' new' : ''}`}>{f.badge}</span><span className="muted">{f.time}</span></div>
                                            <h3>{c.title}</h3><small>{f.info}</small>
                                        </div>
                                    </div>
                                    <div className="item-right">
                                        <button className={`icon-btn${f.bell ? ' on' : ''}`} title="Bật/Tắt chuông" onClick={() => { setFollows(follows.map((x) => x.comicId === f.comicId ? { ...x, bell: !x.bell } : x)); toast(f.bell ? 'Đã tắt chuông thông báo chương mới.' : 'Đã bật chuông thông báo chương mới!') }}><Icon n={f.bell ? 'notifications_active' : 'notifications_none'} /></button>
                                        <a href="#" className={`btn-go${f.hasNew || f.bell ? ' pri' : ''}`}>{f.action}</a>
                                        <button className="icon-btn del" title="Hủy theo dõi" onClick={() => { setFollows(follows.filter((x) => x.comicId !== f.comicId)); toast('Đã hủy theo dõi truyện.') }}><Icon n="bookmark_remove" /></button>
                                    </div>
                                </div>) })}
                        </div>
                    </section>
                )}

                {/* TAB: history */}
                {tab === 'history' && (
                    <section>
                        <div className="sec-head">
                            <div><h2><span className="pri"><Icon n="history" /></span>Tiến trình đọc gần đây ({history.length})</h2><p>Tự động đồng bộ vị trí trang đọc dở trên mọi thiết bị.</p></div>
                            <button className="btn btn-danger" onClick={() => setConfirmClear(true)}><Icon n="delete_sweep" />Xóa toàn bộ lịch sử</button>
                        </div>
                        <div className="history-box">
                            {history.length === 0 && <div className="empty"><Icon n="menu_book" /><p>Lịch sử đọc của bạn đang trống</p><p style={{ fontSize: 12 }}>Hãy khám phá thêm hàng ngàn bộ truyện đặc sắc tại ComicHub!</p></div>}
                            {history.map((h) => { const c = comicOf(h.comicId); return (
                                <div key={h.id} className="item">
                                    <div className="item-left">
                                        <Cover c={c} className="thumb sm" />
                                        <div>
                                            <h3>{c.title}</h3>
                                            <div className="meta"><span className="ch">{h.chapter}</span>•<span>{h.page}</span>•<span>{h.time}</span></div>
                                            <div className="progress"><div className={h.percent === 100 ? 'done' : ''} style={{ width: `${h.percent}%` }} /></div>
                                        </div>
                                    </div>
                                    <div className="item-right">
                                        <a href="#" className={`btn-go${h.percent === 100 ? '' : ' pri'}`}><Icon n={h.percent === 100 ? 'arrow_forward' : 'play_arrow'} />{h.action}</a>
                                        <button className="icon-btn del" title="Xóa bản ghi này" onClick={() => { setHistory(history.filter((x) => x.id !== h.id)); toast('Đã xóa bản ghi khỏi lịch sử đọc.') }}><Icon n="close" /></button>
                                    </div>
                                </div>) })}
                        </div>
                    </section>
                )}

                {/* TAB: comments */}
                {tab === 'comments' && (
                    <section>
                        <div className="sec-head">
                            <div><h2><span className="pri"><Icon n="chat" /></span>Nhật ký Thảo luận ({comments.length})</h2><p>Các bình luận và phản hồi bạn đã để lại trên các chương truyện.</p></div>
                            <span className="pill-total">Tổng lượt thích nhận được: 894 ❤️</span>
                        </div>
                        {comments.map((c) => (
                            <div key={c.id} className="comment">
                                <div className="c-top">
                                    <div className="c-user">
                                        <div className="c-ava">K</div>
                                        <div><div><b>{form.name}</b> <small className="muted">• {c.time}</small></div><div className="c-where"><Icon n="menu_book" />{c.where}</div></div>
                                    </div>
                                    <div>
                                        <button className="mini-btn" title="Chỉnh sửa bình luận" onClick={() => toast('Tính năng chỉnh sửa bình luận đang sẵn sàng!')}><Icon n="edit" /></button>
                                        <button className="mini-btn" title="Xóa bình luận" onClick={() => { setComments(comments.filter((x) => x.id !== c.id)); toast('Đã xóa bình luận của bạn.') }}><Icon n="delete" /></button>
                                    </div>
                                </div>
                                <div className="c-body">“{c.text}”</div>
                                <div className="c-foot">
                                    <span><span className="likes"><Icon n="favorite" fill /> {c.likes} Thích</span><Icon n="reply" /> {c.replies} Trả lời</span>
                                    <a href="#">Xem thảo luận chương <Icon n="open_in_new" /></a>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>

            {confirmClear && (
                <div className="overlay">
                    <div className="modal">
                        <div className="ico"><Icon n="warning" /></div>
                        <h3>Xóa toàn bộ lịch sử đọc?</h3>
                        <p>Hành động này sẽ xóa toàn bộ {history.length} truyện trong tiến trình đọc của bạn và không thể khôi phục.</p>
                        <div className="btns">
                            <button className="cancel" onClick={() => setConfirmClear(false)}>Hủy bỏ</button>
                            <button className="ok" onClick={() => { setHistory([]); setConfirmClear(false); toast('Đã xóa toàn bộ lịch sử đọc thành công!') }}>Xác nhận xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}