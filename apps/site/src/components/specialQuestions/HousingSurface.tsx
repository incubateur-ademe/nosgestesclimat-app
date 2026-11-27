'use client'

import Question from '@/components/form/Question'
import SliderNumberInput from '@/design-system/inputs/SliderNumberInput'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useHousingSurfaceSlider } from './housingSurface/useHousingSurfaceSlider'

const SURFACE_SLIDER_FLAG = 'ab-test-slider-housing-surface' as const
const SURFACE_SLIDER_VARIANT = 'slider'

interface Props {
  question: DottedName
}

export default function HousingSurfaceABTest({ question }: Props) {
  const variant = useFeatureFlag(SURFACE_SLIDER_FLAG)

  if (variant !== SURFACE_SLIDER_VARIANT) {
    return <Question question={question} />
  }

  return <HousingSurfaceSlider question={question} />
}

function HousingSurfaceSlider({ question }: Props) {
  const sliderProps = useHousingSurfaceSlider(question)

  return (
    <Question
      question={question}
      inputOverride={<SliderNumberInput {...sliderProps} />}
    />
  )
}
