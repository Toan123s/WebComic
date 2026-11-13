import { apiClient } from '../services/api/apiClient'

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  const baseUrl = apiClient.defaults.baseURL || window.location.origin
  return new URL(path, baseUrl).toString()
}

export function formatCount(value: number | null | undefined): string {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
