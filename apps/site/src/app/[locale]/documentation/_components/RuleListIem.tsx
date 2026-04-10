import Link from '@/components/Link'
import { encodeRuleName } from '@/utils/publicodes/encodeRuleName'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { FuseResultMatch } from 'fuse.js'
import highlightMatches from '../_helpers/highlightMatches'
import type { Matches, SearchItem } from './SearchBar'

export default function RuleListItem({
  rules,
  item,
  matches = undefined,
}: {
  rules: Partial<NGCRules>
  item: SearchItem
  matches: FuseResultMatch[] | undefined
}) {
  const rule = rules[item.dottedName] as unknown as { icônes?: string }
  const icon = rule?.icônes

  return (
    <li className="border-primary-100 my-2 border-b border-solid p-2">
      <Link
        href={`/documentation/${encodeRuleName(item.dottedName)}`}
        className="decoration-none block"
        aria-describedby={`breadcrumb-${item.dottedName}`}>
        <div className="flex items-start">
          {icon && (
            <span
              className="mr-2 flex-shrink-0"
              aria-hidden="true"
              role="img"
              aria-label={`Icône pour ${item.title}`}>
              {icon}
            </span>
          )}

          <div className="flex-1">
            <div
              id={`breadcrumb-${item.dottedName}`}
              className="mb-1 text-sm text-slate-600"
              aria-label="Chemin de navigation">
              {item.espace
                .slice(1)
                .reverse()
                .map((name, index, array) => (
                  <span key={name}>
                    {matches
                      ? highlightMatches(
                          name,
                          matches.filter(
                            (m) => m.key === 'espace' && m.value === name
                          ) as Matches
                        )
                      : name}
                    {index < array.length - 1 && (
                      <span aria-hidden="true"> › </span>
                    )}
                  </span>
                ))}
            </div>

            <div className="font-medium">
              {matches
                ? highlightMatches(
                    item.title,
                    matches.filter((m) => m.key === 'title') as Matches
                  )
                : item.title}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}
