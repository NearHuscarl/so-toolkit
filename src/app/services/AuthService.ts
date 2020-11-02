import isAfter from "date-fns/isAfter"
import { ServiceBase, ServiceProps } from "app/services/ServiceBase"
import { ApiError, authenticate } from "app/helpers"
import { AccessTokenResponse, ApiResponse } from "app/types"

export class AuthService extends ServiceBase {
  constructor(props: ServiceProps) {
    const { store, api } = props
    super({ api, store })
  }

  async authorize() {
    const result = await authenticate({
      redirectUri: window.location.origin + "/login/success",
      clientId: Number(process.env.REACT_APP_STACK_APP_CLIENT_ID!),
      // default expire interval is too short and can't be changed
      // https://stackapps.com/a/6720/72145
      // TODO: uncomment after doing more testing to make sure nothing goes wrong
      // scope: ["no_expiry"],
    })

    this.API.defaults.params.access_token = result.accessToken
    return result
  }

  async unauthorize(accessToken?: string) {
    if (!accessToken) return

    const { ...params } = this.API.defaults.params
    params.site = undefined // invalidate will throw if pass site params
    const response = await this.API.get<ApiResponse>(
      `access-tokens/${accessToken}/invalidate`,
      { params }
    )

    if (response.data.items?.length === 0) {
      throw new ApiError({
        id: -1,
        name: "Access token is either not available or already expired",
        message: "Logout failed",
      })
    }

    this.API.defaults.params.access_token = undefined
  }

  async isTokenValid(accessToken?: string, expireDate?: string) {
    const { ...params } = this.API.defaults.params

    params.access_token = undefined
    params.site = undefined // invalidate will throw if pass site params

    // the access token has no expire date and should never be invalid
    // unless we explicitly invalidate it when logging out but just in case
    const response = await this.API.get<AccessTokenResponse>(
      `access-tokens/${accessToken}`,
      { params }
    )
    const isValid = !!response.data.items?.some(
      (at) => at.access_token === accessToken
    )
    const isExpired = !expireDate || isAfter(Date.now(), Date.parse(expireDate))
    return isValid && !isExpired
  }
}
