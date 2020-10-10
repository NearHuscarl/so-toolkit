import MockAdapter from "axios-mock-adapter"
import UserService, { createApi } from "./userService"
import userResponse, { userResponseMatcher } from "./userService.data"

export function createMockedApi() {
  const mockedApi = createApi()
  const mock = new MockAdapter(mockedApi)

  mock
    .onGet("/users/1")
    .reply(200, userResponse.near1)
    .onGet("/users/2")
    .reply(200, userResponse.jon1)
    .onGet("/users")
    .reply((config) => {
      const { params } = config

      if (params.inname === "near") {
        return [200, userResponse.near]
      }
      if (params.inname === "jon") {
        return [200, userResponse.jon]
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

it("should throttle properly when calling getUser()", () => {
  UserService.API = createMockedApi()
  const getSpy = jest.spyOn(UserService.API, "get")
  const user1 = userResponseMatcher.near.items[0]
  const user2 = userResponseMatcher.jon.items[0]
  const fetchUser1 = () =>
    UserService.getUser(1).then((u) => expect(u).toMatchObject(user1))
  const fetchUser2 = () =>
    UserService.getUser(2).then((u) => expect(u).toMatchObject(user2))

  return Promise.all([fetchUser1(), fetchUser1(), fetchUser1()])
    .then(() => {
      expect(getSpy).toBeCalledTimes(1)
      return Promise.all([fetchUser2(), fetchUser2(), fetchUser2()])
    })
    .then(() => {
      expect(getSpy).toBeCalledTimes(2)
    })
})

it("should throttle properly when calling getUsersByName()", () => {
  UserService.API = createMockedApi()
  const getSpy = jest.spyOn(UserService.API, "get")
  const user1 = userResponseMatcher.near.items
  const user2 = userResponseMatcher.jon.items
  const fetchUsers1 = () =>
    UserService.getUsersByName("near").then((u) =>
      expect(u).toMatchObject(user1)
    )
  const fetchUsers2 = () =>
    UserService.getUsersByName("jon").then((u) =>
      expect(u).toMatchObject(user2)
    )

  return Promise.all([fetchUsers1(), fetchUsers1(), fetchUsers1()])
    .then(() => {
      expect(getSpy).toBeCalledTimes(1)
      return Promise.all([fetchUsers2(), fetchUsers2(), fetchUsers2()])
    })
    .then(() => {
      expect(getSpy).toBeCalledTimes(2)
    })
})
