import React from "react"
import { AuthRoute } from "./AuthRoute"
import { renderApp } from "app/test"
import { screen } from "@testing-library/react"
import { MemoryRouter, Route } from "react-router-dom"
import { mockAccessToken } from "app/test/fixtures"

describe("<AuthRoute />", () => {
  it("should redirect to home page if already logged in", async () => {
    const loginState = {
      auth: { accessToken: mockAccessToken },
    }
    renderApp(
      <MemoryRouter initialEntries={["/login"]}>
        <Route path="/" exact>
          <div>Home page</div>
        </Route>
        <AuthRoute path="/login">
          <div>Login page</div>
        </AuthRoute>
      </MemoryRouter>,
      { initialState: loginState }
    )

    expect(screen.queryByText("Login page")).not.toBeInTheDocument()
    expect(screen.queryByText("Home page")).toBeInTheDocument()
  })

  it("should stay in current page when logged out", async () => {
    const logoutState = {
      auth: { accessToken: undefined },
    }
    renderApp(
      <MemoryRouter initialEntries={["/login"]}>
        <Route path="/" exact>
          <div>Home page</div>
        </Route>
        <AuthRoute path="/login">
          <div>Login page</div>
        </AuthRoute>
      </MemoryRouter>,
      { initialState: logoutState }
    )

    expect(screen.queryByText("Login page")).toBeInTheDocument()
    expect(screen.queryByText("Home page")).not.toBeInTheDocument()
  })
})
