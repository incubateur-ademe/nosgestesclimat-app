'use client'

import Link from '@/components/Link'

interface LinkListProps {
  entries: Record<string, { title: string; href: string }>
}

export default function LinkList({ entries }: LinkListProps) {
  return (
    <ul className="m-0 list-none p-0">
      {Object.entries(entries).map(([linkKey, { title, href }]) => (
        <li key={linkKey}>
          <Link href={href}>{title}</Link>
        </li>
      ))}
    </ul>
  )
}
