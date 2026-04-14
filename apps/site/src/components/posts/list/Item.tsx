import Link from '@/components/Link'
import Card from '@/design-system/layout/Card'
import { getFormattedDate } from '@/helpers/date/getFormattedDate'
import type { Post } from '@/types/posts'
import Image from 'next/image'

interface Props {
  item: Post
  path: string
  locale: string
}

export default function Item({ item, path, locale }: Props) {
  const imageUrl = item.data?.image || ''

  return (
    <li>
      <Card
        tag={Link}
        href={`${path}/${item.slug}`}
        className="bg-primary-50 text-default h-full w-full justify-between border-0 p-4 no-underline">
        <div>
          {item.data.image ? (
            <Image
              src={imageUrl}
              width="400"
              height="200"
              className="mx-auto mb-2 max-h-36 w-full object-cover"
              alt={`Illustration: ${item.data.title}`}
            />
          ) : null}
          <p className="mt-4 mb-4 text-center text-lg font-bold">
            {item.data.title || item.slug || ''}
          </p>
        </div>
        {item.data.date ? (
          <p className="text-center">
            <small>
              {getFormattedDate(new Date(item.data.date), locale || 'fr')}
            </small>
          </p>
        ) : null}
      </Card>
    </li>
  )
}
