import {
  getBorderColor,
  getTextDarkColor,
} from '@/helpers/getCategoryColorClass'
import { cn } from 'cn'
import type { PropsWithChildren } from 'react'

const colorClassNames = {
  primary: 'border-primary-700 text-primary-700 bg-primary-50',
  secondary: 'border-secondary-700 text-secondary-700 bg-secondary-50',
  green: 'border-green-700 text-green-700 bg-green-50',
  red: 'border-red-700 text-red-700 bg-red-50',
  purple: 'border-purple-700 text-purple-800 bg-purple-50',
  yellow: 'border-yellow-700 text-yellow-800 bg-yellow-50',
  blue: 'border-blue-700 text-blue-800 bg-blue-50',
  orange: 'border-orange-700 text-orange-800 bg-orange-50',
  light: 'border-0 bg-primary-100 text-primary-800',
}

const sizeClassNames = {
  xs: 'text-xs py-0.5 px-0.5',
  sm: 'text-sm py-0.5 px-1',
  md: 'text-base py-1 px-2',
}

export type BadgeColor = keyof typeof colorClassNames

export default function Badge({
  children,
  color = 'primary',
  size = 'md',
  className,
  category,
  tag = 'div',
  border = true,
  ...props
}: PropsWithChildren<{
  color?: BadgeColor
  size?: 'xs' | 'sm' | 'md'
  className?: string
  category?: string
  tag?: 'div' | 'span' | 'p' | 'h2' | 'h3' | 'h4'
  border?: boolean
  ['data-testid']?: string
}>) {
  const { 'data-testid': dataTestId } = props
  const Tag = tag
  return (
    <Tag
      data-testid={dataTestId}
      className={cn(
        'inline-block rounded-md border-2 leading-none whitespace-nowrap',
        sizeClassNames[size],
        category
          ? `${getBorderColor(category)} ${getTextDarkColor(category)}`
          : colorClassNames[color],
        border ? '' : 'border-none',
        className
      )}>
      {children}{' '}
    </Tag>
  )
}
