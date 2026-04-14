import type { DottedName, NGCRule } from '@incubateur-ademe/nosgestesclimat'

/**
 * We use this hook to get the content of the [somme] of a rule.
 *
 * This is needed because in optimized rules, the syntaxic-sugar mechanism
 * [formule] is unfolded (i.e. replaced by its content). The [somme] is then
 * at the root of the rule and not in a [formule] mechanism (both syntaxes are valid).
 *
 * With the new `eau` metric, for some categories, the `somme` is not in the `formule` only but in a `variations` mechanism like:
 *
[
    {
        "si": "métrique = 'carbone'",
        "alors": {
            "somme": [
                "repas",
                "boisson",
                "déchets"
            ]
        }
    },
    {
        "si": "métrique = 'eau'",
        "alors": {
            "somme": [
                "repas",
                "boisson"
            ]
        }
    }
]
 */

type subCatWithVariations = {
  si: string
  alors: {
    somme: DottedName[]
  }
}[]

export default function getSomme(rawNode?: NGCRule): DottedName[] | undefined {
  if (!rawNode) return undefined

  if ('formule' in rawNode) {
    const formule = rawNode.formule as Record<string, unknown>

    if (typeof formule === 'string') {
      return undefined
    }

    return 'variations' in formule
      ? (formule.variations as subCatWithVariations)[0]?.alors?.somme
      : (formule.somme as DottedName[])
  }

  if ('somme' in rawNode) {
    return rawNode.somme as DottedName[]
  }

  if ('variations' in rawNode) {
    const variations = rawNode.variations as subCatWithVariations
    return variations[0].alors.somme
  }

  return undefined
}
