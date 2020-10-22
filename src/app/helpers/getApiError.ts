import { AxiosError } from "axios"
import { ApiResponse } from "app/types"
import { AccessTokenError, accessTokenErrorIds, ApiError } from "./apiError"

export function getApiError(e: AxiosError<ApiResponse>) {
  if (!e.response) {
    return e
  }

  const { data } = e.response
  const errorData = {
    id: data.error_id!,
    name: data.error_name!,
    message: data.error_message!,
  }

  if (accessTokenErrorIds.includes(data.error_id!)) {
    return new AccessTokenError(errorData)
  }

  return new ApiError(errorData)
}
