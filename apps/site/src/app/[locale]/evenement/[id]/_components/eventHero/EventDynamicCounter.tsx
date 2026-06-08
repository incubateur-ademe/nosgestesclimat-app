import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Props {
  locale: Locale
}

export default function EventDynamicCounter({ locale }: Props) {
  return (
    <div>
      <div>
        <span aria-hidden className="text-2xl text-green-700">
          •
        </span>

        <span>
          <Trans i18nKey="event.dynamicCounter.text" locale={locale}>
            EN DIRECT
          </Trans>
        </span>
      </div>

      <div>
        <ButtonLink href="/">
          <Trans i18nKey="event.dynamicCounter.primaryCta" locale={locale}>
            J'engage mon organisation
          </Trans>
        </ButtonLink>

        <ButtonLink href="/" color="secondary">
          <Trans i18nKey="event.dynamicCounter.secondaryCta" locale={locale}>
            Je participe individuellement
          </Trans>
        </ButtonLink>
      </div>

      <div>
        <div>
          <CircularProgressbar value={46} />
        </div>

        <div>
          <p>
            <span>
              <Trans
                i18nKey="event.dynamicCounter.target.title"
                locale={locale}>
                Objectif
              </Trans>
            </span>

            <span>
              <span>18 501</span>
              <span>/ 50 000</span>
            </span>

            <span>
              <Trans i18nKey="event.dynamicCounter.target.text" locale={locale}>
                calculs d'empreinte carbone
              </Trans>
            </span>
          </p>
        </div>
      </div>

      <p>
        <Trans i18nKey="event.dynamicCounter.promise" locale={locale}>
          Résultats en 10 minutes - 100% gratuit
        </Trans>
      </p>
    </div>
  )
}
