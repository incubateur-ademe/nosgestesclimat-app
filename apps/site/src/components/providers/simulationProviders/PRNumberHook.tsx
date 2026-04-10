/**
 * This component is used to get the PR params from the url
 * It needs to be inside a Suspense
 * That's why this hook is in its own component.
 */
import { usePRNumber } from '@/hooks/usePRNumber'
import { useEffect } from 'react'

interface Props {
  setPRNumber: (PRNumber: string) => void
}

export default function PRNumberHook({ setPRNumber }: Props) {
  const { PRNumber } = usePRNumber()

  useEffect(() => {
    if (PRNumber) {
      setPRNumber(PRNumber)
    }
  }, [PRNumber, setPRNumber])

  return null
}
