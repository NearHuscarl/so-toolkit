import UserService from "./userService"
import { createMockedUserService } from "app/test"
import { createUsersMatching } from "app/test/fixtures"

describe("UserService", () => {
  let userNear, userJon, allUserNear, allUserJon

  beforeAll(() => {
    userNear = createUsersMatching("near")
    userJon = createUsersMatching("jon")
    allUserNear = createUsersMatching("near", 7)
    allUserJon = createUsersMatching("jon", 7)
  })

  it("getUser() should throttle properly", async () => {
    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const fetchUser1 = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))
    const fetchUser2 = () =>
      userService.getUser(22656).then((u) => expect(u).toMatchObject(userJon))

    await Promise.all([fetchUser1(), fetchUser1(), fetchUser1()])
    expect(getSpy).toBeCalledTimes(1)

    await Promise.all([fetchUser2(), fetchUser2(), fetchUser2()])
    expect(getSpy).toBeCalledTimes(2)
  })

  it("getUsersByName() should throttle properly", async () => {
    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const fetchUsers1 = () =>
      userService
        .getUsersByName("near")
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUsers2 = () =>
      userService
        .getUsersByName("jon")
        .then((u) => expect(u).toMatchObject(allUserJon))

    await Promise.all([fetchUsers1(), fetchUsers1(), fetchUsers1()])
    expect(getSpy).toBeCalledTimes(1)

    await Promise.all([fetchUsers2(), fetchUsers2(), fetchUsers2()])
    expect(getSpy).toBeCalledTimes(2)
  })

  it("should cache all users found from getUsersByName()", async () => {
    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const fetchUsersFromName = (name: string) =>
      userService
        .getUsersByName(name)
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUser = (userId: number, assert = true) =>
      userService
        .getUser(userId)
        .then((u) => assert && expect(u).toMatchObject(userNear))

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

  it(`getUser() cache should expire after ${
    UserService.USER_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))

    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(UserService.USER_CACHE_MAX_AGE)
    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await fetchUser()
    expect(getSpy).toBeCalledTimes(2)
  })

  it(`getUsersByName() cache should expire after ${
    UserService.USER_SEARCH_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const fetchUsers = () =>
      userService
        .getUsersByName("near")
        .then((u) => expect(u).toMatchObject(allUserNear))
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(userNear))

    await fetchUsers()
    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE)
    await fetchUsers()
    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await fetchUsers()
    await fetchUser()
    expect(getSpy).toBeCalledTimes(2)

    getSpy.mockClear()
    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE + 1000)

    await fetchUsers()
    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(UserService.USER_SEARCH_CACHE_MAX_AGE)
    await fetchUser()
    expect(getSpy).toBeCalledTimes(2)
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
