import { trackingActionClickPostThumbnail } from '@/constants/tracking/actions'
import PostThumbnail from '@/design-system/cms/PostThumbnail'
import ColorLine from '@/design-system/layout/ColorLine'
import { getLandingClickPostThumbnail } from '@/helpers/tracking/landings'
import type { LandingPagePostType } from '@/types/landing-page'
import type { JSX, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'

export default function UnderstandToAct({
  title,
  description,
  posts,
  pathname,
  locale,
  ctaLink,
}: {
  title?: JSX.Element | string
  description?: JSX.Element | string
  posts: Omit<LandingPagePostType, 'trackingEvent'>[]
  pathname: string
  locale: string
  ctaLink?: ReactNode
}) {
  return (
    <div className="bg-heroLightBackground relative w-full py-16 md:py-20">
      <div className="mx-auto flex max-w-full flex-col gap-4 px-4 md:max-w-5xl md:px-0">
        <h2
          className={twMerge(
            'mb-0 text-center text-2xl md:text-3xl',
            !description ? 'mb-10' : ''
          )}>
          {title ?? <Trans locale={locale}>Comprendre pour agir</Trans>}
        </h2>

        {description && (
          <section
            className="mb-10 text-center text-sm md:mx-auto md:max-w-[850px] md:text-lg"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <ul
          className={twMerge(
            'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3',
            posts?.length === 2 ? 'md:grid-cols-2' : '',
            posts?.length === 1 ? 'md:grid-cols-1' : ''
          )}>
          {posts.map((post, index) => (
            <li key={`${index}-post-thumbnail`}>
              <PostThumbnail
                {...post}
                className="bg-white"
                trackingEvent={getLandingClickPostThumbnail(
                  pathname,
                  `${trackingActionClickPostThumbnail} ${index + 1}`
                )}
              />
            </li>
          ))}
        </ul>
      </div>

      {ctaLink && <div className="mt-8 text-center">{ctaLink}</div>}

      <ColorLine className="bg-rainbow animate-rainbow-slow absolute bottom-0 left-0 h-[4px] w-[100%] transition-all motion-reduce:animate-none" />
    </div>
  )
}
