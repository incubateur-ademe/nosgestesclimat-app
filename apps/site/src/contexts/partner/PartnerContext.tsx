'use client'

import Trans from '@/components/translation/trans/TransClient'
import { PARTNER_KEY } from '@/constants/partners'
import type { AlertType } from '@/design-system/alerts/alert/Alert'
import Emoji from '@/design-system/utils/Emoji'
import {
  getPartnerFromStorage,
  removePartnerFromStorage,
  setPartnerInStorage,
} from '@/helpers/partners/storage'
import { useExportSituation } from '@/hooks/partners/useExportSituation'
import { useVerifyPartner } from '@/hooks/partners/useVerifyPartner'
import { useCurrentSimulation } from '@/publicodes-state'
import { captureException } from '@sentry/nextjs'
import { notFound, useRouter } from 'next/navigation'
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import SuccessMessage from './_components/SuccessMessage'

interface AlertToDisplay {
  type: AlertType
  content: ReactNode
}

interface PartnerContextType {
  alertToDisplay?: AlertToDisplay
  redirectUrl: string
}

const PartnerContext = createContext<PartnerContextType>({
  alertToDisplay: undefined,
  redirectUrl: '',
})

export function PartnerProvider({ children }: PropsWithChildren) {
  const [alertToDisplay, setAlertToDisplay] = useState<
    AlertToDisplay | undefined
  >(undefined)
  const [redirectUrl, setRedirectUrl] = useState('')

  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )

  const { progression, situation } = useCurrentSimulation()

  const { exportSituationAsync } = useExportSituation()

  const router = useRouter()
  const partnerParams: Record<string, string> | undefined = useMemo(() => {
    try {
      const params =
        getPartnerFromStorage() ??
        Object.fromEntries(
          (typeof searchParams === 'object' &&
          searchParams !== null &&
          typeof searchParams.entries === 'function'
            ? searchParams.entries()
            : []
          ).filter(
            ([key]) => key === PARTNER_KEY || key.startsWith(PARTNER_KEY)
          )
        )

      return Object.keys(params).length ? params : undefined
    } catch {
      return undefined
    }
  }, [searchParams])

  const isPartnerVerified = useVerifyPartner(partnerParams?.partner)

  const hasNoPartnerParam =
    !partnerParams || Object.keys(partnerParams || {}).length === 0

  const handleExportSituation = useCallback(async () => {
    if (!partnerParams) return

    try {
      const { redirectUrl: redirectUrlFromResponse } =
        (await exportSituationAsync({
          situation,
          partner: partnerParams[PARTNER_KEY],
          partnerParams,
        })) ?? {}

      if (!redirectUrlFromResponse) throw new Error('No redirect URL')

      setRedirectUrl(redirectUrlFromResponse)

      setAlertToDisplay({
        type: 'success',
        content: <SuccessMessage redirectUrl={redirectUrlFromResponse} />,
      })
    } catch (error) {
      captureException(error)

      setAlertToDisplay({
        type: 'error',
        content: (
          <div className="xs:text-left text-center">
            <span className="mb-2 block">
              <Emoji className="mr-2 text-base">😫</Emoji>
              <Trans>
                Oups ! Une erreur s'est produite au moment d'envoyer vos
                résultats à notre partenaire. Veuillez recommencer le parcours
                depuis l'interface du site partenaire.
              </Trans>
            </span>
          </div>
        ),
      })
    } finally {
      removePartnerFromStorage()
    }
  }, [exportSituationAsync, situation, partnerParams])

  useEffect(() => {
    if (!hasNoPartnerParam && isPartnerVerified === false) {
      notFound()
    }
  }, [isPartnerVerified, router, hasNoPartnerParam])

  useEffect(() => {
    if (
      !isPartnerVerified ||
      hasNoPartnerParam ||
      typeof progression === 'undefined'
    )
      return

    if (progression === 1) {
      handleExportSituation()
    } else if (progression !== 1 && !getPartnerFromStorage()) {
      // Save partner info in Session Storage
      setPartnerInStorage(partnerParams)
    }
  }, [
    handleExportSituation,
    hasNoPartnerParam,
    partnerParams,
    progression,
    router,
    searchParams,
    situation,
    isPartnerVerified,
  ])

  return (
    <PartnerContext
      value={{
        alertToDisplay,
        redirectUrl,
      }}>
      {children}
    </PartnerContext>
  )
}

export const usePartner = () => useContext(PartnerContext)
