import { Exception } from '../../../../exception.ts'

export class PollStatsComputationFailedException extends Exception<{
  pollId: string
}> {
  level = 'fatal' as const
}
