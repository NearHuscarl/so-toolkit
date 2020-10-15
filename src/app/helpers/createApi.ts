import axios, { AxiosResponse } from "axios"
import { AppStore, seApiActions } from "app/store"
import { __DEV__, SE_API_URL } from "app/constants"
import { ApiResponse } from "app/types"
import Debug from "./debug"

const debugApi = Debug("api")

export default function createApi(store: AppStore) {
  const api = axios.create({
    baseURL: SE_API_URL,
    params: {
      site: "stackoverflow",
      key: process.env.REACT_APP_STACK_APP_KEY,
    },
  })

  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { quota_remaining = 10_000 } = response.data
      const oldQuotaRemaining = store.getState().seApi.quotaRemaining || 10_001

      debugApi("quota_remaining: " + quota_remaining)

      // simulate SE API error to easily test failure case
      if (__DEV__) {
        const { inname } = response.config.params
        if (inname === "throw") {
          response.data = {
            error_id: 502,
            error_name: "throttle_violation",
            error_message: "Violation of backoff parameter",
          } as ApiResponse

          return Promise.reject({ response })
        }
      }

      if (oldQuotaRemaining > quota_remaining) {
        let message = "quota_changed: %c" + quota_remaining
        const css = ["color: limegreen;"]
        const { inname } = response.config.params

        if (inname) {
          message += " %c" + inname
          css.push("color: crimson")
        }

        debugApi(message, ...css)
        store.dispatch(seApiActions.setQuotaRemaining(quota_remaining))
      }

      return response
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return api
}
