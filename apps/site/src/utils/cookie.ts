export function getClientCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|; )${escaped}=([^;]*)`).exec(document.cookie)
  return match ? decodeURIComponent(match[1]) : undefined
}
