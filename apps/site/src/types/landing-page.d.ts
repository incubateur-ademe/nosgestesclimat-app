import type { ReactNode } from 'react'

export interface WhatDoWeMeasureListItem {
  icon: ReactNode
  title: ReactNode
}

export type GesturesType = Record<
  string,
  {
    imageSrc: string
    imageAlt: string
    gestureList?: ReactNode[]
  }
>

export interface LandingPagePostType {
  category: ReactNode
  title: ReactNode
  imageSrc: string
  href: string
  trackingEvent: string[]
}
