import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'

interface Props extends React.ComponentPropsWithoutRef<'article'> {
  locale: Locale
}

export default function MTaTerreBanner({ locale }: Props) {
  return (
    <article className="bg-secondary-50 mb-8 w-4xl max-w-full rounded-lg p-6">
      <Title
        hasSeparator={false}
        className="mb-2 text-xl leading-7 font-medium">
        <Trans locale={locale} i18nKey="actions.mTaTerre.title">
          Tu veux comprendre ET agir pour la planète ?
        </Trans>
      </Title>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <p className="mb-0">
          <Trans locale={locale} i18nKey="actions.mTaTerre.text">
            Climat, biodiversité, énergie, alimentation…
            <br />
            <strong>M ta Terre</strong>, c'est le site fait pour toi : des{' '}
            <strong>articles</strong>, <strong>vidéos</strong>,{' '}
            <strong>podcasts</strong> et des <strong>gestes concrets</strong>{' '}
            pour passer à l'action au quotidien.
          </Trans>
        </p>

        <ButtonLink
          href="https://mtaterre.fr/"
          target="_blank"
          rel="noopener noreferrer">
          <Trans locale={locale} i18nKey="actions.mTaTerre.button">
            Explorer M ta Terre
          </Trans>
        </ButtonLink>
      </div>
    </article>
  )
}
