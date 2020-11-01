import { Duration } from "date-fns"

export const __DEV__ = process.env.NODE_ENV === "development"
export const __PRODUCTION__ = process.env.NODE_ENV === "production"
export const SE_API_URL = "https://api.stackexchange.com/2.2/"
export const SEDE_AUTH_URL = "https://sede-auth.herokuapp.com"
export const OAUTH_DURATION: Duration = Object.freeze({
  days: 14,
})
