import createMockedStore from "./createMockedStore"
import { UserService } from "app/services"
import { createApi } from "app/helpers"

export default function createMockedUserService() {
  const store = createMockedStore()
  const api = createApi(store)
  const userService = new UserService({ api, store })

  return {
    store,
    api,
    userService,
  }
}
