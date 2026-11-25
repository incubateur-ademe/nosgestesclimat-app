import ChoiceInput from '@/components/misc/ChoiceInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
interface Props {
  value: boolean | undefined
  setValue: (value: boolean | undefined) => void
  'data-testid': string
  label: string
  firstInputId?: string
}

export default function BooleanInput({
  value,
  setValue,
  label,
  firstInputId,
  ...props
}: Props) {
  const { t } = useClientTranslation()

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{label}</legend>

      <ChoiceInput
        label={t('Oui')}
        labelText={t('Oui')}
        active={value === true}
        onClick={() => setValue(value === true ? undefined : true)}
        {...props}
        data-testid={`${props['data-testid']}-oui`}
        id={firstInputId}
      />

      <ChoiceInput
        label={t('Non')}
        labelText={t('Non')}
        active={value === false}
        onClick={() => setValue(value === false ? undefined : false)}
        {...props}
        data-testid={`${props['data-testid']}-non`}
      />
    </fieldset>
  )
}
