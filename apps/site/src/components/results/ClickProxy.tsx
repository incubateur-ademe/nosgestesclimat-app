'use client'

import type { CSSProperties } from 'react'

interface Props {
  targetId: string
  className?: string
  style?: CSSProperties
}

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
