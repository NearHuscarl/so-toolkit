import { Middleware } from "redux"
import { __DEV__ } from "app/constants"

export function createLoggerMiddleware(): Middleware | null {
  if (!__DEV__) {
    return null
  }

  const { createLogger } = require("redux-logger")
  const timestamp = false
  const duration = true

  return createLogger({
    collapsed: true,
    timestamp,
    duration,
  })
}
