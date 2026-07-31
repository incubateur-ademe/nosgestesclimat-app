'use client'

import i18nConfig, { type Locale } from '@/i18nConfig'
import { useEffect, useState } from 'react'

/**
 * Per-locale pathnames of the current page, read from the
 * `<link rel="alternate" hreflang>` tags emitted by `generateMetadata`.
 *
 * Kept in sync across client-side navigations with a MutationObserver:
 * Next.js swaps head metadata asynchronously after the route commits, and
 * React 19 may mutate a hoisted `<link>` in place instead of replacing it —
 * hence observing both childList and attributes.
 *
 * A locale absent from the result has no translated version of the page
 * (or the page declares no alternates at all).
 */
export const useAlternateLanguagePaths = (): Partial<
  Record<Locale, string>
> => {
  const [paths, setPaths] = useState<Partial<Record<Locale, string>>>({})

  useEffect(() => {
    const update = () =>
      setPaths((prev) => {
        const next = readAlternatePaths()
        // The head mutates for unrelated reasons (title swap, style
        // injection…): keep referential stability to avoid re-renders
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      })

    // The observer only fires on changes; read the initial state ourselves
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'hreflang', 'rel'],
    })

    return () => observer.disconnect()
  }, [])

  return paths
}

const isLocale = (lang: string): lang is Locale =>
  (i18nConfig.locales as string[]).includes(lang)

const readAlternatePaths = (): Partial<Record<Locale, string>> => {
  const paths: Partial<Record<Locale, string>> = {}

  for (const link of document.querySelectorAll<HTMLLinkElement>(
    'link[rel="alternate"][hreflang]'
  )) {
    // Only trust the pathname as the hostname may be set to incorrect values in dev env
    if (isLocale(link.hreflang)) {
      paths[link.hreflang] = new URL(link.href).pathname
    }
  }

  return paths
}
