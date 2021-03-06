import { Badge } from "app/types/badge"

type UserType =
  | "unregistered"
  | "registered"
  | "moderator"
  | "team_admin"
  | "does_not_exist"

// https://api.stackexchange.com/docs/types/user
export interface User {
  badge_counts: Badge
  account_id: number
  is_employee: boolean
  last_modified_date: number
  last_access_date: number
  reputation_change_year: number
  reputation_change_quarter: number
  reputation_change_month: number
  reputation_change_week: number
  reputation_change_day: number
  reputation: number
  creation_date: number
  user_type: UserType
  user_id: number
  location?: string
  website_url?: string
  link: string
  profile_image: string
  display_name: string
  accept_rate?: number // TODO: find out what this field is about
}

export type UserSortOption = "reputation" | "creation" | "name" | "modified"

export type UserParams = {
  inname?: string
  sort?: UserSortOption
  order?: "asc" | "desc"
  min?: number
  max?: number
  pagesize?: number
}
