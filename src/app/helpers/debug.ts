import Debug from "debug"

Debug.enable("app:*")

export const debug = {
  api: Debug("app:api"),
  cache: Debug("app:cache"),
}
