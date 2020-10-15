import MockAdapter from "axios-mock-adapter"
import has from "lodash/has"
import { AppStore } from "app/store"
import { createApi } from "app/helpers"
import userResponse, {
  createErrorResponse,
  createUsersResponse,
  userJon,
  userNear,
} from "app/services/userService.data"
import createMockedStore from "./createMockedStore"
import { AppRenderOptions } from "./renderApp"

const defaultStore = createMockedStore()

export default function createMockedApi(
  store: AppStore = defaultStore,
  option: AppRenderOptions = {}
) {
  const mockedApi = createApi(store)
  const mock = new MockAdapter(mockedApi, {
    delayResponse: option.apiResponseDelay,
  })
  const users = userNear.concat(userJon)

  mock
    .onGet(/\/user\/?\d?\d*/)
    .reply((config) => {
      const { params } = config

      if (has(params, "inname")) {
        const { inname } = params

        switch (inname) {
          case "near":
            return [200, userResponse.near]
          case "jon":
            return [200, userResponse.jon]
          case "throw":
            return [400, createErrorResponse()]
        }

        if (params.inname === "near") {
          return [200, userResponse.near]
        }
        if (params.inname === "jon") {
          return [200, userResponse.jon]
        }
      } else {
        const userId = parseFloat(config.url?.split("/").pop() || "-1")
        const user = users.find((u) => u.user_id === userId)
        if (user) {
          return [200, createUsersResponse([user])]
        }
      }

      return [200, createUsersResponse([])]
    })
    .onAny()
    .reply((config) => {
      console.log("404!")
      return [404, "fuck!"]
    })

  return mockedApi
}
