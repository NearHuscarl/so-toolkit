import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import ReputationPage from "app/pages/ReputationPage"
import { ProtectedRoute } from "./ProtectedRoute"

function Login() {
  return <div>Login</div>
}
function LoginSuccess() {
  return <div>Login success!</div>
}
function Logout() {
  return <div>Logout</div>
}

export function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <ProtectedRoute path="/" exact>
          <ReputationPage />
        </ProtectedRoute>
        <Route path="/login" exact>
          <Login />
        </Route>
        <Route path="/login/success">
          <LoginSuccess />
        </Route>
        <Route path="/logout">
          <Logout />
        </Route>
        <Route path="/about">about</Route>
      </Switch>
    </BrowserRouter>
  )
}
