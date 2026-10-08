'use client'

import Tabs from '@/design-system/layout/Tabs'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { AuthenticationMode } from '@/types/authentication'
import { useSearchParams } from 'next/navigation'
import { getTabs } from './_helpers/getTabs'

interface Props {
  mode: AuthenticationMode
  className?: string
}

export default function SigninSignupTabs({ mode, className }: Props) {
  const { t } = useClientTranslation()

  const searchParams = useSearchParams()

  const tabItems = getTabs({
    searchParams,
    mode,
  })

  return (
    <div className={className}>
      <Tabs
        items={tabItems}
        ariaLabel={t(
          'navigation.connexionInscription',
          'Navigation connexion/inscription'
        )}
      />
    </div>
  )
}
