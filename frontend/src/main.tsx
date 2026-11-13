/*
 * ComicHub | Phụ trách: TV2 — Frontend
 * Trạng thái: ĐÃ CÓ ĐIỂM KHỞI TẠO REACT CƠ BẢN; cần xác minh khi tích hợp ứng dụng.
 * Trách nhiệm: mount React vào DOM và nạp stylesheet toàn cục.
 * Lưu ý: không đặt nghiệp vụ hoặc gọi API tại file khởi tạo này.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
