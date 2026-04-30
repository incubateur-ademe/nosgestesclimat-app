import type { Participant } from '@/types/groups'
import type { TFunction } from 'i18next'

interface Props {
  t: TFunction
  participant: Participant
}

export const getParticipantName = ({ t, participant }: Props) =>
  participant.name ??
  t(
    'groups.results.rankingMember.simulationDeleted',
    'Utilisateur anonyme (données supprimées par le participant)'
  )
