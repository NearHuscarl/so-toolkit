import { SE_API_URL } from "app/constants"

export function url(endpoint: string) {
  return SE_API_URL.replace(/\/$/, "") + "/" + endpoint.replace(/\//, "")
}
