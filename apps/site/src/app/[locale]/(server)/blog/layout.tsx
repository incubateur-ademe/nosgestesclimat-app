import type { DefaultPageProps } from '@/types'
import { type PropsWithChildren } from 'react'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default function Layout({ children }: LayoutProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex w-full flex-1 flex-col overflow-visible lg:mx-auto lg:px-0">
      {children}
    </main>
  )
}
