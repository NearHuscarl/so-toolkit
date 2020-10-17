import * as handlers from "./handlers"

export function getAllHandlers() {
  return Object.values(handlers)
}
