import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { JSX } from 'react'
import Plats from './Plats'
import Textile from './Textile'
import Voiture from './Voiture'

interface Props {
  setDisplayedValue?: (value: string | undefined) => void
  setTempValue?: (value: number | undefined) => void
  tempValue?: number
}

type SpecialQuestionProps = Props & { question: DottedName }

const MEAL_RULENAME: DottedName = 'alimentation . plats'
const CAR_RULENAME: DottedName = 'transport . voiture . km'
const CLOTHING_RULENAME: DottedName = 'divers . textile . volume'

const specialQuestions: Record<
  string,
  (props: SpecialQuestionProps) => JSX.Element
> = {
  [MEAL_RULENAME]: (props: Props) => (
    <Plats key={MEAL_RULENAME} question={MEAL_RULENAME} {...props} />
  ),
  [CAR_RULENAME]: (props: Props) => (
    <Voiture key={CAR_RULENAME} question={CAR_RULENAME} {...props} />
  ),
  [CLOTHING_RULENAME]: (props: Props) => (
    <Textile key={CLOTHING_RULENAME} question={CLOTHING_RULENAME} {...props} />
  ),
}

export default specialQuestions
