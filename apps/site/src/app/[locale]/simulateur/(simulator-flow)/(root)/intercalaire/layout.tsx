'use client'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { useFormState } from '@/publicodes-state'
import { useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { gotoNextQuestion } = useFormState()
  const router = useRouter()

  function handleNextQuestion() {
    gotoNextQuestion()
    router.push(SIMULATOR_PATH)
  }
  return (
    <div>
      {children}
      <Button onClick={handleNextQuestion}>J'ai compris, tout baigne</Button>
    </div>
  )
}
