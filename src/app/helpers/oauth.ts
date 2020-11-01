// setup stackapp
// https://stackapps.com/a/7852/72145

// stackexchange oauth instructions
// https://api.stackexchange.com/docs/authentication

// example oauth library
// https://dev.sstatic.net/apiv2/js/all.js
import isArray from "lodash/isArray"
import { openPopupWindow, serializeSearchParams } from "app/helpers"
import * as oauth from "./oauth"

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

// workaround to be able to mock named function
// https://stackoverflow.com/a/52770749/9449426
export function _authenticate(option: AuthenticationOption) {
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

    // @ts-ignore
    window.resolveOauthPopup = (result) => resolve(result)
  })
}

export function authenticate(option: AuthenticationOption) {
  return oauth._authenticate(option)
}
