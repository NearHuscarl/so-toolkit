import { useReducer } from "react"

export function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => ++x, 0)
  return forceUpdate
}
