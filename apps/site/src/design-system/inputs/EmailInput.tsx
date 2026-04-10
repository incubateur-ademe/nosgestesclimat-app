import Trans from '@/components/translation/trans/TransClient'
import { t } from '@/helpers/metadata/fakeMetadataT'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import TextInput from './TextInput'

type Props = Omit<
  ComponentProps<typeof TextInput>,
  'type' | 'autoComplete' | 'placeholder' | 'name'
>

export default forwardRef(function EmailInput(
  {
    label = t('ui.emailInput.label', 'Votre adresse e-mail'),

    ...props
  }: Props,
  ref
) {
  return (
    <TextInput
      label={label}
      srOnlyHelperText={
        <Trans i18nKey="email.input.helper">
          Format attendu : nom@exemple.org
        </Trans>
      }
      name="email"
      type="email"
      autoComplete="email"
      placeholder="nom@exemple.org"
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      {...props}
    />
  )
})
