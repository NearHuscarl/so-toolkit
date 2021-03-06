// https://api.stackexchange.com/docs/wrapper
import { User } from "./user"

export type SuccessApiResponse<Item = any> = {
  backoff?: number
  error_id?: number
  error_message?: string
  error_name?: string
  items: Item[]
  has_more: boolean
  quota_max: number
  quota_remaining: number
  page?: number
  page_size?: number
  total?: number
  type?: string
}

export type FailedApiResponse<Item = any> = {
  backoff?: number
  error_id: number
  error_message: string
  error_name: string
  items?: Item[]
  has_more?: boolean
  quota_max?: number
  quota_remaining?: number
  page?: number
  page_size?: number
  total?: number
  type?: string
}

export type ApiResponse<Item = any> =
  | SuccessApiResponse<Item>
  | FailedApiResponse<Item>

export type UserResponse = ApiResponse<User>
