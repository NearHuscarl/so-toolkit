import { AxiosInstance, AxiosRequestConfig } from "axios"
import MockAdapter from "axios-mock-adapter"
import { MockOptions } from "app/test/renderer"
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

export function createMockApi(
  api: AxiosInstance,
  option: MockOptions = {}
): MockAxiosInstance {
  const mockedApi: any = api
  const mock = applyApiMock(mockedApi, option)

  mockedApi.history = mock.history
  mockedApi.resetHistory = mock.resetHistory

  return mockedApi
}
