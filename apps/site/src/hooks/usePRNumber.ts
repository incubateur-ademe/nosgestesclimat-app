import { useIsClient } from '@/hooks/useIsClient'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { useSearchParams } from 'next/navigation'

function getPRNumberFromStorage() {
  return safeSessionStorage.getItem('PR') ?? ''
}

function clearPRNumberFromStorage() {
  safeSessionStorage.removeItem('PR')
}

export function usePRNumber(): {
  PRNumber: string
  clearPRNumber: () => void
} {
  const isClient = useIsClient()
  const searchParams = useSearchParams()

  // Don't use sessionStorage on the server
  if (!isClient) {
    return {
      PRNumber: '',
      clearPRNumber: clearPRNumberFromStorage,
    }
  }

  const PRNumberFromURL = searchParams.get('PR')

  const savedPRNumber = isClient && getPRNumberFromStorage()
  // Use the PR number from sessionStorage if it exists and there is no PR number in the URL
  if (savedPRNumber && !PRNumberFromURL) {
    return {
      PRNumber: savedPRNumber,
      clearPRNumber: clearPRNumberFromStorage,
    }
  }

  if (PRNumberFromURL) {
    safeSessionStorage.setItem('PR', PRNumberFromURL)
  }

  return {
    PRNumber: PRNumberFromURL || '',
    clearPRNumber: clearPRNumberFromStorage,
  }
}
