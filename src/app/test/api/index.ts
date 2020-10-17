import MockAdapter from "axios-mock-adapter"
import { createApi } from "app/helpers"
import { AppStore } from "app/store"
import createMockedStore from "app/test/createMockedStore"
import { AppRenderOptions } from "app/test/renderApp"
import * as user from "./users"

function applyMock(mock: MockAdapter) {
  Object.values(user).forEach((applyMock) => applyMock(mock))
}

const defaultStore = createMockedStore()

export function getApi(
  store: AppStore = defaultStore,
  option: AppRenderOptions = {}
) {
  const mockedApi = createApi(store)
  const mock = new MockAdapter(mockedApi, {
    delayResponse: option.apiResponseDelay,
  })

  applyMock(mock)

  return mockedApi
}
