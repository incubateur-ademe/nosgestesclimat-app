import Trans from '@/components/translation/trans/TransClient'
import {
  cookieBannerClick,
  cookieBannerDisplayed,
} from '@/constants/tracking/cookie'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useEffect } from 'react'
import ReactModal from 'react-modal'

// Type assertion to resolve React types version mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const Modal = ReactModal as any

// Set the app element once when the module is loaded
if (typeof document !== 'undefined') {
  ReactModal.setAppElement(document.body)
}

export default function CookieConsentBanner({
  onOpenForm,
  rejectAll,
  acceptAll,
}: {
  onOpenForm: () => void
  rejectAll: () => void
  acceptAll: () => void
}) {
  const { t } = useClientTranslation()

  useEffect(() => {
    trackMatomoEvent__deprecated(cookieBannerDisplayed)
  }, [])

  return (
    <Modal
      isOpen={true}
      aria={{
        label: t('cookieConsent.board.title', 'Panneau de gestion des cookies'),
      }}
      className="!fixed !top-1/2 !left-1/2 !z-[10001] !mr-auto !w-[500px] !max-w-[calc(100vw-1rem)] !-translate-x-1/2 !-translate-y-1/2 rounded-2xl !border-0 !p-0 !shadow-2xl md:!top-auto md:!bottom-0 md:!left-0 md:!mb-8 md:!ml-8 md:!translate-x-0 md:!translate-y-0 md:!rounded-4xl"
      overlayClassName="!bg-black/0 !backdrop-blur-none !fixed !bottom-0 !left-0 !right-0 !top-auto !z-[10000]"
      // Accessibility improvements for cookie consent banner
      shouldFocusAfterRender={false}
      shouldReturnFocusAfterClose={false}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      preventScroll={false}
      ariaHideApp={false}
      style={{
        content: {
          margin: '0 auto',
          bottom: '2rem',
          left: '0',
          right: '0',
          top: 'auto',
          padding: 0,
          border: 'none',
          maxWidth: '48rem',
          width: 'calc(100vw - 1rem)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)',
          inset: 'auto',
        },
        overlay: {
          background: 'transparent',
          zIndex: 10000,
          pointerEvents: 'auto',
        },
      }}>
      <div
        className="flex w-full flex-col rounded-2xl bg-white px-6 py-6 shadow-2xl sm:px-8 sm:py-8 md:rounded-4xl"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description">
        <h2
          id="cookie-banner-title"
          className="mb-6 text-left text-lg font-bold text-gray-900 sm:text-xl"
          data-testid="cookie-banner-title">
          <Trans i18nKey="cookies.banner.title">
            Chez Nos Gestes Climat, votre vie privée compte
          </Trans>
        </h2>

        <p
          id="cookie-banner-description"
          className="mb-2 text-sm"
          data-testid="cookie-banner-description">
          <Trans i18nKey="cookies.banner.description">
            Nous utilisons des cookies pour améliorer votre expérience, nos
            services, mesurer l'audience et piloter notre budget de campagnes.
          </Trans>
        </p>
        <ul className="mt-6 flex w-full flex-row flex-wrap items-start justify-start gap-2 md:flex-nowrap md:items-center">
          <li>
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                trackMatomoEvent__deprecated(cookieBannerClick('Personnaliser'))
                onOpenForm()
              }}
              data-testid="cookie-banner-customize-button">
              <Trans i18nKey="cookies.banner.customize">Personnaliser</Trans>
            </Button>
          </li>
          <li>
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                trackMatomoEvent__deprecated(cookieBannerClick('Tout refuser'))
                rejectAll()
              }}
              data-testid="cookie-banner-refuse-button">
              <Trans i18nKey="cookies.banner.rejectAll">Tout refuser</Trans>
            </Button>
          </li>
          <li>
            <Button
              size="sm"
              color="primary"
              onClick={() => {
                trackMatomoEvent__deprecated(cookieBannerClick('Tout accepter'))
                acceptAll()
              }}
              data-testid="cookie-banner-accept-button">
              <Trans i18nKey="cookies.banner.acceptAll">Tout accepter</Trans>
            </Button>
          </li>
        </ul>
      </div>
    </Modal>
  )
}
