import { twMerge } from 'tailwind-merge'
import CategoryBreadcrumbs from './categoryHero/CategoryBreadcrumbs'

export default function CategoryHero({
  title,
  description,
  slug,
  className,
}: {
  title: string
  description: string
  slug: string
  className?: string
}) {
  return (
    <div
      className={twMerge(
        'bg-heroLightBackground relative mt-12 mb-20 w-full px-4',
        className
      )}>
      <div className="mx-auto max-w-5xl">
        <CategoryBreadcrumbs slug={slug} title={title} />

        <div className="relative flex flex-col items-center gap-8 pt-8 pb-20 md:flex-row">
          <h1 className="text-3xl font-medium md:w-1/2 md:text-5xl">{title}</h1>
          <p
            className="text-base md:w-1/2 md:text-lg"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  )
}
