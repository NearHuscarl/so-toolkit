import { createMockedStore } from "./createMockedStore"
import { UserService } from "app/services"
import { MockOptions } from "./renderApp"
import { getApi } from "app/test/api"

export function createMockedUserService(option: MockOptions = {}) {
  const store = createMockedStore()
  const api = getApi(store, option)
  const userService = new UserService({ api, store })

  return {
    store,
    api,
    userService,
  }
}
