import createMockedStore from "./createMockedStore"
import createMockedApi from "./createMockedApi"
import { UserService } from "app/services"
import { AppRenderOptions } from "./renderApp"

export default function createMockedUserService(option: AppRenderOptions = {}) {
  const store = createMockedStore()
  const api = createMockedApi(store, option)
  const userService = new UserService({ api, store })

  return {
    store,
    api,
    userService,
  }
}
