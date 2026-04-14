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

const PLAT_RULENAME: DottedName = 'alimentation . plats'
const VOITURE_RULENAME: DottedName = 'transport . voiture . km'
const TEXTILE_RULENAME: DottedName = 'divers . textile . volume'

const specialQuestions: Record<
  string,
  (props: SpecialQuestionProps) => JSX.Element
> = {
  [PLAT_RULENAME]: (props: Props) => (
    <Plats key={PLAT_RULENAME} question={PLAT_RULENAME} {...props} />
  ),
  [VOITURE_RULENAME]: (props: Props) => (
    <Voiture key={VOITURE_RULENAME} question={VOITURE_RULENAME} {...props} />
  ),
  [TEXTILE_RULENAME]: (props: Props) => (
    <Textile key={TEXTILE_RULENAME} question={TEXTILE_RULENAME} {...props} />
  ),
}

export default specialQuestions
