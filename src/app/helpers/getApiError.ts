import { AxiosError } from "axios"
import { ApiResponse } from "app/types"
import { ApiError } from "./apiError"

export function getApiError(e: AxiosError<ApiResponse>) {
  return new ApiError({
    id: e.response?.data.error_id,
    name: e.response?.data.error_name,
    message: e.response?.data.error_message,
  })
}
