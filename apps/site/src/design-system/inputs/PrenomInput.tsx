import { useClientTranslation } from '@/hooks/useClientTranslation'
import { forwardRef, type HTMLAttributes } from 'react'
import TextInput from './TextInput'

interface Props extends HTMLAttributes<HTMLInputElement> {
  error?: string
  value?: string
}

export default forwardRef(function PrenomInput(
  { error, value, ...props }: Props,
  ref
) {
  const { t } = useClientTranslation()

  return (
    <TextInput
      label={t('Votre prénom')}
      autoComplete="given-name"
      helperText={t(
        'Il sera visible uniquement par les participants du groupe'
      )}
      value={value}
      name="prenom"
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      error={error}
      {...props}
    />
  )
})
