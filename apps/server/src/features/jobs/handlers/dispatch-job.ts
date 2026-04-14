import { prisma } from '../../../adapters/prisma/client.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import { uploadPollSimulationsResult } from '../../organisations/organisations.service.js'
import type { JobCreatedAsyncEvent } from '../events/JobCreated.event.js'
import { JobKind } from '../jobs.repository.js'
import { runJob } from '../jobs.service.js'

export const dispatchJob: Handler<JobCreatedAsyncEvent> = ({
  attributes: { jobId },
}) => {
  return runJob(
    jobId,
    (job) => {
      switch (job.params.kind) {
        case JobKind.DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT:
          return uploadPollSimulationsResult(job.params)
      }
    },
    {
      session: prisma,
    }
  )
}
