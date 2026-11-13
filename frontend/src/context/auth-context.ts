import { createContext } from 'react'
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateDisplayName: (displayName: string | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
