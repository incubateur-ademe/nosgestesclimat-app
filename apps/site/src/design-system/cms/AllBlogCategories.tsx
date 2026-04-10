import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import { fetchCategories } from '@/services/cms/fetchCategories'
import { twMerge } from 'tailwind-merge'
import Badge from '../layout/Badge'
import ColorLine from '../layout/ColorLine'

export default async function AllBlogCategories({
  className,
  locale,
}: {
  className?: string
  locale: Locale
}) {
  const categories = await fetchCategories({ locale })

  return (
    <div
      className={twMerge(
        'relative left-1/2 mb-10 w-[100vw] -translate-x-1/2 overflow-hidden pt-10 pb-10 before:absolute before:-top-8 before:left-1/2 before:z-10 before:h-[100px] before:w-[102vw] before:-translate-x-1/2 before:bg-white',
        className
      )}>
      <div className="bg-heroLightBackground relative left-1/2 w-[140vw] -translate-x-1/2 -rotate-2 skew-x-[10deg] transform overflow-hidden px-[calc(20vw+16px)] pt-28 pb-24">
        <div className="relative flex max-w-[100vw] rotate-2 -skew-x-[10deg] flex-col gap-8 md:mx-auto md:max-w-5xl">
          <h2 className="mb-0 text-2xl md:text-3xl">
            <Trans locale={locale}>Toutes les catégories du blog</Trans>
          </h2>

          <ul className="flex w-full flex-row flex-wrap items-center gap-4 md:max-w-[50%]">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/blog/${category.slug.toLocaleLowerCase()}`}>
                  <Badge size="sm">{category.title}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ColorLine className="bg-rainbow animate-rainbow-slow absolute bottom-0 left-0 h-[4px] w-[100%] transition-all motion-reduce:animate-none" />
      </div>
    </div>
  )
}
