import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { AuthSession } from '../../types/auth'

const SESSION_KEY = 'comichub.session'
const AUTH_EVENT = 'comichub:auth-changed'

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<AuthSession>
  return typeof session.accessToken === 'string'
    && typeof session.refreshToken === 'string'
    && typeof session.tokenType === 'string'
    && typeof session.expiresIn === 'number'
    && typeof session.refreshExpiresIn === 'number'
    && typeof session.userId === 'number'
    && typeof session.username === 'string'
    && (typeof session.displayName === 'string' || session.displayName === null)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

export function readSession(): AuthSession | null {
  const serialized = sessionStorage.getItem(SESSION_KEY)
  if (!serialized) return null

  try {
    const parsed: unknown = JSON.parse(serialized)
    if (isAuthSession(parsed)) return parsed
  } catch {
    // Discard malformed session storage below.
  }
  sessionStorage.removeItem(SESSION_KEY)
  return null
}

export function writeSession(session: AuthSession | null): void {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function subscribeToSession(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback)
  return () => window.removeEventListener(AUTH_EVENT, callback)
}

apiClient.interceptors.request.use((config) => {
  const session = readSession()
  if (session) {
    config.headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  return config
})

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshInFlight: Promise<AuthSession> | null = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined
    const isAuthRequest = /\/api\/auth\/(login|refresh|logout)$/.test(
      request?.url ?? '',
    )

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error)
    }

    const session = readSession()
    if (!session?.refreshToken) {
      writeSession(null)
      return Promise.reject(error)
    }

    request._retry = true
    try {
      refreshInFlight ??= axios
        .post<AuthSession>(
          `${apiClient.defaults.baseURL}/api/auth/refresh`,
          { refreshToken: session.refreshToken },
        )
        .then(({ data }) => {
          writeSession(data)
          return data
        })
        .finally(() => {
          refreshInFlight = null
        })

      const refreshed = await refreshInFlight
      request.headers.Authorization = `${refreshed.tokenType || 'Bearer'} ${refreshed.accessToken}`
      return apiClient(request)
    } catch (refreshError) {
      writeSession(null)
      return Promise.reject(refreshError)
    }
  },
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      const details = data as { detail?: unknown; message?: unknown; title?: unknown }
      if (typeof details.detail === 'string') return details.detail
      if (typeof details.message === 'string') return details.message
      if (typeof details.title === 'string') return details.title
    }
    if (!error.response) return 'Không thể kết nối máy chủ. Hãy thử lại sau.'
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
