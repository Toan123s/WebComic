import type { LoginPayload, LoginResult } from '../types/auth';

const API_URL: string =
    (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080';

// ====== CHỈNH Ở ĐÂY cho khớp backend (AuthController / LoginRequest) ======
const LOGIN_PATH = '/api/auth/login';
const ACCOUNT_FIELD = 'usernameOrEmail'; // tên trường trong LoginRequest.java
const PASSWORD_FIELD = 'password';
// ==========================================================================

const ACCESS_KEY = 'comichub_access_token';
const REFRESH_KEY = 'comichub_refresh_token';

export async function login(payload: LoginPayload): Promise<LoginResult> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}${LOGIN_PATH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                [ACCOUNT_FIELD]: payload.account,
                [PASSWORD_FIELD]: payload.password,
            }),
        });
    } catch {
        throw new Error('Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.');
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.message ?? 'Sai tài khoản hoặc mật khẩu.');
    }

    const accessToken: string | undefined = data?.accessToken ?? data?.token;
    if (!accessToken) throw new Error('Phản hồi đăng nhập không có accessToken.');

    const result: LoginResult = {
        accessToken,
        refreshToken: data?.refreshToken,
        user: data?.user,
    };

    // "Ghi nhớ đăng nhập" -> localStorage, ngược lại -> sessionStorage
    const store = payload.remember ? localStorage : sessionStorage;
    store.setItem(ACCESS_KEY, result.accessToken);
    if (result.refreshToken) store.setItem(REFRESH_KEY, result.refreshToken);
    return result;
}

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

export function logoutLocal(): void {
    for (const s of [localStorage, sessionStorage]) {
        s.removeItem(ACCESS_KEY);
        s.removeItem(REFRESH_KEY);
    }
}
