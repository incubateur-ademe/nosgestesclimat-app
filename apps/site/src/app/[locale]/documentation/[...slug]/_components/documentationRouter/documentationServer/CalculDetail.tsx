import Trans from '@/components/translation/trans/TransServer'
import Card from '@/design-system/layout/Card'
import type {
  DottedName,
  NGCRule,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import RuleDetail from './calculDetail/RuleDetail'

export default function CalculDetail({
  rule,
  ruleName,
  rules,
  locale,
}: {
  rule: NGCRule
  ruleName: DottedName
  rules: NGCRules
  locale: string
}) {
  return (
    <>
      <h2>
        <Trans locale={locale}>Comment cette donnée est-elle calculée ?</Trans>
      </h2>

      <Card className="p-8">
        <RuleDetail ruleData={rule} context={{ dottedName: ruleName, rules }} />
      </Card>
    </>
  )
}
