'use client'

import { captureClickShareSimulationButton } from '@/constants/tracking/trackers'
import {
  FACEBOOK_SHARE_URL,
  LINKEDIN_SHARE_URL,
  MESSENGER_SHARE_MOBILE_URL,
  WHATSAPP_SHARE_URL,
} from '@/constants/urls/share'
import Share from '@/design-system/sharing/Share'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackEvent } from '@/utils/analytics/trackEvent'
import FacebookIcon from '../icons/share/FacebookIcon'
import LinkedinIcon from '../icons/share/LinkedinIcon'
import MailIcon from '../icons/share/MailIcon'
import MessengerIcon from '../icons/share/MessengerIcon'
import WhatsappIcon from '../icons/share/WhatsappIcon'

export default function ShareSimulationButton({
  url,
  buttonLabel,
  buttonColor,
  shouldHideTextOnMobile = true,
}: {
  url: string
  buttonLabel?: string
  buttonColor?: 'primary' | 'secondary' | 'text' | 'borderless'
  shouldHideTextOnMobile?: boolean
}) {
  const { t } = useClientTranslation()

  return (
    <Share
      onClick={() => {
        trackEvent(captureClickShareSimulationButton)
      }}
      buttonLabel={buttonLabel ?? t('Partager')}
      buttonColor={buttonColor ?? 'text'}
      shouldHideTextOnMobile={shouldHideTextOnMobile}
      modalTitle={t('Partager le simulateur')}
      modalDescription={t(
        'Envoyez le simulateur à vos proches et faites votre 1ère bonne action !'
      )}
      shareItems={[
        {
          icon: <WhatsappIcon />,
          label: t('Whatsapp'),
          link: `${WHATSAPP_SHARE_URL}${url}`,
        },
        {
          icon: <FacebookIcon />,
          label: t('Facebook'),
          link: `${FACEBOOK_SHARE_URL}${url}`,
        },
        {
          icon: <MessengerIcon />,
          label: t('Messenger'),
          link: `${MESSENGER_SHARE_MOBILE_URL}${url}`,
          mobileOnly: true,
        },
        {
          icon: <LinkedinIcon />,
          label: t('Linkedin'),
          link: `${LINKEDIN_SHARE_URL}${url}`,
        },
        {
          icon: <MailIcon className="fill-primary-700 w-4" />,
          label: t('Envoyer par e-mail'),
          link: `mailto:?subject=${t('Voici mes empreintes carbone et eau ; tu connais les tiennes ?')}&body=${encodeURIComponent(url)}`,
        },
      ]}
      linkShared={url}
    />
  )
}
