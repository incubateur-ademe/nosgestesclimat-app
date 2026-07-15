import {
  getShouldBeLocalised,
  type LanguageSwitchParams,
} from '@/helpers/language/getShouldBeLocalised'
import LanguageSwitchButtonClient from './LanguageSwitchButtonClient'

export default async function LanguageSwitchButton({
  size = 'sm',
  className,
  params = {},
}: {
  size?: 'xs' | 'sm'
  className?: string
  params?: LanguageSwitchParams
}) {
  const shouldDisplayLangButtons = await getShouldBeLocalised(params)

  // Avoid rendering if all buttons are disabled
  if (!shouldDisplayLangButtons) {
    return null
  }

  return <LanguageSwitchButtonClient size={size} className={className} />
}
