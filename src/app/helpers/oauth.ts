// setup stackapp
// https://stackapps.com/a/7852/72145

// stackexchange oauth instructions
// https://api.stackexchange.com/docs/authentication

// example oauth library
// https://dev.sstatic.net/apiv2/js/all.js
import { openPopupWindow, serializeSearchParams } from "app/helpers"
import isArray from "lodash/isArray"

// https://api.stackexchange.com/docs/authentication#scope
type Scope = "read_inbox" | "no_expiry" | "write_access" | "private_info"

type AuthenticationOption = {
  clientId: number
  scope?: Scope[]
  redirectUri: string
}

function buildQueryParams(option: AuthenticationOption) {
  const { clientId, scope, redirectUri } = option

  if (scope && !isArray(scope)) {
    throw new TypeError("scope is not an array: " + scope)
  }
  const params = {
    client_id: clientId.toString(),
    redirect_uri: redirectUri,
  } as any
  if (scope && scope.length > 0) {
    params.scope = scope?.join(" ")
  }

  return new URLSearchParams(params).toString()
}

type AuthorizationResult = {
  accessToken: string
  expireDate: Date
}

export function authenticate(option: AuthenticationOption) {
  return new Promise<AuthorizationResult>((resolve, reject) => {
    const queryParams = buildQueryParams(option)
    const popup = openPopupWindow(
      "https://stackexchange.com/oauth/dialog?" + queryParams,
      "se-oauth"
    )

    if (!popup) {
      alert("This script requires popups to be enabled.")
      return reject(new Error("This script requires popups to be enabled."))
    }

    popup.addEventListener("DOMContentLoaded", function () {
      const queryString = popup.location.hash.replace(/^#/, "")
      const { access_token: accessToken, expires } = serializeSearchParams(
        new URLSearchParams(queryString)
      ) as any
      const expireDate = new Date(new Date().getTime() + expires * 1000)

      popup.close()
      resolve({ accessToken, expireDate })
    })
  })
}
