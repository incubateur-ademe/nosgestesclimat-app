import ChoiceInput from '@/components/misc/ChoiceInput'
import Emoji from '@/design-system/utils/Emoji'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question: DottedName
  choice: string | number
  active: boolean
  setValue: (value: string | number) => void
  id?: string
  isWithinGrid?: boolean
}

export default function Choice({
  question,
  choice,
  active,
  setValue,
  id,
  isWithinGrid,
  ...props
}: Props) {
  const { title, description, icons } = useRule(
    (question + ' . ' + choice) as DottedName
  )

  return (
    <ChoiceInput
      label={
        <>
          <span className="inline-flex">{title}</span>
          {icons ? (
            <>
              {' '}
              <Emoji className="inline-flex items-center">{icons}</Emoji>
            </>
          ) : null}
        </>
      }
      labelText={title ?? ''}
      description={description}
      active={active}
      onClick={() => setValue(choice)}
      id={id}
      isWithinGrid={isWithinGrid}
      {...props}
    />
  )
}
