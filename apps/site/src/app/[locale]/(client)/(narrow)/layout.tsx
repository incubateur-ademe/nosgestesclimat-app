import ContentNarrow from '@/components/layout/ContentNarrow'
import type { DefaultPageProps } from '@/types'
import type { PropsWithChildren } from 'react'

type LayoutProps = PropsWithChildren & DefaultPageProps

export default function NarrowLayout({ children }: LayoutProps) {
  return (
    <>
      <ContentNarrow>{children}</ContentNarrow>
    </>
  )
}
