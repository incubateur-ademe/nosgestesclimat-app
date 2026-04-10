import dayjs from 'dayjs'
import type {
  Job as PrismaJob,
  InputJsonValue,
} from '../../adapters/prisma/generated.js'
import { JobStatus } from '../../adapters/prisma/generated.js'
import { defaultJobSelection } from '../../adapters/prisma/selection.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import type { ValueOf } from '../../types/types.js'

export const JobKind = {
  DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT:
    'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT',
} as const

export type JobKind = ValueOf<typeof JobKind>

export type Job<T extends JobKind> = Omit<PrismaJob, 'params'> & {
  params: JobParams<T>
}

export type JobParams<T extends JobKind> =
  T extends 'DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT'
    ? {
        kind: T
        pollId: string
        organisationId: string
      }
    : never

const mapJob = async <T extends JobKind, U extends PrismaJob | null>(
  request: Promise<U>
): Promise<U extends PrismaJob ? Job<T> : Job<T> | null> => {
  const job = await request

  return job as Job<T>
}

export const createJob = <T extends JobKind>(
  { id, params }: { id: string; params: JobParams<T> },
  { session }: { session: Session }
) =>
  session.job.upsert({
    where: { id },
    create: {
      executions: {
        create: {
          date: new Date(),
        },
      },
      status: JobStatus.pending,
      params,
      id,
    },
    update: {
      executions: {
        create: {
          date: new Date(),
        },
      },
      status: JobStatus.pending,
      params,
    },
    select: defaultJobSelection,
  })

export const getJob = <T extends JobKind>(
  { id }: { id: string },
  { session }: { session: Session }
): Promise<Job<T>> => {
  return mapJob(
    session.job.findUniqueOrThrow({
      where: { id },
      select: defaultJobSelection,
    })
  )
}

export const getExistingJob = <T extends JobKind>(
  { id }: { id: string },
  { session }: { session: Session }
): Promise<Job<T> | null> => {
  return mapJob(
    session.job.findUnique({
      where: {
        id,
        status: {
          in: [JobStatus.pending, JobStatus.running],
        },
        createdAt: {
          gte: dayjs().subtract(5, 'minute').toDate(),
        },
      },
      select: defaultJobSelection,
    })
  )
}

export const startJob = <T extends JobKind>(
  { id }: { id: string },
  { session }: { session: Session }
): Promise<Job<T>> => {
  return mapJob(
    session.job.update({
      where: { id, status: JobStatus.pending },
      data: { status: JobStatus.running },
      select: defaultJobSelection,
    })
  )
}

type FinishedJobStatus = Exclude<JobStatus, 'pending' | 'running'>

export const stopJob = <T extends JobKind>(
  {
    id,
    status,
    result,
  }: { id: string; status: FinishedJobStatus; result: InputJsonValue },
  { session }: { session: Session }
): Promise<Job<T>> => {
  return mapJob(
    session.job.update({
      where: { id, status: JobStatus.running },
      data: { status, result },
      select: defaultJobSelection,
    })
  )
}
