import { InternalError } from '@/helpers/server/error'

export function getClientCookie(name: string): string | undefined {
  if (typeof document === 'undefined')
    throw new InternalError(
      'getClientCookie must be called on the client (hook)'
    )
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|; )${escaped}=([^;]*)`).exec(document.cookie)
  return match ? decodeURIComponent(match[1]) : undefined
}
