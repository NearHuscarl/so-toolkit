import { AxiosInstance, AxiosRequestConfig } from "axios"
import MockAdapter from "axios-mock-adapter"
import { createApi } from "app/helpers"
import { AppStore } from "app/store"
import { createMockedStore } from "app/test"
import { MockOptions } from "app/test/renderApp"
import * as user from "./users"
import * as accessTokens from "./accessTokens"

export function applyApiMock(
  axiosInstance: AxiosInstance,
  option: MockOptions = {}
) {
  const mock = new MockAdapter(axiosInstance, {
    delayResponse: option.apiResponseDelay,
  })

  Object.values(user).forEach((applyMock) => applyMock(mock))
  Object.values(accessTokens).forEach((applyMock) => applyMock(mock))

  mock.onAny().reply((config) => {
    console.log("something went wrong", config)
    return [404]
  })

  return mock
}

type HttpMethod = "get" | "put" | "post" | "delete"
export type MockAxiosInstance = AxiosInstance & {
  history: Record<HttpMethod, AxiosRequestConfig[]>
  resetHistory: () => void
}

export function getApi(
  store: AppStore = createMockedStore(),
  option: MockOptions = {}
): MockAxiosInstance {
  const mockedApi: any = createApi(store)
  const mock = applyApiMock(mockedApi, option)

  mockedApi.history = mock.history
  mockedApi.resetHistory = mock.resetHistory

  return mockedApi
}
