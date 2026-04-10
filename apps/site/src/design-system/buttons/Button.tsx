import type { ButtonSize } from '@/types/values'
import type {
  HtmlHTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
  RefObject,
} from 'react'
import { twMerge } from 'tailwind-merge'

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'link'
  | 'success'
  | 'borderless'

export type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  size?: ButtonSize
  color?: ButtonColor
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  id?: string
  title?: string
  form?: string
  ref?: RefObject<HTMLButtonElement | null>
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
  borderless: 'bg-primary-50 hover:bg-primary-100 text-primary-800',
}

export const sizeClassNames = {
  xs: 'px-5 py-2 text-xs',
  sm: 'px-6 py-2.5 text-sm',
  md: 'px-4 sm:px-7 py-3 text-sm sm:text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-9 py-4 text-xl',
}

export const baseClassNames =
  'inline-flex items-center opacity-100! justify-center whitespace-nowrap rounded-full font-bold no-underline transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-700 focus:ring-offset-3 aria-disabled:opacity-50 leading-none!'

export default function Button({
  onClick,
  children,
  className,
  size = 'md',
  color = 'primary',
  type,
  disabled,
  id,
  title,
  form,
  ref,
  ...props
}: PropsWithChildren<ButtonProps & HtmlHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      onClick={
        disabled
          ? (e) => {
              e.preventDefault()
            }
          : onClick
      }
      ref={ref}
      type={type}
      aria-disabled={disabled}
      title={title}
      form={form}
      id={id}
      className={twMerge(
        baseClassNames,
        sizeClassNames[size],
        colorClassNames[color],
        disabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      {...props}>
      {children}
    </button>
  )
}
