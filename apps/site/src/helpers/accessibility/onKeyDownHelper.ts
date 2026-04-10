import type { KeyboardEvent } from 'react'

export const onKeyDownHelper =
  (
    callback: (
      event: KeyboardEvent<
        | HTMLInputElement
        | HTMLButtonElement
        | HTMLDivElement
        | HTMLAnchorElement
      >
    ) => void
  ) =>
  (
    event: KeyboardEvent<
      HTMLInputElement | HTMLButtonElement | HTMLDivElement | HTMLAnchorElement
    >
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback(event)
    }
  }
