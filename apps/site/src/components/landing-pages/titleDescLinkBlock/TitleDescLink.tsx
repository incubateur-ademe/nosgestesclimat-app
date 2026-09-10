import Link from '@/components/Link'
import type { ReactNode } from 'react'

export default function TitleDescLink({
  href,
  text,
}: {
  href: string
  text: ReactNode
}) {
  return (
    <Link className="text-[13px] md:text-base" href={href}>
      {text}
    </Link>
  )
}
