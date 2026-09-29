import type { Theme } from '@/types/themes'

export const classesByTheme: Record<
  Theme['key'],
  Record<'card' | 'panel' | 'value', string>
> = {
  transport: {
    card: 'border-transport-200 border-t-transport-400 md:border-t-transport-200 md:border-l-transport-400',
    panel: 'bg-transport-50',
    value: 'text-transport-900',
  },
  food: {
    card: 'border-alimentation-200 border-t-alimentation-400 md:border-t-alimentation-200 md:border-l-alimentation-400',
    panel: 'bg-alimentation-50',
    value: 'text-alimentation-900',
  },
  housing: {
    card: 'border-logement-200 border-t-logement-400 md:border-t-logement-200 md:border-l-logement-400',
    panel: 'bg-logement-50',
    value: 'text-logement-900',
  },
  misc: {
    card: 'border-divers-200 border-t-divers-400 md:border-t-divers-200 md:border-l-divers-400',
    panel: 'bg-divers-50',
    value: 'text-divers-900',
  },
  societal_services: {
    card: 'border-servicessocietaux-200 border-t-servicessocietaux-400 md:border-t-servicessocietaux-200 md:border-l-servicessocietaux-400',
    panel: 'bg-servicessocietaux-50',
    value: 'text-servicessocietaux-900',
  },
}
