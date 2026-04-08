import Trans from '@/components/translation/trans/TransServer'
import InlineLink from '@/design-system/inputs/InlineLink'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import { fetchThematicLandingPages } from '@/services/cms/fetchThematicLandingPages'

export default async function ThematicPagesSection({
  locale,
}: {
  locale: Locale
}) {
  if (locale !== i18nConfig.defaultLocale) {
    return null
  }

  let thematicPages
  try {
    const result = await fetchThematicLandingPages()
    thematicPages = result?.thematicLandingPages ?? []
  } catch {
    return null
  }

  if (thematicPages.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-2">
      <p
        id="thematic-pages-section"
        className="text-default mb-0 text-sm font-bold">
        <Trans i18nKey="footer.thematicLandingPages.title" locale={locale}>
          Pages thématiques
        </Trans>
      </p>
      <ul aria-labelledby="thematic-pages-section">
        {thematicPages.map((page) => (
          <li key={page.id}>
            <InlineLink
              href={`/themes/${page.slug}`}
              className="text-default text-sm no-underline hover:underline">
              {page.title}
            </InlineLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
