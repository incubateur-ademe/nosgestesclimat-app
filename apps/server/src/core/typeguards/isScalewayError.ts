import { S3ServiceException } from '@aws-sdk/client-s3'
import { StatusCodes } from 'http-status-codes'

const isScalewayError = (err: unknown): err is S3ServiceException =>
  err instanceof S3ServiceException

export const isScalewayErrorNotFound = (
  err: unknown
): err is S3ServiceException & {
  $metadata: S3ServiceException['$metadata'] & {
    httpStatusCode: StatusCodes.NOT_FOUND
  }
} =>
  isScalewayError(err) && err.$metadata.httpStatusCode === StatusCodes.NOT_FOUND
