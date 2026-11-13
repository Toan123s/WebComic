import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'
import { authApi } from '../services/api/authApi'
import {
  readSession,
  subscribeToSession,
  writeSession,
} from '../services/api/apiClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())

  useEffect(() => subscribeToSession(() => setSession(readSession())), [])

  const login = useCallback(async (request: LoginRequest) => {
    const newSession = await authApi.login(request)
    writeSession(newSession)
  }, [])

  const register = useCallback(
    async (request: RegisterRequest) => {
      await authApi.register(request)
      await login({
        usernameOrEmail: request.username,
        password: request.password,
      })
    },
    [login],
  )

  const logout = useCallback(async () => {
    const currentSession = readSession()
    try {
      if (currentSession?.refreshToken) {
        await authApi.logout(currentSession.refreshToken)
      }
    } finally {
      writeSession(null)
    }
  }, [])

  const updateDisplayName = useCallback((displayName: string | null) => {
    const currentSession = readSession()
    if (currentSession) writeSession({ ...currentSession, displayName })
  }, [])

  const value: AuthContextValue = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
      updateDisplayName,
    }),
    [session, login, register, logout, updateDisplayName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
