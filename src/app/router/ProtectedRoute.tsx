import React from "react"
import { Route } from "react-router-dom"
import { RouteProps } from "react-router"

// TODO: write test
// TODO: require user to login only if low on request quotas
export function ProtectedRoute(props: RouteProps) {
  const shouldProtect = false

  if (shouldProtect) {
    return null
  }

  return <Route {...props} />
}
