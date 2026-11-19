'use client'

import type { CSSProperties } from 'react'

interface Props {
  /** Id of the element that a click on this one clicks */
  targetId: string
  className?: string
  style?: CSSProperties
}

/**
 * A larger, mouse-only hit area for a control rendered elsewhere: keyboard and
 * assistive technology users reach the control itself, so it stays out of
 * their way.
 */
export default function ClickProxy({ targetId, className, style }: Props) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      className={className}
      style={style}
      onClick={() => document.getElementById(targetId)?.click()}
    />
  )
}
