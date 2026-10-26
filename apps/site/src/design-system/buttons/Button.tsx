'use client'

import { cn } from 'cn'
import {
  type HtmlHTMLAttributes,
  type MouseEventHandler,
  type PropsWithChildren,
  type RefObject,
} from 'react'
import Loader from '../layout/Loader'
import {
  baseClassNames,
  getVariantClassNames,
  loaderColorMap,
  sizeClassNames,
  type ButtonColor,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'
import { useButtonState } from './useButtonState'

export type ButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
  color?: ButtonColor
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  id?: string
  title?: string
  form?: string
  ref?: RefObject<HTMLButtonElement | null>
  showLoadingOnClickWhilePending?: boolean
} & PropsWithChildren

export { baseClassNames, getVariantClassNames, loaderColorMap, sizeClassNames }
export type { ButtonColor }

export default function Button({
  onClick,
  children,
  className,
  size = 'md',
  color = 'primary',
  variant = 'filled',
  type,
  disabled,
  loading,
  id,
  title,
  form,
  ref,
  showLoadingOnClickWhilePending,
  ...props
}: PropsWithChildren<ButtonProps & HtmlHTMLAttributes<HTMLButtonElement>>) {
  const { isDisabled, showLoader, startTransition } = useButtonState({
    disabled,
    loading,
    showLoadingOnClick: showLoadingOnClickWhilePending,
  })

  return (
    <button
      onClick={
        isDisabled
          ? (e) => {
              e.preventDefault()
            }
          : showLoadingOnClickWhilePending
            ? (e) => {
                startTransition(() => {
                  onClick?.(e)
                })
              }
            : onClick
      }
      ref={ref}
      type={type}
      aria-disabled={isDisabled}
      title={title}
      form={form}
      id={id}
      className={cn(
        baseClassNames,
        sizeClassNames[size],
        getVariantClassNames(variant, color),
        isDisabled && 'cursor-not-allowed opacity-50!',
        className
      )}
      {...props}>
      {showLoader && (
        <Loader size="sm" color={loaderColorMap[variant]} className="mr-2" />
      )}
      {children}
    </button>
  )
}
