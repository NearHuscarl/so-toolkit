import { AxiosInstance } from "axios"
import MockAdapter from "axios-mock-adapter"
import { createApi } from "app/helpers"
import { AppStore } from "app/store"
import { createMockedStore } from "app/test"
import { MockOptions } from "app/test/renderApp"
import * as user from "./users"

export function applyApiMock(
  axiosInstance: AxiosInstance,
  option: MockOptions = {}
) {
  const mock = new MockAdapter(axiosInstance, {
    delayResponse: option.apiResponseDelay,
  })

  Object.values(user).forEach((applyMock) => applyMock(mock))

  return mock
}

const defaultStore = createMockedStore()

export function getApi(
  store: AppStore = defaultStore,
  option: MockOptions = {}
) {
  const mockedApi = createApi(store)

  applyApiMock(mockedApi, option)

  return mockedApi
}
