import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'

interface Props {
  displayValue: string | number
  unit?: string
}

export default function NumberValue({ displayValue, unit }: Props) {
  const locale = useLocale()
  const { t } = useClientTranslation()

  return (
    <>
      {Number(displayValue).toLocaleString(locale, {
        maximumFractionDigits: 2,
      })}{' '}
      {t(unit ?? '')}
    </>
  )
}
