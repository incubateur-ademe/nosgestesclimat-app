import { twMerge } from 'tailwind-merge'

type LoaderSizes = 'sm' | 'md' | 'lg'

interface Props {
  size?: LoaderSizes
  color?: 'light' | 'dark'
  className?: string
  /** Texte descriptif pour les lecteurs d'écran */
  ariaLabel?: string
}

const sizesClassNames = {
  sm: 'w-3 h-3 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-12 h-12 border-4',
}

const colorsClassNames = {
  light: 'border-white border-b-transparent',
  dark: 'border-primary-700 border-b-transparent',
}

export default function Loader({
  size = 'md',
  color = 'light',
  className,
  ariaLabel = 'Chargement en cours',
}: Props) {
  return (
    <>
      <span
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        className={twMerge(
          `inline-block animate-spin rounded-[50%] border-solid ${sizesClassNames[size]} ${colorsClassNames[color]} motion-reduce:hidden motion-reduce:animate-none`,
          className
        )}
      />
      <span className="hidden motion-reduce:block">{ariaLabel}</span>
    </>
  )
}
