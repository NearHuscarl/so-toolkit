import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { ReputationPage, LoginPage, LoginSuccessPage } from "app/pages"
import { ProtectedRoute } from "./ProtectedRoute"
import { AppBar, DevTool } from "app/widgets"

export function Router() {
  return (
    <BrowserRouter>
      <AppBar />
      <DevTool />
      <Switch>
        <ProtectedRoute path="/" exact>
          <ReputationPage />
        </ProtectedRoute>
        <Route path="/login" exact>
          <LoginPage />
        </Route>
        <Route path="/login/success">
          <LoginSuccessPage />
        </Route>
        <Route path="/about">about</Route>
      </Switch>
    </BrowserRouter>
  )
}
