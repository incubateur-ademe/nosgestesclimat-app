import { DomainError } from '../../lib/errors.ts'

export class ModelFileFetchFailedError extends DomainError<'model_file_fetch_failed'> {
  public readonly url: string
  public readonly status?: number

  constructor(params: {
    message: string
    url: string
    status?: number
    cause?: unknown
  }) {
    const { message, url, status, cause } = params
    super('model_file_fetch_failed', message)
    this.url = url
    if (status !== undefined) {
      this.status = status
    }
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class OutdatedModelVersionError extends DomainError<'outdated_model_version'> {
  public readonly publishedTag: string
  public readonly currentModelVersion: string

  constructor(params: {
    message: string
    publishedTag: string
    currentModelVersion: string
  }) {
    const { message, publishedTag, currentModelVersion } = params
    super('outdated_model_version', message)
    this.publishedTag = publishedTag
    this.currentModelVersion = currentModelVersion
  }
}
