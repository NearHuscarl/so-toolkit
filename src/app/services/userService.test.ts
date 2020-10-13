import UserService from "./userService"
import { userResponseMatcher } from "./userService.data"
import { createMockedUserService } from "app/test"

describe("UserService", () => {
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
      userService
        .getUsersByName(name)
        .then((u) => expect(u).toMatchObject(user1))
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

  it(`should getUser() cache expire after ${
    UserService.USER_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const user = userResponseMatcher.near.items[0]
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(user))

    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(UserService.USER_CACHE_MAX_AGE)
    await fetchUser()
    expect(getSpy).toBeCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await fetchUser()
    expect(getSpy).toBeCalledTimes(2)
  })

  it(`should getUsersByName() cache expire after ${
    UserService.USER_SEARCH_CACHE_MAX_AGE / (1000 * 60)
  } minutes`, async () => {
    jest.useFakeTimers("modern")

    const { api, userService } = createMockedUserService()
    const getSpy = jest.spyOn(api, "get")
    const user = userResponseMatcher.near.items
    const fetchUsers = () =>
      userService
        .getUsersByName("near")
        .then((u) => expect(u).toMatchObject(user))
    const user1 = userResponseMatcher.near.items[0]
    const fetchUser = () =>
      userService.getUser(901827).then((u) => expect(u).toMatchObject(user1))

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
