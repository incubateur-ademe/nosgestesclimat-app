'use client'

import Trans from '@/components/translation/trans/TransClient'

import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { useSimulateurPage } from '@/hooks/navigation/useSimulateurPage'
import { useFetchPublicPoll } from '@/hooks/organisations/polls/useFetchPublicPoll'
import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { endTestAction } from '../../../simulateur/[root]/_actions/endTestAction'
import SimulateurSkeleton from '../../../simulateur/[root]/skeleton'

export default function Commencer() {
  const router = useRouter()

  const { data, isLoading } = useFetchPublicPoll()
  const poll = data && { slug: data.slug, id: data.id }
  const { initSimulation } = useUser()
  const { getLinkToSimulateurPage } = useSimulateurPage()
  const currentSimulation = useCurrentSimulation()
  const { progression, polls } = currentSimulation

  useEffect(() => {
    if (typeof progression !== 'undefined' && progression !== 1) {
      router.push(SIMULATOR_PATH)
    }
  }, [progression, router])

  if (isLoading || !poll) return <SimulateurSkeleton />
  return (
    <Card className={'items-start border-none bg-gray-100 p-8'}>
      <Title
        data-testid="commencer-title"
        className="text-lg md:text-xl"
        title={
          <span className="flex items-center">
            <Trans>Vous avez déjà réalisé le test Nos Gestes Climat !</Trans>{' '}
            <Emoji className="ml-1">👏</Emoji>
          </span>
        }
      />

      <p className="mb-8">
        <Trans>
          Vous pouvez utiliser vos données existantes, ou recommencer le test.
        </Trans>
      </p>

      <div className="flex flex-col items-start gap-6" data-track>
        <Button
          onClick={() => {
            void endTestAction({
              ...currentSimulation,
              polls: [...(polls ?? []), poll],
            })

            // We try to go to the calculateur page. If the test is finished we will save the simulation and then go to the end page
          }}>
          <Trans>Utiliser mes données existantes</Trans>
        </Button>

        <Button
          color="secondary"
          onClick={() => {
            initSimulation({ polls: [poll] })
            router.push(
              getLinkToSimulateurPage({
                newSimulation: true,
              })
            )
          }}>
          <Trans>Commencer un nouveau test</Trans>
        </Button>
      </div>
    </Card>
  )
}
