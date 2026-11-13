export interface AuthSession {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
  userId: number
  username: string
  displayName: string | null
}

export interface UserProfile {
  id: number
  username: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  status: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
}
