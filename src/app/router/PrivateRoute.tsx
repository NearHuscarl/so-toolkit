import React from "react"
import { Redirect, Route } from "react-router-dom"
import { RouteProps } from "react-router"
import { useSelector } from "app/store"

export function PrivateRoute(props: RouteProps) {
  const isLogin = useSelector((state) => Boolean(state.auth.accessToken))

  if (!isLogin) {
    return <Redirect to="/login" />
  }

  return <Route {...props} />
}
