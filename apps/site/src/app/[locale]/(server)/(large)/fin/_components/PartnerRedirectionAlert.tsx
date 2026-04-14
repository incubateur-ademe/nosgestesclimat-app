'use client'

import { usePartner } from '@/contexts/partner/PartnerContext'
import Alert from '@/design-system/alerts/alert/Alert'
import Confirmation from '@/design-system/alerts/Confirmation'

export default function PartnerRedirectionAlert() {
  const { alertToDisplay } = usePartner()

  if (!alertToDisplay) return null

  if (alertToDisplay.type === 'error') {
    return (
      <Alert
        className="mb-8"
        type={alertToDisplay.type}
        description={alertToDisplay.content}
      />
    )
  }

  return <Confirmation>{alertToDisplay.content}</Confirmation>
}
