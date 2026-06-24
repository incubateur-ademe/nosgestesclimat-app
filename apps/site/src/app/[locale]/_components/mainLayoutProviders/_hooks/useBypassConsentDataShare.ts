'use client'

import { useEffect, useState } from 'react'
import { getIsAllowedToBypassConsentDataShare } from '../_helpers/getIsAllowedToBypassConsentDataShare'

export const useBypassConsentDataShare = () => {
  const [
    isAllowedToBypassConsentDataShare,
    setIsAllowedToBypassConsentDataShare,
  ] = useState(false)

  useEffect(() => {
    getIsAllowedToBypassConsentDataShare()
      .then(setIsAllowedToBypassConsentDataShare)
      .catch(() => {
        // Do nothing
      })
  }, [])

  return {
    isAllowedToBypassConsentDataShare,
  }
}
