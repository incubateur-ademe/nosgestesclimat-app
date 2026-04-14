import { useRule } from '@/publicodes-state'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  value: NodeValue
  question: DottedName
}
export default function ChoicesValue({ value, question }: Props) {
  const { title, icons } = useRule((question + ' . ' + value) as DottedName)

  return (
    <>
      {icons} {title}
    </>
  )
}
