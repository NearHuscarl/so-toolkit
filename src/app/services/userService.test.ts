import configureStore from "redux-mock-store"
import MockAdapter from "axios-mock-adapter"
import has from "lodash/has"
import UserService, { createApi } from "./userService"
import userResponse, {
  userResponseMatcher,
  userJon,
  userNear,
  createUsersResponse,
} from "./userService.data"
import { AppStore, RootState, userInitialState } from "app/store"

export function createMockedStore() {
  const mockStore = configureStore<RootState>()
  return mockStore({
    user: userInitialState as any,
    seApi: {
      quotaRemaining: 0,
    },
  })
}

export function createMockedApi(store: AppStore) {
  const mockedApi = createApi(store)
  const mock = new MockAdapter(mockedApi)

  mock
    .onGet(/\/user\/?\d?\d*/)
    .reply((config) => {
      const { params } = config

      if (has(params, "inname")) {
        if (params.inname === "near") {
          return [200, userResponse.near]
        }
        if (params.inname === "jon") {
          return [200, userResponse.jon]
        }
      } else {
        const userId = parseFloat(config.url?.split("/").pop() || "-1")
        const users = userNear.concat(userJon)
        const user = users.find((u) => u.user_id === userId)
        if (user) {
          return [200, createUsersResponse([user])]
        }
      }

      return [404, "not found!"] // TODO: what happen when not found
    })
    .onAny()
    .reply((config) => {
      console.log("404!")
      return [404, "fuck!"]
    })

  return mockedApi
}

function createMockedUserService() {
  const store = createMockedStore()
  const api = createMockedApi(store)
  const userService = new UserService({ api, store })

  return {
    store,
    api,
    userService,
  }
}

it("should throttle properly when calling getUser()", async () => {
  const { api, userService } = createMockedUserService()
  const getSpy = jest.spyOn(api, "get")
  const user1 = userResponseMatcher.near.items[0]
  const user2 = userResponseMatcher.jon.items[0]
  const fetchUser1 = () =>
    userService.getUser(901827).then((u) => expect(u).toMatchObject(user1))
  const fetchUser2 = () =>
    userService.getUser(22656).then((u) => expect(u).toMatchObject(user2))

  await Promise.all([fetchUser1(), fetchUser1(), fetchUser1()])
  expect(getSpy).toBeCalledTimes(1)

  await Promise.all([fetchUser2(), fetchUser2(), fetchUser2()])
  expect(getSpy).toBeCalledTimes(2)
})

it("should throttle properly when calling getUsersByName()", async () => {
  const { api, userService } = createMockedUserService()
  const getSpy = jest.spyOn(api, "get")
  const user1 = userResponseMatcher.near.items
  const user2 = userResponseMatcher.jon.items
  const fetchUsers1 = () =>
    userService
      .getUsersByName("near")
      .then((u) => expect(u).toMatchObject(user1))
  const fetchUsers2 = () =>
    userService
      .getUsersByName("jon")
      .then((u) => expect(u).toMatchObject(user2))

  await Promise.all([fetchUsers1(), fetchUsers1(), fetchUsers1()])
  expect(getSpy).toBeCalledTimes(1)

  await Promise.all([fetchUsers2(), fetchUsers2(), fetchUsers2()])
  expect(getSpy).toBeCalledTimes(2)
})

it("should cache all users found from getUsersByName()", async () => {
  const { api, userService } = createMockedUserService()
  const getSpy = jest.spyOn(api, "get")
  const user1 = userResponseMatcher.near.items
  const fetchUsersFromName = (name: string) =>
    userService.getUsersByName(name).then((u) => expect(u).toMatchObject(user1))
  const fetchUser = (userId: number, assert = true) =>
    userService
      .getUser(userId)
      .then((u) => assert && expect(u).toMatchObject(user1[0]))

  await fetchUsersFromName("near")
  expect(getSpy).toBeCalledTimes(1)

  // try fetching all users from the previous results, should be cached now
  await Promise.all([
    fetchUser(901827),
    fetchUser(23447),
    fetchUser(25549),
    fetchUser(1874522),
    fetchUser(24071),
  ])
  expect(getSpy).toBeCalledTimes(1)

  // try fetching a new user, should fetch now
  await fetchUser(22656, false)
  expect(getSpy).toBeCalledTimes(2)
})

// TODO
// test api throttle violation

// [HTTP/1.1 400 Bad Request 580ms]
// {
// error_id	502
// error_message	"Violation of backoff parameter"
// error_name	"throttle_violation"
// }
