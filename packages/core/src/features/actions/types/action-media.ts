/** ISO 639-1 language codes */
type ImpactCO2Language = 'fr' | 'en' | 'es'

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
  }
}

interface MediaImage extends MediaBase {
  type: 'image'
  /** Absolute url or absolute public path */
  src: string
  alt: string
}

export type ActionMedia = MediaImpactCO2 | MediaImage
