import { AxiosError } from "axios"
import isNumber from "lodash/isNumber"
import isString from "lodash/isString"
import { ApiResponse } from "app/types"
import { AccessTokenError, accessTokenErrorIds, ApiError } from "./apiError"

function isApiError(e: any): e is ApiError {
  return (
    e &&
    isNumber(e.error_id) &&
    isString(e.error_name) &&
    isString(e.error_message)
  )
}

export function getApiError(e: AxiosError<ApiResponse>) {
  if (!e.response || !isApiError(e.response.data)) {
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
