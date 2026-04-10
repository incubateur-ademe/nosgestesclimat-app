import {
  getBackgroundDarkColor,
  getBackgroundLightColor,
} from '@/helpers/getCategoryColorClass'
import { useFormState } from '@/publicodes-state'
import { twMerge } from 'tailwind-merge'

export default function Progress() {
  const { testAdvancement, currentCategory } = useFormState()

  // Calculer le pourcentage pour l'accessibilité
  const percentage = Math.round(testAdvancement * 100)

  return (
    <div
      role="progressbar"
      aria-label="Progression de la simulation"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${percentage}% complété`}
      className="absolute right-0 bottom-0 left-0 h-1">
      {/* Barre de fond */}
      <div
        className={twMerge(
          'absolute right-0 bottom-0 left-0 h-1 transition-transform',
          getBackgroundLightColor(currentCategory)
        )}
        aria-hidden="true"
      />
      {/* Barre de progression */}
      <div
        className={twMerge(
          'absolute right-0 bottom-0 left-0 h-1 origin-left transition-transform',
          getBackgroundDarkColor(currentCategory)
        )}
        style={{ transform: `scaleX(${testAdvancement})` }}
        aria-hidden="true"
      />
    </div>
  )
}
