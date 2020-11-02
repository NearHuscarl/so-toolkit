import Debug from "debug"
import { __DEV__, __PRODUCTION__ } from "app/constants"

if (__DEV__ || __PRODUCTION__) {
  Debug.enable("app:*")
}

export const debug = {
  api: Debug("app:api"),
  cache: Debug("app:cache"),
}
