import Separator from '@/design-system/layout/Separator'
import type { ReactNode } from 'react'
import TitleDescLink from './titleDescLinkBlock/TitleDescLink'

export default function TitleDescLinkBlock({
  title,
  description,
  link,
}: {
  title: ReactNode
  description: ReactNode
  link: {
    href: string
    text: ReactNode
  }
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h3 className="mb-0 text-xl md:text-2xl">{title}</h3>

      <Separator className="my-4" />

      <p className="mb-6 text-sm md:text-lg">{description}</p>

      <TitleDescLink {...link} />
    </div>
  )
}
