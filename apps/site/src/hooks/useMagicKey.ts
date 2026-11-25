import { useEffect, useRef } from 'react'

interface Props {
  gotToNextQuestion: (e: KeyboardEvent) => void
  isLastQuestion: boolean
}

/**
 * Alt+Enter / Alt+Escape advances. The listener is registered once and reads the
 * latest handler through a ref: re-subscribing on every render loses the repeat
 * events a held key fires while React re-renders.
 */
export function useMagicKey({ gotToNextQuestion, isLastQuestion }: Props) {
  const handlerRef = useRef(gotToNextQuestion)
  useEffect(() => {
    handlerRef.current = gotToNextQuestion
  })

  const isLastQuestionRef = useRef(isLastQuestion)
  useEffect(() => {
    isLastQuestionRef.current = isLastQuestion
  })

  useEffect(() => {
    const handleMagicKey = (e: KeyboardEvent) => {
      if (!e.altKey || (e.key !== 'Escape' && e.key !== 'Enter')) return
      // Avoid completing the simulation several times on a held key.
      if (isLastQuestionRef.current && e.repeat) return
      handlerRef.current(e)
    }
    document.addEventListener('keydown', handleMagicKey)
    return () => document.removeEventListener('keydown', handleMagicKey)
  }, [])
}
