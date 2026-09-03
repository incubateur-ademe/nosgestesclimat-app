'use client'

import TrashIcon from '@/components/icons/TrashIcon'
import Trans from '@/components/translation/trans/TransClient'
import { carboneMetric } from '@/constants/model/metric'
import Badge from '@/design-system/layout/Badge'
import ConfirmationModal from '@/design-system/modals/ConfirmationModal'
import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { AppUser } from '@/services/auth/get-user-session'
import type { Group, Participant } from '@/types/groups'
import { captureErrorForSentryAndPosthog } from '@/utils/analytics/captureErrorForSentryAndPosthog'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import isMobile from 'is-mobile'
import { useState, useTransition } from 'react'
import { twMerge } from 'tailwind-merge'
import { getParticipantName } from '../../../../_helpers/getParticipantName'
import { isGroupOwner } from '../../../../_helpers/isGroupOwner'
import { removeParticipantAction } from '../../../_actions/remove-participant.action'

const getRank = (index: number) => {
  switch (index) {
    case 0:
      return <Emoji>🥇</Emoji>
    case 1:
      return <Emoji>🥈</Emoji>
    case 2:
      return <Emoji>🥉</Emoji>
    default:
      return `${index + 1}.`
  }
}

export default function RankingMember({
  participant,
  index,
  isTopThree,
  isCurrentMember,
  group,
  numberOfParticipants,
  textColor,
  metric,
  user,
}: {
  isTopThree?: boolean
  index: number
  isCurrentMember?: boolean
  group: Group
  numberOfParticipants?: number
  textColor?: string
  participant: Participant
  metric: Metrics
  user: AppUser
}) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

  const { t } = useClientTranslation()

  const shouldUseAbbreviation = isMobile()

  const isOwner = isGroupOwner(group, user)

  const participantName = getParticipantName({ t, participant })

  const [isPending, startTransition] = useTransition()

  const { formattedValue, unit } = formatFootprint(
    participant.simulation.computedResults?.[metric]?.bilan ?? '',
    {
      metric,
      shouldUseAbbreviation,
    }
  )

  const suffix = metric === carboneMetric ? t('CO₂e / an') : t('/ jour')

  const quantity =
    participant.simulation.progression !== 1 ? (
      <span className="text-sm text-gray-600">
        <Trans>En cours</Trans>
      </span>
    ) : participant.simulation.computedResults?.[metric]?.bilan ? (
      <span className="m-none leading-[160%]">
        <strong>{formattedValue}</strong>{' '}
        <span className="text-sm font-light">
          {unit} {suffix}
        </span>
      </span>
    ) : (
      '...'
    )

  function handleDelete() {
    startTransition(async () => {
      try {
        await removeParticipantAction({
          participantId: participant.id,
          groupId: group.id,
        })

        setIsConfirmationModalOpen(false)
      } catch (error) {
        captureErrorForSentryAndPosthog(error)
      }
    })
  }

  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center justify-between">
        <div className="mb-0 flex items-center text-sm md:text-base">
          <span
            className={twMerge(
              'mr-2',
              isTopThree ? 'text-lg md:text-2xl' : 'ml-1 text-base md:text-lg',
              textColor ?? ''
            )}>
            {participant.simulation.progression !== 1
              ? // Display a placeholder
                '--'
              : getRank(index)}
          </span>

          <span className={textColor} data-testid="participant-name">
            {participantName}
          </span>

          {isCurrentMember && (
            <Badge
              className="text-secondary-800 ml-2 inline rounded-xl border-pink-100 bg-pink-200 text-xs font-bold"
              data-testid="current-member-badge">
              <Trans>Vous</Trans>
            </Badge>
          )}
        </div>

        <div className={textColor}>{quantity}</div>
      </div>

      {isOwner &&
        (isCurrentMember ? (
          // Add a gap to keep the layout consistent
          <div
            className={
              numberOfParticipants === undefined || numberOfParticipants > 1
                ? 'w-6'
                : ''
            }
          />
        ) : (
          <>
            <button
              onClick={() => setIsConfirmationModalOpen(true)}
              className={twMerge(
                'focus:ring-primary-700 inline-flex h-6 w-6 items-center justify-center p-0! transition-colors focus:ring-2 focus:ring-offset-3 focus:outline-hidden',
                textColor
              )}
              aria-label={t('{{name}}, supprimer cette participation', {
                name: participantName,
              })}>
              <TrashIcon
                className={twMerge(
                  'fill-default w-4',
                  textColor === 'text-white' ? 'fill-white' : 'fill-default'
                )}
              />
            </button>

            {isConfirmationModalOpen && (
              <ConfirmationModal
                onConfirm={handleDelete}
                loading={isPending}
                ariaLabel={t(
                  'group.results.rankingMember.delete.modal.ariaLabel',
                  'Fenêtre modale de confirmation de suppression du membre du groupe'
                )}
                closeModal={() => setIsConfirmationModalOpen(false)}>
                <p className="text-sm md:text-base">
                  <Trans>
                    Supprimer ce participant ? Cette opération est définitive.
                  </Trans>
                </p>
              </ConfirmationModal>
            )}
          </>
        ))}
    </li>
  )
}
