
import { useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import './AIStudioPage.css';

type Message = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
};

type Conversation = {
    id: number;
    title: string;
    messages: Message[];
};

const initialMessages: Message[] = [
    {
        id: 1,
        role: 'user',
        content: 'Mình muốn viết một bộ truyện fantasy về một cô gái phát hiện mình có năng lực điều khiển ánh trăng. Hãy giúp mình xây dựng cốt truyện.',
    },
    {
        id: 2,
        role: 'assistant',
        content: 'Ý tưởng rất thú vị! Mình đề xuất phát triển câu chuyện theo hướng fantasy, bí ẩn và trưởng thành nhân vật. Dưới đây là một khung cốt truyện ban đầu:',
    },
    {
        id: 3,
        role: 'assistant',
        content: 'DÀN Ý: NGƯỜI GIỮ ÁNH TRĂNG\n\nChương 1 — Đêm trăng vỡ\nMột cô gái trẻ tên Luna phát hiện ánh trăng phản ứng với cảm xúc của mình. Một sự kiện kỳ lạ xảy ra tại ngôi làng nơi cô sinh sống.\n\nChương 2 — Bí mật cổ xưa\nLuna tìm thấy một cuốn sách cổ hé lộ về những người canh giữ mặt trăng và nguồn gốc năng lực của cô.\n\nChương 3 — Người đồng hành\nCô gặp một chàng trai bí ẩn sở hữu chiếc nhẫn có biểu tượng mặt trăng. Cả hai bắt đầu hành trình tìm kiếm sự thật.\n\nChương 4 — Vương quốc bóng tối\nNhững bí mật về thế lực đang tìm cách đánh cắp ánh sáng mặt trăng dần được hé lộ.\n\nChương 5 — Lựa chọn của Luna\nLuna phải quyết định cách sử dụng sức mạnh của mình để bảo vệ những người cô yêu quý.',
    },
];

const initialConversations: Conversation[] = [
    { id: 1, title: 'Người Giữ Ánh Trăng', messages: initialMessages },
    {
        id: 2,
        title: 'Xây dựng nhân vật chính',
        messages: [
            { id: 4, role: 'user', content: 'Giúp mình tạo nhân vật chính cho truyện fantasy.' },
            { id: 5, role: 'assistant', content: 'Hãy bắt đầu với mục tiêu, nỗi sợ, điểm mạnh và bí mật của nhân vật nhé!' },
        ],
    },
    {
        id: 3,
        title: 'Ý tưởng truyện học đường',
        messages: [
            { id: 6, role: 'user', content: 'Gợi ý một ý tưởng truyện học đường.' },
            { id: 7, role: 'assistant', content: 'Bạn có thể khai thác tình bạn, những bí mật trong trường học và hành trình trưởng thành.' },
        ],
    },
    {
        id: 4,
        title: 'Đặt tên cho thế giới',
        messages: [
            { id: 8, role: 'user', content: 'Đặt tên cho một thế giới phép thuật.' },
            { id: 9, role: 'assistant', content: 'Một vài gợi ý: Elaria, Lunaris, Astravia, Aetheria.' },
        ],
    },
    {
        id: 5,
        title: 'Phát triển chương 10',
        messages: [
            { id: 10, role: 'user', content: 'Làm sao để chương 10 hấp dẫn hơn?' },
            { id: 11, role: 'assistant', content: 'Bạn có thể đặt một bước ngoặt bất ngờ hoặc hé lộ một bí mật quan trọng.' },
        ],
    },
];

const suggestions = [
    'Viết tiếp chương truyện',
    'Tạo nhân vật mới',
    'Gợi ý tình tiết bất ngờ',
    'Kiểm tra lỗi chính tả',
];

function createReply(prompt: string) {
    const normalized = prompt.toLowerCase();

    if (normalized.includes('nhân vật')) {
        return 'Hãy xây dựng nhân vật theo 4 yếu tố: mục tiêu, điểm mạnh, điểm yếu và bí mật. Một nhân vật hấp dẫn không cần hoàn hảo; họ cần có lý do để thay đổi trong suốt câu chuyện.';
    }

    if (normalized.includes('chương') || normalized.includes('viết tiếp')) {
        return 'Gợi ý phát triển chương tiếp theo:\n\n1. Mở đầu bằng một tình huống nối tiếp chương trước.\n2. Đặt nhân vật trước một lựa chọn khó khăn.\n3. Đưa vào một chi tiết hé lộ bí mật mới.\n4. Kết thúc bằng một tình tiết khiến độc giả muốn đọc tiếp.\n\nBạn có thể điều chỉnh các ý này theo thế giới truyện của mình.';
    }

    if (normalized.includes('tên')) {
        return 'Một số tên bạn có thể tham khảo: Lunaris, Elaria, Astravia, Valoria và Aetheria. Hãy chọn tên phù hợp với không khí và lịch sử của thế giới truyện.';
    }

    return `Mình đã nhận được ý tưởng: "${prompt}"\n\nĐây là một hướng phát triển để bạn tham khảo:\n\n1. Xác định mục tiêu chính của nhân vật.\n2. Xây dựng xung đột làm câu chuyện trở nên hấp dẫn.\n3. Tạo một tình tiết bất ngờ nhưng hợp lý.\n4. Kết thúc bằng một chi tiết mở ra diễn biến tiếp theo.\n\nBạn có thể tiếp tục trao đổi để phát triển ý tưởng này.`;
}

export default function AIStudioPage() {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState(1);
    const [search, setSearch] = useState('');
    const [prompt, setPrompt] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notice, setNotice] = useState('');
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConversation = conversations.find((item) => item.id === activeId);

    const filteredConversations = useMemo(
        () => conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
        [conversations, search],
    );

    function updateActiveMessages(messages: Message[]) {
        setConversations((current) =>
            current.map((item) => item.id === activeId ? { ...item, messages } : item),
        );
    }

    function newConversation() {
        const conversation: Conversation = {
            id: Date.now(),
            title: 'Cuộc trò chuyện mới',
            messages: [],
        };

        setConversations((current) => [conversation, ...current]);
        setActiveId(conversation.id);
        setPrompt('');
        setMobileSidebar(false);
    }

    function sendMessage(event?: FormEvent) {
        event?.preventDefault();

        const content = prompt.trim();
        if (!content || !activeConversation) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content,
        };

        const assistantMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: createReply(content),
        };

        const updatedMessages = [
            ...activeConversation.messages,
            userMessage,
            assistantMessage,
        ];

        updateActiveMessages(updatedMessages);

        if (activeConversation.title === 'Cuộc trò chuyện mới') {
            setConversations((current) =>
                current.map((item) =>
                    item.id === activeId
                        ? { ...item, title: content.slice(0, 34) }
                        : item,
                ),
            );
        }

        setPrompt('');
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function deleteConversation(id: number) {
        if (!window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;

        const remaining = conversations.filter((item) => item.id !== id);
        setConversations(remaining);

        if (activeId === id) {
            if (remaining.length > 0) {
                setActiveId(remaining[0].id);
            } else {
                const fresh: Conversation = {
                    id: Date.now(),
                    title: 'Cuộc trò chuyện mới',
                    messages: [],
                };
                setConversations([fresh]);
                setActiveId(fresh.id);
            }
        }
    }

    function renameConversation(id: number) {
        const title = editingTitle.trim();
        if (title) {
            setConversations((current) =>
                current.map((item) => item.id === id ? { ...item, title } : item),
            );
        }
        setEditingId(null);
    }

    async function copyConversation() {
        const text = activeConversation?.messages
            .map((message) => `${message.role === 'user' ? 'Bạn' : 'ComicHub AI'}:\n${message.content}`)
            .join('\n\n') ?? '';

        try {
            await navigator.clipboard.writeText(text);
            setNotice('Đã sao chép cuộc trò chuyện!');
        } catch {
            setNotice('Không thể sao chép. Trình duyệt có thể chưa cấp quyền.');
        }
    }

    function exportConversation() {
        const content = activeConversation?.messages
            .map((message) => `${message.role === 'user' ? 'Bạn' : 'ComicHub AI'}:\n${message.content}`)
            .join('\n\n') ?? '';

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${activeConversation?.title || 'comichub-chat'}.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="studio-page">
            <aside className={`studio-sidebar ${mobileSidebar ? 'is-open' : ''}`}>
                <a className="studio-brand" href="/">
                    <span className="studio-brand-icon">✦</span>
                    <span>ComicHub <b>Studio</b></span>
                </a>

                <div className="studio-workspace">
                    <div className="studio-avatar">CH</div>
                    <div>
                        <strong>Author Workspace</strong>
                        <small>Không gian sáng tác</small>
                    </div>
                    <span className="studio-chevron">⌄</span>
                </div>

                <div className="studio-nav-label">WORKSPACE</div>
                <nav className="studio-navigation">
                    <a href="/profile"><span>▦</span> Tổng quan</a>
                    <a href="/profile"><span>▤</span> Quản lý truyện</a>
                    <a href="/profile"><span>▧</span> Quản lý chương</a>
                    <a className="active" href="/studio/ai-assistant"><span>✧</span> Trợ lý AI <em>PRO</em></a>
                </nav>

                <div className="studio-sidebar-bottom">
                    <div className="studio-storage-heading">
                        <span>Dung lượng Studio</span>
                        <strong>32%</strong>
                    </div>
                    <div className="studio-storage-track"><span /></div>
                    <small>3.2 GB / 10 GB đã sử dụng</small>
                    <div className="studio-upgrade">
                        <span>✦</span>
                        <div><strong>Nâng cấp Studio</strong><small>Mở khóa thêm không gian sáng tác</small></div>
                        <span>›</span>
                    </div>
                    <div className="studio-version">ComicHub Studio · Version 1.0</div>
                </div>
            </aside>

            {mobileSidebar && (
                <button
                    className="studio-mobile-backdrop"
                    aria-label="Đóng menu"
                    onClick={() => setMobileSidebar(false)}
                />
            )}

            <main className="studio-main">
                <header className="studio-topbar">
                    <div className="studio-topbar-left">
                        <button className="studio-icon-button studio-menu-button" onClick={() => setMobileSidebar(!mobileSidebar)}>☰</button>
                        <span className="studio-breadcrumb">Workspace</span>
                        <span className="studio-breadcrumb-separator">/</span>
                        <strong>Trợ lý AI</strong>
                    </div>

                    <div className="studio-topbar-right">
                        <label className="studio-global-search">
                            <span>⌕</span>
                            <input placeholder="Tìm kiếm..." />
                            <kbd>⌘ K</kbd>
                        </label>
                        <a className="studio-reader-link" href="/">↗ Trang đọc truyện</a>

                        <div className="studio-dropdown-wrap">
                            <button className="studio-icon-button" aria-label="Thông báo" onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowProfile(false);
                            }}>♧</button>
                            {showNotifications && (
                                <div className="studio-dropdown">
                                    <strong>Thông báo</strong>
                                    <p>Chào mừng bạn đến với ComicHub Studio!</p>
                                    <small>Không có thông báo mới.</small>
                                </div>
                            )}
                        </div>

                        <div className="studio-dropdown-wrap">
                            <button className="studio-profile-button" onClick={() => {
                                setShowProfile(!showProfile);
                                setShowNotifications(false);
                            }}>
                                <span className="studio-profile-avatar">H</span>
                                <span><strong>Hoạt</strong><small>Tác giả</small></span>
                                <span>⌄</span>
                            </button>
                            {showProfile && (
                                <div className="studio-dropdown">
                                    <strong>Tài khoản tác giả</strong>
                                    <a href="/profile">Hồ sơ cá nhân</a>
                                    <a href="/">Về trang chủ</a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <section className="studio-content">
                    <div className="studio-page-heading">
                        <div>
                            <div className="studio-eyebrow"><span>✦</span> COMICHUB CREATOR TOOLS</div>
                            <h1>Trợ lý sáng tác <span>AI</span></h1>
                            <p>Người đồng hành giúp bạn biến những ý tưởng thành câu chuyện tuyệt vời.</p>
                        </div>
                        <div className="studio-engine-status"><span /> AI Engine đang sẵn sàng</div>
                    </div>

                    <div className="studio-chat-layout">
                        <section className="studio-history-panel">
                            <div className="studio-history-heading">
                                <div><h2>Lịch sử trò chuyện</h2><span>{conversations.length} cuộc trò chuyện</span></div>
                                <button className="studio-new-chat" onClick={newConversation}>＋ Mới</button>
                            </div>

                            <label className="studio-history-search">
                                <span>⌕</span>
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Tìm cuộc trò chuyện..."
                                />
                            </label>

                            <div className="studio-history-list">
                                {filteredConversations.map((conversation) => (
                                    <div
                                        className={`studio-history-item ${activeId === conversation.id ? 'selected' : ''}`}
                                        key={conversation.id}
                                    >
                                        <button className="studio-history-select" onClick={() => {
                                            setActiveId(conversation.id);
                                            setMobileSidebar(false);
                                        }}>
                                            <span className="studio-history-icon">✧</span>
                                            <span className="studio-history-title">
                        {editingId === conversation.id ? (
                            <input
                                autoFocus
                                value={editingTitle}
                                onChange={(event) => setEditingTitle(event.target.value)}
                                onBlur={() => renameConversation(conversation.id)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') renameConversation(conversation.id);
                                }}
                                onClick={(event) => event.stopPropagation()}
                            />
                        ) : conversation.title}
                                                <small>{conversation.messages.length} tin nhắn</small>
                      </span>
                                        </button>
                                        <div className="studio-history-actions">
                                            <button title="Đổi tên" onClick={() => {
                                                setEditingId(conversation.id);
                                                setEditingTitle(conversation.title);
                                            }}>✎</button>
                                            <button title="Xóa" onClick={() => deleteConversation(conversation.id)}>×</button>
                                        </div>
                                    </div>
                                ))}
                                {filteredConversations.length === 0 && (
                                    <div className="studio-empty-history">Không tìm thấy cuộc trò chuyện.</div>
                                )}
                            </div>

                            <div className="studio-history-footer">
                                <span className="studio-online-dot" /> Hội thoại được lưu trong phiên hiện tại
                            </div>
                        </section>

                        <section className="studio-chat-panel">
                            <div className="studio-chat-header">
                                <div className="studio-chat-title">
                                    <div className="studio-ai-avatar">✦</div>
                                    <div>
                                        <strong>{activeConversation?.title ?? 'Cuộc trò chuyện mới'}</strong>
                                        <small><span /> ComicHub AI Assistant</small>
                                    </div>
                                </div>
                                <div className="studio-chat-tools">
                                    <button title="Sao chép nội dung" onClick={copyConversation}>▢</button>
                                    <button title="Xuất nội dung" onClick={exportConversation}>⇩</button>
                                    <button title="Xóa cuộc trò chuyện" onClick={() => deleteConversation(activeId)}>⌫</button>
                                </div>
                            </div>

                            <div className="studio-messages">
                                {activeConversation?.messages.length ? (
                                    activeConversation.messages.map((message) => (
                                        <article className={`studio-message ${message.role}`} key={message.id}>
                                            {message.role === 'assistant' && <div className="studio-message-avatar">✦</div>}
                                            <div className="studio-message-body">
                                                <div className="studio-message-meta">
                                                    <strong>{message.role === 'user' ? 'Bạn' : 'ComicHub AI'}</strong>
                                                    {message.role === 'assistant' && <span>✦ AI Assistant</span>}
                                                </div>
                                                <div className="studio-message-content">{message.content}</div>
                                            </div>
                                            {message.role === 'user' && <div className="studio-user-avatar">H</div>}
                                        </article>
                                    ))
                                ) : (
                                    <div className="studio-welcome">
                                        <div className="studio-welcome-icon">✦</div>
                                        <h2>Hôm nay bạn muốn sáng tác gì?</h2>
                                        <p>Chia sẻ ý tưởng, đặt câu hỏi hoặc nhờ AI hỗ trợ phát triển câu chuyện của bạn.</p>
                                    </div>
                                )}
                            </div>

                            <div className="studio-composer-area">
                                <div className="studio-suggestion-label">GỢI Ý CHO BẠN</div>
                                <div className="studio-suggestions">
                                    {suggestions.map((suggestion) => (
                                        <button key={suggestion} onClick={() => {
                                            setPrompt(suggestion);
                                            textareaRef.current?.focus();
                                        }}>{suggestion}</button>
                                    ))}
                                </div>

                                <form className="studio-composer" onSubmit={sendMessage}>
                  <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập ý tưởng hoặc câu hỏi của bạn..."
                      rows={2}
                  />
                                    <div className="studio-composer-toolbar">
                                        <div className="studio-composer-actions">
                                            <button type="button" title="Tùy chọn công cụ" onClick={() => setShowTools(!showTools)}>＋</button>
                                            <button type="button" title="Đính kèm tệp" onClick={() => setNotice('Tính năng đính kèm tệp sẽ được bổ sung sau.')}>▧</button>
                                            <button type="button" title="Tạo hình ảnh" onClick={() => setNotice('Tính năng tạo hình ảnh chưa được kết nối.')}>▧</button>
                                        </div>
                                        <div className="studio-send-area">
                                            <span>Enter để gửi · Shift + Enter để xuống dòng</span>
                                            <button className="studio-send-button" type="submit" disabled={!prompt.trim()}>↑</button>
                                        </div>
                                    </div>
                                    {showTools && <div className="studio-tool-note">Công cụ sáng tác · Gợi ý cốt truyện · Phát triển nhân vật</div>}
                                </form>
                                <p className="studio-disclaimer">ComicHub AI có thể đưa ra gợi ý chưa chính xác. Hãy kiểm tra nội dung trước khi sử dụng.</p>
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            {notice && (
                <div className="studio-toast" role="status">
                    {notice}
                    <button onClick={() => setNotice('')}>×</button>
                </div>
            )}
        </div>
    );
}
