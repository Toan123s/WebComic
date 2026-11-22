export interface LoginPayload {
    account: string; // email hoặc tên đăng nhập
    password: string;
    remember: boolean;
}

export interface LoginResult {
    accessToken: string;
    refreshToken?: string;
    user?: unknown; // chỉnh lại theo LoginResponse của backend
}
