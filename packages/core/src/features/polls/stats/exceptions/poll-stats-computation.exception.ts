import { DomainError } from '../../../../lib/errors.ts'

export class PollStatsComputationFailedError extends DomainError<'poll_stats_computation_failed'> {
  public readonly pollId: string

  constructor({ pollId, cause }: { pollId: string; cause?: unknown }) {
    super('poll_stats_computation_failed', 'Poll stats computation failed')
    this.pollId = pollId
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}
