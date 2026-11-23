// Dữ liệu mẫu — thay bằng gọi API (services/profileService.ts) khi backend sẵn sàng.
export interface Comic {
    id: number; title: string; genres: string; chapter: number; rating: number;
    badge?: string; from: string; to: string; cover?: string;
}
export const COMICS: Comic[] = [
    { id: 1, title: 'The Last Crimson Moon', genres: 'Dark Fantasy • Hành động', chapter: 25, rating: 4.9, badge: 'HOT', from: '#3b0a0a', to: '#ff6b4a' },
    { id: 2, title: 'Đế Quốc Bóng Tối', genres: 'Hành động • Hệ thống', chapter: 88, rating: 4.8, badge: 'Đang ra', from: '#1d0a3b', to: '#7c4dff' },
    { id: 3, title: 'Kỷ Nguyên Cybernetic', genres: 'Cyberpunk • Sci-fi', chapter: 48, rating: 4.7, badge: 'Mới', from: '#06283b', to: '#e040fb' },
    { id: 4, title: 'Tuyệt Kiếm Vô Song', genres: 'Võ hiệp • Cổ trang', chapter: 95, rating: 4.9, from: '#1c2a2a', to: '#9fb4b0' },
    { id: 5, title: 'Vô Hạn Thế Giới', genres: 'Kinh dị • Tâm lý', chapter: 52, rating: 4.6, from: '#1a1a24', to: '#5b6b9a' },
    { id: 6, title: 'Thanh Xuân Trong Mưa', genres: 'Lãng mạn • Đời thường', chapter: 42, rating: 4.9, from: '#3b2a1a', to: '#f4a77a' },
    { id: 7, title: 'Pháp Sư Tối Thượng', genres: 'Phép thuật • Trọng sinh', chapter: 110, rating: 4.7, from: '#0f2a3b', to: '#4dd0e1' },
    { id: 8, title: 'Chiến Giáp Tận Thế', genres: 'Mecha • Hào hùng', chapter: 64, rating: 4.8, from: '#2a230a', to: '#ffc13b' },
];
export interface FollowItem { comicId: number; badge: string; time: string; info: string; action: string; bell: boolean; hasNew: boolean }
export const FOLLOWS: FollowItem[] = [
    { comicId: 1, badge: 'Chương 25 mới', time: '5 phút trước', info: 'Đã đọc đến: Chương 24 • Tác giả: Shirakawa', action: 'Đọc Ch. 25', bell: true, hasNew: true },
    { comicId: 2, badge: 'Chương 88 mới', time: '35 phút trước', info: 'Đã đọc đến: Chương 87 • Nhóm dịch: Asura Scans', action: 'Đọc Ch. 88', bell: true, hasNew: true },
    { comicId: 6, badge: 'Chương 42', time: 'Hôm qua', info: 'Đã đọc đến: Chương 42 • Tình trạng: Đã bắt kịp', action: 'Đọc lại', bell: false, hasNew: false },
    { comicId: 3, badge: 'Chương 48', time: '3 ngày trước', info: 'Đã đọc đến: Chương 45 • Còn 3 chương chưa đọc', action: 'Đọc tiếp Ch. 46', bell: true, hasNew: false },
];
export interface HistoryItem { id: number; comicId: number; chapter: string; page: string; time: string; percent: number; action: string }
export const HISTORY: HistoryItem[] = [
    { id: 1, comicId: 1, chapter: 'Chương 24: Nhát Chém Phản Nghịch', page: 'Trang 18/32 (56%)', time: '25 phút trước', percent: 56, action: 'Đọc tiếp trang 18' },
    { id: 2, comicId: 4, chapter: 'Chương 95: Vạn Kiếm Quy Tông', page: 'Trang 45/45 (Đã hoàn thành)', time: 'Hôm qua 23:40', percent: 100, action: 'Sang Ch. 96' },
    { id: 3, comicId: 5, chapter: 'Chương 52: Tận Cùng Cơn Ác Mộng', page: 'Trang 10/28 (35%)', time: '4 ngày trước', percent: 35, action: 'Đọc tiếp trang 10' },
];
export interface CommentItem { id: number; where: string; time: string; text: string; likes: number; replies: number }
export const COMMENTS: CommentItem[] = [
    { id: 1, where: 'The Last Crimson Moon — Chương 25', time: '45 phút trước', likes: 142, replies: 18, text: 'Nét vẽ trận này đỉnh thực sự! Quả chém trang 4 vẽ góc phối cảnh cực kỳ bùng nổ, rực rỡ hết nấc. Không uổng công hóng từ tuần trước tới giờ.' },
    { id: 2, where: 'Tuyệt Kiếm Vô Song — Chương 95', time: '4 ngày trước', likes: 89, replies: 6, text: 'Main dùng chiêu kiếm thứ 7 đúng lúc thật sự. Đoạn giải thích kiếm ý tầng thứ chín đọc nổi da gà. Chờ màn tái đấu với Ma Quân chap sau!' },
    { id: 3, where: 'Vô Hạn Thế Giới — Chương 52', time: '1 tuần trước', likes: 54, replies: 2, text: 'Kết thúc arc 1 trọn vẹn ghê. Bẻ lái đoạn thân phận của kẻ giấu mặt trong gương quá khét, không đoán trước được luôn.' },
];
export const ALL_GENRES = ['Dark Fantasy', 'Hành động', 'Huyền bí', 'Seinen', 'Siêu nhiên', 'Võ thuật', 'Trùng sinh'];