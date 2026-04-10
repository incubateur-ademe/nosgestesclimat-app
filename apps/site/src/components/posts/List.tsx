import type { Post } from '@/types/posts'
import { twMerge } from 'tailwind-merge'
import Item from './list/Item'

interface Props {
  items: Post[]
  path: string
  className?: string
  locale: string
}
export default function PostList({ items, path, className, locale }: Props) {
  return (
    <ul
      className={twMerge(
        'grid list-none grid-cols-1 justify-center gap-4 pl-0 sm:grid-cols-2',
        className
      )}
      data-testid="blog-list"
      role="list">
      {items
        .sort((itemA, itemB) =>
          new Date(itemA.data.date || '') > new Date(itemB.data.date || '')
            ? -1
            : 1
        )
        .map((item) => (
          <Item item={item} key={item.slug} path={path} locale={locale} />
        ))}
    </ul>
  )
}
