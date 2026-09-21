'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRouter } from 'next/navigation'

interface Props {
  className?: string
}

export default function ButtonBack({ className }: Props) {
  const { t } = useClientTranslation()
  const { back } = useRouter()
  return (
    <Button
      color="secondary"
      title={t("Revenir à l'accueil")}
      className={className}
      onClick={() => {
        back()
      }}>
      ← <Trans>Précédent</Trans>
    </Button>
  )
}
