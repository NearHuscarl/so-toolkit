import { ApiResponse } from "./apiResponse"

// https://api.stackexchange.com/docs/types/access-token
export type AccessToken = {
  account_id: number
  expires_on_date: number
  access_token: string
  scope?: string[]
}

export type AccessTokenResponse = ApiResponse<AccessToken>
