import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { ReputationPage, LoginPage, LoginSuccessPage } from "app/pages"
import { ProtectedRoute } from "./ProtectedRoute"
import { AppBar, DevTool } from "app/widgets"
import { AuthRoute } from "./AuthRoute"

export function Router() {
  return (
    <BrowserRouter>
      <AppBar />
      <DevTool />
      <Switch>
        <ProtectedRoute path="/" exact>
          <ReputationPage />
        </ProtectedRoute>
        <AuthRoute path="/login" exact>
          <LoginPage />
        </AuthRoute>
        <AuthRoute path="/login/success">
          <LoginSuccessPage />
        </AuthRoute>
        <Route path="/about">about</Route>
      </Switch>
    </BrowserRouter>
  )
}
