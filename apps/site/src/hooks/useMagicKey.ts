import { useEffect } from 'react'

interface Props {
  gotToNextQuestion: (e: KeyboardEvent) => void
  isLastQuestion: boolean
}

export function useMagicKey({ gotToNextQuestion, isLastQuestion }: Props) {
  useEffect(() => {
    const handleMagicKey = (e: KeyboardEvent) => {
      if (isLastQuestion && e.repeat) return
      if (e.altKey && (e.key === 'Escape' || e.key === 'Enter')) {
        gotToNextQuestion(e)
      }
    }
    document.addEventListener('keydown', handleMagicKey)

    return () => {
      document.removeEventListener('keydown', handleMagicKey)
    }
  }, [gotToNextQuestion, isLastQuestion])
}
