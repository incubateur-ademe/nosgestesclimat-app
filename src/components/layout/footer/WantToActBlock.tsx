import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'

export default function WantToActBlock({ locale }: { locale: Locale }) {
  return (
    <section className="border-primary-700 flex w-96 max-w-full flex-col items-start rounded-xl border p-6">
      <p className="text-primary-700 mb-2 font-bold">
        <Trans locale={locale} i18nKey="footer.wantToAct.title">
          Envie d'agir, pas à pas ?
        </Trans>
      </p>

      <p className="mb-4">
        <Trans locale={locale} i18nKey="footer.wantToAct.description">
          Recevez nos infolettres pour comprendre, apprendre et passer à
          l'action simplement.
        </Trans>
      </p>

      <ButtonLink color="secondary" href="/gestion-infolettres">
        <Trans locale={locale} i18nKey="footer.wantToAct.button">
          Je choisis mes infolettres
        </Trans>
      </ButtonLink>
    </section>
  )
}
