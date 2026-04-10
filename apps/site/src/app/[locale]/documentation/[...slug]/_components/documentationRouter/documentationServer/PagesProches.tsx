import Link from '@/components/Link'
import { getRuleTitle } from '@/helpers/publicodes/getRuleTitle'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'

export default function PagesProches({
  rules,
  ruleName,
}: {
  rules: NGCRules
  ruleName: DottedName
}) {
  const namespaceRules = Object.keys(rules).filter(
    (key) => key.includes(ruleName) && key !== ruleName
  ) as DottedName[]

  if (!namespaceRules.length) return null
  return (
    <section className="mt-8">
      <h2>Pages proches</h2>

      <ul className="list-none">
        {namespaceRules.map((ruleName) => {
          const item = {
            ...rules[ruleName],
            dottedName: ruleName,
            espace: ruleName.split(' . ').reverse(),
          }

          return (
            <li key={item.dottedName} className="border-b border-gray-300 p-2">
              <Link
                href={`/documentation/${utils.encodeRuleName(item.dottedName)}`}
                className="no-underline hover:underline">
                <small>
                  {item.espace
                    .slice(1)
                    .reverse()
                    .map((name: string) => (
                      <span key={name}>{name} › </span>
                    ))}
                  <br />
                </small>

                <span className="mr-2">{rules[item.dottedName]?.icônes}</span>

                {getRuleTitle(item)}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
