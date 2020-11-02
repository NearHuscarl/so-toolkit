import React from "react"
import { renderApp } from "app/test"
import { screen } from "@testing-library/react"
import { MemoryRouter, Route } from "react-router-dom"
import { mockAccessToken } from "app/test/fixtures"
import { PrivateRoute } from "./PrivateRoute"

describe("<PrivateRoute />", () => {
  it("should redirect to login page if not login", async () => {
    const logoutState = {
      auth: { accessToken: undefined },
    }
    renderApp(
      <MemoryRouter initialEntries={["/private"]}>
        <Route path="/login" exact>
          <div>Login page</div>
        </Route>
        <PrivateRoute path="/private">
          <div>Private page</div>
        </PrivateRoute>
      </MemoryRouter>,
      { initialState: logoutState }
    )

    expect(screen.queryByText("Private page")).not.toBeInTheDocument()
    expect(screen.queryByText("Login page")).toBeInTheDocument()
  })

  it("should stay in current page if login", async () => {
    const loginState = {
      auth: { accessToken: mockAccessToken },
    }
    renderApp(
      <MemoryRouter initialEntries={["/private"]}>
        <Route path="/login" exact>
          <div>Login page</div>
        </Route>
        <PrivateRoute path="/private">
          <div>Private page</div>
        </PrivateRoute>
      </MemoryRouter>,
      { initialState: loginState }
    )

    expect(screen.queryByText("Private page")).toBeInTheDocument()
    expect(screen.queryByText("Login page")).not.toBeInTheDocument()
  })
})
