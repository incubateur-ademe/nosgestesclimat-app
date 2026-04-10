import FAQ from '@/components/landing-pages/FAQ'
import Partners from '@/components/landing-pages/Partners'
import Markdown from '@/design-system/utils/Markdown'
import { getUser } from '@/helpers/server/dal/user'
import type { Locale } from '@/i18nConfig'
import { fetchPartnerCampaign } from '@/services/cms/fetchPartnerCampaign'
import { notFound } from 'next/navigation'
import { ClientLayout } from '../../../../components/layout/ClientLayout'
import PartnerCampaignContent from './_components/PartnerCampaignContent'

export default async function PartnerCampaignPage({
  params,
}: {
  params: Promise<{ pollSlug: string; locale: Locale }>
}) {
  const { locale, pollSlug } = await params

  const { id: serverUserId } = await getUser()

  const partnerCampaign = await fetchPartnerCampaign({
    locale,
    pollSlug,
  })

  if (!partnerCampaign) {
    notFound()
  }

  return (
    <ClientLayout locale={locale} serverUserId={serverUserId}>
      <PartnerCampaignContent
        pollSlug={pollSlug}
        partnerCampaign={partnerCampaign}
        partnersComponent={<Partners locale={locale} />}
        faqComponent={
          !!partnerCampaign.faq?.questions?.length && (
            <FAQ
              isBackgroundSkewed={false}
              className="bg-white"
              questions={partnerCampaign.faq.questions.map(
                (questionObject) => ({
                  question: questionObject.question,
                  answer: <Markdown>{questionObject.answer}</Markdown>,
                })
              )}
              locale={locale}
            />
          )
        }
      />
    </ClientLayout>
  )
}
