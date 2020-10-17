import { rest } from "msw"
import orderBy from "lodash/orderBy"
import { serializeSearchParams } from "app/helpers"
import { users as allUsers, createApiResponse } from "../fixtures"
import { UserParams, UserSortOption } from "app/types"
import { url } from "app/test/handlers/url"

const delay = 100

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

export const usersIds = rest.get(url("/users/:userId"), (req, res, ctx) => {
  const userId = Number(req.params.userId)
  const user = allUsers.find((u) => u.user_id === userId)
  const items = user ? [user] : []

  return res(
    //
    ctx.delay(delay),
    ctx.json(createApiResponse(items))
  )
})

export const users = rest.get(url("/users"), (req, res, ctx) => {
  const params: UserParams = serializeSearchParams(req.url.searchParams)
  const { inname = "", pagesize, sort = "reputation", order = "desc" } = params

  // simulate error
  if (inname === "throw") {
    return res(
      ctx.delay(delay),
      ctx.status(400),
      ctx.json({
        error_id: 502,
        error_name: "throttle_violation",
        error_message: "Violation of backoff parameter",
      })
    )
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

  console.log("compute", users.length)

  return res(
    //
    ctx.delay(delay),
    ctx.json(createApiResponse(users))
  )
})
