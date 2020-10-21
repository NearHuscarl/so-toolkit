import MockAdapter from "axios-mock-adapter"
import orderBy from "lodash/orderBy"
import {
  users as allUsers,
  createApiResponse,
  mockAccessToken,
} from "../fixtures"
import { User, UserParams, UserSortOption } from "app/types"

function getSortField(sort: UserSortOption) {
  switch (sort) {
    case "reputation":
      return "reputation"
    case "creation":
      return "creation_date"
    case "name":
      return "display_name"
    case "modified":
      return "last_modified_date"
  }
}

export function user(mock: MockAdapter) {
  mock.onGet("/users").reply((config) => {
    const params: UserParams = config.params
    const {
      inname = "",
      pagesize,
      sort = "reputation",
      order = "desc",
    } = params

    // simulate error
    if (inname === "throw") {
      const errorResponse = {
        error_id: 502,
        error_name: "throttle_violation",
        error_message: "Violation of backoff parameter",
      }
      return [400, errorResponse]
    }

    let users = allUsers.filter(
      (u) => u.display_name.search(new RegExp(inname, "i")) !== -1
    )

    if (sort) {
      users = orderBy(users, [getSortField(sort)], [order]) // TODO: remove array?
    }

    if (pagesize) {
      users = users.slice(0, pagesize)
    }

    return [200, createApiResponse(users)]
  })

  return mock
}

export function userId(mock: MockAdapter) {
  mock.onGet(/\/users\/?\d+/).reply((config) => {
    // TODO: simplify this line
    const userId = parseFloat(config.url?.split("/").pop() || "-1")
    const user = allUsers.find((u) => u.user_id === userId)
    const items = user ? [user] : []

    return [200, createApiResponse(items)]
  })

  return mock
}

export function me(mock: MockAdapter) {
  mock.onGet("/me").reply((config) => {
    const accessToken = config.params.access_token

    if (accessToken !== mockAccessToken) {
      const errorResponse = {
        error_id: 403,
        error_name: "access_denied",
        error_message:
          "`key` is not valid for passed `access_token`, token not found (does not exist).",
      }
      return [400, errorResponse]
    }

    const user = allUsers.find((u) => u.display_name === "NearHuscarl")
    const items = user ? [user] : []
    return [200, createApiResponse(items)]
  })

  return mock
}
