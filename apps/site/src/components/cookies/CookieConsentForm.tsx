'use client'

import Trans from '@/components/translation/trans/TransClient'
import { cookieBannerClick } from '@/constants/tracking/cookie'
import Button from '@/design-system/buttons/Button'
import InlineLink from '@/design-system/inputs/InlineLink'
import Modal from '@/design-system/modals/Modal'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { CookieState } from '@/services/tracking/cookieStateStore'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { CookieFieldset, CookieRadio } from './cookieConsentForm/CookieFieldSet'
import { useCookieManagement } from './useCookieManagement'

export default function CookieConsentForm({
  onCancel,
  rejectAll,
  acceptAll,
  defaultChoices: defaultValues,
  confirmChoices,
}: {
  onCancel: () => void
  rejectAll: () => void
  acceptAll: () => void
  confirmChoices: (data: CookieState) => void
  defaultChoices?: CookieState
}) {
  const { t } = useClientTranslation()

  const { register, handleSubmit } = useForm<CookieState>({
    defaultValues,
  })

  const { setCookieBannerDisplayState } = useCookieManagement()

  return (
    <Modal
      isOpen={true}
      ariaLabel={t(
        'cookieConsent.banner.title',
        'Fenêtre modale de gestion des cookies'
      )}
      closeModal={onCancel}
      hasAbortCross={true}
      hasAbortButton={false}
      className="!w-3xl max-w-screen overflow-hidden !rounded-2xl !p-0 !shadow-2xl">
      <div className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl bg-white p-0 shadow-2xl">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2
            className="text-xl font-bold text-gray-900"
            data-testid="cookie-management-title">
            <Trans i18nKey="cookies.management.title">
              Gestion des cookies
            </Trans>
          </h2>
        </div>
        <form
          onSubmit={(e) => {
            trackMatomoEvent__deprecated(
              cookieBannerClick('Confirmer mes choix')
            )
            void handleSubmit(confirmChoices)(e)
          }}
          data-testid="cookie-form">
          <div className="max-h-[40vh] flex-1 overflow-y-scroll px-8 pb-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div>
                <span
                  className="text-base font-medium text-gray-900"
                  data-testid="preferences-text">
                  <Trans i18nKey="cookies.management.preferences">
                    Préférences pour tous les services.{' '}
                  </Trans>
                </span>
                <InlineLink
                  href="/politique-de-confidentialite#cookies"
                  data-testid="privacy-link">
                  <Trans i18nKey="cookies.management.privacyLink">
                    Données personnelles et cookies
                  </Trans>
                </InlineLink>
              </div>
              <ul className="mb-8 flex flex-wrap gap-3 md:flex-nowrap">
                <li>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => {
                      trackMatomoEvent__deprecated(
                        cookieBannerClick('Tout refuser')
                      )
                      rejectAll()
                    }}
                    size="sm"
                    data-testid="refuse-all-button">
                    <Trans i18nKey="cookies.management.rejectAll">
                      Tout refuser
                    </Trans>
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => {
                      trackMatomoEvent__deprecated(
                        cookieBannerClick('Tout accepter')
                      )
                      acceptAll()
                    }}
                    size="sm"
                    data-testid="accept-all-button">
                    <Trans i18nKey="cookies.management.acceptAll">
                      Tout accepter
                    </Trans>
                  </Button>
                </li>
              </ul>
            </div>

            <fieldset className="mb-6 border-t border-gray-200">
              <legend className="mb-2 flex w-full flex-col flex-wrap justify-between gap-2 sm:flex-row sm:items-center">
                <span
                  className="text-base font-bold whitespace-nowrap text-gray-900 md:text-lg"
                  data-testid="required-cookies-title">
                  <Trans i18nKey="cookies.management.required.title">
                    Cookies obligatoires
                  </Trans>
                </span>
                <div className="flex gap-6">
                  <CookieRadio
                    id="oblig-accept"
                    name="oblig"
                    checked={true}
                    disabled
                    data-testid="required-accept-radio"
                    label={
                      <Trans i18nKey="cookies.management.accept">
                        Accepter
                      </Trans>
                    }
                  />
                  <CookieRadio
                    id="oblig-refuse"
                    name="oblig"
                    checked={false}
                    disabled
                    data-testid="required-refuse-radio"
                    label={
                      <Trans i18nKey="cookies.management.refuse">Refuser</Trans>
                    }
                  />
                </div>
              </legend>
              <p
                className="mt-2 text-base text-gray-700"
                data-testid="required-cookies-description">
                <Trans i18nKey="cookies.management.required.description">
                  Notre site utilise des cookies indispensables à son bon
                  fonctionnement (sécurité, choix de langue, authentification).
                  Ils ne contiennent aucune donnée personnelle et ne peuvent pas
                  être désactivés.
                </Trans>
              </p>

              <details className="bg-primary-50 rounded-xl p-4">
                <summary className="cursor-pointer">
                  <Trans i18nKey="cookies.management.required.detail.title">
                    Voir le détail des cookies
                  </Trans>
                </summary>

                <ul className="mt-2 flex flex-col gap-2 pl-4">
                  <li>
                    <pre className="block font-bold">NEXT_LOCALE</pre>
                    <Trans i18nKey="cookies.management.required.detail.description1">
                      Choix de langue
                    </Trans>
                  </li>

                  <li>
                    <pre className="block font-bold">ngc_server_auth_jwt</pre>
                    <Trans i18nKey="cookies.management.required.detail.description2">
                      Authentification sur l'espace personnel
                    </Trans>
                  </li>

                  <li>
                    <pre className="block font-bold">nosgestesclimat::v3</pre>
                    <Trans i18nKey="cookies.management.required.detail.description3">
                      Sauvegarde des données de simulation en local
                    </Trans>
                  </li>

                  <li>
                    <pre className="block font-bold">
                      cookie-management-state
                    </pre>
                    <Trans i18nKey="cookies.management.required.detail.description4">
                      Sauvegarde des préférences de cookie (cette bannière)
                    </Trans>
                  </li>

                  <li>
                    <pre className="block font-bold">ngc_anon_user</pre>
                    <Trans i18nKey="cookies.management.required.detail.description2">
                      Sauvegarde de la session anonyme (pour retrouver les
                      simulations précédentes)
                    </Trans>
                  </li>
                </ul>
              </details>
            </fieldset>

            <CookieFieldset
              id="google-ads"
              titleI18nKey="cookies.management.googleAds.title"
              titleDefault="Google Ads"
              descriptionI18nKey="cookies.management.googleAds.description"
              descriptionDefault={t(
                'cookies.management.googleAds.description',
                "Nous utilisons des cookies pour mesurer et calibrer l'efficacité de nos campagnes publicitaires en ligne. Ceux-ci permettent de suivre votre navigation."
              )}
              linkHref="https://policies.google.com/technologies/cookies?hl=fr-fr"
              linkI18nKey="cookies.management.googleAds.link"
              linkDefault={t(
                'cookies.management.googleAds.link',
                'Voir le site officiel'
              )}
              defaultValue={defaultValues?.googleTag ?? 'refused'}
              register={register('googleTag')}
            />

            <CookieFieldset
              id="posthog"
              titleI18nKey="cookies.management.posthog.title"
              titleDefault="Posthog"
              descriptionI18nKey="cookies.management.posthog.description"
              descriptionDefault={t(
                'cookies.management.posthog.description',
                "Nous utilisons Posthog pour mesurer l'audience de notre site et améliorer son contenu. Vos données sont stockées sur des serveurs sécurisés et ne sont jamais partagées avec des tiers."
              )}
              linkHref="https://posthog.com/docs/privacy"
              linkI18nKey="cookies.management.posthog.link"
              linkDefault={t(
                'cookies.management.posthog.link',
                'Voir le site officiel'
              )}
              defaultValue={defaultValues?.posthog ?? 'refused'}
              register={register('posthog')}
              className="mt-6"
            />
          </div>
          <div className="flex justify-start border-t border-slate-200 bg-white px-8 pt-4 pb-8">
            <Button
              type="submit"
              color="primary"
              data-testid="confirm-choices-button">
              <Trans i18nKey="cookies.management.confirm">
                Confirmer mes choix
              </Trans>
            </Button>
          </div>
        </form>

        <div className="px-8 pt-4 pb-8">
          <h2 className="text-lg font-bold">
            <Trans i18nKey="cookies.management.audience.title">
              Mesure d'audience
            </Trans>
          </h2>
          <p>
            <Trans i18nKey="cookies.management.audience.description">
              Pour désactiver tous les cookies de mesure d'audience anonymes,
              visitez
            </Trans>{' '}
            <Link
              href="/politique-de-confidentialite#cookies"
              title={t(
                'cookies.management.audience.linkTitle',
                'Visiter notre politique de confidentialité'
              )}
              onClick={() => setCookieBannerDisplayState('hidden')}
              className="text-primary-700 underline">
              <Trans i18nKey="cookies.management.audience.linkText">
                notre politique de confidentialité
              </Trans>
            </Link>
            .
          </p>
        </div>
      </div>
    </Modal>
  )
}
