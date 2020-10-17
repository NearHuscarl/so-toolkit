import { ApiResponse } from "app/types"

export function createApiResponse<T>(items: T[]): ApiResponse<T> {
  return {
    items,
    has_more: true,
    quota_max: 10000,
    quota_remaining: 9977,
  }
}
