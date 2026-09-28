import type { DottedName, NGCRule } from '@incubateur-ademe/nosgestesclimat'

/**
 * TODO: this is a duplicate of site code, refactor apps and server fixtures to use these functions.
 **/

type SommeVariations = { si: string; alors: { somme: DottedName[] } }[]

export const getSomme = (rawNode?: NGCRule): DottedName[] | undefined => {
  if (!rawNode) return undefined

  if ('formule' in rawNode) {
    const formule = rawNode.formule

    // `bilan . formule` can be a string (`'services sociétaux'`) or a number,
    // neither of which carries a somme.
    if (typeof formule !== 'object' || formule === null) return undefined

    const formuleNode = formule as Record<string, unknown>

    if ('variations' in formuleNode) {
      return (formuleNode.variations as SommeVariations)[0]?.alors?.somme
    }

    return formuleNode.somme as DottedName[] | undefined
  }

  if ('somme' in rawNode) {
    return rawNode.somme as DottedName[]
  }

  if ('variations' in rawNode) {
    return (rawNode.variations as SommeVariations)[0]?.alors?.somme
  }

  return undefined
}
