import Trans from '@/components/translation/trans/TransServer'
import Card from '@/design-system/layout/Card'
import type { Locale } from '@/i18nConfig'

export default function FAQListItem({
  id,
  question,
  answer,
  locale,
}: {
  id: string
  question: string
  answer: string
  locale: Locale
}) {
  return (
    <li className="whitespace-wrap mb-2 list-none font-bold">
      <details id={id}>
        <summary className="cursor-pointer border-none bg-transparent text-left text-base">
          <h3 className="inline text-black">{question}</h3>
          <span className="sr-only">
            <Trans locale={locale}>Cliquez pour afficher la réponse</Trans>
          </span>
        </summary>

        <Card className="bg-primary-50 markdown m-4 rounded-sm border-none p-4 font-normal">
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </Card>
      </details>
    </li>
  )
}
