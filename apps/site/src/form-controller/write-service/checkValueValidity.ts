import type getType from '@/publicodes-state/helpers/getType'
import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'

/**
 * Coerce a raw input value into the situation representation Publicodes expects
 * for the rule's type. The drafts hold the semantic value (`true`, the raw
 * choice); this is the single place that translates it.
 */
export const checkValueValidity = ({
  value,
  type,
}: {
  value: unknown
  type: ReturnType<typeof getType>
}): NodeValue => {
  switch (type) {
    case 'choices': {
      if (value === null) {
        return
      }
      if (value === undefined) {
        return "''"
      }
      const stringValue =
        typeof value === 'string' ? value : String(value as string | number)
      return stringValue.startsWith("'") ? stringValue : `'${stringValue}'`
    }
    case 'boolean':
      if (value === 'oui' || value === true) {
        return 'oui'
      }
      if (value === 'non' || value === false || value === null) {
        return 'non'
      }
      return undefined
    case 'number':
      if (value === undefined) return undefined
      // `NaN` would reach the engine as an unparseable expression.
      if (typeof value === 'number')
        return Number.isFinite(value) ? value : undefined
      return 0
    case 'notQuestion':
      // A notification is silenced by writing a falsy value, and the situation
      // schema holds no boolean: `false` becomes `0`.
      return 0
    case 'numberMosaic':
    case 'selectMosaic':
    case undefined:
      return value as NodeValue
  }
}
