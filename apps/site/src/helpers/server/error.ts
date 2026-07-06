import { notFound, unauthorized } from 'next/navigation'
export class APIError extends Error {}
export class NotFoundError extends APIError {
  constructor() {
    super('Not Found')
    this.name = 'NotFoundError'
  }
}

export class NoSessionFoundError extends APIError {
  constructor() {
    super('No session found in cookies')
    this.name = 'NoSessionFound'
  }
}

export class UnauthorizedError extends APIError {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends APIError {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}

export class TooManyRequestsError extends APIError {
  constructor() {
    super('Too Many Requests')
    this.name = 'TooManyRequestsError'
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'Internal Server Error') {
    super(message)

    this.name = 'InternalServerError'
  }
}

export class UnknownError extends APIError {
  constructor(statusCode: number, message: string) {
    super(`Unknown Error requesting server ${statusCode}: ${message}`)
    this.name = 'UnknownError'
  }
}

export class InvalidInputError extends APIError {
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

export class InternalError extends Error {
  constructor(message = 'Internal Server Error') {
    super(message)

    this.name = 'InternalServerError'
  }
}
