'use client'

import Trans from '@/components/translation/trans/TransClient'
import { tutorielClickPrecedent } from '@/constants/tracking/pages/tutoriel'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useRouter } from 'next/navigation'

export default function ButtonBack() {
  const { t } = useClientTranslation()
  const { back } = useRouter()
  return (
    <Button
      color="secondary"
      title={t("Revenir à l'accueil")}
      onClick={() => {
        trackMatomoEvent__deprecated(tutorielClickPrecedent)
        back()
      }}>
      ← <Trans>Précédent</Trans>
    </Button>
  )
}
