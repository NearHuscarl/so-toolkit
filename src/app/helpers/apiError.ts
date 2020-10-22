type ApiErrorProps = {
  id: number
  name: string
  message: string
}
export class ApiError extends Error {
  readonly id: number

  constructor({ id, name, message }: ApiErrorProps) {
    super(message)
    this.name = name
    this.id = id
  }
}

export const accessTokenErrorIds = [401, 402, 403, 406]
export type AccessTokenErrorId = typeof accessTokenErrorIds[number]

type AccessTokenErrorProps = {
  id: AccessTokenErrorId
  name: string
  message: string
}

/*
 * Error related to access token that is either invalid, insecure or expired
 * https://api.stackexchange.com/docs/error-handling
 */
export class AccessTokenError extends Error {
  readonly id: AccessTokenErrorId

  constructor({ id, name, message }: AccessTokenErrorProps) {
    super(message)
    this.name = name
    this.id = id
  }
}
