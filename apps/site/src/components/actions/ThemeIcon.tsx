import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { twMerge } from 'cn'
import CarIcon from '../icons/CarIcon'
import FoodIcon from '../icons/FoodIcon'
import HousingIcon from '../icons/HousingIcon'
import MiscIcon from '../icons/MiscIcon'
import PublicServicesIcon from '../icons/PublicServicesIcon'
import { classesByTheme } from './theme/constants/classesByTheme'

export default function ThemeIcon({ themeKey }: { themeKey: Theme['key'] }) {
  const icon = getThemeIcon(themeKey)

  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'size-6 rounded-sm p-1',
        classesByTheme[themeKey].icon
      )}>
      {icon}
    </span>
  )
}

function getThemeIcon(themeKey: Theme['key']) {
  switch (themeKey) {
    case 'transport':
      return <CarIcon />
    case 'food':
      return <FoodIcon />
    case 'housing':
      return <HousingIcon />
    case 'misc':
      return <MiscIcon />
    case 'societal_services':
      return <PublicServicesIcon />
    default:
      themeKey satisfies never
      return ''
  }
}
