import JSONLD from '@/components/seo/JSONLD'
import Trans from '@/components/translation/trans/TransServer'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { Locale } from '@/i18nConfig'
import { fetchFaq } from '@/services/cms/fetchFAQ'
import type { DefaultPageProps } from '@/types'
import Image from 'next/image'
import ContactUsLink from './_components/ContactUsLink'
import DoTheTest from './_components/DoTheTest'
import FAQListItem from './_components/FAQListItem'
import Scroller from './_components/Scroller'

export const generateMetadata = getCommonMetadata({
  title: t('Questions fréquentes - Nos Gestes Climat'),
  description: t(
    'Retrouvez les réponses aux questions les plus fréquentes sur  Nos Gestes Climat.'
  ),
  alternates: {
    canonical: '/questions-frequentes',
  },
})

export default async function FAQPage({
  params,
}: DefaultPageProps<{ params: { locale: Locale } }>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  const faqCategories =
    (await fetchFaq({
      locale,
    })) ?? []

  return (
    <>
      <JSONLD
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            url: 'https://nosgestesclimat.fr',
            name: 'Nos Gestes Climat',
            logo: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqCategories
              .flatMap((faq) => faq.questions)
              .map((question) => ({
                '@type': 'Question',
                name: question.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: question.answer,
                },
              })),
          },
        ]}
      />
      <div className="flex flex-wrap gap-8 pb-8 md:flex-nowrap">
        <div className="mt-8">
          <Title title={t('Questions fréquentes')} />

          <Scroller />

          <p>
            <Trans locale={locale}>
              Levez la main, on répond à vos questions !
            </Trans>
          </p>
          <p>
            <Trans locale={locale}>
              Vous trouverez ici les réponses aux questions les plus fréquentes.
              S'il vous reste des interrogations ou si vous souhaitez nous
              proposer des améliorations, rendez-vous tout en bas. Bonne lecture
              !
            </Trans>
          </p>

          <DoTheTest />
        </div>

        <Image
          className="-mt-4 ml-auto w-48 self-start md:w-full"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_children_holding_hand_6951392e78.png"
          width="300"
          height="400"
          alt={t("Des enfants sortant de l'école en se tenant la main.")}
        />
      </div>

      <ul className="-mt-8 pb-4 md:-mt-16">
        {faqCategories
          .sort((a, b) => a.order - b.order)
          .map(({ title, questions }) => {
            return (
              <li key={title} className="list-none">
                <h2 className="mt-8 capitalize">{title}</h2>
                <ul className="pl-2">
                  {questions.map(({ question, htmlAnswer, id }) => {
                    return (
                      <FAQListItem
                        id={id}
                        key={id}
                        question={question}
                        answer={htmlAnswer}
                        locale={locale}
                      />
                    )
                  })}
                </ul>
              </li>
            )
          })}
      </ul>

      <Card className="bg-gray-100">
        <h3 className="text-yellow-dark flex items-center">
          <Trans locale={locale}>Je ne trouve pas réponse à ma question </Trans>

          <Emoji className="ml-2 inline-block">🙋‍♀️</Emoji>
        </h3>
        <p className="mb-0">
          <Trans locale={locale}>
            Vous pouvez nous contacter via notre page de contact :{' '}
            <ContactUsLink />.
          </Trans>
        </p>
      </Card>
    </>
  )
}
