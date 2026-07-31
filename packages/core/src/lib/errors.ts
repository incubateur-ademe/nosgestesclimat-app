export class ErrorWithCode<Code extends string = string> extends Error {
  public code: Code

  constructor(code: Code, message: string = code) {
    super(message)
    this.code = code
    this.name = this.constructor.name
  }

  toJSON() {
    return {
      ...this,
    }
  }
}

export abstract class DomainError<
  Code extends string = string,
> extends ErrorWithCode<Code> {}
