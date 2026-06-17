import type { ButtonSize } from '@/types/values'
import {
  useState,
  type HtmlHTMLAttributes,
  type MouseEventHandler,
  type PropsWithChildren,
  type RefObject,
} from 'react'
import { twMerge } from 'tailwind-merge'
import type { LoaderSizes } from '../layout/Loader'
import Loader from '../layout/Loader'

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'link'
  | 'success'
  | 'borderless'
  | 'red'

export type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  size?: ButtonSize
  color?: ButtonColor
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  id?: string
  title?: string
  form?: string
  ref?: RefObject<HTMLButtonElement | null>
  isClickableOnce?: boolean
} & PropsWithChildren

export const colorClassNames = {
  primary:
    'text-white bg-primary-700 border-2 border-primary-700 shadow-xs hover:text-white hover:bg-primary-800',
  secondary:
    'border-solid border-primary-700 border-2 text-primary-700 bg-transparent shadow-xs hover:text-primary-700 hover:bg-primary-100 hover:border-primary-700',
  success:
    'bg-green-700 text-white border-2 border-green-700 shadow-xs hover:text-white hover:bg-green-800',
  text: 'text-primary-700 bg-transparent border-2 border-transparent shadow-none hover:bg-primary-200 hover:text-primary-700 hover:border-primary-200',
  link: 'text-primary-700 bg-transparent border-2 border-transparent shadow-none hover:text-primary-700 underline px-1!',
  borderless:
    'bg-primary-100 hover:bg-primary-200 hover:text-primary-800 text-primary-700',
  red: 'text-white bg-red-700 border-2 border-red-700 shadow-xs hover:text-white hover:bg-red-800',
}

export const sizeClassNames = {
  xs: 'px-5 py-2 text-xs',
  sm: 'px-6 py-2.5 text-sm',
  md: 'px-4 sm:px-7 py-3 text-sm sm:text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-9 py-4 text-xl',
}

export const loaderSizeMap: Record<ButtonSize, LoaderSizes> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
}

export const loaderColorMap: Record<ButtonColor, 'light' | 'dark'> = {
  primary: 'light',
  secondary: 'dark',
  success: 'light',
  text: 'dark',
  link: 'dark',
  borderless: 'dark',
  red: 'light',
}

export const baseClassNames =
  'inline-flex items-center opacity-100! justify-center whitespace-nowrap rounded-full font-bold no-underline transition-colors aria-disabled:opacity-50 leading-none!'

export default function Button({
  onClick,
  children,
  className,
  size = 'md',
  color = 'primary',
  type,
  disabled,
  loading,
  id,
  title,
  form,
  ref,
  isClickableOnce,
  ...props
}: PropsWithChildren<ButtonProps & HtmlHTMLAttributes<HTMLButtonElement>>) {
  const [isClicked, setIsClicked] = useState(false)

  const isDisabled = disabled || loading || (isClickableOnce && isClicked)

  return (
    <button
      onClick={
        isDisabled
          ? (e) => {
              e.preventDefault()
            }
          : (e) => {
              setIsClicked(true)
              onClick?.(e)
            }
      }
      ref={ref}
      type={type}
      aria-disabled={isDisabled}
      title={title}
      form={form}
      id={id}
      className={twMerge(
        baseClassNames,
        sizeClassNames[size],
        colorClassNames[color],
        isDisabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      {...props}>
      {loading && (
        <Loader
          size={loaderSizeMap[size]}
          color={loaderColorMap[color]}
          className="mr-2"
        />
      )}
      {children}
    </button>
  )
}
