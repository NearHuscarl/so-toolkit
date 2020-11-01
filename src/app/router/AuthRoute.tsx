import React from "react"
import { RouteProps } from "react-router"
import { Route, Redirect } from "react-router-dom"
import { useSelector } from "app/store"

/*
 * AuthRoute is the opposite of PrivateRoute
 * - Render current page when logged out
 * - Redirect to homepage when logged in
 */
export function AuthRoute(props: RouteProps) {
  const isLogin = useSelector((state) => Boolean(state.auth.accessToken))

  if (isLogin) {
    return <Redirect to="/" />
  }

  return <Route {...props} />
}
