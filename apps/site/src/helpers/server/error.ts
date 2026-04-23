import { notFound, unauthorized } from 'next/navigation'

export class NotFoundError extends Error {
  constructor() {
    super('Not Found')
    this.name = 'NotFoundError'
  }
}

export class NoSessionFoundError extends Error {
  constructor() {
    super('No session found in cookies')
    this.name = 'NoSessionFound'
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}

export class TooManyRequestsError extends Error {
  constructor() {
    super('Too Many Requests')
    this.name = 'TooManyRequestsError'
  }
}

export class InternalServerError extends Error {
  constructor() {
    super('Internal Server Error')

    this.name = 'InternalServerError'
  }
}

export class UnknownError extends Error {
  constructor(statusCode: number, message: string) {
    super(`Unknown Error requesting server ${statusCode}: ${message}`)
    this.name = 'UnknownError'
  }
}

export class InvalidInputError extends Error {
  constructor(public errorObject: unknown) {
    super('Invalid Input')
    this.name = 'InvalidInputError'
  }
}
export async function throwNextError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound()
    } else if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError
    ) {
      unauthorized()
    } else {
      throw error
    }
  }
}
