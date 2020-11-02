import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import {
  HomePage,
  PeopleReachedPage,
  LoginPage,
  LoginSuccessPage,
} from "app/pages"
import { PrivateRoute } from "app/router/PrivateRoute"
import { AppBar, DevTool } from "app/widgets"
import { AuthRoute } from "./AuthRoute"

export function Router() {
  return (
    <BrowserRouter>
      <AppBar />
      <DevTool />
      <Switch>
        <Route path="/" exact>
          <HomePage />
        </Route>
        <AuthRoute path="/login" exact>
          <LoginPage />
        </AuthRoute>
        <AuthRoute path="/login/success">
          <LoginSuccessPage />
        </AuthRoute>
        <PrivateRoute path="/people-reached">
          <PeopleReachedPage />
        </PrivateRoute>
        <Route path="/about">about</Route>
      </Switch>
    </BrowserRouter>
  )
}
