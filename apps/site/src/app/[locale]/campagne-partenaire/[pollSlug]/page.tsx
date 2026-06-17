import FAQ from '@/components/landing-pages/FAQ'
import Partners from '@/components/landing-pages/Partners'
import LanguageSwitchButton from '@/components/translation/LanguageSwitchButton'
import Markdown from '@/design-system/utils/Markdown'
import { getUser } from '@/services/users/get-user'
import type { Locale } from '@/i18nConfig'
import { fetchPartnerCampaign } from '@/services/cms/fetchPartnerCampaign'
import { notFound } from 'next/navigation'
import { ClientLayout } from '../../../../components/layout/ClientLayout'
import PartnerCampaignContent from './_components/PartnerCampaignContent'
import PartnerCampaignHeader from './_components/PartnerCampaignHeader'

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
      <PartnerCampaignHeader
        logoSrc={partnerCampaign.logo?.url ?? ''}
        alt={partnerCampaign.logo?.alternativeText ?? ''}>
        {/* Mobile */}
        <div className="block sm:hidden">
          <LanguageSwitchButton size="xs" />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <LanguageSwitchButton />
        </div>
      </PartnerCampaignHeader>
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
