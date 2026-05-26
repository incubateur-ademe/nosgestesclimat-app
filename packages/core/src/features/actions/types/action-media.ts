import * as v from 'valibot'

/** ISO 639-1 language codes */
export const ImpactCO2LanguageSchema = v.picklist(['fr', 'en', 'es'])
export type ImpactCO2Language = v.InferOutput<typeof ImpactCO2LanguageSchema>

interface MediaBase {
  title: string
}

interface MediaImpactCO2 extends MediaBase {
  type: 'impact_co2'
  data: {
    // Could perhaps be an enum
    type: string
    /** Inherits the language if not specified */
    language?: ImpactCO2Language
    options?: Record<string, string>
  }
}

interface MediaImage extends MediaBase {
  type: 'image'
  /** Absolute url or absolute public path */
  src: string
  alt: string
}

export type ActionMedia = MediaImpactCO2 | MediaImage
