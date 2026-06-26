import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'

import { getUserSession } from '@/services/auth/get-user-session'
import { redirect } from 'next/navigation'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function Layout({ children }: LayoutProps) {
  if (!(await getUserSession())?.isAuth) {
    redirect(MON_ESPACE_PATH)
  }

  return <div className="-mt-6">{children}</div>
}
