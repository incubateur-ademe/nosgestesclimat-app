import type supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'

export type SupportedRegions = {
  [Region in keyof typeof supportedRegions]: {
    [Locale in keyof (typeof supportedRegions)[Region]]: {
      regionCode: Region & string
      locale: Locale & string
    }
  }[keyof (typeof supportedRegions)[Region]]
}[keyof typeof supportedRegions]

export type Model = SupportedRegions extends {
  regionCode: infer R extends string
  locale: infer L extends string
}
  ? `${R}-${L}-${string}`
  : never
