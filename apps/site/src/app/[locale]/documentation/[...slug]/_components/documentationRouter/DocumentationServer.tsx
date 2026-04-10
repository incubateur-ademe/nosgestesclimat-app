import PasserTestBanner from '@/components/layout/PasserTestBanner'
import Trans from '@/components/translation/trans/TransServer'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Markdown from '@/design-system/utils/Markdown'
import { getRuleTitle } from '@/helpers/publicodes/getRuleTitle'
import { capitalizeString } from '@/utils/capitalizeString'
import type {
  DottedName,
  NGCRule,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import ButtonLaunch from './documentationServer/ButtonLaunch'
import CalculDetail from './documentationServer/CalculDetail'
import PagesProches from './documentationServer/PagesProches'
import QuestionSection from './documentationServer/QuestionSection'

interface Props {
  rule: NonNullable<NGCRule>
  rules: NGCRules
  locale: string
  ruleName: DottedName
}
export default function DocumentationServer({
  rule,
  rules,
  locale,
  ruleName,
}: Props) {
  return (
    <div className="mt-12 w-full max-w-4xl p-4 md:mx-auto md:py-8">
      <PasserTestBanner />

      <Title
        title={`${rule.icônes ?? ''} ${capitalizeString(
          getRuleTitle({ ...rule, dottedName: ruleName })
        )}`}
        data-testid="documentation-title"
      />

      {rule.question && <QuestionSection rule={rule} locale={locale} />}

      {!rule.question && rule.description && (
        <section className="mt-4">
          <Markdown>{rule.description}</Markdown>
        </section>
      )}

      {rule.note && (
        <section className="mt-4">
          <h2>
            <Trans locale={locale}>Notes</Trans>
          </h2>
          <Markdown>{rule.note}</Markdown>
        </section>
      )}

      <CalculDetail
        rule={rule}
        ruleName={ruleName}
        rules={rules}
        locale={locale}
      />

      <Card className="bg-primary-100 mt-4 mb-4 border-none">
        <p className="mb-0">
          <Trans locale={locale}>
            Pour en savoir plus sur cette règle de notre modèle, lancer le
            calcul en cliquant sur le bouton ci-dessous.
          </Trans>
        </p>
      </Card>

      <ButtonLaunch />

      <PagesProches rules={rules} ruleName={ruleName} />
    </div>
  )
}
