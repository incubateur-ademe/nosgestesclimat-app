import * as v from 'valibot'

export const ISOSupportedLanguageSchema = v.picklist(['fr', 'en'])

/**
 * Languages supported by the app
 * ISO 639-1 language codes
 */
export type ISOSupportedLanguage = v.InferOutput<
  typeof ISOSupportedLanguageSchema
>
