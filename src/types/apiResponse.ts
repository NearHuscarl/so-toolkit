// https://api.stackexchange.com/docs/wrapper
import { User } from "./user";

export interface ApiResponse<Item> {
  backoff?: number;
  error_id?: number;
  error_message?: string;
  error_name?: string;
  items: Item[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
  page?: number;
  page_size?: number;
  total?: number;
  type?: string;
}

export interface UserResponse extends ApiResponse<User> {}
