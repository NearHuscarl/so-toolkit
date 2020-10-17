import createMockedStore from "./createMockedStore"
import { UserService } from "app/services"
import { AppRenderOptions } from "./renderApp"
import { getApi } from "app/test/api"

export default function createMockedUserService(option: AppRenderOptions = {}) {
  const store = createMockedStore()
  const api = getApi(store, option)
  const userService = new UserService({ api, store })

  return {
    store,
    api,
    userService,
  }
}
