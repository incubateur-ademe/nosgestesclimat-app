import { cn } from 'cn'

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'link'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ButtonColor = 'primary' | 'red'

type VariantStyles = { primary: string } & Partial<Record<ButtonColor, string>>

const variantClassNames: Record<ButtonVariant, VariantStyles> = {
  filled: {
    primary: cn(
      'text-white bg-primary-700 border-2 border-primary-700 shadow-xs',
      'hover:text-white hover:bg-primary-800',
      'dark:bg-primary-100 dark:hover:bg-primary-100 hover:dark:bg-primary-200 hover:dark:border-primary-200 dark:border-primary-100 dark:text-primary-700!'
    ),
    red: cn(
      'text-white bg-red-700 border-2 border-red-700 shadow-xs',
      'hover:text-white hover:bg-red-800'
    ),
  },
  outlined: {
    primary: cn(
      'border-solid border-primary-700 border-2 text-primary-700 bg-transparent shadow-xs',
      'hover:text-primary-700 hover:bg-primary-100 hover:border-primary-700'
    ),
  },
  text: {
    primary: cn(
      'text-primary-700 bg-white border-2 border-white shadow-none',
      'hover:bg-primary-100 hover:text-primary-700 hover:border-primary-100'
    ),
  },
  link: {
    primary: cn(
      'text-primary-700 bg-inherit border-2 border-transparent shadow-none',
      'hover:text-primary-700 underline px-1!'
    ),
    red: cn(
      'text-red-700 bg-white border-2 border-white shadow-xs',
      'hover:text-white hover:bg-red-800 underline px-1!'
    ),
  },
}

export function getVariantClassNames(
  variant: ButtonVariant,
  color: ButtonColor
) {
  return variantClassNames[variant][color] ?? variantClassNames[variant].primary
}

export const sizeClassNames: Record<ButtonSize, string> = {
  xs: 'px-5 py-2 text-xs',
  sm: 'px-6 py-2.5 text-sm',
  md: 'px-4 sm:px-7 py-3 text-sm sm:text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-9 py-4 text-xl',
}

export const loaderColorMap: Partial<Record<ButtonVariant, 'light' | 'dark'>> =
  {
    filled: 'light',
    outlined: 'dark',
    text: 'dark',
    link: 'dark',
  }

export const baseClassNames = cn(
  'inline-flex items-center justify-center whitespace-nowrap',
  'rounded-full opacity-100',
  'font-bold no-underline leading-none',
  'transition-colors aria-disabled:opacity-50'
)
