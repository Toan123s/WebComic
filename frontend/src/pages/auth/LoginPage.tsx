import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { login } from '../../services/authService';
import type { LoginResult } from '../../types/auth';
import './LoginPage.css';

/* ---------- Icon SVG nhỏ (không cần font ngoài) ---------- */
const ICONS: Record<string, ReactNode> = {
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 7.6A17 17 0 0 0 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    unlock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></>,
    sparkle: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
    library: <><path d="M4 4h5v16H4zM11 4h5v16h-5z" /><path d="M18 6l3 1-4 13-3-1z" /></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
    bell: <><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z" /><path d="M10 21h4" /></>,
};

function Icon({ name, className = '' }: { name: string; className?: string }) {
    return (
        <svg className={`lg-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[name]}
        </svg>
    );
}

/* ---------- Hình minh họa nền (SVG) ---------- */
function HeroArt() {
    const embers: [number, number, number, number][] = [
        [120, 860, 2.5, 0], [260, 900, 2, 1.8], [430, 880, 3, 3.2],
        [560, 920, 2, 0.9], [680, 870, 2.5, 4.4], [340, 940, 2, 5.5],
    ];
    return (
        <svg className="lg-art" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <linearGradient id="lg-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0c0e13" /><stop offset=".55" stopColor="#3a0d0b" /><stop offset="1" stopColor="#111318" />
                </linearGradient>
                <radialGradient id="lg-glow"><stop offset="0" stopColor="#ff6b4a" stopOpacity=".55" /><stop offset="1" stopColor="#ff6b4a" stopOpacity="0" /></radialGradient>
                <radialGradient id="lg-moon" cx=".4" cy=".35"><stop offset="0" stopColor="#ffb4a3" /><stop offset=".45" stopColor="#ff6b4a" /><stop offset="1" stopColor="#8c1900" /></radialGradient>
                <filter id="lg-blur"><feGaussianBlur stdDeviation="14" /></filter>
                <filter id="lg-soft"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <rect width="800" height="1000" fill="url(#lg-sky)" />
            <circle cx="560" cy="300" r="340" fill="url(#lg-glow)" />
            <circle cx="560" cy="300" r="130" fill="url(#lg-moon)" />
            <g fill="#8c1900" opacity=".35"><circle cx="520" cy="270" r="22" /><circle cx="598" cy="340" r="16" /><circle cx="545" cy="355" r="10" /></g>
            <g filter="url(#lg-blur)" fill="#0c0e13" opacity=".85"><ellipse cx="380" cy="260" rx="260" ry="26" /><ellipse cx="700" cy="360" rx="220" ry="22" /><ellipse cx="260" cy="420" rx="240" ry="20" /></g>
            <g fill="#0c0e13">
                <path d="M0 1000V610h46v-60h38v60h30v390zM150 1000V700h34v-44h30v44h20v300z" />
                <path d="M560 1000V640q0-70 60-70t60 70v360h-34V650q0-34-26-34t-26 34v350zM700 1000V560h40v-48h36v48h24v440z" />
                <path d="M0 880q200-40 400-10t400-30v160H0z" />
            </g>
            <g transform="translate(60 0)">
                <path d="M380 650q-44 36-56 150h120q-6-100-34-150z" fill="#0c0e13" />
                <path d="M392 640q-24 20-30 36h50q-4-22-20-36z" fill="#1a1b21" />
                <circle cx="388" cy="632" r="17" fill="#0c0e13" />
                <path d="M420 710L540 540" stroke="#ff6b4a" strokeWidth="9" opacity=".7" filter="url(#lg-soft)" />
                <path d="M420 710L540 540" stroke="#ffdad2" strokeWidth="3" strokeLinecap="round" />
                <path d="M412 716l16-12" stroke="#c2c6d4" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g fill="#ff6b4a">
                {embers.map(([cx, cy, r, d]) => (
                    <circle key={cx} className="lg-ember" cx={cx} cy={cy} r={r} style={{ animationDelay: `${d}s` }} />
                ))}
            </g>
        </svg>
    );
}

const FEATURES = [
    { icon: 'library', title: 'Kho truyện đa dạng', text: 'Nhiều thể loại, ngập tràn tác phẩm chọn lọc.' },
    { icon: 'bookmark', title: 'Lưu lịch sử đọc', text: 'Tiếp tục chính xác từ phân đoạn bạn dừng lại.' },
    { icon: 'bell', title: 'Cập nhật chương mới', text: 'Nhận thông báo ngay khi bản dịch ra lò.' },
];

interface Props {
    /** Gọi sau khi đăng nhập thành công. Mặc định: về trang chủ "/". */
    onSuccess?: (result: LoginResult) => void;
}

export default function LoginPage({ onSuccess }: Props) {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!account.trim()) return setStatus({ ok: false, text: 'Nhập email hoặc tên đăng nhập.' });
        if (password.length < 6) return setStatus({ ok: false, text: 'Mật khẩu cần ít nhất 6 ký tự.' });

        setLoading(true);
        setStatus(null);
        try {
            const result = await login({ account: account.trim(), password, remember });
            setStatus({ ok: true, text: 'Đăng nhập thành công.' });
            if (onSuccess) onSuccess(result);
            else window.location.assign('/');
        } catch (err) {
            setStatus({ ok: false, text: err instanceof Error ? err.message : 'Không thể đăng nhập.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="lg-root">
            <section className="lg-left">
                <HeroArt />
                <div className="lg-scrim" />

                <header className="lg-head">
                    <div className="lg-brand">
                        <div className="lg-logo">
                            <svg viewBox="0 0 32 32" aria-hidden="true">
                                <path d="M6 6h13a7 7 0 0 1 7 7v13H13a7 7 0 0 1-7-7z" fill="#ff6b4a" />
                                <path d="M11 12h9M11 17h9M11 22h5" stroke="#661000" strokeWidth="2.4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="lg-name">Comic<span>Hub</span></div>
                            <div className="lg-sub">Manga • Webtoon • Manhwa</div>
                        </div>
                    </div>
                    <div className="lg-pill"><i /> Server Tokyo • Ổn định</div>
                </header>

                <div className="lg-hero">
                    <div className="lg-tag"><Icon name="sparkle" /> Cộng đồng đọc truyện đêm khuya</div>
                    <h1>Mở ra thế giới truyện<br /><span>của riêng bạn</span></h1>
                    <p>Khám phá hàng nghìn câu chuyện, lưu lại hành trình đọc và kết nối cùng cộng đồng độc giả đam mê truyện tranh trên toàn quốc.</p>
                    <div className="lg-stat">
                        <div className="lg-avatars"><b>VN</b><b>JP</b><b className="hot">+9k</b></div>
                        <div><strong>14.200+ chương mới</strong><small>Được cập nhật tự động mỗi ngày</small></div>
                    </div>
                </div>

                <div className="lg-features">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="lg-feat">
                            <div className="lg-feat-ic"><Icon name={f.icon} /></div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="lg-right">
                <div className="lg-card">
                    <div className="lg-card-head">
                        <h2>Chào mừng trở lại!</h2>
                        <Icon name="unlock" className="lg-accent" />
                    </div>
                    <p className="lg-muted">Đăng nhập để tiếp tục hành trình đọc truyện của bạn.</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <label htmlFor="lg-account">Email hoặc tên đăng nhập</label>
                        <div className="lg-field">
                            <Icon name="user" className="lg-lead" />
                            <input id="lg-account" type="text" autoComplete="username" value={account}
                                   onChange={(e) => setAccount(e.target.value)} placeholder="reader@comichub.vn hoặc username" />
                        </div>

                        <label htmlFor="lg-password">Mật khẩu</label>
                        <div className="lg-field">
                            <Icon name="key" className="lg-lead" />
                            <input id="lg-password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                                   value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu của bạn" />
                            <button type="button" className="lg-eye" onClick={() => setShowPw((v) => !v)}
                                    aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                                <Icon name={showPw ? 'eyeOff' : 'eye'} />
                            </button>
                        </div>

                        {status && <p role="status" className={`lg-status ${status.ok ? 'ok' : 'err'}`}>{status.text}</p>}

                        <div className="lg-row">
                            <label className="lg-check">
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                Ghi nhớ đăng nhập
                            </label>
                            <a href="/forgot-password">Quên mật khẩu?</a>
                        </div>

                        <button type="submit" className="lg-submit" disabled={loading}>
                            {loading ? 'Đang đăng nhập…' : <>Đăng nhập <Icon name="arrow" /></>}
                        </button>
                    </form>

                    <div className="lg-or"><span>Hoặc tiếp tục qua</span></div>
                    <div className="lg-social">
                        <button type="button">Google</button>
                        <button type="button">Apple ID</button>
                    </div>

                    <p className="lg-reg">Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
                </div>

                <div className="lg-foot">
                    <span>© 2026 ComicHub Platform</span>
                    <a href="/terms">Điều khoản dịch vụ</a>
                    <a href="/privacy">Quyền riêng tư</a>
                </div>
            </section>
        </main>
    );
}
