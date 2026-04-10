import type { AuthorType } from '@/adapters/cmsClient'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

export default async function AuthorBlock({
  author,
  locale,
}: {
  author?: AuthorType | null
  locale: Locale
}) {
  const { t } = await getServerTranslation({ locale })

  if (!author) return null

  return (
    <div className="mb-12 max-w-5xl px-4 md:mx-auto">
      <div className="mt-8 flex flex-row items-center gap-6 md:w-8/12">
        <div className="min-w-24">
          {author.image ? (
            <Image
              className="h-24 w-24 overflow-hidden rounded-full object-cover"
              src={author.image?.url}
              alt={
                author.image?.alternativeText ??
                t('authorBlock.defaultAlt', "Photo de l'auteur ou de l'autrice")
              }
              width={200}
              height={200}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <p className="mb-0 text-center text-lg">
                {author.name.charAt(0)}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-0 text-lg">{author.name},</p>

          <p className="mb-0 text-sm">{author.description}</p>
        </div>
      </div>
    </div>
  )
}
