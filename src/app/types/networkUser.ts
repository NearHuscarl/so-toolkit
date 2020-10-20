import { Badge } from "./badge"

export interface NetworkUser {
  account_id: number
  answer_count: number
  badge_counts: Badge
  creation_date: number
  last_access_date: number
  question_count: number
  reputation: number
  site_name: string
  site_url: string
  user_id: number
}
