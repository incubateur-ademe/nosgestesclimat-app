import { prisma } from '@nosgestesclimat/core/prisma/client'
import type { Handler } from '../../../core/event-bus/handler.ts'
import { uploadPollSimulationsResult } from '../../organisations/organisations.service.ts'
import type { JobCreatedAsyncEvent } from '../events/JobCreated.event.ts'
import { JobKind } from '../jobs.repository.ts'
import { runJob } from '../jobs.service.ts'

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
