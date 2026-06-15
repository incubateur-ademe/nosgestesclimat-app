'use client'

import { useSyncLocaleCookie } from '@/hooks/useSyncLocaleCookie'

export default function SyncLocaleProvider({
  children,
}: React.PropsWithChildren) {
  useSyncLocaleCookie()
  return <>{children}</>
}
