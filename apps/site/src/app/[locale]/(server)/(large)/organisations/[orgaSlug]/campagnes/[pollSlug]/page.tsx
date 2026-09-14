import SettingsIcon from '@/components/icons/SettingsIcon'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import PollStatistics from '@/components/organisations/PollStatistics'
import Trans from '@/components/translation/trans/TransServer'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getPollResult } from '@/services/polls/get-poll-result'
import dayjs from 'dayjs'
import CommunicationKit from './_components/CommunicationKit'
import ShareSection from './_components/ShareSection'
import FootprintDistribution from './_components/footPrintDistribution/FootprintDistribution'
import WaterFootprintSection from './_components/waterFootprint/WaterFootprintSection'
import { redirectFromLegacy } from './_helpers/redirect-from-legacy'

export default async function CampagnePage({
  params,
  searchParams,
}: PageProps<'/[locale]/organisations/[orgaSlug]/campagnes/[pollSlug]'>) {
  const { locale, orgaSlug, pollSlug } = await params

  if ((await searchParams).isRedirectFromLegacy) {
    await redirectFromLegacy(orgaSlug)
  }

  const {
    poll,
    participants,
    userParticipation,
    cooldownSeconds,
    results,
    isAdmin,
  } = await getPollResult({
    organisationSlug: orgaSlug,
    pollIdOrSlug: pollSlug,
  })

  const { t } = getServerTranslation({ locale })

  return (
    <>
      <OrganisationFilAriane
        organisation={poll.organisation}
        poll={poll}
        t={t}
        isAdmin={isAdmin}
      />
      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <div className="flex flex-col items-start justify-between sm:flex-row md:items-center">
          <Title
            title={<span className="text-primary-700">{poll.name}</span>}
            subtitle={
              <span>
                <Trans locale={locale}>Test collectif créé par</Trans>{' '}
                <strong className="text-primary-700">
                  {poll.organisation.name}
                </strong>
                <Trans locale={locale}>, le</Trans>{' '}
                {dayjs(poll.createdAt).format('DD/MM/YYYY')}
              </span>
            }
          />

          {isAdmin && (
            <div>
              <ButtonLinkServer
                href={`/organisations/${orgaSlug}/campagnes/${pollSlug}/parametres`}
                color="secondary"
                size="sm"
                data-testid="poll-admin-section-see-parameters-button"
                className="flex items-center">
                <SettingsIcon className="fill-primary-700 mr-2" />

                <Trans locale={locale}>Voir les paramètres</Trans>
              </ButtonLinkServer>
            </div>
          )}
        </div>

        <div className="mt-8">
          {isAdmin && participants <= 0 && (
            <ShareSection
              className="mt-0"
              poll={poll}
              title={
                <Trans locale={locale}>
                  C'est prêt ! Voici votre lien à partager
                </Trans>
              }
            />
          )}

          {isAdmin && participants === 0 && <CommunicationKit />}

          <PollStatistics
            participants={participants}
            cooldownSeconds={cooldownSeconds}
            computedResults={results?.computedResults ?? null}
            funFacts={results?.funFacts ?? null}
            title={
              <Trans locale={locale}>Résultats de votre test collectif</Trans>
            }
            poll={poll}
            isAdmin={isAdmin}
          />

          <FootprintDistribution
            computedResults={results?.computedResults ?? null}
            userComputedResults={userParticipation?.computedResults}
            participants={participants}
            organisationName={poll.organisation.name}
            isAdmin={isAdmin}
          />

          <WaterFootprintSection
            computedResults={results?.computedResults ?? null}
            participants={participants}
          />

          {isAdmin && participants > 0 && (
            <>
              <ShareSection poll={poll} />
              <CommunicationKit />
            </>
          )}
        </div>
      </div>
    </>
  )
}
