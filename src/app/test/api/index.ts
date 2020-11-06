import { AxiosInstance, AxiosRequestConfig } from "axios"
import MockAdapter from "axios-mock-adapter"
import { MockOptions } from "app/test/renderer"
import * as user from "./users"
import * as accessTokens from "./accessTokens"
import * as peopleReached from "./peopleReached"

const sedeMocks = [peopleReached]
const seMocks = [user, accessTokens]

export function applyApiMock(
  axiosInstance: AxiosInstance,
  option: MockOptions = {},
  api: "sede" | "se"
) {
  const mock = new MockAdapter(axiosInstance, {
    delayResponse: option.apiResponseDelay,
  })

  const mocks = api === "sede" ? sedeMocks : seMocks
  mocks.forEach((m) =>
    Object.values(m).forEach((applyMock: any) => applyMock(mock))
  )

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
  // TODO: add support for sede
  const mock = applyApiMock(mockedApi, option, "se")

  mockedApi.history = mock.history
  mockedApi.resetHistory = mock.resetHistory

  return mockedApi
}
