'use client'

import Link from '@/components/Link'
import Card from '@/design-system/layout/Card'
import Emoji from '@/design-system/utils/Emoji'
import {
  getBackgroundLightColor,
  getBorderColor,
  getTextDarkColor,
} from '@/helpers/getCategoryColorClass'
import { useEngine } from '@/publicodes-state'
import type { DottedName, NGCRule } from '@incubateur-ademe/nosgestesclimat'
import Markdown from 'markdown-to-jsx'
import { utils } from 'publicodes'

interface Props {
  dottedName: DottedName
  summary: string
  rule?: NGCRule
}

export default function DocumentationLandingCard({
  dottedName,
  summary,
  rule,
}: Props) {
  const { getCategory } = useEngine()
  const category = getCategory(dottedName)

  if (!rule) return null

  return (
    <Card
      tag={Link}
      href={'/documentation/' + utils.encodeRuleName(dottedName)}
      className={`relative h-[12rem] flex-auto justify-center rounded-xl border-2 text-center text-base shadow-none ${getBorderColor(category)} ${getTextDarkColor(category)} no-underline ${getBackgroundLightColor(
        category
      )}`}>
      <div>
        <Emoji className="mb-4 flex w-full justify-center text-2xl">
          {rule['icônes']}
        </Emoji>
      </div>

      <h2 className="z-10 mb-0 text-base">{<Markdown>{summary}</Markdown>}</h2>
    </Card>
  )
}
