import Question from '@/components/form/Question'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import DishesNumberInfo from './plats/DishesNumberInfo'

export default function Plats({ question }: { question: DottedName }) {
  const { isMissing } = useRule(question)

  return (
    <>
      <Question question={question} />
      {!isMissing ? <DishesNumberInfo /> : null}
    </>
  )
}
