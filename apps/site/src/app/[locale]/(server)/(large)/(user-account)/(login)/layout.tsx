import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'

import { redirect } from 'next/navigation'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default async function Layout({ children }: LayoutProps) {
  if (await isUserAuthenticated()) {
    redirect(MON_ESPACE_PATH)
  }

  return <div className="-mt-6">{children}</div>
}
