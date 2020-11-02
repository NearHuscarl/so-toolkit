import axios, { AxiosInstance, AxiosResponse } from "axios"
import { AppStore, seApiActions } from "app/store"
import { SE_API_URL, SEDE_AUTH_URL } from "app/constants"
import { ApiResponse } from "app/types"
import { debug } from "app/helpers/debug"

export function interceptResponse(api: AxiosInstance, store: AppStore) {
  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { quota_remaining = 10_000 } = response.data
      const oldQuotaRemaining = store.getState().seApi.quotaRemaining

      let message = "quotas: %c" + oldQuotaRemaining
      const css = ["color: limegreen;"]

      message += "%c → %c" + quota_remaining
      css.push("color: white")
      css.push("color: #75BFFF")

      debug.api(message, ...css)
      store.dispatch(seApiActions.setQuotaRemaining(quota_remaining))

      return response
    },
    (error) => Promise.reject(error)
  )

  return api
}

export function createSeApi(store: AppStore) {
  const api = axios.create({
    baseURL: SE_API_URL,
    params: {
      site: "stackoverflow",
      key: process.env.REACT_APP_STACK_APP_KEY,
    },
  })

  return interceptResponse(api, store)
}

export function createSedeApi(store: AppStore) {
  const api = axios.create({
    baseURL: SEDE_AUTH_URL,
  })

  return interceptResponse(api, store)
}
