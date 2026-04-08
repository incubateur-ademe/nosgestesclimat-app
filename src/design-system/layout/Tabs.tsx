import Link from 'next/link'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export interface TabItem {
  id: string
  label: ReactNode
  href?: string
  isActive?: boolean
  className?: string
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface TabsProps {
  items: TabItem[]
  className?: string
  ariaLabel?: string
  containerId?: string
  hideBorder?: boolean
  isLocked?: boolean
}

const TabLink = ({
  item,
  children,
  isLocked,
  ...props
}: {
  item: TabItem
  children: ReactNode
  isLocked?: boolean
  scroll?: boolean
} & React.HTMLAttributes<HTMLElement>) => {
  const baseClasses =
    'inline-block w-full md:w-auto px-1 md:px-4 py-3 text-lg border-b-3 border-transparent'
  const activeClasses =
    'font-bold px-1 md:px-4 py-3 border-primary-600! border-current text-primary-600'

  const { href, isActive, className, prefetch, ...otherProps } = item

  if (isLocked) {
    return (
      <span
        className={twMerge(
          baseClasses,
          isActive ? activeClasses : '',
          className
        )}
        {...otherProps}
        {...props}>
        {children}
      </span>
    )
  }

  if (!href) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-current={isActive ? 'page' : undefined}
        className={twMerge(
          baseClasses,
          isActive ? activeClasses : '',
          className
        )}
        {...otherProps}
        {...props}>
        {children}
      </button>
    )
  }

  if (isActive) {
    return (
      <span
        role="tab"
        aria-current="page"
        aria-selected
        className={twMerge(baseClasses, activeClasses, className)}
        {...otherProps}
        {...props}>
        {children}
      </span>
    )
  }

  return (
    <Link
      role="tab"
      href={href}
      prefetch={prefetch}
      className={twMerge(baseClasses, className)}
      {...otherProps}
      {...props}>
      {children}
    </Link>
  )
}

export default function Tabs({
  items,
  className,
  ariaLabel = 'Navigation par onglets',
  containerId,
  hideBorder = false,
  isLocked = false,
}: TabsProps) {
  const borderClasses = hideBorder ? '' : 'border-b-2 border-slate-200'

  return (
    <div
      data-track
      className={twMerge(borderClasses, className)}
      id={containerId}>
      <nav aria-label={ariaLabel}>
        <ul
          role={isLocked ? undefined : 'tablist'}
          className={twMerge(
            'flex items-end justify-between md:justify-start',
            isLocked ? 'cursor-not-allowed' : ''
          )}>
          {items.map(({ containerClassName, ...item }) => (
            <li
              key={item.id}
              className={twMerge(
                'flex-1 translate-y-0.5 md:flex-none',
                containerClassName
              )}>
              <TabLink item={item} isLocked={isLocked}>
                {item.label}
              </TabLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
