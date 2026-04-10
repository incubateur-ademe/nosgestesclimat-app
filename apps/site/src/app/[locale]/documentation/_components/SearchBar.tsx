import SearchIcon from '@/components/icons/SearchIcon'
import Trans from '@/components/translation/trans/TransClient'
import TextInput from '@/design-system/inputs/TextInput'
import Card from '@/design-system/layout/Card'
import { getRuleTitle } from '@/helpers/publicodes/getRuleTitle'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type {
  DottedName,
  NGCRule,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import Fuse, { type FuseResult } from 'fuse.js'
import { utils } from 'publicodes'
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import RuleListItem from './RuleListIem'

export interface SearchItem {
  title: string
  dottedName: DottedName
  espace: string[]
}

export type Matches = {
  key: string
  value: string
  indices: [number, number][]
}[]

const searchWeights = [
  {
    name: 'espace',
    weight: 0.6,
  },
  {
    name: 'title',
    weight: 0.4,
  },
]

export default function SearchBar({ rules }: { rules: Partial<NGCRules> }) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsListRef = useRef<HTMLUListElement>(null)

  const rulesList: (NGCRule & { dottedName: DottedName })[] = Object.entries(
    rules
  ).map(([dottedName, rule]) => ({
    ...rule,
    dottedName: dottedName as DottedName,
  }))

  const searchIndex: SearchItem[] = useMemo(
    () =>
      Object.values(rulesList)
        .filter(utils.ruleWithDedicatedDocumentationPage)
        .map((rule) => ({
          title:
            getRuleTitle(rule) + (rule.acronyme ? ` (${rule.acronyme})` : ''),
          dottedName: rule.dottedName,
          espace: rule.dottedName.split(' . ').reverse(),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules]
  )

  const fuseSearchRef = useRef(
    () =>
      new Fuse(searchIndex, {
        keys: searchWeights,
        includeMatches: true,
        minMatchCharLength: 2,
        useExtendedSearch: true,
        distance: 50,
        threshold: 0.3,
      })
  )

  useEffect(() => {
    if (input.length < 3) {
      setResults([])
      setIsExpanded(false)
      return
    }

    const fuse = fuseSearchRef.current()

    const results = [...fuse.search(input + '|' + input.replace(/ /g, '|'))]

    setResults(results)
    setIsExpanded(true)
  }, [searchIndex, input])

  const { t } = useClientTranslation()

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInput(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('')
      setIsExpanded(false)
      searchInputRef.current?.blur()
    }
  }

  const getStatusMessage = () => {
    if (input.length <= 2) return ''
    if (!results.length) {
      return t(
        'documentation.noresults',
        'Aucun résultat ne correspond à cette recherche'
      )
    }
    return t(
      'documentation.search.results',
      '{{count}} résultat(s) trouvé(s)',
      {
        count: results.length,
      }
    )
  }

  return (
    <div
      className="search-container"
      role="search"
      aria-label={t(
        'documentation.search.label',
        'Recherche dans la documentation'
      )}>
      <Card className="bg-primary-50 my-8 border-none">
        <h2 className="flex items-center text-xl">
          <SearchIcon className="mr-2" aria-hidden="true" />
          <Trans i18nKey="documentation.search.h2">Explorez nos modèles</Trans>
        </h2>

        <TextInput
          ref={searchInputRef}
          name="search"
          label={t('documentation.search.input.label', 'Entrez des mots clefs')}
          placeholder={t(
            'documentation.search.input.placeholder',
            'Entrez des mots-clefs de recherche'
          )}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={input}
          aria-expanded={isExpanded}
          aria-controls="search-results"
          aria-describedby="search-status"
          autoComplete="off"
        />

        <div
          id="search-status"
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-slate-600">
          {getStatusMessage()}
        </div>
      </Card>

      {input.length > 2 && (
        <div className="search-results-container">
          <ul
            ref={resultsListRef}
            id="search-results"
            aria-label={t(
              'documentation.search.results.label',
              'Résultats de recherche'
            )}
            className="m-0 list-none rounded-md bg-white px-4">
            {results.map(({ item, matches }) => (
              <RuleListItem
                key={item.dottedName}
                item={item}
                matches={matches as Matches}
                rules={rules}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
