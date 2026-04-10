import type { Locale } from '@/i18nConfig'

declare module '@getbrevo/brevo'

export interface DefaultPageProps<
  T = {
    params: Record<string, string | string[]>
    searchParams?: Record<string, string | string[] | undefined>
  },
> {
  params: Promise<{ locale: Locale } & T['params']>
  searchParams?: Promise<
    Record<string, string | string[] | undefined> & T['searchParams']
  >
}

export type SkipLinksDisplayed = Set<'main' | 'navigation' | 'footer'>
