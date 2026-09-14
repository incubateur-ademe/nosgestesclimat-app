import type { Simulation } from '../../simulations/types/simulation.ts'
import type { PollStats } from '../stats/types/poll-stats.ts'
import type {
  Poll,
  PollAnonymityNotReached,
  PollAnonymityReached,
} from './poll.ts'

/**
 * Everything the poll result page shows: the poll, how many people took part,
 * its stats when they may be published, and the viewer's own contribution to
 * compare against them.
 *
 * `anonymity` and `stats` answer two different questions — may anything be
 * published, and has the worker computed it — and the type only lets the second
 * be answered once the first is.
 */
export type PollResult = {
  poll: Poll
  /**
   * Delay the worker applies between two recomputations of this poll's stats,
   * in seconds. `stats` can be that much older than `participants`, which is
   * counted live.
   */
  cooldownSeconds: number
  /** Finished simulations: an unfinished one is not a participant. */
  participants: number
  /** `null` until the user has a finished simulation for this poll. */
  userParticipation: Simulation | null
} & (
  | { anonymity: PollAnonymityNotReached; stats: null }
  | {
      anonymity: PollAnonymityReached
      /**
       * `null` while the worker has not computed them: a completion queues its
       * first run, and later ones can be deferred by the cooldown or fail.
       */
      stats: PollStats | null
    }
)
