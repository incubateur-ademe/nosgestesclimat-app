import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import ImageWithCategory from '@/design-system/cms/ImageWithCategory'
import ColorLine from '@/design-system/layout/ColorLine'

export default function MainArticle({
  imageSrc,
  title,
  description,
  category,
  href,
  locale,
}: {
  imageSrc: string
  title: string
  description: string
  category: string
  href: string
  locale: string
}) {
  return (
    <Link href={href} className="mb-20 no-underline">
      <h2 className="text-default relative mb-8 inline-block pb-4 text-2xl font-medium md:text-3xl">
        <Trans locale={locale}>À la une !</Trans>{' '}
        <ColorLine className="bg-rainbow animate-rainbow-slow absolute bottom-0 left-[15%] h-[3px] w-[70%] transition-all motion-reduce:animate-none md:left-0 md:w-full" />
      </h2>
      <div className="bg-heroLightBackground flex flex-col gap-6 rounded-xl md:flex-row">
        <ImageWithCategory
          imageSrc={imageSrc}
          imageAlt=""
          width={500}
          height={500}
          category={category}
          imageClassName="w-full"
          containerClassName="w-full md:w-1/2"
        />

        <div className="flex flex-1 flex-col gap-4 p-4 md:py-6 md:pr-20 md:pl-0">
          <h3 className="text-default mb-0 text-xl font-normal md:text-2xl">
            {title}
          </h3>

          <p
            className="text-default flex-1 text-base"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div className="flex justify-end">
            <span className="text-primary-800 ml-auto inline-block cursor-pointer text-right text-[13px] underline md:text-right md:text-base">
              <Trans locale={locale}>Lire la suite</Trans>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
