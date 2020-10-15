export class ApiError extends Error {
  readonly id: number

  constructor({ id, name, message }) {
    super(message)
    this.name = name
    this.id = id
  }
}
