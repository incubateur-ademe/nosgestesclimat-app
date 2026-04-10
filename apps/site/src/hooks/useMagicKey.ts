import { useEffect } from 'react'

export function useMagicKey({
  gotToNextQuestion,
}: {
  gotToNextQuestion: (e: KeyboardEvent) => void
}) {
  useEffect(() => {
    const handleMagicKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'Escape' || e.key === 'Enter')) {
        gotToNextQuestion(e)
      }
    }
    document.addEventListener('keydown', handleMagicKey)

    return () => {
      document.removeEventListener('keydown', handleMagicKey)
    }
  }, [gotToNextQuestion])
}
