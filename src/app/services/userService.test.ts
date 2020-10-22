import { UserService } from "./userService"
import { createMockedStore, MockOptions } from "app/test"
import { createUsersMatching, mockAccessToken, users } from "app/test/fixtures"
import { getApi } from "app/test/api"

describe("UserService", () => {
  let userNear, userJon, allUserNear, allUserJon, me

  function createMockedUserService(option: MockOptions = {}) {
    const store = createMockedStore()
    const api = getApi(store, option)
    const userService = new UserService({ api, store })

    return {
      store,
      api,
      userService,
    }
  }

  beforeAll(() => {
    me = users.find((u) => u.display_name === "NearHuscarl")
    userNear = createUsersMatching("near")
    userJon = createUsersMatching("jon")
    allUserNear = createUsersMatching("near", 8)
    allUserJon = createUsersMatching("jon", 7)
  })

  it("getUser() should throttle properly", async () => {
    const { api, userService } = createMockedUserService()
    const fetchUser1 = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))
    const fetchUser2 = () =>
      userService.getUser(22656).then((u) => expect(u).toMatchObject(userJon))

    await Promise.all([fetchUser1(), fetchUser1(), fetchUser1()])
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("users/901827")

    await Promise.all([fetchUser2(), fetchUser2(), fetchUser2()])
    expect(api.history.get).toHaveLength(2)
    expect(api.history.get).lastRequestedWith("users/22656")
  })

  it("getUsersByName() should throttle properly", async () => {
    const { api, userService } = createMockedUserService()
    const fetchUsers1 = () =>
      userService
        .getUsersByName("near")
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUsers2 = () =>
      userService
        .getUsersByName("jon")
        .then((u) => expect(u).toMatchObject(allUserJon))

    await Promise.all([fetchUsers1(), fetchUsers1(), fetchUsers1()])
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("users")

    await Promise.all([fetchUsers2(), fetchUsers2(), fetchUsers2()])
    expect(api.history.get).toHaveLength(2)
    expect(api.history.get).lastRequestedWith("users")
  })

  it("geMe() should throttle properly", async () => {
    const { api, userService } = createMockedUserService()
    api.defaults.params.access_token = mockAccessToken
    const fetchUsers = () =>
      userService.getMe().then((u) => expect(u).toStrictEqual(me))

    await Promise.all([fetchUsers(), fetchUsers(), fetchUsers()])
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("me")
  })

  it("should cache all users found from getUsersByName()", async () => {
    const { api, userService } = createMockedUserService()
    const fetchUsersFromName = (name: string) =>
      userService
        .getUsersByName(name)
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUser = (userId: number, assert = true) =>
      userService
        .getUser(userId)
        .then((u) => assert && expect(u).toMatchObject(userNear))

    await fetchUsersFromName("near")
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("users")

    // try fetching all users from the previous results, should be cached now
    await Promise.all([
      fetchUser(901827),
      fetchUser(23447),
      fetchUser(25549),
      fetchUser(1874522),
      fetchUser(24071),
    ])
    expect(api.history.get).toHaveLength(1)

    // try fetching a new user, should fetch now
    await fetchUser(22656, false)
    expect(api.history.get).toHaveLength(2)
    expect(api.history.get).lastRequestedWith("users/22656")
  })

  it(`getUser() cache should expire after ${
    UserService.USER_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))

    await fetchUser()
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("users/901827")

    jest.advanceTimersByTime(UserService.USER_CACHE_MAX_AGE)
    await fetchUser()
    expect(api.history.get).toHaveLength(1)

    jest.advanceTimersByTime(1000)
    await fetchUser()
    expect(api.history.get).toHaveLength(2)
    expect(api.history.get).lastRequestedWith("users/901827")
  })

  it(`getUsersByName() cache should expire after ${
    UserService.USER_SEARCH_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const fetchUsers = () =>
      userService
        .getUsersByName("near")
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))

    await fetchUsers()
    await fetchUser()
    expect(api.history.get).toHaveLength(1)
    expect(api.history.get).lastRequestedWith("users")

    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE)
    await fetchUsers()
    await fetchUser()
    expect(api.history.get).toHaveLength(1)

    jest.advanceTimersByTime(1000)
    await fetchUsers()
    await fetchUser()
    expect(api.history.get).toHaveLength(2)
    expect(api.history.get).lastRequestedWith("users")

    // TODO: resetHistory() not working
    // api.resetHistory()
    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE + 1000)

    await fetchUsers()
    await fetchUser()
    expect(api.history.get).toHaveLength(3)
    expect(api.history.get).lastRequestedWith("users")

    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE)
    await fetchUser()
    expect(api.history.get).toHaveLength(4)
    expect(api.history.get).lastRequestedWith("users/901827")
  })
})

// TODO
// test api throttle violation

// [HTTP/1.1 400 Bad Request 580ms]
// {
// error_id	502
// error_message	"Violation of backoff parameter"
// error_name	"throttle_violation"
// }
